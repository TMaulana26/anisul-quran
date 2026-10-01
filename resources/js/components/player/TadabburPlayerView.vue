<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useQuranAudioPlayer } from '@/composables/useQuranAudioPlayer';
import { useUserPreferences } from '@/composables/useUserPreferences';
import { useTadabburAmbience } from '@/composables/useTadabburAmbience';
import { useI18n } from '@/composables/useI18n';
import {
    TADABBUR_THEMES,
    getSurahDefaultTheme,
    getThemeConfig,
    getThemeList,
} from '@/lib/tadabburThemes';
import {
    getFormattedArabicText,
    getFormattedWordText,
    cleanTranslationText,
} from '@/lib/quranUtils';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    Maximize2,
    Minimize2,
    X,
    Image as ImageIcon,
    Film,
    Sparkles,
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
    arabicFontSize: {
        type: Number,
        default: 36,
    },
    isListener: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits([
    'update:open',
    'open-settings',
    'open-reciter-modal',
]);

const audioPlayer = useQuranAudioPlayer();
const userPreferences = useUserPreferences();
const tadabburAmbience = useTadabburAmbience();
const { t } = useI18n();

// Theme State
const currentThemeId = ref(getSurahDefaultTheme(props.chapter?.id));
const currentThemeConfig = computed(() => getThemeConfig(currentThemeId.value));
const availableThemes = computed(() => getThemeList());

// Video / Data Saver State
const hasVideoError = ref(false);
const isDataSaver = computed(() => userPreferences.tadabburDataSaver.value || hasVideoError.value);
const overlayOpacity = computed(() => userPreferences.tadabburOverlayOpacity.value || 0.45);

// Fullscreen State
const isFullscreen = ref(false);

// HUD Visibility & Auto-Hide (3.5 seconds inactivity)
const isHudVisible = ref(true);
let hudTimer = null;

const showHudTemporarily = () => {
    isHudVisible.value = true;
    if (hudTimer) clearTimeout(hudTimer);
    hudTimer = setTimeout(() => {
        if (audioPlayer.isPlaying.value) {
            isHudVisible.value = false;
        }
    }, 3500);
};

// Current Verse Resolution
const currentVerse = computed(() => {
    const num = audioPlayer.currentAyahNumber.value || 1;
    return props.verses.find((v) => v.verse_number === num) || props.verses[0] || null;
});

// Smart Audio-Timed Subtitle Chunks (Max 1 Line Arabic + Translation)
const subtitleChunks = computed(() => {
    if (!currentVerse.value) return [];

    const words = currentVerse.value.words || [];
    const nonEndWords = words.filter((w) => w.char_type_name !== 'end');

    // Short verse: Entire verse fits in 1 single subtitle line
    if (nonEndWords.length <= 11) {
        const fullArabic = getFormattedArabicText(currentVerse.value, props.mushafType);
        const rawTranslation = currentVerse.value.translations?.[0]?.text || '';
        const translation = cleanTranslationText(rawTranslation);

        return [
            {
                id: 1,
                arabicText: fullArabic,
                translation: translation,
                startWordPos: 1,
                endWordPos: words.length,
            },
        ];
    }

    // Long verse: Segment words into ~7-9 words per subtitle line
    const chunkSize = 8;
    const chunks = [];
    let chunkIndex = 1;

    for (let i = 0; i < nonEndWords.length; i += chunkSize) {
        const chunkWords = nonEndWords.slice(i, i + chunkSize);
        const arabicText = chunkWords
            .map((w) => getFormattedWordText(w, props.mushafType))
            .join(' ');

        // Proportional or word-by-word translation for this phrase
        const chunkTranslation = chunkWords
            .map((w) => w.translation?.text?.trim())
            .filter(Boolean)
            .join(' ');

        chunks.push({
            id: chunkIndex++,
            arabicText,
            translation: chunkTranslation || cleanTranslationText(currentVerse.value.translations?.[0]?.text || ''),
            startWordPos: chunkWords[0]?.position || 1,
            endWordPos: chunkWords[chunkWords.length - 1]?.position || 1,
        });
    }

    return chunks;
});

// Active Subtitle Line based on current word position
const activeSubtitle = computed(() => {
    const chunks = subtitleChunks.value;
    if (chunks.length === 0) {
        return {
            arabicText: '',
            translation: '',
        };
    }
    if (chunks.length === 1) return chunks[0];

    const currentWordPos = audioPlayer.currentWordIndex.value;
    if (!currentWordPos) return chunks[0];

    // Find chunk containing current word position
    const match = chunks.find(
        (c) => currentWordPos >= c.startWordPos && currentWordPos <= c.endWordPos
    );
    return match || chunks[0];
});

// Actions
const selectTheme = (themeId) => {
    currentThemeId.value = themeId;
    hasVideoError.value = false;
    tadabburAmbience.setTheme(themeId);
    showHudTemporarily();
};

const toggleDataSaver = () => {
    userPreferences.setTadabburDataSaver(!userPreferences.tadabburDataSaver.value);
    hasVideoError.value = false;
    showHudTemporarily();
};

const toggleFullscreen = async () => {
    try {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
            isFullscreen.value = true;
        } else {
            await document.exitFullscreen();
            isFullscreen.value = false;
        }
    } catch (e) {
        // Fullscreen might be restricted
    }
    showHudTemporarily();
};

const closeTadabbur = () => {
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
    }
    tadabburAmbience.pause();
    emit('update:open', false);
};

const handleVideoError = () => {
    hasVideoError.value = true;
};

// Keyboard Shortcuts Listener
const handleKeyDown = (e) => {
    if (!props.open) return;

    if (e.code === 'Space') {
        e.preventDefault();
        audioPlayer.togglePlay();
        showHudTemporarily();
    } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        audioPlayer.nextAyah();
        showHudTemporarily();
    } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        audioPlayer.prevAyah();
        showHudTemporarily();
    } else if (e.code === 'KeyM') {
        e.preventDefault();
        tadabburAmbience.toggleMute();
        showHudTemporarily();
    } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
    } else if (e.code === 'Escape') {
        e.preventDefault();
        closeTadabbur();
    }
};

const onFullscreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement;
};

// Watchers & Lifecycle
watch(
    () => props.open,
    (isOpen) => {
        if (isOpen) {
            currentThemeId.value = getSurahDefaultTheme(props.chapter?.id);
            tadabburAmbience.init();
            tadabburAmbience.setTheme(currentThemeId.value);
            if (audioPlayer.isPlaying.value) {
                tadabburAmbience.play(currentThemeId.value);
            }
            showHudTemporarily();
            window.addEventListener('keydown', handleKeyDown);
            document.addEventListener('fullscreenchange', onFullscreenChange);
        } else {
            tadabburAmbience.pause();
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('fullscreenchange', onFullscreenChange);
            if (hudTimer) clearTimeout(hudTimer);
        }
    }
);

watch(
    () => audioPlayer.isPlaying.value,
    (playing) => {
        if (!props.open) return;
        if (playing) {
            tadabburAmbience.play(currentThemeId.value);
            showHudTemporarily();
        } else {
            tadabburAmbience.pause();
            isHudVisible.value = true;
            if (hudTimer) clearTimeout(hudTimer);
        }
    }
);

watch(
    () => props.chapter?.id,
    (newChapterId) => {
        if (newChapterId) {
            const defTheme = getSurahDefaultTheme(newChapterId);
            currentThemeId.value = defTheme;
            tadabburAmbience.setTheme(defTheme);
        }
    }
);

onMounted(() => {
    if (props.open) {
        window.addEventListener('keydown', handleKeyDown);
        document.addEventListener('fullscreenchange', onFullscreenChange);
    }
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('fullscreenchange', onFullscreenChange);
    if (hudTimer) clearTimeout(hudTimer);
    tadabburAmbience.pause();
});
</script>

<template>
    <div
        v-if="open"
        class="fixed inset-0 z-50 overflow-hidden select-none bg-black flex flex-col justify-between font-sans transition-colors duration-700"
        @mousemove="showHudTemporarily"
        @touchstart="showHudTemporarily"
        tabindex="0"
    >
        <!-- 1. Background Video or Ken Burns Poster -->
        <div class="absolute inset-0 pointer-events-none overflow-hidden">
            <video
                v-if="!isDataSaver"
                :key="currentThemeConfig.video"
                :src="currentThemeConfig.video"
                autoplay
                loop
                muted
                playsinline
                preload="auto"
                class="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
                @error="handleVideoError"
            ></video>

            <!-- Fallback / Data Saver Ken Burns Motion Background -->
            <div
                v-else
                :key="currentThemeConfig.poster"
                class="absolute inset-0 bg-cover bg-center animate-ken-burns scale-105 transition-transform duration-1000"
                :style="{ backgroundImage: `url(${currentThemeConfig.poster})` }"
            ></div>

            <!-- Dynamic Contrast Vignette Overlay -->
            <div
                class="absolute inset-0 transition-opacity duration-700 pointer-events-none"
                :style="{
                    background: currentThemeConfig.gradientOverlay,
                    opacity: overlayOpacity,
                }"
            ></div>
        </div>

        <!-- 2. Minimalist HUD: Top Header Bar -->
        <header
            class="relative z-20 flex items-center justify-between px-4 sm:px-8 pt-4 pb-2 transition-opacity duration-500"
            :class="{ 'opacity-0 pointer-events-none': !isHudVisible, 'opacity-100': isHudVisible }"
        >
            <!-- Left: Back Button & Surah Badge -->
            <div class="flex items-center gap-3">
                <button
                    @click="closeTadabbur"
                    class="p-2 sm:p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white/90 border border-white/10 backdrop-blur-md transition-all active:scale-95 shadow-lg"
                    :title="t('tadabbur.close_tadabbur')"
                    aria-label="Close Tadabbur"
                >
                    <X class="w-5 h-5" />
                </button>

                <div class="flex flex-col">
                    <div class="flex items-center gap-2">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/10 backdrop-blur-md">
                            <Sparkles class="w-3 h-3 text-amber-300" />
                            <span>{{ t('tadabbur.title') }}</span>
                        </span>
                        <span class="text-xs sm:text-sm font-medium text-white/80 drop-shadow">
                            {{ chapter.name_simple }} ({{ chapter.name_arabic }})
                        </span>
                    </div>
                    <span class="text-[11px] text-white/60 drop-shadow">
                        {{ t('tadabbur.ayah_badge', { surah: chapter.name_simple, ayah: audioPlayer.currentAyahNumber.value || 1 }) }}
                    </span>
                </div>
            </div>

            <!-- Right: Quick Themes Pill, Data Saver, Fullscreen -->
            <div class="flex items-center gap-2 sm:gap-3">
                <!-- 5 Theme Quick Switcher Pills -->
                <div class="flex items-center gap-1 p-1 rounded-full bg-black/40 border border-white/10 backdrop-blur-md shadow-lg">
                    <button
                        v-for="theme in availableThemes"
                        :key="theme.id"
                        @click="selectTheme(theme.id)"
                        class="p-1.5 sm:px-2.5 sm:py-1 rounded-full text-xs transition-all flex items-center gap-1"
                        :class="currentThemeId === theme.id ? 'bg-white/20 text-white font-medium shadow-inner' : 'text-white/60 hover:text-white hover:bg-white/10'"
                        :title="t(theme.nameKey)"
                    >
                        <span class="text-sm leading-none">{{ theme.icon }}</span>
                        <span class="hidden md:inline">{{ t(theme.nameKey) }}</span>
                    </button>
                </div>

                <!-- Data Saver Toggle -->
                <button
                    @click="toggleDataSaver"
                    class="p-2 sm:p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white/90 border border-white/10 backdrop-blur-md transition-all active:scale-95 shadow-lg"
                    :class="{ 'text-amber-300 border-amber-400/40': isDataSaver }"
                    :title="t('tadabbur.data_saver')"
                    aria-label="Toggle Data Saver"
                >
                    <ImageIcon v-if="isDataSaver" class="w-4 h-4" />
                    <Film v-else class="w-4 h-4" />
                </button>

                <!-- Fullscreen Toggle -->
                <button
                    @click="toggleFullscreen"
                    class="p-2 sm:p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white/90 border border-white/10 backdrop-blur-md transition-all active:scale-95 shadow-lg"
                    :title="isFullscreen ? t('tadabbur.exit_fullscreen') : t('tadabbur.fullscreen')"
                    aria-label="Toggle Fullscreen"
                >
                    <Minimize2 v-if="isFullscreen" class="w-4 h-4" />
                    <Maximize2 v-else class="w-4 h-4" />
                </button>
            </div>
        </header>

        <!-- 3. Center/Bottom Cinematic Subtitle Stage -->
        <main class="relative z-10 flex-1 flex flex-col justify-end items-center pb-28 sm:pb-32 px-4 sm:px-8 text-center pointer-events-none">
            <div class="w-full max-w-5xl mx-auto flex flex-col items-center gap-4 transition-all duration-500">
                <!-- Subtitle Container (Cinema Styling) -->
                <div
                    v-if="activeSubtitle.arabicText"
                    class="inline-flex flex-col items-center gap-3 px-6 sm:px-10 py-4 sm:py-6 rounded-3xl bg-black/45 backdrop-blur-[3px] border border-white/10 shadow-2xl max-w-4xl transition-all duration-500"
                >
                    <!-- Max 1-Line Arabic Subtitle -->
                    <p
                        class="font-arabic text-2xl sm:text-4xl md:text-5xl text-white/95 leading-relaxed tracking-wide text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-full drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]"
                        dir="rtl"
                        :style="{ fontSize: `${Math.min(46, Math.max(26, arabicFontSize))}px` }"
                    >
                        {{ activeSubtitle.arabicText }}
                    </p>

                    <!-- Translation Subtitle Line -->
                    <p
                        v-if="showTranslation && activeSubtitle.translation"
                        class="text-sm sm:text-base md:text-lg text-neutral-200 font-medium leading-normal tracking-wide text-center line-clamp-2 max-w-3xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
                    >
                        {{ activeSubtitle.translation }}
                    </p>
                </div>
            </div>
        </main>

        <!-- 4. Minimalist HUD: Bottom Transport & Ambience Bar -->
        <footer
            class="relative z-20 flex items-center justify-between px-4 sm:px-8 pb-6 pt-2 transition-opacity duration-500"
            :class="{ 'opacity-0 pointer-events-none': !isHudVisible, 'opacity-100': isHudVisible }"
        >
            <!-- Left: Keyboard Shortcut Hint -->
            <div class="hidden lg:flex items-center text-xs text-white/50 drop-shadow">
                <span>{{ t('tadabbur.shortcuts_hint') }}</span>
            </div>

            <!-- Center: Audio Transport Floating Pill -->
            <div class="flex items-center gap-2 sm:gap-4 p-1.5 sm:p-2 rounded-full bg-black/50 border border-white/10 backdrop-blur-md shadow-2xl mx-auto">
                <button
                    @click="audioPlayer.prevAyah"
                    class="p-2 sm:p-2.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition active:scale-95"
                    aria-label="Previous Ayah"
                >
                    <SkipBack class="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <button
                    @click="audioPlayer.togglePlay"
                    class="p-3 sm:p-3.5 rounded-full bg-white text-black hover:bg-neutral-200 transition active:scale-95 shadow-lg"
                    aria-label="Play / Pause"
                >
                    <Pause v-if="audioPlayer.isPlaying.value" class="w-5 h-5 fill-current" />
                    <Play v-else class="w-5 h-5 fill-current translate-x-0.5" />
                </button>

                <button
                    @click="audioPlayer.nextAyah"
                    class="p-2 sm:p-2.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition active:scale-95"
                    aria-label="Next Ayah"
                >
                    <SkipForward class="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
            </div>

            <!-- Right: Secondary Nature Soundscape Ambience Mixer -->
            <div class="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-full bg-black/50 border border-white/10 backdrop-blur-md shadow-2xl">
                <button
                    @click="tadabburAmbience.toggleMute"
                    class="p-1.5 text-white/80 hover:text-white transition active:scale-95"
                    :title="tadabburAmbience.isMuted.value ? t('tadabbur.unmute_ambience') : t('tadabbur.mute_ambience')"
                    aria-label="Toggle Ambience Mute"
                >
                    <VolumeX v-if="tadabburAmbience.isMuted.value" class="w-4 h-4 text-rose-400" />
                    <Volume2 v-else class="w-4 h-4 text-emerald-400" />
                </button>

                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    :value="tadabburAmbience.ambienceVolume.value"
                    @input="tadabburAmbience.setVolume(parseFloat($event.target.value))"
                    class="w-16 sm:w-20 accent-emerald-400 bg-white/20 h-1 rounded-lg cursor-pointer"
                    :title="t('tadabbur.ambience_volume')"
                    aria-label="Ambience Volume Slider"
                />
            </div>
        </footer>
    </div>
</template>

<style scoped>
@keyframes kenburns {
    0% {
        transform: scale(1.0) translate(0, 0);
    }
    50% {
        transform: scale(1.08) translate(-1%, -1%);
    }
    100% {
        transform: scale(1.0) translate(0, 0);
    }
}

.animate-ken-burns {
    animation: kenburns 35s ease-in-out infinite alternate;
}
</style>
