<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useQuranAudioPlayer } from '@/composables/useQuranAudioPlayer';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Repeat,
    Repeat1,
    Volume2,
    VolumeX,
    User,
    Gauge,
    Sparkles,
    Loader2,
    ChevronUp,
    ChevronDown,
    Sliders,
    Radio,
    Maximize2
} from '@lucide/vue';

const emit = defineEmits(['open-reciter-modal', 'open-settings', 'open-listen-together', 'open-zen-mode']);

const {
    isPlaying,
    isLoading,
    currentTime,
    duration,
    progressPercent,
    formattedCurrentTime,
    formattedDuration,
    currentSurahName,
    currentAyahNumber,
    activeReciter,
    playbackRate,
    repeatMode,
    volume,
    isMuted,
    autoScrollEnabled,
    togglePlay,
    seekToTime,
    nextAyah,
    prevAyah,
    setPlaybackRate,
    cycleRepeatMode,
    setVolume,
    toggleMute,
    toggleAutoScroll,
} = useQuranAudioPlayer();

const isCollapsed = ref(false);
const showVolumeSlider = ref(false);
const showSpeedMenu = ref(false);

const speedMenuRef = ref(null);
const volumeContainerRef = ref(null);

const speedOptions = [0.75, 1.0, 1.25, 1.5, 2.0];

const onSeekbarChange = (event) => {
    const val = parseFloat(event.target.value);
    const targetSeconds = (val / 100) * (duration.value || 1);
    seekToTime(targetSeconds);
};

const selectSpeed = (speed) => {
    setPlaybackRate(speed);
    showSpeedMenu.value = false;
};

const onVolumeInput = (event) => {
    const val = parseFloat(event.target.value);
    setVolume(val);
};

const handlePlayClick = () => {
    togglePlay();
    if (!isPlaying.value) {
        emit('open-zen-mode');
    }
};

// Outside click auto-close for speed menu and volume popup
const handleDocumentClick = (e) => {
    if (showSpeedMenu.value && speedMenuRef.value && !speedMenuRef.value.contains(e.target)) {
        showSpeedMenu.value = false;
    }
    if (showVolumeSlider.value && volumeContainerRef.value && !volumeContainerRef.value.contains(e.target)) {
        showVolumeSlider.value = false;
    }
};

onMounted(() => {
    document.addEventListener('click', handleDocumentClick);
});

onUnmounted(() => {
    document.removeEventListener('click', handleDocumentClick);
});
</script>

<template>
    <aside 
        v-if="currentSurahName"
        class="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-40 transition-all duration-300 ease-out"
        :class="isCollapsed ? 'translate-y-[calc(100%-4.25rem)]' : 'translate-y-0'"
        aria-label="Pemutar Audio Al-Qur'an"
    >
        <!-- Collapse/Expand floating tab toggle on top right -->
        <div class="flex justify-end pr-4 mb-1">
            <button
                type="button"
                @click="isCollapsed = !isCollapsed"
                class="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-semibold rounded-t-xl bg-card/95 backdrop-blur-md border-t border-x border-border/80 text-foreground/80 hover:text-primary shadow-sm hover:bg-card transition-all cursor-pointer"
                :title="isCollapsed ? 'Tampilkan Player Bar' : 'Sembunyikan Player Bar'"
            >
                <component :is="isCollapsed ? ChevronUp : ChevronDown" class="h-3.5 w-3.5 text-primary" />
                <span>{{ isCollapsed ? 'Buka Player' : 'Kecilkan' }}</span>
            </button>
        </div>

        <!-- Main Glassmorphism Player Card (overflow-visible to prevent clipping popups) -->
        <div class="relative rounded-2xl sm:rounded-3xl border border-border/80 bg-card/95 dark:bg-card/90 backdrop-blur-xl shadow-2xl p-3 sm:p-4 pb-4 sm:pb-5 text-card-foreground">
            <!-- Ambient Emerald Glow Line on Top of Player -->
            <div class="absolute top-0 left-0 right-0 h-[2px] rounded-t-3xl overflow-hidden bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

            <div class="flex flex-col gap-2.5">
                <!-- Top Row: Surah & Ayah Info, Qari pill, & Action triggers -->
                <div class="flex items-center justify-between gap-2 text-xs">
                    <!-- Left: Now Playing Surah & Ayah badge -->
                    <div class="flex items-center gap-2 min-w-0">
                        <div class="h-2 w-2 rounded-full bg-primary animate-pulse shrink-0" />
                        <span class="font-heading font-bold text-foreground text-sm truncate">
                            {{ currentSurahName }}
                        </span>
                        <span 
                            v-if="currentAyahNumber" 
                            class="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/15 text-primary font-semibold text-[11px] shrink-0"
                        >
                            Ayat {{ currentAyahNumber }}
                        </span>
                    </div>

                    <!-- Right Controls: Zen Mode, Qari Button, Listen Together trigger -->
                    <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <!-- Zen Focus Mode Trigger Button -->
                        <button
                            type="button"
                            @click="emit('open-zen-mode')"
                            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 font-semibold text-[11px] transition-all cursor-pointer shadow-2xs"
                            title="Buka Mode Fokus Zen (Immersive)"
                        >
                            <Maximize2 class="h-3.5 w-3.5" />
                            <span>Mode Zen</span>
                        </button>

                        <!-- Qari Selector Button -->
                        <button
                            type="button"
                            @click="emit('open-reciter-modal')"
                            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/60 hover:bg-muted text-foreground/85 hover:text-primary border border-border/60 transition-colors"
                            title="Ganti Qari / Pembaca"
                        >
                            <User class="h-3.5 w-3.5 text-primary" />
                            <span class="hidden sm:inline truncate max-w-[130px]">
                                {{ activeReciter?.name || 'Pilih Qari' }}
                            </span>
                        </button>

                        <!-- Auto-scroll Sync Toggle Pill -->
                        <button
                            type="button"
                            @click="toggleAutoScroll"
                            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border transition-colors text-[11px] font-medium"
                            :class="autoScrollEnabled ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-muted/40 border-border/40 text-muted-foreground'"
                            title="Sinkronisasi Gulir Otomatis (Auto-Scroll)"
                        >
                            <Sparkles class="h-3 w-3" />
                            <span class="hidden md:inline">Auto-Scroll</span>
                        </button>

                        <!-- Listen Together Trigger -->
                        <button
                            type="button"
                            @click="emit('open-listen-together')"
                            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-600/15 to-teal-600/15 border border-primary/30 text-primary hover:bg-primary/20 transition-all text-[11px] font-semibold"
                            title="Dengarkan Bersama (Realtime Sync)"
                        >
                            <Radio class="h-3.5 w-3.5 text-primary animate-pulse" />
                            <span class="hidden sm:inline">Listen Together</span>
                        </button>
                    </div>
                </div>

                <!-- Middle/Bottom Row: Playback Controls & Seekbar -->
                <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                    <!-- Transport Buttons: Prev, Play/Pause, Next -->
                    <div class="flex items-center justify-center sm:justify-start gap-2 shrink-0">
                        <!-- Prev Ayah Button -->
                        <button
                            type="button"
                            @click="prevAyah"
                            class="p-2 rounded-xl text-foreground/80 hover:text-foreground hover:bg-muted/70 active:scale-95 transition-all"
                            title="Ayat Sebelumnya"
                        >
                            <SkipBack class="h-4 w-4" />
                        </button>

                        <!-- Play / Pause Main Button -->
                        <button
                            type="button"
                            @click="handlePlayClick"
                            class="p-3 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 shadow-md shadow-primary/20 transition-all flex items-center justify-center cursor-pointer"
                            :title="isPlaying ? 'Jeda Audio' : 'Putar Audio'"
                        >
                            <Loader2 v-if="isLoading" class="h-5 w-5 animate-spin" />
                            <Pause v-else-if="isPlaying" class="h-5 w-5 fill-current" />
                            <Play v-else class="h-5 w-5 fill-current ml-0.5" />
                        </button>

                        <!-- Next Ayah Button -->
                        <button
                            type="button"
                            @click="nextAyah"
                            class="p-2 rounded-xl text-foreground/80 hover:text-foreground hover:bg-muted/70 active:scale-95 transition-all"
                            title="Ayat Selanjutnya"
                        >
                            <SkipForward class="h-4 w-4" />
                        </button>
                    </div>

                    <!-- Seekbar Slider & Timers -->
                    <div class="flex items-center gap-2.5 flex-1 w-full">
                        <span class="text-[11px] font-mono font-medium text-muted-foreground tabular-nums w-10 text-right shrink-0">
                            {{ formattedCurrentTime }}
                        </span>

                        <!-- Interactive Range Slider -->
                        <div class="relative flex-1 flex items-center group/seek">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="0.1"
                                :value="progressPercent"
                                @input="onSeekbarChange"
                                class="w-full h-2 rounded-lg bg-muted appearance-none cursor-pointer accent-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                                aria-label="Audio Timeline Progress"
                            />
                        </div>

                        <span class="text-[11px] font-mono font-medium text-muted-foreground tabular-nums w-10 shrink-0">
                            {{ formattedDuration }}
                        </span>
                    </div>

                    <!-- Extra Utilities: Repeat, Speed, Volume -->
                    <div class="flex items-center justify-end gap-1 shrink-0 relative">
                        <!-- Repeat Mode Toggle -->
                        <button
                            type="button"
                            @click="cycleRepeatMode"
                            class="p-2 rounded-xl transition-colors relative"
                            :class="repeatMode !== 'none' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'"
                            :title="repeatMode === 'ayah' ? 'Ulangi Ayat Ini' : repeatMode === 'surah' ? 'Ulangi Seluruh Surah' : 'Tanpa Pengulangan'"
                        >
                            <Repeat1 v-if="repeatMode === 'ayah'" class="h-4 w-4" />
                            <Repeat v-else class="h-4 w-4" />
                            <span 
                                v-if="repeatMode !== 'none'" 
                                class="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-primary"
                            />
                        </button>

                        <!-- Speed Popover Trigger -->
                        <div ref="speedMenuRef" class="relative">
                            <button
                                type="button"
                                @click="showSpeedMenu = !showSpeedMenu"
                                class="px-2 py-1 rounded-xl text-xs font-semibold font-mono text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors flex items-center gap-1 cursor-pointer"
                                title="Kecepatan Pemutaran"
                            >
                                <span>{{ playbackRate }}x</span>
                            </button>

                            <!-- Speed Dropdown Menu -->
                            <div 
                                v-if="showSpeedMenu" 
                                class="absolute bottom-full right-0 mb-3 w-28 rounded-2xl border border-border/80 bg-popover/95 backdrop-blur-xl p-1.5 shadow-2xl z-50 flex flex-col gap-0.5 animate-scale-in"
                            >
                                <button
                                    v-for="rate in speedOptions"
                                    :key="rate"
                                    type="button"
                                    @click="selectSpeed(rate)"
                                    class="w-full text-left px-2.5 py-1.5 text-xs rounded-xl font-mono transition-colors flex items-center justify-between cursor-pointer"
                                    :class="playbackRate === rate ? 'bg-primary/15 text-primary font-bold' : 'text-foreground hover:bg-muted'"
                                >
                                    <span>{{ rate }}x</span>
                                    <span v-if="playbackRate === rate" class="h-1.5 w-1.5 rounded-full bg-primary" />
                                </button>
                            </div>
                        </div>

                        <!-- Volume Mute & Slider Container -->
                        <div ref="volumeContainerRef" class="relative flex items-center">
                            <button
                                type="button"
                                @click="showVolumeSlider = !showVolumeSlider"
                                @mouseenter="showVolumeSlider = true"
                                class="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                                :title="isMuted ? 'Nyalakan Suara' : 'Pengaturan Volume'"
                            >
                                <VolumeX v-if="isMuted || volume === 0" class="h-4 w-4 text-destructive" />
                                <Volume2 v-else class="h-4 w-4" />
                            </button>

                            <!-- Volume Slider Popover -->
                            <div 
                                v-if="showVolumeSlider" 
                                class="absolute bottom-full right-0 mb-3 p-3 rounded-2xl border border-border/80 bg-popover/95 backdrop-blur-xl shadow-2xl z-50 flex items-center gap-2.5 animate-scale-in w-40"
                            >
                                <button
                                    type="button"
                                    @click="toggleMute"
                                    class="p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                    :title="isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'"
                                >
                                    <VolumeX v-if="isMuted || volume === 0" class="h-3.5 w-3.5 text-destructive" />
                                    <Volume2 v-else class="h-3.5 w-3.5" />
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    :value="isMuted ? 0 : volume"
                                    @input="onVolumeInput"
                                    class="w-full h-1.5 rounded-lg bg-muted appearance-none cursor-pointer accent-primary"
                                    aria-label="Volume Slider"
                                />
                                <span class="text-[10px] font-mono text-muted-foreground tabular-nums w-7 text-right">
                                    {{ isMuted ? 0 : Math.round(volume * 100) }}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </aside>
</template>
