import { ref, computed } from 'vue';

// Shared singleton state across components
const audioInstance = typeof window !== 'undefined' ? new Audio() : null;

const isPlaying = ref(false);
const isLoading = ref(false);
const currentTime = ref(0); // in seconds
const duration = ref(0); // in seconds
const currentSurahId = ref(null);
const currentSurahName = ref('');
const currentAyahNumber = ref(null);
const currentWordIndex = ref(null);
const activeReciter = ref(null);
const playbackRate = ref(1.0);
const repeatMode = ref('none'); // 'none', 'ayah', 'surah'
const volume = ref(1.0);
const isMuted = ref(false);
const autoScrollEnabled = ref(true);

// Current recitation metadata with verse timings and segments
const currentRecitation = ref(null);
const currentChapter = ref(null);

let isAudioBound = false;
let pendingSeekTime = null;
let pendingAutoPlay = false;

/**
 * Match current audio timestamp (in ms) to verse and word segment
 * 
 * @param {number} timeMs 
 * @param {Array} verseTimings 
 * @returns {{ ayahNumber: number|null, wordIndex: number|null, verseKey: string|null }}
 */
export function matchTimestampToVerseAndWord(timeMs, verseTimings = []) {
    if (!Array.isArray(verseTimings) || verseTimings.length === 0) {
        return { ayahNumber: null, wordIndex: null, verseKey: null };
    }

    for (const timing of verseTimings) {
        const from = timing.timestamp_from ?? 0;
        const to = timing.timestamp_to ?? Infinity;

        if (timeMs >= from && timeMs <= to) {
            // Parse ayah number from verse_key (e.g. "1:3" -> 3)
            let ayahNum = null;
            if (timing.verse_key) {
                const parts = timing.verse_key.split(':');
                ayahNum = parseInt(parts[1], 10);
            } else if (timing.verse_number) {
                ayahNum = parseInt(timing.verse_number, 10);
            }

            // Check word segments if available
            let wordIdx = null;
            if (Array.isArray(timing.segments) && timing.segments.length > 0) {
                for (let i = 0; i < timing.segments.length; i++) {
                    const segment = timing.segments[i];
                    // Segment schema: [wordPosition, startMs, endMs]
                    const [pos, start, end] = segment;
                    
                    if (timeMs >= start && timeMs < end) {
                        wordIdx = pos;
                        break;
                    }
                    
                    // Bridge pauses between words so highlight stays locked until next word starts
                    const nextSegment = timing.segments[i + 1];
                    if (nextSegment && timeMs >= end && timeMs < nextSegment[1]) {
                        wordIdx = pos;
                        break;
                    }

                    // Before first word in verse
                    if (i === 0 && timeMs < start) {
                        wordIdx = pos;
                        break;
                    }

                    // After last word in verse
                    if (i === timing.segments.length - 1 && timeMs >= end) {
                        wordIdx = pos;
                        break;
                    }
                }
            }

            return {
                ayahNumber: isNaN(ayahNum) ? null : ayahNum,
                wordIndex: wordIdx,
                verseKey: timing.verse_key || null,
            };
        }
    }

    // Fallback: If past the end of the last timing, return the last ayah
    const lastTiming = verseTimings[verseTimings.length - 1];
    if (lastTiming && timeMs >= (lastTiming.timestamp_to ?? 0)) {
        const parts = (lastTiming.verse_key || '').split(':');
        const ayahNum = parseInt(parts[1], 10);
        return {
            ayahNumber: isNaN(ayahNum) ? null : ayahNum,
            wordIndex: null,
            verseKey: lastTiming.verse_key || null,
        };
    }

    return { ayahNumber: null, wordIndex: null, verseKey: null };
}

/**
 * Format seconds into HH:MM:SS or MM:SS string
 * 
 * @param {number} sec 
 * @param {boolean} forceHours 
 * @returns {string}
 */
export function formatAudioTime(sec, forceHours = false) {
    if (!sec || isNaN(sec) || sec < 0) {
        return forceHours ? '00:00:00' : '00:00';
    }
    const totalSecs = Math.floor(sec);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const mStr = mins < 10 ? `0${mins}` : `${mins}`;
    const sStr = secs < 10 ? `0${secs}` : `${secs}`;

    if (hours > 0 || forceHours) {
        const hStr = hours < 10 ? `0${hours}` : `${hours}`;
        return `${hStr}:${mStr}:${sStr}`;
    }

    return `${mStr}:${sStr}`;
}

export function useQuranAudioPlayer() {
    // Initialize audio listeners once
    if (audioInstance && !isAudioBound) {
        audioInstance.preload = 'auto';

        audioInstance.addEventListener('play', () => {
            isPlaying.value = true;
            isLoading.value = false;
        });

        audioInstance.addEventListener('pause', () => {
            isPlaying.value = false;
        });

        audioInstance.addEventListener('waiting', () => {
            isLoading.value = true;
        });

        audioInstance.addEventListener('playing', () => {
            isLoading.value = false;
            isPlaying.value = true;
        });

        const handleReadyMetadata = () => {
            duration.value = audioInstance.duration || 0;
            if (pendingSeekTime !== null) {
                try {
                    audioInstance.currentTime = Math.min(pendingSeekTime, duration.value || pendingSeekTime);
                } catch (e) {
                    console.warn('Failed to seek pending time on loadedmetadata:', e);
                }
                currentTime.value = pendingSeekTime;
                pendingSeekTime = null;
            }
            if (pendingAutoPlay) {
                pendingAutoPlay = false;
                play();
            }
            isLoading.value = false;
        };

        audioInstance.addEventListener('loadedmetadata', handleReadyMetadata);
        audioInstance.addEventListener('canplay', handleReadyMetadata);

        audioInstance.addEventListener('durationchange', () => {
            duration.value = audioInstance.duration || 0;
        });

        audioInstance.addEventListener('timeupdate', () => {
            if (!audioInstance) return;
            currentTime.value = audioInstance.currentTime;
            const timeMs = Math.round(audioInstance.currentTime * 1000);

            // Match active verse and word
            if (currentRecitation.value?.verse_timings) {
                const match = matchTimestampToVerseAndWord(timeMs, currentRecitation.value.verse_timings);
                
                // Handle repeat ayah mode
                if (repeatMode.value === 'ayah' && currentAyahNumber.value !== null) {
                    const currentTiming = currentRecitation.value.verse_timings.find(t => {
                        const num = parseInt((t.verse_key || '').split(':')[1], 10);
                        return num === currentAyahNumber.value;
                    });
                    
                    if (currentTiming && timeMs >= (currentTiming.timestamp_to || Infinity)) {
                        seekToTime((currentTiming.timestamp_from || 0) / 1000);
                        return;
                    }
                }

                if (match.ayahNumber !== null) {
                    currentAyahNumber.value = match.ayahNumber;
                }
                currentWordIndex.value = match.wordIndex;
            }
        });

        audioInstance.addEventListener('ended', () => {
            if (repeatMode.value === 'surah') {
                seekToTime(0);
                play();
            } else if (repeatMode.value === 'ayah' && currentAyahNumber.value !== null) {
                seekToAyah(currentAyahNumber.value);
            } else {
                isPlaying.value = false;
                currentTime.value = 0;
                currentWordIndex.value = null;
            }
        });

        audioInstance.addEventListener('error', (e) => {
            console.error('Quran audio playback error:', e);
            isLoading.value = false;
            isPlaying.value = false;
        });

        isAudioBound = true;
    }

    /**
     * Load a Surah and its recitation audio stream
     */
    const loadSurah = (chapter, recitationData, reciter = null, startAyah = 1, autoPlay = false) => {
        if (!chapter || !recitationData) return;

        currentChapter.value = chapter;
        currentSurahId.value = chapter.id;
        currentSurahName.value = chapter.name_simple || chapter.name_arabic || `Surah ${chapter.id}`;
        
        // Standardize verse_timings property from either verse_timings or timestamps
        currentRecitation.value = {
            ...recitationData,
            verse_timings: recitationData.verse_timings || recitationData.timestamps || [],
        };
        
        if (reciter) {
            activeReciter.value = reciter;
        }

        const initialAyah = startAyah || 1;
        currentAyahNumber.value = initialAyah;
        currentWordIndex.value = 1;

        if (audioInstance) {
            const rawUrl = recitationData.audio_url || '';
            const fullUrl = rawUrl.startsWith('//') ? `https:${rawUrl}` : rawUrl;

            // Calculate starting timestamp for initialAyah from verse_timings
            const timings = currentRecitation.value.verse_timings || [];
            const targetTiming = timings.find(t => {
                const num = parseInt((t.verse_key || '').split(':')[1], 10) || t.verse_number;
                return num === initialAyah;
            });
            const targetSec = (targetTiming?.timestamp_from || 0) / 1000;

            if (audioInstance.src !== fullUrl) {
                // Changing audio source (e.g. reciter change or new surah)
                if (isPlaying.value) {
                    audioInstance.pause();
                }
                isLoading.value = true;
                pendingSeekTime = targetSec;
                pendingAutoPlay = autoPlay;
                audioInstance.src = fullUrl;
                audioInstance.playbackRate = playbackRate.value;
                audioInstance.volume = volume.value;
                audioInstance.muted = isMuted.value;
                currentTime.value = targetSec;
            } else {
                // Same source already loaded
                seekToAyah(initialAyah, autoPlay);
            }
        }
    };

    /**
     * Play current audio
     */
    const play = async () => {
        if (!audioInstance) return;
        
        // If src is not loaded yet but recitation data exists
        if (!audioInstance.src && currentRecitation.value?.audio_url) {
            const rawUrl = currentRecitation.value.audio_url;
            audioInstance.src = rawUrl.startsWith('//') ? `https:${rawUrl}` : rawUrl;
        }

        if (currentAyahNumber.value === null) {
            currentAyahNumber.value = 1;
        }

        try {
            isLoading.value = true;
            await audioInstance.play();
            isPlaying.value = true;
            isLoading.value = false;
            return true;
        } catch (error) {
            console.warn('Audio play request interrupted or prevented by browser autoplay policy:', error);
            isLoading.value = false;
            isPlaying.value = false;
            return false;
        }
    };

    /**
     * Pause audio
     */
    const pause = () => {
        if (!audioInstance) return;
        audioInstance.pause();
        isPlaying.value = false;
    };

    /**
     * Toggle play/pause state
     */
    const togglePlay = () => {
        if (isPlaying.value) {
            pause();
        } else {
            play();
        }
    };

    /**
     * Seek audio to exact seconds
     */
    const seekToTime = (seconds) => {
        if (!audioInstance) return;
        const target = Math.max(0, seconds);
        currentTime.value = target;

        if (audioInstance.readyState >= 1) {
            try {
                audioInstance.currentTime = Math.min(target, duration.value || target);
                pendingSeekTime = null;
            } catch {
                pendingSeekTime = target;
            }
        } else {
            pendingSeekTime = target;
        }
    };

    /**
     * Seek to specific Ayah number within current Surah
     */
    const seekToAyah = (ayahNumber, autoPlay = true) => {
        const total = currentChapter.value?.verses_count || Infinity;
        const targetAyah = Math.max(1, Math.min(ayahNumber, total));

        currentAyahNumber.value = targetAyah;
        currentWordIndex.value = 1;

        const timings = currentRecitation.value?.verse_timings;
        if (!timings || !Array.isArray(timings) || timings.length === 0) {
            if (autoPlay && !isPlaying.value) {
                play();
            }
            return;
        }

        const targetTiming = timings.find(t => {
            const num = parseInt((t.verse_key || '').split(':')[1], 10) || t.verse_number;
            return num === targetAyah;
        });

        if (targetTiming) {
            const startSec = (targetTiming.timestamp_from || 0) / 1000;
            seekToTime(startSec);
            if (Array.isArray(targetTiming.segments) && targetTiming.segments.length > 0) {
                currentWordIndex.value = targetTiming.segments[0][0] || 1;
            }
            if (autoPlay && !isPlaying.value) {
                play();
            }
        } else if (autoPlay && !isPlaying.value) {
            play();
        }
    };

    /**
     * Next Ayah in current Surah
     */
    const nextAyah = (autoPlay = null) => {
        const current = currentAyahNumber.value || 1;
        const total = currentChapter.value?.verses_count || Infinity;
        if (current >= total) return;

        const shouldPlay = autoPlay !== null ? autoPlay : isPlaying.value;
        seekToAyah(current + 1, shouldPlay);
    };

    /**
     * Previous Ayah in current Surah
     */
    const prevAyah = (autoPlay = null) => {
        const current = currentAyahNumber.value || 1;
        const shouldPlay = autoPlay !== null ? autoPlay : isPlaying.value;

        if (current <= 1) {
            seekToAyah(1, shouldPlay);
            return;
        }

        // If audio is actively playing and more than 2.5s into current ayah, restart current ayah
        if (isPlaying.value && currentRecitation.value?.verse_timings) {
            const currentTiming = currentRecitation.value.verse_timings.find(t => {
                const num = parseInt((t.verse_key || '').split(':')[1], 10) || t.verse_number;
                return num === current;
            });
            const startSec = (currentTiming?.timestamp_from || 0) / 1000;
            if (currentTime.value - startSec > 2.5) {
                seekToTime(startSec);
                return;
            }
        }

        seekToAyah(current - 1, shouldPlay);
    };

    /**
     * Set playback rate (speed)
     */
    const setPlaybackRate = (rate) => {
        playbackRate.value = rate;
        if (audioInstance) {
            audioInstance.playbackRate = rate;
        }
    };

    /**
     * Set repeat mode
     */
    const setRepeatMode = (mode) => {
        repeatMode.value = mode;
    };

    /**
     * Cycle repeat mode: 'none' -> 'ayah' -> 'surah' -> 'none'
     */
    const cycleRepeatMode = () => {
        if (repeatMode.value === 'none') {
            repeatMode.value = 'ayah';
        } else if (repeatMode.value === 'ayah') {
            repeatMode.value = 'surah';
        } else {
            repeatMode.value = 'none';
        }
    };

    /**
     * Set volume level (0.0 to 1.0)
     */
    const setVolume = (val) => {
        const clamped = Math.max(0, Math.min(1, val));
        volume.value = clamped;
        if (audioInstance) {
            audioInstance.volume = clamped;
            if (clamped === 0) {
                isMuted.value = true;
                audioInstance.muted = true;
            } else if (isMuted.value) {
                isMuted.value = false;
                audioInstance.muted = false;
            }
        }
    };

    /**
     * Toggle audio mute
     */
    const toggleMute = () => {
        isMuted.value = !isMuted.value;
        if (audioInstance) {
            audioInstance.muted = isMuted.value;
        }
    };

    /**
     * Toggle auto-scroll synchronization
     */
    const toggleAutoScroll = () => {
        autoScrollEnabled.value = !autoScrollEnabled.value;
    };

    // Progress percentage computed for seekbars
    const progressPercent = computed(() => {
        if (!duration.value || duration.value === 0) return 0;
        return Math.min(100, (currentTime.value / duration.value) * 100);
    });

    const hasHours = computed(() => (duration.value || 0) >= 3600 || (currentTime.value || 0) >= 3600);
    const formattedCurrentTime = computed(() => formatAudioTime(currentTime.value, hasHours.value));
    const formattedDuration = computed(() => formatAudioTime(duration.value, hasHours.value));

    return {
        // State
        isPlaying,
        isLoading,
        currentTime,
        duration,
        progressPercent,
        formattedCurrentTime,
        formattedDuration,
        currentSurahId,
        currentSurahName,
        currentAyahNumber,
        currentWordIndex,
        activeReciter,
        playbackRate,
        repeatMode,
        volume,
        isMuted,
        autoScrollEnabled,
        currentRecitation,
        currentChapter,

        // Actions
        loadSurah,
        play,
        pause,
        togglePlay,
        seekToTime,
        seekTo: seekToTime,
        seekToAyah,
        nextAyah,
        prevAyah,
        loadSurahRecitation: (chapterIdOrObj, nameOrRecitation, recitationData, reciterId) => {
            const chapter = typeof chapterIdOrObj === 'object' ? chapterIdOrObj : { id: chapterIdOrObj, name_simple: nameOrRecitation };
            const recData = typeof chapterIdOrObj === 'object' ? nameOrRecitation : recitationData;
            const reciter = typeof chapterIdOrObj === 'object' ? (recitationData ? { id: recitationData } : null) : (reciterId ? { id: reciterId } : null);
            return loadSurah(chapter, recData, reciter);
        },
        setPlaybackRate,
        setRepeatMode,
        cycleRepeatMode,
        setVolume,
        toggleMute,
        toggleAutoScroll,
    };
}
