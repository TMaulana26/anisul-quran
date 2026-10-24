<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useQuranAudioPlayer } from '@/composables/useQuranAudioPlayer';
import { useRoomSync } from '@/composables/useRoomSync';
import { useI18n } from '@/composables/useI18n';
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
    Maximize2,
    Film
} from '@lucide/vue';

const emit = defineEmits(['open-reciter-modal', 'open-settings', 'open-listen-together', 'open-khusyu-mode', 'open-zen-mode', 'open-tadabbur-mode', 'play-triggered']);

const roomSync = useRoomSync();
const { t } = useI18n();

const {
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
    if (roomSync.isHost.value) {
        roomSync.broadcastState({
            surahId: currentSurahId.value,
            ayahNumber: currentAyahNumber.value,
            currentTime: targetSeconds,
            isPlaying: isPlaying.value,
            force: true,
        });
    }
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
    const wasPlaying = isPlaying.value;
    togglePlay();
    if (!wasPlaying) {
        emit('play-triggered');
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
        :aria-label="t('player.aria_label')"
    >
        <!-- Collapse/Expand floating tab toggle on top right -->
        <div class="flex justify-end pr-4 mb-1">
            <button
                type="button"
                @click="isCollapsed = !isCollapsed"
                class="relative inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-t-xl bg-card/95 backdrop-blur-md border-t border-x border-border/80 text-foreground/80 hover:text-primary shadow-sm hover:bg-card transition-all cursor-pointer"
                :title="isCollapsed ? t('player.expand_player') : t('player.collapse_player')"
                :aria-label="isCollapsed ? t('player.expand_player') : t('player.collapse_player')"
            >
                <component :is="isCollapsed ? ChevronUp : ChevronDown" class="h-3.5 w-3.5 text-primary shrink-0" />
                <span>{{ isCollapsed ? t('player.expand_label') : t('player.collapse_label') }}</span>
            </button>
        </div>

        <!-- Main Glassmorphism Player Card (overflow-visible to prevent clipping popups) -->
        <div class="relative rounded-2xl sm:rounded-3xl border border-border/80 bg-card/95 dark:bg-card/90 backdrop-blur-xl shadow-2xl p-3 sm:p-4 pb-3.5 sm:pb-4 text-card-foreground">
            <!-- Ambient Emerald Glow Line on Top of Player -->
            <div class="absolute top-0 left-0 right-0 h-[2px] rounded-t-3xl overflow-hidden bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

            <div class="flex flex-col gap-2">
                <!-- Top Row: Surah & Ayah Info, Qari pill, & Action triggers -->
                <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <!-- Left: Now Playing Surah & Ayah badge -->
                    <div class="flex items-center gap-2 min-w-0">
                        <div class="h-2 w-2 rounded-full bg-primary animate-pulse shrink-0" />
                        <span class="font-heading font-bold text-foreground text-sm truncate">
                            {{ currentSurahName }}
                        </span>
                        <span 
                            v-if="currentAyahNumber" 
                            class="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/15 text-primary font-semibold text-[11px] tabular-nums shrink-0"
                        >
                            {{ t('surah.ayah_number', { number: currentAyahNumber }) }}
                        </span>
                    </div>

                    <!-- Right Controls: Mode Khusyu, Tadabbur, Qari Button, Auto-Scroll, Listen Together -->
                    <div class="flex items-center gap-1 sm:gap-1.5 shrink-0">
                        <!-- Mode Khusyu' (خُشُوع) Trigger Button -->
                        <button
                            type="button"
                            @click="emit('open-khusyu-mode'); emit('open-zen-mode');"
                            class="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 font-semibold text-[11px] transition-all cursor-pointer shadow-2xs"
                            :title="t('surah.khusyu_mode')"
                            :aria-label="t('surah.khusyu_mode')"
                        >
                            <Maximize2 class="h-3.5 w-3.5 shrink-0" />
                            <span class="hidden md:inline">{{ t('surah.khusyu_mode') }} (خُشُوع)</span>
                        </button>

                        <!-- Mode Tadabbur Alam (Cinema Sanctuary) Trigger Button -->
                        <button
                            type="button"
                            @click="emit('open-tadabbur-mode')"
                            class="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-accent/70 hover:bg-accent text-accent-foreground border border-border font-semibold text-[11px] transition-all cursor-pointer shadow-2xs"
                            :title="t('tadabbur.open_tadabbur')"
                            :aria-label="t('tadabbur.open_tadabbur')"
                        >
                            <Film class="h-3.5 w-3.5 shrink-0 text-primary" />
                            <span class="hidden md:inline">{{ t('tadabbur.title') }}</span>
                        </button>

                        <!-- Qari Selector Button -->
                        <button
                            type="button"
                            @click="emit('open-reciter-modal')"
                            class="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-muted/60 hover:bg-muted text-foreground/85 hover:text-primary border border-border/60 transition-colors cursor-pointer"
                            :title="t('player.change_reciter')"
                            :aria-label="t('player.change_reciter')"
                        >
                            <User class="h-3.5 w-3.5 text-primary shrink-0" />
                            <span class="hidden sm:inline truncate max-w-[130px]">
                                {{ activeReciter?.name || t('player.change_reciter') }}
                            </span>
                        </button>

                        <!-- Auto-scroll Sync Toggle Pill -->
                        <button
                            type="button"
                            @click="toggleAutoScroll"
                            :aria-pressed="autoScrollEnabled"
                            :aria-label="t('player.auto_scroll')"
                            class="inline-flex min-h-11 min-w-11 items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl border transition-colors text-[11px] font-medium cursor-pointer"
                            :class="autoScrollEnabled ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-muted/40 border-border/40 text-muted-foreground'"
                            :title="t('player.auto_scroll')"
                        >
                            <Sparkles class="h-3.5 w-3.5 shrink-0" />
                            <span class="hidden lg:inline">{{ t('player.auto_scroll') }}</span>
                        </button>

                        <!-- Listen Together Trigger -->
                        <button
                            type="button"
                            @click="emit('open-listen-together')"
                            class="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all text-[11px] font-semibold relative cursor-pointer"
                            :class="roomSync.roomCode.value 
                                ? 'bg-primary/20 text-primary border border-primary/40 shadow-xs' 
                                : 'bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20'"
                            :title="t('player.listen_together')"
                            :aria-label="t('player.listen_together')"
                        >
                            <Radio class="h-3.5 w-3.5 shrink-0" :class="roomSync.roomCode.value ? 'animate-pulse text-primary' : 'text-primary'" />
                            <span class="hidden sm:inline">{{ roomSync.roomCode.value ? `Room ${roomSync.roomCode.value}` : t('player.listen_together') }}</span>
                            <span 
                                v-if="roomSync.roomCode.value" 
                                class="h-1.5 w-1.5 rounded-full bg-primary shrink-0 animate-ping"
                            />
                        </button>
                    </div>
                </div>

                <!-- Middle/Bottom Row: Playback Controls & Seekbar -->
                <div class="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-4">
                    <!-- Transport Buttons: Prev, Play/Pause, Next -->
                    <div class="flex items-center gap-1.5 shrink-0 order-1">
                        <!-- Prev Ayah Button -->
                        <button
                            type="button"
                            @click="prevAyah"
                            class="inline-flex h-11 w-11 items-center justify-center rounded-xl text-foreground/80 hover:text-foreground hover:bg-muted/70 active:scale-95 transition-all cursor-pointer"
                            :title="t('player.prev')"
                            :aria-label="t('player.prev')"
                        >
                            <SkipBack class="h-4 w-4" />
                        </button>

                        <!-- Play / Pause Main Button -->
                        <button
                            type="button"
                            @click="handlePlayClick"
                            class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 shadow-md shadow-primary/20 transition-all cursor-pointer"
                            :title="isPlaying ? t('player.pause') : t('player.play')"
                            :aria-label="isPlaying ? t('player.pause') : t('player.play')"
                        >
                            <Loader2 v-if="isLoading" class="h-5 w-5 animate-spin" />
                            <Pause v-else-if="isPlaying" class="h-5 w-5 fill-current" />
                            <Play v-else class="h-5 w-5 fill-current ml-0.5" />
                        </button>

                        <!-- Next Ayah Button -->
                        <button
                            type="button"
                            @click="nextAyah"
                            class="inline-flex h-11 w-11 items-center justify-center rounded-xl text-foreground/80 hover:text-foreground hover:bg-muted/70 active:scale-95 transition-all cursor-pointer"
                            :title="t('player.next')"
                            :aria-label="t('player.next')"
                        >
                            <SkipForward class="h-4 w-4" />
                        </button>
                    </div>

                    <!-- Seekbar Slider & Timers -->
                    <div class="flex items-center gap-2.5 w-full sm:w-auto sm:flex-1 order-3 sm:order-2">
                        <span class="text-[11px] font-mono font-medium text-muted-foreground tabular-nums w-12 sm:w-14 text-right shrink-0">
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
                                class="vibe-slider w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                                :style="{ '--slider-progress': `${progressPercent}%` }"
                                aria-label="Audio Timeline Progress"
                            />
                        </div>

                        <span class="text-[11px] font-mono font-medium text-muted-foreground tabular-nums w-12 sm:w-14 shrink-0">
                            {{ formattedDuration }}
                        </span>
                    </div>

                    <!-- Extra Utilities: Repeat, Speed, Volume -->
                    <div class="flex items-center justify-end gap-1 shrink-0 relative order-2 sm:order-3">
                        <!-- Repeat Mode Toggle -->
                        <button
                            type="button"
                            @click="cycleRepeatMode"
                            class="inline-flex h-11 w-11 items-center justify-center rounded-xl transition-colors relative cursor-pointer"
                            :class="repeatMode !== 'none' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'"
                            :title="repeatMode === 'ayah' ? t('player.repeat_ayah') : repeatMode === 'surah' ? t('player.repeat_surah') : t('player.repeat_none')"
                            :aria-label="repeatMode === 'ayah' ? t('player.repeat_ayah') : repeatMode === 'surah' ? t('player.repeat_surah') : t('player.repeat_none')"
                        >
                            <Repeat1 v-if="repeatMode === 'ayah'" class="h-4 w-4" />
                            <Repeat v-else class="h-4 w-4" />
                            <span 
                                v-if="repeatMode !== 'none'" 
                                class="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-primary"
                            />
                        </button>

                        <!-- Speed Popover Trigger -->
                        <div ref="speedMenuRef" class="relative">
                            <button
                                type="button"
                                @click="showSpeedMenu = !showSpeedMenu"
                                class="inline-flex min-h-11 min-w-11 items-center justify-center px-2.5 py-1.5 rounded-xl text-xs font-semibold font-mono tabular-nums text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors gap-1 cursor-pointer"
                                :title="t('player.speed_with_rate', { rate: playbackRate })"
                                :aria-label="t('player.speed_with_rate', { rate: playbackRate })"
                            >
                                <span>{{ playbackRate }}x</span>
                            </button>

                            <!-- Speed Dropdown Menu -->
                            <div 
                                v-if="showSpeedMenu" 
                                class="absolute bottom-full right-0 mb-3 w-32 rounded-2xl border border-border/80 bg-popover/95 backdrop-blur-xl p-1.5 shadow-2xl z-50 flex flex-col gap-0.5 animate-scale-in"
                            >
                                <button
                                    v-for="rate in speedOptions"
                                    :key="rate"
                                    type="button"
                                    @click="selectSpeed(rate)"
                                    class="w-full min-h-11 text-left px-3 py-2 text-xs rounded-xl font-mono tabular-nums transition-colors flex items-center justify-between cursor-pointer"
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
                                class="inline-flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                                :title="isMuted ? t('player.volume_unmute') : t('player.volume')"
                                :aria-label="isMuted ? t('player.volume_unmute') : t('player.volume')"
                            >
                                <VolumeX v-if="isMuted || volume === 0" class="h-4 w-4 text-destructive" />
                                <Volume2 v-else class="h-4 w-4" />
                            </button>

                            <!-- Volume Slider Popover -->
                            <div 
                                v-if="showVolumeSlider" 
                                class="absolute bottom-full right-0 mb-3 p-3 rounded-2xl border border-border/80 bg-popover/95 backdrop-blur-xl shadow-2xl z-50 flex items-center gap-2.5 animate-scale-in w-48"
                            >
                                <button
                                    type="button"
                                    @click="toggleMute"
                                    class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                    :title="isMuted ? t('player.volume_unmute') : t('player.volume_mute')"
                                    :aria-label="isMuted ? t('player.volume_unmute') : t('player.volume_mute')"
                                >
                                    <VolumeX v-if="isMuted || volume === 0" class="h-3.5 w-3.5 text-destructive" />
                                    <Volume2 v-else class="h-3.5 w-3.5" />
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    :value="isMuted ? 0 : volume"
                                    @input="onVolumeInput"
                                    class="volume-slider w-full cursor-pointer"
                                    :style="{ '--slider-progress': `${(isMuted ? 0 : volume) * 100}%` }"
                                    aria-label="Volume Slider"
                                />
                                <span class="text-[11px] font-mono font-medium text-muted-foreground tabular-nums w-8 text-right shrink-0">
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
