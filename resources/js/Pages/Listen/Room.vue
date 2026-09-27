<template>
    <AppLayout :title="pageTitle">
        <!-- Error State: Room Expired or Not Found -->
        <div v-if="error || !room" class="min-h-[70vh] flex items-center justify-center p-4">
            <div class="max-w-md w-full text-center space-y-5 p-8 rounded-3xl bg-card border border-border shadow-xl">
                <div class="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
                    <Radio class="h-8 w-8 opacity-60" />
                </div>

                <div class="space-y-2">
                    <h2 class="font-heading text-xl font-bold text-foreground">
                        Sesi Selesai atau Tidak Ditemukan
                    </h2>
                    <p class="text-sm text-muted-foreground leading-relaxed">
                        Room <span class="font-mono font-semibold text-primary">{{ roomCode }}</span> telah ditutup oleh Host atau masa aktifnya telah berakhir.
                    </p>
                </div>

                <div class="pt-2">
                    <Link
                        href="/"
                        class="inline-flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                    >
                        <ArrowLeft class="h-4 w-4" />
                        <span>Kembali ke Beranda</span>
                    </Link>
                </div>
            </div>
        </div>

        <!-- Active Room Follower View -->
        <div v-else class="relative pb-36">
            <!-- Follower Banner -->
            <FollowerBanner
                :room-code="roomCode"
                :is-connected="roomSync.isConnected.value"
                :listener-count="roomSync.listenerCount.value"
                :status="roomSync.roomState.value?.status || room.status"
                :ayah-number="roomSync.roomState.value?.ayahNumber || room.ayahNumber"
                @leave="handleLeave"
            />

            <div class="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
                <!-- Surah Header Card -->
                <div v-if="chapter" class="relative overflow-hidden rounded-3xl bg-card/60 backdrop-blur-md border border-border/80 p-6 sm:p-8 text-center space-y-3 shadow-sm">
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        <span>Surah Ke-{{ chapter.id }}</span>
                        <span>•</span>
                        <span class="capitalize">{{ chapter.revelation_place === 'makkah' ? 'Makkiyah' : 'Madaniyah' }}</span>
                        <span>•</span>
                        <span>{{ chapter.verses_count }} Ayat</span>
                    </div>

                    <h1 class="font-arabic text-3xl sm:text-4xl text-foreground">
                        {{ chapter.name_arabic }}
                    </h1>

                    <div class="space-y-1">
                        <h2 class="font-heading font-bold text-xl sm:text-2xl text-foreground tracking-tight">
                            {{ chapter.name_simple }}
                        </h2>
                        <p class="text-xs sm:text-sm text-muted-foreground">
                            {{ chapter.translated_name?.name || '' }}
                        </p>
                    </div>
                </div>

                <!-- Bismillah Banner (except Surah 1 and 9) -->
                <div 
                    v-if="chapter && chapter.id !== 1 && chapter.id !== 9"
                    class="py-6 text-center"
                >
                    <p class="font-arabic text-2xl sm:text-3xl text-foreground/85 select-none leading-relaxed">
                        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                    </p>
                </div>

                <!-- Reading View: Either Mode Ayat OR Mode Mushaf -->
                <div v-if="hostReadingMode === 'mushaf'" class="space-y-6">
                    <MushafPageView 
                        :verses="verses" 
                        :chapter="chapter"
                        :mushaf-type="userPreferences.preferences.mushafType"
                        :arabic-font-size="userPreferences.preferences.arabicFontSize"
                        :active-ayah-number="audioPlayer.currentAyahNumber.value"
                        :active-word-index="audioPlayer.currentWordIndex.value"
                        :is-playing="audioPlayer.isPlaying.value"
                    />
                </div>
                <div v-else class="space-y-4">
                    <AyahItem
                        v-for="verse in verses"
                        :key="verse.id"
                        :verse="verse"
                        :chapter-id="chapter.id"
                        :is-active="audioPlayer.currentAyahNumber.value === verse.verse_number"
                        :is-playing="audioPlayer.isPlaying.value"
                        :active-word-index="audioPlayer.currentAyahNumber.value === verse.verse_number ? audioPlayer.currentWordIndex.value : null"
                        :show-translation="userPreferences.preferences.showTranslation"
                        :show-transliteration="userPreferences.preferences.showTransliteration"
                        :mushaf-type="userPreferences.preferences.mushafType"
                        :arabic-font-size="userPreferences.preferences.arabicFontSize"
                    />
                </div>
            </div>

            <!-- Follower Floating Audio Bar (Read-only host sync with local volume) -->
            <div class="fixed bottom-0 left-0 right-0 z-40 p-3 sm:p-4 bg-background/95 backdrop-blur-md border-t border-border shadow-2xl">
                <div class="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                    <!-- Left: Current Playing Info & Lock Indicator -->
                    <div class="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                        <div class="flex items-center gap-2.5">
                            <div class="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                                <Radio class="h-4 w-4 animate-pulse" />
                            </div>
                            <div class="text-left">
                                <div class="flex items-center gap-1.5">
                                    <span class="text-xs font-heading font-semibold text-foreground">
                                        {{ chapter?.name_simple || 'Al-Qur\'an' }}
                                    </span>
                                    <span class="text-[11px] text-muted-foreground">
                                        Ayat {{ audioPlayer.currentAyahNumber.value || room.ayahNumber || 1 }}
                                    </span>
                                </div>
                                <span class="text-[10px] text-primary flex items-center gap-1 font-medium">
                                    <Lock class="h-3 w-3 inline" />
                                    Playback Terkunci ke Host
                                </span>
                            </div>
                        </div>

                        <!-- Sync Status Badge on Mobile -->
                        <div class="sm:hidden flex items-center gap-2">
                            <button
                                v-if="needsTapToPlay"
                                type="button"
                                @click="unlockAudio"
                                class="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-medium cursor-pointer shadow-sm active:scale-95 transition-transform"
                            >
                                <Play class="h-3 w-3 fill-current" />
                                <span>Putar</span>
                            </button>
                            <div class="text-[11px] font-mono text-muted-foreground tabular-nums">
                                {{ audioPlayer.formattedCurrentTime }} / {{ audioPlayer.formattedDuration }}
                            </div>
                        </div>
                    </div>

                    <!-- Middle: Synced Progress Bar -->
                    <div class="flex items-center gap-3 flex-1 w-full max-w-md">
                        <span class="hidden sm:inline text-[11px] font-mono text-muted-foreground tabular-nums w-14 text-right shrink-0">
                            {{ audioPlayer.formattedCurrentTime }}
                        </span>

                        <div class="relative flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                                class="h-full bg-primary transition-all duration-300"
                                :style="{ width: `${audioPlayer.progressPercent.value}%` }"
                            />
                        </div>

                        <span class="hidden sm:inline text-[11px] font-mono text-muted-foreground tabular-nums w-14 shrink-0">
                            {{ audioPlayer.formattedDuration }}
                        </span>
                    </div>

                    <!-- Right: Local Volume Control & Mute -->
                    <div class="flex items-center gap-2 shrink-0">
                        <button
                            v-if="needsTapToPlay"
                            type="button"
                            @click="unlockAudio"
                            class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all cursor-pointer shadow-sm active:scale-95"
                        >
                            <Play class="h-3.5 w-3.5 fill-current" />
                            <span>Mulai Dengar</span>
                        </button>

                        <button
                            type="button"
                            @click="audioPlayer.toggleMute"
                            class="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
                            :title="audioPlayer.isMuted.value ? 'Batal Bisukan' : 'Bisukan Suara'"
                        >
                            <VolumeX v-if="audioPlayer.isMuted.value" class="h-4 w-4 text-destructive" />
                            <Volume2 v-else class="h-4 w-4" />
                        </button>

                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            :value="audioPlayer.isMuted.value ? 0 : audioPlayer.volume.value"
                            @input="e => audioPlayer.setVolume(parseFloat(e.target.value))"
                            class="volume-slider w-24 sm:w-28 cursor-pointer"
                            :style="{ '--slider-progress': `${(audioPlayer.isMuted.value ? 0 : audioPlayer.volume.value) * 100}%` }"
                            aria-label="Volume Lokal"
                            title="Atur Volume Perangkat Anda"
                        />

                        <span class="text-[11px] sm:text-xs font-mono font-medium text-muted-foreground tabular-nums w-8 text-right shrink-0">
                            {{ audioPlayer.isMuted.value ? 0 : Math.round(audioPlayer.volume.value * 100) }}%
                        </span>
                    </div>
                </div>
            </div>

            <!-- Autoplay Unlock Prompt (Mobile Safari & Chrome Gesture Requirement) -->
            <transition
                enter-active-class="transition duration-300 ease-out"
                enter-from-class="transform translate-y-4 opacity-0"
                enter-to-class="transform translate-y-0 opacity-100"
                leave-active-class="transition duration-200 ease-in"
                leave-from-class="transform translate-y-0 opacity-100"
                leave-to-class="transform translate-y-4 opacity-0"
            >
                <div
                    v-if="needsTapToPlay"
                    class="fixed bottom-24 sm:bottom-20 left-4 right-4 max-w-md mx-auto z-50 p-4 rounded-2xl bg-primary text-primary-foreground shadow-2xl flex items-center justify-between gap-3 border border-primary-foreground/20"
                >
                    <div class="flex items-center gap-3 min-w-0">
                        <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                            <Volume2 class="h-5 w-5 animate-pulse" />
                        </div>
                        <div class="min-w-0">
                            <p class="text-xs font-semibold leading-tight truncate">
                                Host sedang memutar audio
                            </p>
                            <p class="text-[11px] opacity-90 leading-tight truncate">
                                Ketuk untuk mendengarkan di perangkat ini
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        @click="unlockAudio"
                        class="px-3.5 py-2 rounded-xl bg-white text-primary font-semibold text-xs shrink-0 hover:bg-white/90 active:scale-95 transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                        <Play class="h-3.5 w-3.5 fill-current" />
                        <span>Mulai Dengar</span>
                    </button>
                </div>
            </transition>

            <!-- Follower Fullscreen Khusyu Focus Reading View -->
            <KhusyuPlayerView
                v-if="chapter && verses && verses.length > 0"
                v-model:open="isKhusyuMode"
                :chapter="chapter"
                :verses="verses"
                v-model:mushafType="userPreferences.preferences.mushafType"
                v-model:showTranslation="userPreferences.preferences.showTranslation"
                v-model:showTransliteration="userPreferences.preferences.showTransliteration"
                v-model:arabicFontSize="userPreferences.preferences.arabicFontSize"
                :is-listener="true"
                :needs-tap-to-play="needsTapToPlay"
                @unlock-audio="unlockAudio"
                @leave-room="handleLeave"
            />
        </div>
    </AppLayout>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { router, Link } from '@inertiajs/vue3';
import AppLayout from '@/Layouts/AppLayout.vue';
import AyahItem from '@/components/AyahItem.vue';
import MushafPageView from '@/components/MushafPageView.vue';
import KhusyuPlayerView from '@/components/player/KhusyuPlayerView.vue';
import FollowerBanner from '@/components/sync/FollowerBanner.vue';
import { useRoomSync, calculateDrift } from '@/composables/useRoomSync';
import { useQuranAudioPlayer } from '@/composables/useQuranAudioPlayer';
import { useUserPreferences } from '@/composables/useUserPreferences';
import { Radio, Lock, Volume2, VolumeX, ArrowLeft, Play } from 'lucide-vue-next';

const props = defineProps({
    room: {
        type: Object,
        default: null,
    },
    roomCode: {
        type: String,
        required: true,
    },
    error: {
        type: String,
        default: null,
    },
    chapter: {
        type: Object,
        default: null,
    },
    verses: {
        type: Array,
        default: () => [],
    },
    recitation: {
        type: Object,
        default: null,
    },
});

const roomSync = useRoomSync();
const audioPlayer = useQuranAudioPlayer();
const userPreferences = useUserPreferences();
const needsTapToPlay = ref(false);

const hostReadingMode = ref(props.room?.readingMode || 'ayah');
const isKhusyuMode = ref(Boolean(props.room?.isKhusyuMode || props.room?.readingMode === 'khusyu'));

const pageTitle = computed(() => {
    if (props.error || !props.room) {
        return 'Sesi Dengar Bersama Tidak Ditemukan';
    }
    return `Dengar Bersama — Room ${props.roomCode} (${props.chapter?.name_simple || ''})`;
});

const handleLeave = () => {
    roomSync.leaveRoom();
    audioPlayer.pause();
    router.visit('/');
};

const handleRoomClosed = () => {
    audioPlayer.pause();
    router.visit('/listen/' + props.roomCode);
};

const unlockAudio = async () => {
    try {
        const ok = await audioPlayer.play();
        if (ok || audioPlayer.isPlaying.value) {
            needsTapToPlay.value = false;
            if (roomSync.roomState.value) {
                await handleSyncUpdate(roomSync.roomState.value);
            }
        }
    } catch {
        // Handled
    }
};

// Smooth Auto-Scroll to Active Ayah (Follower view)
watch(() => audioPlayer.currentAyahNumber.value, (ayahNum) => {
    if (!ayahNum || !audioPlayer.autoScrollEnabled.value || isKhusyuMode.value) return;

    nextTick(() => {
        const elId = hostReadingMode.value === 'mushaf' ? `mushaf-ayah-${ayahNum}` : `ayah-${ayahNum}`;
        const el = document.getElementById(elId);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
});

// When exiting Khusyu Mode, smoothly scroll back to the currently playing ayah
watch(() => isKhusyuMode.value, (isOpen) => {
    if (!isOpen) {
        nextTick(() => {
            const ayahNum = audioPlayer.currentAyahNumber.value || 1;
            const elId = hostReadingMode.value === 'mushaf' ? `mushaf-ayah-${ayahNum}` : `ayah-${ayahNum}`;
            const el = document.getElementById(elId);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }
});

let lastSeekTimestamp = 0;

const handleSyncUpdate = async (serverRoom) => {
    if (!serverRoom) return;

    // Check if Host switched Surah
    if (serverRoom.surahId && props.chapter && serverRoom.surahId !== props.chapter.id) {
        router.visit(`/listen/${props.roomCode}`, { preserveScroll: false });
        return;
    }

    // Synchronize Host Reading Mode & Khusyu Mode
    if (serverRoom.readingMode) {
        hostReadingMode.value = serverRoom.readingMode;
    }
    if (serverRoom.isKhusyuMode !== undefined) {
        isKhusyuMode.value = Boolean(serverRoom.isKhusyuMode || serverRoom.readingMode === 'khusyu');
    } else if (serverRoom.readingMode) {
        isKhusyuMode.value = serverRoom.readingMode === 'khusyu';
    }

    // Play / Pause synchronization
    const shouldPlay = serverRoom.status === 'playing';
    if (shouldPlay) {
        if (!audioPlayer.isPlaying.value) {
            // Only attempt play if user hasn't already been blocked by mobile autoplay policy
            if (!needsTapToPlay.value) {
                const ok = await audioPlayer.play();
                if (!ok && !audioPlayer.isPlaying.value) {
                    needsTapToPlay.value = true;
                }
            }
        } else {
            needsTapToPlay.value = false;
        }
    } else {
        needsTapToPlay.value = false;
        if (audioPlayer.isPlaying.value) {
            audioPlayer.pause();
        }
    }

    // Autoplay Guard: If waiting for user tap on mobile, do not perform range-request seeks
    if (needsTapToPlay.value) {
        return;
    }

    // Calculate drift with clock offset calibration
    const localSec = audioPlayer.currentTime.value;
    const now = Date.now();
    const { estimatedHostSec, absDriftSec } = calculateDrift(
        localSec,
        serverRoom.timestampMs,
        serverRoom.updatedAt,
        now,
        shouldPlay,
        roomSync.clockOffset?.value || 0
    );

    const hostAyah = serverRoom.ayahNumber;
    const localAyah = audioPlayer.currentAyahNumber.value;

    // 1. Distinguish between Natural Verse Progression vs Intentional Host Ayah Jump:
    // When playing continuously, the single MP3 audio stream naturally progresses across verses.
    // If the difference is just 1 adjacent verse and drift is small (< 2s), DO NOT SEEK!
    // The follower's audio will cross the verse boundary naturally without cutting off or buffering.
    const isIntentionalAyahJump = Boolean(
        hostAyah && localAyah && hostAyah !== localAyah && (
            (shouldPlay && (hostAyah < localAyah || Math.abs(hostAyah - localAyah) > 1 || absDriftSec > 2.0)) ||
            (!shouldPlay && hostAyah !== localAyah)
        )
    );

    if (isIntentionalAyahJump) {
        audioPlayer.seekToAyah(hostAyah, shouldPlay);
        lastSeekTimestamp = now;
        audioPlayer.setPlaybackRate(1.0);
        return;
    }

    // 2. Playback State Synchronization:
    if (!shouldPlay) {
        // When host is paused, only seek if host explicitly scrubbed (massive drift > 3.0s),
        // with a 2-second cooldown to eliminate audio stutter/looping ping-pong on mobile.
        if (absDriftSec > 3.0 && now - lastSeekTimestamp > 2000) {
            audioPlayer.seekToTime(estimatedHostSec);
            lastSeekTimestamp = now;
        }
        audioPlayer.setPlaybackRate(1.0);
    } else {
        // When playing: Keep playbackRate strictly at 1.0x (zero audio resampling flutter/warble).
        // Only seek if there is a severe desync (> 2.5s, e.g. network stall), protected by a 3s cooldown guard.
        if (absDriftSec > 2.5 && now - lastSeekTimestamp > 3000) {
            audioPlayer.seekToTime(estimatedHostSec);
            lastSeekTimestamp = now;
        }
        audioPlayer.setPlaybackRate(1.0);
    }
};

onMounted(async () => {
    if (props.room && props.chapter && props.recitation) {
        // Synchronize initial mode
        if (props.room.readingMode) {
            hostReadingMode.value = props.room.readingMode;
        }
        if (props.room.isKhusyuMode !== undefined) {
            isKhusyuMode.value = Boolean(props.room.isKhusyuMode || props.room.readingMode === 'khusyu');
        } else if (props.room.readingMode === 'khusyu') {
            isKhusyuMode.value = true;
        }

        // Ensure repeat mode is disabled in Listen Together mode (prevent listener local ayah loop)
        audioPlayer.setRepeatMode('none');

        // Load recitation into audio player
        audioPlayer.loadSurah(
            props.chapter,
            props.recitation,
            props.room.reciterId ? { id: props.room.reciterId } : null,
            props.room.ayahNumber || 1,
            false
        );

        // Seek to initial host position
        const initialSec = (props.room.timestampMs || 0) / 1000;
        if (initialSec > 0) {
            audioPlayer.seekToTime(initialSec);
        }

        if (props.room.status === 'playing') {
            const ok = await audioPlayer.play();
            if (!ok && !audioPlayer.isPlaying.value) {
                needsTapToPlay.value = true;
            }
        }

        // Start real-time sync polling & heartbeat
        roomSync.startListening(props.roomCode, handleSyncUpdate, handleRoomClosed);
    }
});

onUnmounted(() => {
    roomSync.leaveRoom();
});
</script>
