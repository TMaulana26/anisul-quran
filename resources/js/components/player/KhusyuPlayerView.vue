<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useQuranAudioPlayer } from '@/composables/useQuranAudioPlayer';
import { useUserPreferences } from '@/composables/useUserPreferences';
import { getFormattedArabicText, getFormattedWordText, parseTranslationTokens } from '@/lib/quranUtils';
import FootnoteDialog from '@/components/FootnoteDialog.vue';
import AyahEndOrnament from '@/components/AyahEndOrnament.vue';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Repeat,
    Repeat1,
    Volume2,
    VolumeX,
    Minimize2,
    Loader2,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal,
    BookOpen,
    Moon,
    X,
    ScrollText
} from '@lucide/vue';

const props = defineProps({
    open: {
        type: Boolean,
        default: false,
    },
    chapter: {
        type: Object,
        required: true,
    },
    verses: {
        type: Array,
        default: () => [],
    },
    mushafType: {
        type: String,
        default: 'uthmani',
    },
    showTranslation: {
        type: Boolean,
        default: true,
    },
    showTransliteration: {
        type: Boolean,
        default: false,
    },
    arabicFontSize: {
        type: Number,
        default: 32,
    },
});

const emit = defineEmits([
    'update:open',
    'update:showTranslation',
    'update:showTransliteration',
    'update:mushafType',
    'update:arabicFontSize',
    'open-reciter-modal',
    'open-settings'
]);

const audioPlayer = useQuranAudioPlayer();
const userPreferences = useUserPreferences();

// Active Atmosphere Theme ('noor' | 'midnight' | 'warqah') synced with global preferences
const currentTheme = computed(() => userPreferences.preferences.appVibe || 'noor');
const showFullTranslationDialog = ref(false);

const setTheme = (theme) => {
    userPreferences.setAppVibe(theme);
};

// Theme-aware button styles for footer controls
const controlButtonClass = computed(() => {
    if (currentTheme.value === 'midnight') {
        return 'bg-white/10 hover:bg-white/20 text-[#f4efe6] border-white/10';
    }
    if (currentTheme.value === 'warqah') {
        return 'bg-amber-900/10 dark:bg-white/10 hover:bg-amber-900/20 text-[#2c1d11] dark:text-[#f4ebd0] border-amber-900/20 dark:border-amber-700/30';
    }
    return 'bg-muted/60 hover:bg-muted text-foreground border-border/50';
});

// Footnote Dialog State
const showFootnoteDialog = ref(false);
const selectedFootnoteId = ref(null);
const selectedFootnoteNumber = ref('1');

const openFootnote = (id, number) => {
    selectedFootnoteId.value = id;
    selectedFootnoteNumber.value = number;
    showFootnoteDialog.value = true;
};

// Current Verse
const currentVerse = computed(() => {
    const num = audioPlayer.currentAyahNumber.value || 1;
    return props.verses.find(v => v.verse_number === num) || props.verses[0] || null;
});

// Translation tokens for full verse dialog
const currentTranslationTokens = computed(() => {
    if (!currentVerse.value?.translations || currentVerse.value.translations.length === 0) return [];
    return parseTranslationTokens(currentVerse.value.translations[0].text || '');
});

// Full Arabic text of the verse
const currentArabicText = computed(() => {
    if (!currentVerse.value) return '';
    return getFormattedArabicText(currentVerse.value, props.mushafType);
});

// Smart Adaptive Verse Chunking (Short vs Long)
const isShortVerse = computed(() => {
    if (!currentVerse.value) return true;
    const words = currentVerse.value.words || [];
    // If verse has <= 14 words, it fits in 1-2 lines on screen easily: display all!
    if (words.length <= 14) return true;

    // Check distinct line numbers if available
    const validLines = words.map(w => w.line_number).filter(l => l !== undefined && l !== null);
    if (validLines.length > 0) {
        const uniqueLines = new Set(validLines);
        return uniqueLines.size <= 2;
    }

    return false;
});

// Chunks of Verse (If short: 1 chunk with all words; If long: strictly 2 lines per chunk)
const verseChunks = computed(() => {
    if (!currentVerse.value || !Array.isArray(currentVerse.value.words) || currentVerse.value.words.length === 0) {
        return [];
    }

    const words = currentVerse.value.words;

    // 1. Short Verse: Display entire verse at once
    if (isShortVerse.value) {
        const nonEndWords = words.filter(w => w.char_type_name !== 'end');
        const translation = currentVerse.value.translations?.[0]?.text || nonEndWords.map(w => w.translation?.text?.trim()).filter(Boolean).join(' ');
        const transliteration = nonEndWords.map(w => w.transliteration?.text?.trim()).filter(Boolean).join(' ');

        return [{
            index: 1,
            totalChunks: 1,
            isShort: true,
            words,
            nonEndWords,
            translation,
            transliteration,
            startPosition: words[0]?.position || 1,
            endPosition: words[words.length - 1]?.position || 1,
            hasEndSymbol: words.some(w => w.char_type_name === 'end'),
        }];
    }

    // 2. Long Verse: Check if line_number is present
    const validLines = words.filter(w => w.line_number !== undefined && w.line_number !== null);

    if (validLines.length >= words.length * 0.5) {
        // Group by line_number from Quran Foundation
        const lineMap = new Map();
        words.forEach((word) => {
            const lineKey = `${word.page_number || 0}_${word.line_number}`;
            if (!lineMap.has(lineKey)) {
                lineMap.set(lineKey, {
                    lineKey,
                    lineNumber: word.line_number,
                    words: [],
                });
            }
            lineMap.get(lineKey).words.push(word);
        });

        const lines = Array.from(lineMap.values());
        const chunks = [];

        for (let i = 0; i < lines.length; i += 2) {
            const line1 = lines[i];
            const line2 = lines[i + 1] || null;
            const chunkWords = line2 ? [...line1.words, ...line2.words] : [...line1.words];
            const nonEndWords = chunkWords.filter(w => w.char_type_name !== 'end');

            const translation = nonEndWords
                .map(w => w.translation?.text?.trim())
                .filter(Boolean)
                .join(' ');

            const transliteration = nonEndWords
                .map(w => w.transliteration?.text?.trim())
                .filter(Boolean)
                .join(' ');

            const startPosition = chunkWords[0]?.position || 1;
            const endPosition = chunkWords[chunkWords.length - 1]?.position || startPosition;
            const hasEndSymbol = chunkWords.some(w => w.char_type_name === 'end');

            chunks.push({
                index: Math.floor(i / 2) + 1,
                totalChunks: Math.ceil(lines.length / 2),
                isShort: false,
                words: chunkWords,
                nonEndWords,
                translation,
                transliteration,
                startPosition,
                endPosition,
                hasEndSymbol,
            });
        }

        const total = chunks.length;
        chunks.forEach(c => c.totalChunks = total);
        return chunks;
    }

    // Fallback: chunk strictly by 12 words per view (~2 lines of Arabic)
    const WORDS_PER_CHUNK = 12;
    const chunks = [];
    const totalChunks = Math.ceil(words.length / WORDS_PER_CHUNK);

    for (let i = 0; i < words.length; i += WORDS_PER_CHUNK) {
        const chunkWords = words.slice(i, i + WORDS_PER_CHUNK);
        const nonEndWords = chunkWords.filter(w => w.char_type_name !== 'end');

        const translation = nonEndWords
            .map(w => w.translation?.text?.trim())
            .filter(Boolean)
            .join(' ');

        const transliteration = nonEndWords
            .map(w => w.transliteration?.text?.trim())
            .filter(Boolean)
            .join(' ');

        const startPosition = chunkWords[0]?.position || 1;
        const endPosition = chunkWords[chunkWords.length - 1]?.position || startPosition;
        const hasEndSymbol = chunkWords.some(w => w.char_type_name === 'end');

        chunks.push({
            index: Math.floor(i / WORDS_PER_CHUNK) + 1,
            totalChunks,
            isShort: false,
            words: chunkWords,
            nonEndWords,
            translation,
            transliteration,
            startPosition,
            endPosition,
            hasEndSymbol,
        });
    }

    return chunks;
});

// Active Chunk Index & Directional Transition ('forward' | 'backward')
const activeChunkIndex = ref(1);
const transitionDirection = ref('forward');

// Sync active chunk automatically with audioPlayer.currentWordIndex
watch(() => audioPlayer.currentWordIndex.value, (wordPos) => {
    if (!wordPos || verseChunks.value.length === 0) return;
    const foundChunk = verseChunks.value.find(c => wordPos >= c.startPosition && wordPos <= c.endPosition);
    if (foundChunk && foundChunk.index !== activeChunkIndex.value) {
        transitionDirection.value = foundChunk.index > activeChunkIndex.value ? 'forward' : 'backward';
        activeChunkIndex.value = foundChunk.index;
    }
}, { immediate: true });

// Reset activeChunkIndex to 1 when verse changes
watch(() => currentVerse.value?.id, (newId, oldId) => {
    if (newId !== oldId) {
        transitionDirection.value = 'forward';
        activeChunkIndex.value = 1;
    }
});

const currentChunk = computed(() => {
    if (verseChunks.value.length === 0) return null;
    const idx = Math.min(Math.max(1, activeChunkIndex.value), verseChunks.value.length);
    return verseChunks.value[idx - 1] || verseChunks.value[0];
});

// Check if a specific word is actively being recited
const isWordActive = (word) => {
    if (!word || !audioPlayer.isPlaying.value) return false;
    return audioPlayer.currentWordIndex.value === word.position;
};

// Seek audio to word position
const seekToWord = (wordPos) => {
    if (!currentVerse.value || !audioPlayer.currentRecitation.value?.verse_timings) return;
    
    const verseKey = currentVerse.value.verse_key;
    const timing = audioPlayer.currentRecitation.value.verse_timings.find(t => t.verse_key === verseKey);
    if (!timing || !Array.isArray(timing.segments)) return;

    const segment = timing.segments.find(s => s[0] === wordPos);
    if (segment) {
        const startSec = segment[1] / 1000;
        audioPlayer.seekToTime(startSec);
        if (!audioPlayer.isPlaying.value) {
            audioPlayer.play();
        }
    }
};

const goToChunk = (chunkIdx) => {
    if (chunkIdx < 1 || chunkIdx > verseChunks.value.length) return;
    transitionDirection.value = chunkIdx > activeChunkIndex.value ? 'forward' : 'backward';
    activeChunkIndex.value = chunkIdx;
    const target = verseChunks.value[chunkIdx - 1];
    if (target) {
        seekToWord(target.startPosition);
    }
};

const nextChunk = () => {
    if (activeChunkIndex.value < verseChunks.value.length) {
        goToChunk(activeChunkIndex.value + 1);
    } else {
        transitionDirection.value = 'forward';
        audioPlayer.nextAyah();
    }
};

const prevChunk = () => {
    if (activeChunkIndex.value > 1) {
        goToChunk(activeChunkIndex.value - 1);
    } else {
        transitionDirection.value = 'backward';
        audioPlayer.prevAyah();
    }
};

const closeKhusyuMode = () => {
    emit('update:open', false);
};
const closeZenMode = closeKhusyuMode;

// Keyboard shortcuts
const handleKeyDown = (e) => {
    if (!props.open) return;
    if (e.key === 'Escape') {
        if (showFullTranslationDialog.value) {
            showFullTranslationDialog.value = false;
        } else {
            closeKhusyuMode();
        }
    } else if (e.key === ' ' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
        e.preventDefault();
        audioPlayer.togglePlay();
    } else if (e.key === 'ArrowRight' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        nextChunk();
    } else if (e.key === 'ArrowLeft' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        prevChunk();
    }
};

const showSpeedMenu = ref(false);
const showVolumeSlider = ref(false);
const speedMenuRef = ref(null);
const volumeContainerRef = ref(null);

const speedOptions = [0.75, 1.0, 1.25, 1.5, 2.0];

const handleDocumentClick = (e) => {
    if (showSpeedMenu.value && speedMenuRef.value && !speedMenuRef.value.contains(e.target)) {
        showSpeedMenu.value = false;
    }
    if (showVolumeSlider.value && volumeContainerRef.value && !volumeContainerRef.value.contains(e.target)) {
        showVolumeSlider.value = false;
    }
};

onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleDocumentClick);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('click', handleDocumentClick);
});

const onSeekbarChange = (event) => {
    const val = parseFloat(event.target.value);
    const targetSeconds = (val / 100) * (audioPlayer.duration.value || 1);
    audioPlayer.seekToTime(targetSeconds);
};

const selectSpeed = (rate) => {
    audioPlayer.setPlaybackRate(rate);
    showSpeedMenu.value = false;
};
</script>

<template>
    <Teleport to="body">
        <Transition
            enter-active-class="transition-all duration-400 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition-all duration-300 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
        >
            <div 
                v-if="open" 
                :class="[
                    'fixed inset-0 z-50 flex flex-col justify-between overflow-hidden select-none transition-colors duration-500',
                    currentTheme === 'noor' ? 'bg-background text-foreground' : '',
                    currentTheme === 'midnight' ? 'bg-[#070a10] text-[#f4efe6]' : '',
                    currentTheme === 'warqah' ? 'bg-[#fcf7ee] dark:bg-[#1a1612] text-[#2c1d11] dark:text-[#f4ebd0]' : ''
                ]"
                role="dialog"
                aria-modal="true"
                aria-label="Mode Khusyu' (خُشُوع)"
            >
                <!-- Meditative Ambient Background Glow -->
                <div class="pointer-events-none absolute inset-0 overflow-hidden">
                    <template v-if="currentTheme === 'noor'">
                        <div class="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary/10 rounded-full blur-[140px]" />
                        <div class="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-teal-500/10 rounded-full blur-[130px]" />
                    </template>

                    <template v-else-if="currentTheme === 'midnight'">
                        <div class="absolute -top-40 left-1/2 -translate-x-1/2 w-[650px] h-[450px] bg-amber-500/10 rounded-full blur-[160px]" />
                        <div class="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-500/10 rounded-full blur-[150px]" />
                    </template>

                    <template v-else-if="currentTheme === 'warqah'">
                        <div class="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-amber-700/8 dark:bg-amber-600/10 rounded-full blur-[150px]" />
                        <div class="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-orange-700/6 dark:bg-orange-600/8 rounded-full blur-[140px]" />
                    </template>
                </div>

                <!-- Top Khusyu Header Bar -->
                <header 
                    :class="[
                        'relative z-10 flex items-center justify-between p-3.5 sm:p-5 border-b backdrop-blur-md transition-colors duration-500',
                        currentTheme === 'noor' ? 'border-border/40 bg-background/60' : '',
                        currentTheme === 'midnight' ? 'border-amber-500/15 bg-[#070a10]/75' : '',
                        currentTheme === 'warqah' ? 'border-amber-900/15 dark:border-amber-700/20 bg-[#fcf7ee]/75 dark:bg-[#1a1612]/75' : ''
                    ]"
                >
                    <!-- Left: Surah Info & Chunk Progress -->
                    <div class="flex items-center gap-3">
                        <div 
                            :class="[
                                'h-2.5 w-2.5 rounded-full animate-pulse',
                                currentTheme === 'noor' ? 'bg-primary' : '',
                                currentTheme === 'midnight' ? 'bg-amber-400' : '',
                                currentTheme === 'warqah' ? 'bg-amber-700 dark:bg-amber-400' : ''
                            ]" 
                        />
                        <div>
                            <div class="flex items-center gap-2">
                                <h1 class="font-heading font-extrabold text-base sm:text-lg">
                                    {{ chapter.name_simple }}
                                </h1>
                                <span class="font-arabic text-sm opacity-70">
                                    ({{ chapter.name_arabic }})
                                </span>
                            </div>
                            <p class="text-xs opacity-75 font-medium">
                                Ayat <span class="font-bold">{{ audioPlayer.currentAyahNumber.value || 1 }}</span> dari {{ chapter.verses_count }}
                                <span v-if="currentChunk && currentChunk.totalChunks > 1" class="ml-1 opacity-90 font-semibold">
                                    • Bagian {{ currentChunk.index }} dari {{ currentChunk.totalChunks }}
                                </span>
                            </p>
                        </div>
                    </div>

                    <!-- Right Controls: Theme Switcher, Latin Toggle, Full Translation, Exit -->
                    <div class="flex items-center gap-1.5 sm:gap-2">
                        <!-- Atmosphere Theme Switcher Segmented Pills -->
                        <div 
                            :class="[
                                'flex items-center p-1 rounded-2xl border text-xs font-semibold backdrop-blur-md transition-all',
                                currentTheme === 'noor' ? 'bg-muted/40 border-border/50' : '',
                                currentTheme === 'midnight' ? 'bg-white/5 border-amber-500/20' : '',
                                currentTheme === 'warqah' ? 'bg-amber-900/5 dark:bg-white/5 border-amber-900/20 dark:border-amber-700/30' : ''
                            ]"
                        >
                            <button
                                type="button"
                                @click="setTheme('noor')"
                                :class="[
                                    'px-2.5 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1.5',
                                    currentTheme === 'noor'
                                        ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                                        : 'opacity-70 hover:opacity-100 hover:text-foreground'
                                ]"
                                title="Noor Sanctuary (Modern Bersih)"
                            >
                                <Sparkles class="h-3.5 w-3.5" />
                                <span class="hidden md:inline">Noor</span>
                            </button>

                            <button
                                type="button"
                                @click="setTheme('midnight')"
                                :class="[
                                    'px-2.5 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1.5',
                                    currentTheme === 'midnight'
                                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                                        : 'opacity-70 hover:opacity-100 hover:text-foreground'
                                ]"
                                title="Midnight Mushaf (Tahajjud Malam Emas)"
                            >
                                <Moon class="h-3.5 w-3.5" />
                                <span class="hidden md:inline">Midnight</span>
                            </button>

                            <button
                                type="button"
                                @click="setTheme('warqah')"
                                :class="[
                                    'px-2.5 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1.5',
                                    currentTheme === 'warqah'
                                        ? 'bg-amber-800 dark:bg-amber-600 text-white font-bold shadow-xs'
                                        : 'opacity-70 hover:opacity-100 hover:text-foreground'
                                ]"
                                title="Warqah Turath (Manuskrip Perkamen Klasik)"
                            >
                                <ScrollText class="h-3.5 w-3.5" />
                                <span class="hidden md:inline">Warqah</span>
                            </button>
                        </div>

                        <!-- Toggle Latin -->
                        <button
                            type="button"
                            @click="emit('update:showTransliteration', !showTransliteration)"
                            :class="[
                                'px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer',
                                showTransliteration 
                                    ? (currentTheme === 'midnight' ? 'bg-amber-500/25 border-amber-500/50 text-amber-300' : 'bg-primary/15 border-primary/40 text-primary')
                                    : 'opacity-70 hover:opacity-100 border-border/50'
                            ]"
                            title="Tampilkan / Sembunyikan Transliterasi Latin"
                        >
                            Latin
                        </button>

                        <!-- Full Translation Dialog Trigger -->
                        <button
                            type="button"
                            @click="showFullTranslationDialog = true"
                            :class="[
                                'p-2 rounded-xl border transition-all cursor-pointer',
                                currentTheme === 'noor' ? 'bg-muted/60 border-border/60 hover:bg-muted text-foreground' : '',
                                currentTheme === 'midnight' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20' : '',
                                currentTheme === 'warqah' ? 'bg-amber-900/10 dark:bg-amber-400/10 border-amber-900/25 dark:border-amber-400/25 hover:bg-amber-900/20' : ''
                            ]"
                            title="Buka Terjemahan Utuh Resmi Kemenag RI"
                        >
                            <BookOpen class="h-3.5 w-3.5" />
                        </button>

                        <!-- Exit Khusyu Mode Button -->
                        <button
                            type="button"
                            @click="closeKhusyuMode"
                            :class="[
                                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ml-1',
                                currentTheme === 'noor' ? 'bg-muted/80 hover:bg-destructive/15 hover:text-destructive hover:border-destructive/30 border-border text-foreground' : '',
                                currentTheme === 'midnight' ? 'bg-white/10 hover:bg-destructive/20 text-[#f4efe6] hover:text-destructive hover:border-destructive/40 border-amber-500/20' : '',
                                currentTheme === 'warqah' ? 'bg-amber-900/10 dark:bg-white/10 hover:bg-destructive/15 hover:text-destructive hover:border-destructive/30 border-amber-900/20 dark:border-amber-700/30 text-[#2c1d11] dark:text-[#f4ebd0]' : ''
                            ]"
                            title="Keluar dari Mode Khusyu' (Esc)"
                        >
                            <Minimize2 class="h-3.5 w-3.5" />
                            <span class="hidden sm:inline">Keluar Khusyu'</span>
                        </button>
                    </div>
                </header>

                <!-- Center Stage: Permanent Stable Card Container -->
                <main class="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-4 sm:px-12 sm:py-6 overflow-hidden max-w-5xl mx-auto w-full text-center">
                    <!-- Left Arrow: Prev Chunk / Ayah -->
                    <button
                        type="button"
                        @click="prevChunk"
                        class="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full opacity-40 hover:opacity-100 hover:scale-110 active:scale-95 transition-all cursor-pointer z-20 backdrop-blur-md"
                        :title="activeChunkIndex > 1 ? 'Bagian Sebelumnya' : 'Ayat Sebelumnya'"
                    >
                        <ChevronLeft class="h-6 w-6 sm:h-8 sm:w-8" />
                    </button>

                    <!-- Right Arrow: Next Chunk / Ayah -->
                    <button
                        type="button"
                        @click="nextChunk"
                        class="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full opacity-40 hover:opacity-100 hover:scale-110 active:scale-95 transition-all cursor-pointer z-20 backdrop-blur-md"
                        :title="activeChunkIndex < verseChunks.length ? 'Bagian Selanjutnya' : 'Ayat Selanjutnya'"
                    >
                        <ChevronRight class="h-6 w-6 sm:h-8 sm:w-8" />
                    </button>

                    <!-- Permanent Outer Sanctuary Card (Card NEVER blinks or disappears) -->
                    <div 
                        :class="[
                            'w-full max-w-4xl mx-auto flex flex-col items-center justify-between min-h-[360px] p-6 sm:p-8 transition-colors duration-500 relative select-text',
                            currentTheme === 'noor' 
                                ? 'rounded-3xl border border-primary/20 bg-card/60 backdrop-blur-xl shadow-[0_10px_40px_-15px_rgba(16,185,129,0.12)]' 
                                : '',
                            currentTheme === 'midnight' 
                                ? 'rounded-3xl border border-amber-500/25 bg-[#0e131d]/85 backdrop-blur-xl shadow-[0_10px_50px_-15px_rgba(245,158,11,0.15)]' 
                                : '',
                            currentTheme === 'warqah' 
                                ? 'rounded-3xl border-2 border-amber-900/20 dark:border-amber-600/25 bg-[#faf4e6]/95 dark:bg-[#201b16]/95 shadow-[0_10px_35px_-10px_rgba(120,53,15,0.15)] ring-1 ring-amber-900/10 dark:ring-amber-500/10' 
                                : ''
                        ]"
                    >
                        <!-- Top Chunk Badge (Permanent, not in transition) -->
                        <div class="shrink-0 mb-4">
                            <div 
                                :class="[
                                    'inline-flex items-center justify-center px-4 py-1 rounded-full text-xs font-bold tracking-wide transition-colors',
                                    currentTheme === 'noor' ? 'bg-primary/10 text-primary border border-primary/25' : '',
                                    currentTheme === 'midnight' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/35' : '',
                                    currentTheme === 'warqah' ? 'bg-amber-800/15 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-800/25 dark:border-amber-500/30' : ''
                                ]"
                            >
                                <span v-if="currentChunk && currentChunk.totalChunks > 1">
                                    Ayat {{ currentVerse.verse_number }} • Bagian {{ currentChunk.index }} dari {{ currentChunk.totalChunks }}
                                </span>
                                <span v-else>
                                    Ayat {{ currentVerse.verse_number }}
                                </span>
                            </div>
                        </div>

                        <!-- Inner Content: Directional Vertical Conveyor (Exit UP, Enter from DOWN) -->
                        <div class="w-full flex-1 flex flex-col items-center justify-center relative overflow-hidden py-2">
                            <Transition 
                                :name="transitionDirection === 'forward' ? 'khusyu-slide-forward' : 'khusyu-slide-backward'" 
                                mode="out-in"
                            >
                                <div 
                                    v-if="currentChunk"
                                    :key="`${currentVerse?.id}_${currentChunk.index}`"
                                    class="w-full flex flex-col items-center justify-center text-center space-y-5"
                                >
                                    <!-- 1. Teks Arab (2 Baris atau 1 Ayat Utuh) dengan Underline Kata Aktif -->
                                    <div class="w-full text-center" dir="rtl">
                                        <p 
                                            :class="[
                                                'leading-[2.2] sm:leading-[2.6] tracking-normal transition-all duration-300',
                                                mushafType === 'indopak' ? 'font-indopak' : 'font-arabic',
                                                currentTheme === 'noor' ? 'text-foreground' : '',
                                                currentTheme === 'midnight' ? 'text-[#faebd7] drop-shadow-[0_2px_12px_rgba(245,158,11,0.2)]' : '',
                                                currentTheme === 'warqah' ? 'text-[#2b1810] dark:text-[#f8ecd0]' : ''
                                            ]"
                                            :style="{ fontSize: `${arabicFontSize + 4}px` }"
                                        >
                                            <template v-for="word in currentChunk.words" :key="word.id || word.position">
                                                <AyahEndOrnament
                                                    v-if="word.char_type_name === 'end'"
                                                    :verse-number="currentVerse.verse_number"
                                                    size="khusyu"
                                                    :is-active="audioPlayer.isPlaying.value"
                                                />
                                                <!-- Word span with calm underline when active -->
                                                <span 
                                                    v-else 
                                                    class="inline-block mx-1 sm:mx-1.5 pb-1 border-b-2 transition-all duration-200"
                                                    :class="[
                                                        isWordActive(word)
                                                            ? (currentTheme === 'midnight' 
                                                                ? 'border-amber-400 text-amber-200 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)] font-bold' 
                                                                : currentTheme === 'warqah'
                                                                    ? 'border-amber-700 dark:border-amber-400 text-[#1f1008] dark:text-[#fff5db] font-bold'
                                                                    : 'border-primary text-primary drop-shadow-[0_0_8px_rgba(16,185,129,0.3)] font-bold')
                                                            : 'border-transparent text-inherit'
                                                    ]"
                                                >
                                                    {{ getFormattedWordText(word, mushafType) }}
                                                </span>
                                            </template>
                                        </p>
                                    </div>

                                    <!-- 2. Transliterasi Latin (Opsional) -->
                                    <div 
                                        v-if="showTransliteration && currentChunk.transliteration"
                                        class="w-full max-w-2xl mx-auto text-center"
                                        dir="ltr"
                                    >
                                        <p 
                                            :class="[
                                                'text-xs sm:text-sm font-serif italic leading-relaxed tracking-wide',
                                                currentTheme === 'noor' ? 'text-primary/80' : '',
                                                currentTheme === 'midnight' ? 'text-amber-300/80' : '',
                                                currentTheme === 'warqah' ? 'text-amber-900/80 dark:text-amber-300/80' : ''
                                            ]"
                                        >
                                            {{ currentChunk.transliteration }}
                                        </p>
                                    </div>

                                    <!-- 3. Terjemahan Indonesia (Mengalir Tenang Sesuai Bagian/Ayat) -->
                                    <div 
                                        class="w-full max-w-2xl mx-auto text-center"
                                        dir="ltr"
                                    >
                                        <p 
                                            :class="[
                                                'leading-relaxed sm:leading-loose text-sm sm:text-base md:text-lg transition-colors duration-300',
                                                currentTheme === 'noor' ? 'font-sans font-medium text-foreground/85' : '',
                                                currentTheme === 'midnight' ? 'font-serif italic text-amber-100/90 text-base sm:text-lg' : '',
                                                currentTheme === 'warqah' ? 'font-serif text-[#463024] dark:text-[#d3c2aa] text-sm sm:text-base md:text-lg' : ''
                                            ]"
                                        >
                                            “{{ currentChunk.translation }}”
                                        </p>
                                    </div>
                                </div>
                            </Transition>
                        </div>

                        <!-- Bottom Pagination Dots (Hanya muncul jika ayat panjang > 1 bagian) -->
                        <div 
                            v-if="currentChunk && currentChunk.totalChunks > 1" 
                            class="shrink-0 mt-4 flex items-center justify-center gap-1.5"
                        >
                            <button
                                v-for="c in verseChunks"
                                :key="c.index"
                                type="button"
                                @click="goToChunk(c.index)"
                                :class="[
                                    'h-1.5 rounded-full transition-all cursor-pointer',
                                    c.index === currentChunk.index 
                                        ? (currentTheme === 'midnight' ? 'w-6 bg-amber-400' : 'w-6 bg-primary')
                                        : 'w-1.5 opacity-30 hover:opacity-80 bg-foreground'
                                ]"
                                :title="`Menuju Bagian ${c.index}`"
                            />
                        </div>
                    </div>
                </main>

                <!-- Bottom Khusyu Player Control Bar -->
                <footer 
                    :class="[
                        'relative z-10 p-3 sm:p-5 border-t backdrop-blur-md transition-colors duration-500',
                        currentTheme === 'noor' ? 'border-border/40 bg-background/70' : '',
                        currentTheme === 'midnight' ? 'border-amber-500/15 bg-[#070a10]/80 text-[#faebd7]' : '',
                        currentTheme === 'warqah' ? 'border-amber-900/15 dark:border-amber-700/20 bg-[#fcf7ee]/80 dark:bg-[#1a1612]/80' : ''
                    ]"
                >
                    <div class="max-w-3xl mx-auto space-y-3">
                        <!-- Seekbar Timeline Slider -->
                        <div class="flex items-center gap-3">
                            <span class="text-xs font-mono font-medium opacity-70 tabular-nums w-12 text-right shrink-0">
                                {{ audioPlayer.formattedCurrentTime.value }}
                            </span>

                            <div class="relative flex-1 flex items-center">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    :value="audioPlayer.progressPercent.value"
                                    @input="onSeekbarChange"
                                    :class="[
                                        'w-full h-2 rounded-lg appearance-none cursor-pointer focus:outline-none focus-visible:ring-2',
                                        currentTheme === 'midnight' 
                                            ? 'bg-white/15 accent-amber-400 focus-visible:ring-amber-400/40' 
                                            : currentTheme === 'warqah'
                                                ? 'bg-amber-900/15 dark:bg-white/15 accent-amber-700 dark:accent-amber-500'
                                                : 'bg-muted accent-primary focus-visible:ring-primary/40'
                                    ]"
                                    aria-label="Timeline Audio"
                                />
                            </div>

                            <span class="text-xs font-mono font-medium opacity-70 tabular-nums w-12 shrink-0">
                                {{ audioPlayer.formattedDuration.value }}
                            </span>
                        </div>

                        <!-- Transport Buttons & Utilities -->
                        <div class="flex items-center justify-between gap-4">
                            <!-- Left: Speed & Repeat Mode -->
                            <div class="flex items-center gap-2">
                                <div ref="speedMenuRef" class="relative">
                                    <button
                                        type="button"
                                        @click="showSpeedMenu = !showSpeedMenu"
                                        :class="[
                                            'px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition-colors cursor-pointer',
                                            controlButtonClass
                                        ]"
                                        title="Kecepatan Pemutaran"
                                    >
                                        {{ audioPlayer.playbackRate.value }}x
                                    </button>

                                    <div 
                                        v-if="showSpeedMenu" 
                                        class="absolute bottom-full left-0 mb-3 w-28 rounded-2xl border border-border/80 bg-popover/95 backdrop-blur-xl p-1.5 shadow-2xl z-50 flex flex-col gap-0.5 animate-scale-in"
                                    >
                                        <button
                                            v-for="rate in speedOptions"
                                            :key="rate"
                                            type="button"
                                            @click="selectSpeed(rate)"
                                            class="w-full text-left px-2.5 py-1.5 text-xs rounded-xl font-mono transition-colors flex items-center justify-between cursor-pointer"
                                            :class="audioPlayer.playbackRate.value === rate ? 'bg-primary/15 text-primary font-bold' : 'hover:bg-muted'"
                                        >
                                            <span>{{ rate }}x</span>
                                            <span v-if="audioPlayer.playbackRate.value === rate" class="h-1.5 w-1.5 rounded-full bg-primary" />
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    @click="audioPlayer.cycleRepeatMode"
                                    :class="[
                                        'p-2 rounded-xl border transition-colors relative cursor-pointer',
                                        audioPlayer.repeatMode.value !== 'none' 
                                            ? (currentTheme === 'midnight' ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-primary/15 border-primary/40 text-primary') 
                                            : controlButtonClass
                                    ]"
                                    :title="audioPlayer.repeatMode.value === 'ayah' ? 'Ulangi Ayat Ini' : audioPlayer.repeatMode.value === 'surah' ? 'Ulangi Surah' : 'Tanpa Pengulangan'"
                                >
                                    <Repeat1 v-if="audioPlayer.repeatMode.value === 'ayah'" class="h-4 w-4" />
                                    <Repeat v-else class="h-4 w-4" />
                                </button>
                            </div>

                            <!-- Center: Prev, Play/Pause, Next Controls -->
                            <div class="flex items-center gap-3">
                                <button
                                    type="button"
                                    @click="audioPlayer.prevAyah"
                                    :class="[
                                        'p-2.5 rounded-2xl border active:scale-95 transition-all cursor-pointer',
                                        controlButtonClass
                                    ]"
                                    title="Ayat Sebelumnya"
                                >
                                    <SkipBack class="h-5 w-5" />
                                </button>

                                <button
                                    type="button"
                                    @click="audioPlayer.togglePlay"
                                    :class="[
                                        'p-4 rounded-3xl active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-lg',
                                        currentTheme === 'midnight' 
                                            ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-amber-500/25' 
                                            : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/25'
                                    ]"
                                    :title="audioPlayer.isPlaying.value ? 'Jeda Audio' : 'Putar Audio'"
                                >
                                    <Loader2 v-if="audioPlayer.isLoading.value" class="h-6 w-6 animate-spin" />
                                    <Pause v-else-if="audioPlayer.isPlaying.value" class="h-6 w-6 fill-current" />
                                    <Play v-else class="h-6 w-6 fill-current ml-0.5" />
                                </button>

                                <button
                                    type="button"
                                    @click="audioPlayer.nextAyah"
                                    :class="[
                                        'p-2.5 rounded-2xl border active:scale-95 transition-all cursor-pointer',
                                        controlButtonClass
                                    ]"
                                    title="Ayat Selanjutnya"
                                >
                                    <SkipForward class="h-5 w-5" />
                                </button>
                            </div>

                            <!-- Right: Volume Popover & Settings -->
                            <div class="flex items-center gap-2">
                                <div ref="volumeContainerRef" class="relative flex items-center">
                                    <button
                                        type="button"
                                        @click="showVolumeSlider = !showVolumeSlider"
                                        @mouseenter="showVolumeSlider = true"
                                        :class="[
                                            'p-2 rounded-xl border opacity-80 hover:opacity-100 transition-colors cursor-pointer',
                                            controlButtonClass
                                        ]"
                                        :title="audioPlayer.isMuted.value ? 'Nyalakan Suara' : 'Pengaturan Volume'"
                                    >
                                        <VolumeX v-if="audioPlayer.isMuted.value || audioPlayer.volume.value === 0" class="h-4 w-4 text-destructive" />
                                        <Volume2 v-else class="h-4 w-4" />
                                    </button>

                                    <div 
                                        v-if="showVolumeSlider" 
                                        class="absolute bottom-full right-0 mb-3 p-3 rounded-2xl border border-border/80 bg-popover/95 backdrop-blur-xl shadow-2xl z-50 flex items-center gap-2.5 animate-scale-in w-40"
                                    >
                                        <button
                                            type="button"
                                            @click="audioPlayer.toggleMute"
                                            class="p-1 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                                            :title="audioPlayer.isMuted.value ? 'Nyalakan Suara' : 'Bisukan Suara'"
                                        >
                                            <VolumeX v-if="audioPlayer.isMuted.value || audioPlayer.volume.value === 0" class="h-3.5 w-3.5 text-destructive" />
                                            <Volume2 v-else class="h-3.5 w-3.5" />
                                        </button>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.05"
                                            :value="audioPlayer.isMuted.value ? 0 : audioPlayer.volume.value"
                                            @input="(e) => audioPlayer.setVolume(parseFloat(e.target.value))"
                                            class="w-full h-1.5 rounded-lg bg-muted appearance-none cursor-pointer accent-primary"
                                            aria-label="Volume Slider"
                                        />
                                        <span class="text-[10px] font-mono opacity-75 tabular-nums w-7 text-right">
                                            {{ audioPlayer.isMuted.value ? 0 : Math.round(audioPlayer.volume.value * 100) }}%
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    @click="emit('open-settings')"
                                    :class="[
                                        'p-2 rounded-xl border opacity-80 hover:opacity-100 transition-colors cursor-pointer',
                                        controlButtonClass
                                    ]"
                                    title="Pengaturan Tampilan"
                                >
                                    <SlidersHorizontal class="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </footer>

                <!-- MODAL: Full Verse Translation Dialog (Kemenag RI Resmi) -->
                <div 
                    v-if="showFullTranslationDialog" 
                    class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md select-text animate-fade-in"
                    role="dialog"
                >
                    <div class="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto scrollbar-none rounded-3xl bg-background border border-border p-6 sm:p-8 shadow-2xl flex flex-col gap-5">
                        <div class="flex items-center justify-between border-b border-border/50 pb-3">
                            <div class="flex items-center gap-2">
                                <BookOpen class="h-5 w-5 text-primary" />
                                <h3 class="font-heading font-extrabold text-base sm:text-lg">
                                    Terjemahan Lengkap — Surah {{ chapter.name_simple }}: Ayat {{ currentVerse?.verse_number }}
                                </h3>
                            </div>
                            <button
                                type="button"
                                @click="showFullTranslationDialog = false"
                                class="p-1.5 rounded-xl bg-muted/60 hover:bg-muted transition-colors cursor-pointer"
                            >
                                <X class="h-4 w-4" />
                            </button>
                        </div>

                        <!-- Full Arabic Verse -->
                        <div class="p-5 rounded-2xl bg-muted/30 border border-border/50 text-center" dir="rtl">
                            <p 
                                :class="[
                                    'leading-[2.6] sm:leading-[3.0] text-xl sm:text-2xl',
                                    mushafType === 'indopak' ? 'font-indopak' : 'font-arabic'
                                ]"
                            >
                                {{ currentArabicText }}
                                <AyahEndOrnament
                                    :verse-number="currentVerse.verse_number"
                                    size="md"
                                    :is-active="audioPlayer.isPlaying.value"
                                />
                            </p>
                        </div>

                        <!-- Full Indonesian Translation (Kemenag RI) with Footnote buttons -->
                        <div class="space-y-2 text-sm sm:text-base leading-relaxed text-foreground font-medium" dir="ltr">
                            <h4 class="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                                Terjemahan Resmi Kemenag RI:
                            </h4>
                            <p class="leading-relaxed">
                                <template v-for="(token, idx) in currentTranslationTokens" :key="idx">
                                    <span v-if="token.type === 'text'">{{ token.content }}</span>
                                    <button 
                                        v-else-if="token.type === 'footnote'"
                                        @click.stop="openFootnote(token.id, token.number)"
                                        type="button"
                                        class="inline-flex items-center justify-center px-1.5 py-0.5 mx-0.5 rounded-md text-[10px] font-bold bg-primary/15 text-primary hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer align-baseline select-none"
                                        :title="`Lihat Catatan Kaki [${token.number}]`"
                                    >
                                        [{{ token.number }}]
                                    </button>
                                </template>
                            </p>
                        </div>

                        <div class="flex justify-end pt-2">
                            <button
                                type="button"
                                @click="showFullTranslationDialog = false"
                                class="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-xs font-bold transition-colors cursor-pointer"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Footnote Dialog -->
                <FootnoteDialog
                    v-model="showFootnoteDialog"
                    :footnote-id="selectedFootnoteId"
                    :footnote-number="selectedFootnoteNumber"
                />
            </div>
        </Transition>
    </Teleport>
</template>
