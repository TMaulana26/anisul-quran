<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
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
    ChevronDown,
    Check,
    Image as ImageIcon,
    Film,
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

// Scene (theme) menu & root focus target
const rootRef = ref(null);
const isSceneMenuOpen = ref(false);

// HUD Visibility & Auto-Hide (3.5 seconds inactivity)
const isHudVisible = ref(true);
let hudTimer = null;

const showHudTemporarily = () => {
    isHudVisible.value = true;
    if (hudTimer) clearTimeout(hudTimer);
    hudTimer = setTimeout(() => {
        if (audioPlayer.isPlaying.value && !isSceneMenuOpen.value) {
            isHudVisible.value = false;
        }
    }, 3500);
};

// Page scroll lock while the sanctuary covers the viewport
let previousHtmlOverflow = '';
const lockPageScroll = () => {
    previousHtmlOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
};
const unlockPageScroll = () => {
    document.documentElement.style.overflow = previousHtmlOverflow;
};

// Surah progress & Arabic scale (user font-size preference clamped 26-46px, 36px = 1x)
const totalAyahs = computed(() => props.chapter?.verses_count || props.verses.length || 1);
const progressPercent = computed(() => {
    const ayah = audioPlayer.currentAyahNumber.value || 1;
    return Math.min(100, Math.max(0, (ayah / totalAyahs.value) * 100));
});
const arabicScale = computed(() => Math.min(46, Math.max(26, props.arabicFontSize)) / 36);

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
    isSceneMenuOpen.value = false;
    tadabburAmbience.setTheme(themeId);
    showHudTemporarily();
};

const toggleSceneMenu = () => {
    isSceneMenuOpen.value = !isSceneMenuOpen.value;
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
        if (isSceneMenuOpen.value) {
            isSceneMenuOpen.value = false;
            return;
        }
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
            lockPageScroll();
            showHudTemporarily();
            window.addEventListener('keydown', handleKeyDown);
            document.addEventListener('fullscreenchange', onFullscreenChange);
            nextTick(() => rootRef.value?.focus({ preventScroll: true }));
        } else {
            tadabburAmbience.pause();
            isSceneMenuOpen.value = false;
            unlockPageScroll();
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

watch(isHudVisible, (visible) => {
    if (!visible) isSceneMenuOpen.value = false;
});

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
        lockPageScroll();
        window.addEventListener('keydown', handleKeyDown);
        document.addEventListener('fullscreenchange', onFullscreenChange);
    }
});

onUnmounted(() => {
    unlockPageScroll();
    window.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('fullscreenchange', onFullscreenChange);
    if (hudTimer) clearTimeout(hudTimer);
    tadabburAmbience.pause();
});
</script>

<template>
    <div
        v-if="open"
        ref="rootRef"
        role="dialog"
        aria-modal="true"
        :aria-label="t('tadabbur.title')"
        tabindex="-1"
        class="tdb-root fixed inset-0 z-50 select-none overflow-hidden bg-[#0b111a] font-sans text-white outline-none"
        :style="{ '--tdb-accent': currentThemeConfig.accentColor, '--ar-scale': arabicScale }"
        @mousemove="showHudTemporarily"
        @touchstart.passive="showHudTemporarily"
        @focusin="showHudTemporarily"
    >
        <h2 class="sr-only">{{ t('tadabbur.title') }}</h2>

        <!-- 1. Scene: plate / video / Ken Burns poster, drifting mist, theme tint, reading scrim -->
        <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <img
                v-if="currentThemeConfig.scene"
                :key="currentThemeConfig.scene"
                :src="currentThemeConfig.scene"
                alt=""
                class="tdb-scene absolute inset-0 size-full object-cover"
            />
            <video
                v-else-if="!isDataSaver"
                :key="currentThemeConfig.video"
                :src="currentThemeConfig.video"
                autoplay
                loop
                muted
                playsinline
                preload="auto"
                class="absolute inset-0 size-full object-cover"
                @error="handleVideoError"
            ></video>
            <div
                v-else
                :key="currentThemeConfig.poster"
                class="animate-ken-burns absolute inset-0 scale-105 bg-cover bg-center"
                :style="{ backgroundImage: `url(${currentThemeConfig.poster})` }"
            ></div>

            <div class="tdb-mist absolute -inset-[10%]"></div>
            <div
                class="absolute inset-0 transition-opacity duration-700"
                :style="{ background: currentThemeConfig.gradientOverlay, opacity: overlayOpacity }"
            ></div>
            <div class="tdb-scrim absolute inset-0"></div>
        </div>

        <!-- 2. Top bar: close + heading left, scene switcher + fullscreen right -->
        <header
            class="tdb-hud tdb-enter-top absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6"
            :class="{ 'tdb-hud-hidden': !isHudVisible }"
        >
            <div class="relative z-20 flex min-w-0 items-center gap-3">
                <button
                    type="button"
                    class="tdb-icon-btn shrink-0"
                    :title="t('tadabbur.close_tadabbur')"
                    aria-label="Close Tadabbur"
                    @click="closeTadabbur"
                >
                    <X class="size-5" aria-hidden="true" />
                </button>

                <div class="-mt-1 min-w-0 leading-snug">
                    <p class="truncate text-base font-normal text-white sm:text-[19px]">
                        {{ t('tadabbur.surah_label', { name: chapter.name_simple }) }}
                        <span class="text-white/90">(<bdi lang="ar" class="font-arabic">{{ chapter.name_arabic }}</bdi>)</span>
                    </p>
                    <p class="truncate text-sm tabular-nums text-white/65 sm:text-[15px]">
                        {{ t('tadabbur.ayah_of', { ayah: audioPlayer.currentAyahNumber.value || 1, total: totalAyahs }) }}
                    </p>
                </div>
            </div>

            <div class="relative z-20 flex shrink-0 items-center gap-3">
                <div class="relative">
                    <button
                        type="button"
                        class="tdb-pill"
                        aria-haspopup="listbox"
                        :aria-expanded="isSceneMenuOpen"
                        :aria-label="`${t('tadabbur.scene_label')}: ${t(currentThemeConfig.nameKey)}`"
                        @click="toggleSceneMenu"
                    >
                        <span class="size-2.5 shrink-0 rounded-full" :style="{ backgroundColor: currentThemeConfig.accentColor }"></span>
                        <span class="hidden truncate sm:inline">{{ t(currentThemeConfig.nameKey) }}</span>
                        <ChevronDown
                            class="size-4 shrink-0 text-white/70 transition-transform duration-300"
                            :class="{ 'rotate-180': isSceneMenuOpen }"
                            aria-hidden="true"
                        />
                    </button>

                    <Transition name="tdb-menu">
                        <div
                            v-if="isSceneMenuOpen"
                            class="tdb-menu absolute right-0 top-full z-30 mt-2 w-72 max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-2xl border border-white/12 bg-[#0e1622]/95 p-1.5 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)]"
                        >
                            <ul role="listbox" :aria-label="t('tadabbur.scene_label')">
                                <li v-for="theme in availableThemes" :key="theme.id" role="presentation">
                                    <button
                                        type="button"
                                        role="option"
                                        :aria-selected="currentThemeId === theme.id"
                                        class="tdb-menu-item"
                                        :class="{ 'tdb-menu-item-active': currentThemeId === theme.id }"
                                        @click="selectTheme(theme.id)"
                                    >
                                        <span class="size-2.5 shrink-0 rounded-full" :style="{ backgroundColor: theme.accentColor }"></span>
                                        <span class="flex-1 truncate text-left">{{ t(theme.nameKey) }}</span>
                                        <Check v-if="currentThemeId === theme.id" class="size-4 shrink-0" aria-hidden="true" />
                                    </button>
                                </li>
                            </ul>
                            <div class="my-1.5 h-px bg-white/10"></div>
                            <button
                                type="button"
                                class="tdb-menu-item"
                                :aria-pressed="isDataSaver"
                                aria-label="Toggle Data Saver"
                                @click="toggleDataSaver"
                            >
                                <ImageIcon v-if="isDataSaver" class="size-4 shrink-0 text-white/70" aria-hidden="true" />
                                <Film v-else class="size-4 shrink-0 text-white/70" aria-hidden="true" />
                                <span class="flex-1 truncate text-left">{{ t('tadabbur.data_saver') }}</span>
                                <span
                                    class="text-xs font-medium"
                                    :class="isDataSaver ? 'text-[var(--tdb-accent)]' : 'text-white/45'"
                                >{{ isDataSaver ? t('tadabbur.on') : t('tadabbur.off') }}</span>
                            </button>
                        </div>
                    </Transition>
                </div>

                <button
                    type="button"
                    class="tdb-icon-btn max-sm:!hidden"
                    :title="isFullscreen ? t('tadabbur.exit_fullscreen') : t('tadabbur.fullscreen')"
                    aria-label="Toggle Fullscreen"
                    @click="toggleFullscreen"
                >
                    <Minimize2 v-if="isFullscreen" class="size-[18px]" aria-hidden="true" />
                    <Maximize2 v-else class="size-[18px]" aria-hidden="true" />
                </button>
            </div>
        </header>

        <!-- Click-away layer for the scene menu (sits under the header controls) -->
        <div v-if="isSceneMenuOpen" class="absolute inset-0 z-10" @click="isSceneMenuOpen = false"></div>

        <!-- 3. Stage: cinematic subtitle (no card) + footer controls -->
        <div class="relative z-10 flex h-full flex-col justify-end">
            <section
                class="tdb-enter-stage pointer-events-none mb-[clamp(1.25rem,4vh,3.5rem)] px-6 text-center sm:px-10"
                aria-live="polite"
            >
                <Transition name="tdb-verse" mode="out-in">
                    <div
                        v-if="activeSubtitle.arabicText"
                        :key="`${currentVerse?.verse_number}-${activeSubtitle.id}`"
                        class="mx-auto flex max-w-6xl flex-col items-center"
                    >
                        <p class="tdb-verse font-arabic" dir="rtl" lang="ar">
                            {{ activeSubtitle.arabicText }}
                        </p>
                        <span class="tdb-rule" aria-hidden="true"></span>
                        <p v-if="showTranslation && activeSubtitle.translation" class="tdb-translation">
                            {{ activeSubtitle.translation }}
                        </p>
                    </div>
                </Transition>
            </section>

            <footer class="tdb-enter-bottom">
                <div
                    class="relative h-0.5 w-full overflow-visible bg-[#2d343d]"
                    role="progressbar"
                    aria-label="Surah progress"
                    aria-valuemin="1"
                    :aria-valuemax="totalAyahs"
                    :aria-valuenow="audioPlayer.currentAyahNumber.value || 1"
                >
                    <span
                        class="absolute inset-y-0 left-[3px] bg-[var(--tdb-accent)] transition-[width] duration-700 ease-out"
                        :style="{ width: `${progressPercent}%` }"
                    ></span>
                    <span
                        class="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--tdb-accent)] shadow-[0_0_0_4px_rgba(255,255,255,0.08)] transition-[left] duration-700 ease-out"
                        :style="{ left: `min(max(${progressPercent}%, 6px), calc(100% - 6px))` }"
                    ></span>
                </div>

                <div
                    class="tdb-hud grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-5 sm:gap-4 pb-5 pt-[22px] sm:px-8"
                    :class="{ 'tdb-hud-hidden': !isHudVisible }"
                >
                    <p class="hidden whitespace-pre-wrap text-[15px] text-white/60 lg:block">{{ t('tadabbur.shortcuts_hint') }}</p>
                    <span class="lg:hidden"></span>

                    <div class="flex items-center gap-2 sm:gap-4">
                        <button type="button" class="tdb-ghost-btn" aria-label="Previous Ayah" @click="audioPlayer.prevAyah">
                            <SkipBack class="size-6" aria-hidden="true" />
                        </button>
                        <button type="button" class="tdb-play-btn" aria-label="Play / Pause" @click="audioPlayer.togglePlay">
                            <Pause v-if="audioPlayer.isPlaying.value" class="size-6 fill-current" aria-hidden="true" />
                            <Play v-else class="size-6 translate-x-0.5 fill-current" aria-hidden="true" />
                        </button>
                        <button type="button" class="tdb-ghost-btn" aria-label="Next Ayah" @click="audioPlayer.nextAyah">
                            <SkipForward class="size-6" aria-hidden="true" />
                        </button>
                    </div>

                    <div class="flex items-center justify-self-end gap-1">
                        <button
                            type="button"
                            class="tdb-ghost-btn !size-9 sm:!size-10"
                            :title="tadabburAmbience.isMuted.value ? t('tadabbur.unmute_ambience') : t('tadabbur.mute_ambience')"
                            aria-label="Toggle Ambience Mute"
                            @click="tadabburAmbience.toggleMute"
                        >
                            <VolumeX v-if="tadabburAmbience.isMuted.value" class="size-[18px] text-rose-300" aria-hidden="true" />
                            <Volume2 v-else class="size-[18px] text-[var(--tdb-accent)]" aria-hidden="true" />
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            :value="tadabburAmbience.ambienceVolume.value"
                            class="tdb-range w-10 cursor-pointer sm:w-[94px]"
                            :style="{ '--vol': `${Math.round(tadabburAmbience.ambienceVolume.value * 100)}%` }"
                            :title="t('tadabbur.ambience_volume')"
                            aria-label="Ambience Volume Slider"
                            @input="tadabburAmbience.setVolume(parseFloat($event.target.value))"
                        />
                    </div>
                </div>
            </footer>
        </div>
    </div>
</template>

<style scoped>
.tdb-root {
    --tdb-ease: cubic-bezier(0.16, 1, 0.3, 1);
}

.tdb-root ::selection {
    background: color-mix(in oklab, var(--tdb-accent) 40%, transparent);
    color: #fff;
}

/* Scene */
.tdb-scene {
    animation: tdb-scene-drift 60s ease-in-out infinite alternate;
    transform-origin: 50% 60%;
}

.tdb-mist {
    background:
        radial-gradient(55% 32% at 18% 74%, rgba(170, 205, 205, 0.16), transparent 70%),
        radial-gradient(48% 28% at 82% 68%, rgba(170, 205, 205, 0.11), transparent 70%);
    animation: tdb-mist-drift 48s ease-in-out infinite alternate;
}

/* Reading scrim: keeps the verse legible on any theme, without a caption card */
.tdb-scrim {
    background:
        linear-gradient(to top, rgba(16, 20, 31, 0.88) 0%, rgba(16, 20, 31, 0.55) 26%, transparent 52%),
        linear-gradient(to bottom, rgba(16, 20, 31, 0.5) 0%, transparent 18%),
        radial-gradient(ellipse at 50% 45%, transparent 58%, rgba(16, 20, 31, 0.55) 100%);
}

/* Subtitle */
.tdb-verse {
    max-width: 100%;
    font-size: calc(clamp(1.9rem, 3.9vw, 4.25rem) * var(--ar-scale, 1));
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.97);
    text-wrap: balance;
    text-shadow: 0 2px 18px rgba(0, 0, 0, 0.35);
}

.tdb-rule {
    margin-block: clamp(0.5rem, 1.4vh, 1rem) clamp(0.75rem, 1.8vh, 1.25rem);
    height: 1px;
    width: min(100%, 48vw);
    background: linear-gradient(90deg, transparent, var(--tdb-accent) 30%, var(--tdb-accent) 70%, transparent);
    opacity: 0.85;
}

.tdb-translation {
    max-width: min(44rem, 88vw);
    font-size: clamp(0.9375rem, 1.5vw, 1.5rem);
    line-height: 1.55;
    color: rgba(255, 255, 255, 0.86);
    text-wrap: pretty;
    text-shadow: 0 1px 14px rgba(0, 0, 0, 0.65);
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

@media (min-width: 1024px) {
    .tdb-translation {
        max-width: min(44rem, 46vw);
        -webkit-line-clamp: 3;
    }
}

@media (min-width: 1440px) {
    .tdb-translation {
        max-width: min(52rem, 46vw);
    }
}

/* Controls */
.tdb-hud {
    transition: opacity 0.5s var(--tdb-ease);
}

.tdb-hud-hidden {
    opacity: 0;
    pointer-events: none;
}

.tdb-icon-btn,
.tdb-ghost-btn,
.tdb-play-btn,
.tdb-pill,
.tdb-menu-item {
    transition:
        background-color 0.25s var(--tdb-ease),
        transform 0.25s var(--tdb-ease),
        color 0.25s var(--tdb-ease),
        border-color 0.25s var(--tdb-ease);
}

.tdb-icon-btn {
    display: grid;
    place-items: center;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 9999px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(28, 41, 56, 0.72);
    color: rgba(255, 255, 255, 0.95);
}

.tdb-icon-btn:hover {
    background: rgba(255, 255, 255, 0.16);
}

.tdb-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.625rem;
    height: 2.5rem;
    padding-inline: 1rem;
    border-radius: 9999px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(112, 128, 144, 0.3);
    color: rgba(255, 255, 255, 0.95);
    font-size: 0.9375rem;
}

.tdb-pill:hover {
    background: rgba(255, 255, 255, 0.22);
}

/* Ambience slider: emerald fill up to the thumb */
.tdb-range {
    appearance: none;
    height: 1.25rem;
    background: transparent;
}

.tdb-range::-webkit-slider-runnable-track {
    height: 5px;
    border: 1.5px solid rgba(255, 255, 255, 0.55);
    border-radius: 9999px;
    background: linear-gradient(to right, var(--tdb-accent) var(--vol, 50%), transparent var(--vol, 50%));
}

.tdb-range::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    margin-top: -5px;
    border: 0;
    border-radius: 9999px;
    background: var(--tdb-accent);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
}

.tdb-range::-moz-range-track {
    height: 7px;
    box-sizing: border-box;
    border: 1.5px solid rgba(255, 255, 255, 0.55);
    border-radius: 9999px;
    background: transparent;
}

.tdb-range::-moz-range-progress {
    height: 6px;
    border-radius: 9999px;
    background: var(--tdb-accent);
}

.tdb-range::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border: 0;
    border-radius: 9999px;
    background: var(--tdb-accent);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
}

.tdb-range:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.85);
    outline-offset: 2px;
}

.tdb-ghost-btn {
    display: grid;
    place-items: center;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 9999px;
    color: rgba(255, 255, 255, 0.82);
}

.tdb-ghost-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
}

.tdb-play-btn {
    display: grid;
    place-items: center;
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 9999px;
    background: #fff;
    color: #0b111a;
    box-shadow: 0 10px 28px -8px rgba(0, 0, 0, 0.6);
}

.tdb-play-btn:hover {
    background: rgba(255, 255, 255, 0.9);
}

.tdb-icon-btn:active,
.tdb-ghost-btn:active,
.tdb-play-btn:active,
.tdb-pill:active {
    transform: scale(0.95);
}

.tdb-icon-btn:focus-visible,
.tdb-ghost-btn:focus-visible,
.tdb-play-btn:focus-visible,
.tdb-pill:focus-visible,
.tdb-menu-item:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.85);
    outline-offset: 2px;
}

.tdb-menu-item {
    display: flex;
    width: 100%;
    align-items: center;
    gap: 0.75rem;
    min-height: 2.75rem;
    padding-inline: 0.875rem;
    border-radius: 0.75rem;
    font-size: 0.9375rem;
    color: rgba(255, 255, 255, 0.82);
}

.tdb-menu-item:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
}

.tdb-menu-item-active {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
}

/* Motion: one authored entrance, verse crossfade, menu reveal */
.tdb-enter-top {
    animation: tdb-rise-down 0.9s var(--tdb-ease) both;
}

.tdb-enter-stage {
    animation: tdb-fade 1.1s var(--tdb-ease) 0.15s both;
}

.tdb-enter-bottom {
    animation: tdb-rise-up 0.9s var(--tdb-ease) 0.25s both;
}

.tdb-verse-enter-active {
    transition:
        opacity 0.7s var(--tdb-ease),
        transform 0.7s var(--tdb-ease),
        filter 0.7s var(--tdb-ease);
}

.tdb-verse-leave-active {
    transition: opacity 0.25s ease-out;
}

.tdb-verse-enter-from {
    opacity: 0;
    transform: translateY(10px);
    filter: blur(4px);
}

.tdb-verse-leave-to {
    opacity: 0;
}

.tdb-menu-enter-active,
.tdb-menu-leave-active {
    transition:
        opacity 0.25s var(--tdb-ease),
        transform 0.25s var(--tdb-ease);
    transform-origin: top right;
}

.tdb-menu-enter-from,
.tdb-menu-leave-to {
    opacity: 0;
    transform: translateY(-6px) scale(0.97);
}

.animate-ken-burns {
    animation: kenburns 35s ease-in-out infinite alternate;
}

@keyframes kenburns {
    0% {
        transform: scale(1) translate(0, 0);
    }
    50% {
        transform: scale(1.08) translate(-1%, -1%);
    }
    100% {
        transform: scale(1) translate(0, 0);
    }
}

@keyframes tdb-scene-drift {
    from {
        transform: scale(1.02) translate3d(0, 0, 0);
    }
    to {
        transform: scale(1.07) translate3d(-1%, -0.8%, 0);
    }
}

@keyframes tdb-mist-drift {
    from {
        transform: translate3d(-3%, 0, 0);
    }
    to {
        transform: translate3d(3%, -2%, 0);
    }
}

@keyframes tdb-rise-down {
    from {
        opacity: 0;
        transform: translateY(-12px);
    }
}

@keyframes tdb-rise-up {
    from {
        opacity: 0;
        transform: translateY(14px);
    }
}

@keyframes tdb-fade {
    from {
        opacity: 0;
    }
}

@media (prefers-reduced-motion: reduce) {
    .tdb-scene,
    .tdb-mist,
    .animate-ken-burns,
    .tdb-enter-top,
    .tdb-enter-stage,
    .tdb-enter-bottom {
        animation: none;
    }

    .tdb-verse-enter-active,
    .tdb-verse-leave-active,
    .tdb-menu-enter-active,
    .tdb-menu-leave-active {
        transition: opacity 0.2s linear;
    }

    .tdb-verse-enter-from {
        transform: none;
        filter: none;
    }

    .tdb-menu-enter-from,
    .tdb-menu-leave-to {
        transform: none;
    }
}
</style>
