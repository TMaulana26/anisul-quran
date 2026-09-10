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

                <!-- Verses Stream -->
                <div class="space-y-4">
                    <AyahItem
                        v-for="verse in verses"
                        :key="verse.id"
                        :verse="verse"
                        :chapter-id="chapter.id"
                        :is-active="audioPlayer.currentAyahNumber.value === verse.verse_number"
                        :active-word-index="audioPlayer.currentAyahNumber.value === verse.verse_number ? audioPlayer.currentWordIndex.value : null"
                        :show-translation="userPreferences.showTranslation.value"
                        :show-transliteration="userPreferences.showTransliteration.value"
                        :mushaf-type="userPreferences.mushafType.value"
                        :font-size="userPreferences.arabicFontSize.value"
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
                        <div class="sm:hidden flex items-center gap-1 text-[11px] font-mono text-muted-foreground tabular-nums">
                            {{ audioPlayer.formattedCurrentTime }} / {{ audioPlayer.formattedDuration }}
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
                            step="0.05"
                            :value="audioPlayer.isMuted.value ? 0 : audioPlayer.volume.value"
                            @input="e => audioPlayer.setVolume(parseFloat(e.target.value))"
                            class="w-20 h-1.5 rounded-lg bg-muted appearance-none cursor-pointer accent-primary"
                            aria-label="Volume Lokal"
                            title="Atur Volume Perangkat Anda"
                        />
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>
</template>

<script setup>
import { computed, onMounted, onUnmounted, watch } from 'vue';
import { router, Link } from '@inertiajs/vue3';
import AppLayout from '@/Layouts/AppLayout.vue';
import AyahItem from '@/components/AyahItem.vue';
import FollowerBanner from '@/components/sync/FollowerBanner.vue';
import { useRoomSync, calculateDrift } from '@/composables/useRoomSync';
import { useQuranAudioPlayer } from '@/composables/useQuranAudioPlayer';
import { useUserPreferences } from '@/composables/useUserPreferences';
import { Radio, Lock, Volume2, VolumeX, ArrowLeft } from 'lucide-vue-next';

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

const handleSyncUpdate = (serverRoom) => {
    if (!serverRoom) return;

    // Check if Host switched Surah
    if (serverRoom.surahId && props.chapter && serverRoom.surahId !== props.chapter.id) {
        router.visit(`/listen/${props.roomCode}`, { preserveScroll: false });
        return;
    }

    // Play / Pause synchronization
    const shouldPlay = serverRoom.status === 'playing';
    if (shouldPlay && !audioPlayer.isPlaying.value) {
        audioPlayer.play().catch(() => {});
    } else if (!shouldPlay && audioPlayer.isPlaying.value) {
        audioPlayer.pause();
    }

    // Drift correction
    const localSec = audioPlayer.currentTime.value;
    const { estimatedHostSec, absDriftSec } = calculateDrift(
        localSec,
        serverRoom.timestampMs,
        serverRoom.updatedAt,
        Date.now(),
        shouldPlay
    );

    // If drift is > 400ms, jump to sync
    if (absDriftSec > 0.4) {
        audioPlayer.seekTo(estimatedHostSec);
    } else if (absDriftSec > 0.1 && shouldPlay) {
        // Nudge rate slightly to close gap smoothly
        const rate = localSec < estimatedHostSec ? 1.05 : 0.95;
        audioPlayer.setPlaybackRate(rate);
    } else {
        audioPlayer.setPlaybackRate(1.0);
    }
};

onMounted(() => {
    if (props.room && props.chapter && props.recitation) {
        // Load recitation into audio player
        audioPlayer.loadSurahRecitation(
            props.chapter.id,
            props.chapter.name_simple,
            props.recitation,
            props.room.reciterId || 7
        );

        // Seek to initial host position
        const initialSec = (props.room.timestampMs || 0) / 1000;
        if (initialSec > 0) {
            audioPlayer.seekTo(initialSec);
        }

        if (props.room.status === 'playing') {
            audioPlayer.play().catch(() => {});
        }

        // Start real-time sync polling & heartbeat
        roomSync.startListening(props.roomCode, handleSyncUpdate, handleRoomClosed);
    }
});

onUnmounted(() => {
    roomSync.leaveRoom();
});
</script>
