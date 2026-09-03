<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useQuranAudioPlayer } from '@/composables/useQuranAudioPlayer';
import { getFormattedArabicText, parseTranslationTokens } from '@/lib/quranUtils';
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
    User,
    Minimize2,
    Loader2,
    Sparkles,
    Type,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal,
    BookOpen
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
        default: true,
    },
    arabicFontSize: {
        type: Number,
        default: 36,
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

// Footnote Dialog State
const showFootnoteDialog = ref(false);
const selectedFootnoteId = ref(null);
const selectedFootnoteNumber = ref('1');

const openFootnote = (id, number) => {
    selectedFootnoteId.value = id;
    selectedFootnoteNumber.value = number;
    showFootnoteDialog.value = true;
};

// Find current active verse object
const currentVerse = computed(() => {
    const num = audioPlayer.currentAyahNumber.value || 1;
    return props.verses.find(v => v.verse_number === num) || props.verses[0] || null;
});

// Translation tokens for current verse
const currentTranslationTokens = computed(() => {
    if (!currentVerse.value?.translations || currentVerse.value.translations.length === 0) return [];
    return parseTranslationTokens(currentVerse.value.translations[0].text || '');
});

// Transliteration text for current verse
const currentTransliteration = computed(() => {
    if (currentVerse.value?.words && currentVerse.value.words.length > 0) {
        return currentVerse.value.words
            .map(w => w.transliteration?.text)
            .filter(Boolean)
            .join(' ');
    }
    return '';
});

// Formatted Arabic text for current verse
const currentArabicText = computed(() => {
    if (!currentVerse.value) return '';
    return getFormattedArabicText(currentVerse.value, props.mushafType);
});

// Check if current verse has Arabic word tokens
const hasArabicWords = computed(() => {
    return Array.isArray(currentVerse.value?.words) && currentVerse.value.words.some(w => Boolean(w.text_uthmani || w.text_indopak || w.text));
});

const closeZenMode = () => {
    emit('update:open', false);
};

// Keyboard shortcut (Escape to exit Zen Mode, Space to toggle play)
const handleKeyDown = (e) => {
    if (!props.open) return;
    if (e.key === 'Escape') {
        closeZenMode();
    } else if (e.key === ' ' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
        e.preventDefault();
        audioPlayer.togglePlay();
    }
};

onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
});

const onSeekbarChange = (event) => {
    const val = parseFloat(event.target.value);
    const targetSeconds = (val / 100) * (audioPlayer.duration.value || 1);
    audioPlayer.seekToTime(targetSeconds);
};

const showSpeedMenu = ref(false);
const speedOptions = [0.75, 1.0, 1.25, 1.5, 2.0];

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
                class="fixed inset-0 z-50 flex flex-col justify-between bg-background text-foreground overflow-hidden select-none"
                role="dialog"
                aria-modal="true"
                aria-label="Zen Focus Reading Mode"
            >
                <!-- Meditative Radial Glow Ambient Background -->
                <div class="pointer-events-none absolute inset-0 overflow-hidden">
                    <div class="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary/10 rounded-full blur-[140px]" />
                    <div class="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-teal-500/10 rounded-full blur-[130px]" />
                </div>

                <!-- Top Zen Header Bar -->
                <header class="relative z-10 flex items-center justify-between p-4 sm:p-6 border-b border-border/40 backdrop-blur-md bg-background/60">
                    <!-- Left: Surah Name & Ayah Counter -->
                    <div class="flex items-center gap-3">
                        <div class="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                        <div>
                            <div class="flex items-center gap-2">
                                <h1 class="font-heading font-extrabold text-base sm:text-lg text-foreground">
                                    {{ chapter.name_simple }}
                                </h1>
                                <span class="font-arabic text-sm text-muted-foreground">
                                    ({{ chapter.name_arabic }})
                                </span>
                            </div>
                            <p class="text-xs text-muted-foreground font-medium">
                                Ayat <span class="text-primary font-bold">{{ audioPlayer.currentAyahNumber.value || 1 }}</span> dari {{ chapter.verses_count }}
                            </p>
                        </div>
                    </div>

                    <!-- Right Controls: Toggle Latin, Translation, Font Size & Exit Button -->
                    <div class="flex items-center gap-1.5 sm:gap-2">
                        <!-- Toggle Latin -->
                        <button
                            type="button"
                            @click="emit('update:showTransliteration', !showTransliteration)"
                            class="px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer"
                            :class="showTransliteration 
                                ? 'bg-primary/15 border-primary/40 text-primary shadow-2xs' 
                                : 'bg-muted/50 border-border/50 text-muted-foreground hover:text-foreground'"
                            title="Tampilkan / Sembunyikan Latin"
                        >
                            Latin
                        </button>

                        <!-- Toggle Translation -->
                        <button
                            type="button"
                            @click="emit('update:showTranslation', !showTranslation)"
                            class="px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer"
                            :class="showTranslation 
                                ? 'bg-primary/15 border-primary/40 text-primary shadow-2xs' 
                                : 'bg-muted/50 border-border/50 text-muted-foreground hover:text-foreground'"
                            title="Tampilkan / Sembunyikan Terjemahan"
                        >
                            Arti
                        </button>

                        <!-- Qari Selector Trigger -->
                        <button
                            type="button"
                            @click="emit('open-reciter-modal')"
                            class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 hover:bg-muted border border-border/60 text-xs font-medium text-foreground transition-colors cursor-pointer"
                            title="Ganti Qari"
                        >
                            <User class="h-3.5 w-3.5 text-primary" />
                            <span class="max-w-[120px] truncate">{{ audioPlayer.activeReciter.value?.name || 'Qari' }}</span>
                        </button>

                        <!-- Exit Zen Mode Button -->
                        <button
                            type="button"
                            @click="closeZenMode"
                            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/80 hover:bg-destructive/15 hover:text-destructive hover:border-destructive/30 border border-border text-xs font-semibold transition-all cursor-pointer ml-1"
                            title="Keluar dari Mode Zen (Esc)"
                        >
                            <Minimize2 class="h-3.5 w-3.5" />
                            <span class="hidden sm:inline">Keluar Zen</span>
                        </button>
                    </div>
                </header>

                <!-- Center Stage: Glorious Floating Ayah Content -->
                <main class="relative z-10 flex-1 flex flex-col items-center justify-center p-6 sm:p-12 overflow-y-auto max-w-4xl mx-auto w-full text-center">
                    <Transition name="fade" mode="out-in">
                        <div 
                            v-if="currentVerse" 
                            :key="currentVerse.id" 
                            class="space-y-6 sm:space-y-8 w-full animate-fade-in"
                        >
                            <!-- Big Ayah Ornament Badge -->
                            <div class="inline-flex items-center justify-center px-3.5 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold shadow-2xs">
                                <span>Ayat {{ currentVerse.verse_number }}</span>
                            </div>

                            <!-- Arabic Typography (Word-by-word with active segment highlight) -->
                            <div class="text-center py-2" dir="rtl">
                                <p 
                                    :class="[
                                        'leading-[2.6] sm:leading-[2.8] select-text transition-all duration-200',
                                        mushafType === 'indopak' ? 'font-indopak' : 'font-arabic'
                                    ]"
                                    :style="{ fontSize: `${arabicFontSize + 6}px` }"
                                >
                                    <template v-if="hasArabicWords">
                                    <template v-for="word in currentVerse.words" :key="word.id || word.position">
                                        <!-- Quranic Rosette End-of-Ayah Symbol -->
                                        <AyahEndOrnament
                                            v-if="word.char_type_name === 'end'"
                                            :verse-number="currentVerse.verse_number"
                                            size="zen"
                                            :is-active="audioPlayer.isPlaying.value"
                                        />
                                        <span
                                            v-else
                                            :class="[
                                                'inline-block transition-all duration-150 mx-1 px-1.5 py-0.5 rounded-xl',
                                                audioPlayer.currentWordIndex.value === word.position && audioPlayer.isPlaying.value
                                                    ? 'bg-primary/25 text-primary font-bold scale-110 shadow-sm ring-1 ring-primary/40'
                                                    : 'text-foreground hover:text-primary'
                                            ]"
                                        >
                                            {{ mushafType === 'indopak' ? (word.text_indopak || word.text) : (word.text_uthmani || word.text) }}
                                        </span>
                                    </template>
                                </template>
                                <template v-else>
                                    <span class="text-foreground font-semibold">
                                        {{ currentArabicText }}
                                    </span>
                                    <!-- Quranic Rosette End-of-Ayah Symbol -->
                                    <AyahEndOrnament 
                                        :verse-number="currentVerse.verse_number"
                                        size="zen"
                                        :is-active="audioPlayer.isPlaying.value"
                                    />
                                </template>
                                </p>
                            </div>

                            <!-- Latin Transliteration & Indonesian Translation -->
                            <div v-if="showTransliteration || showTranslation" class="space-y-4 max-w-2xl mx-auto pt-4 border-t border-border/50 text-center" dir="ltr">
                                <!-- Latin Transliteration -->
                                <p 
                                    v-if="showTransliteration && currentTransliteration"
                                    class="text-sm sm:text-base italic text-muted-foreground font-serif leading-relaxed"
                                >
                                    {{ currentTransliteration }}
                                </p>

                                <!-- Indonesian Translation (Kemenag RI) with interactive footnotes -->
                                <p 
                                    v-if="showTranslation && currentTranslationTokens.length > 0"
                                    class="text-base sm:text-lg leading-relaxed text-foreground font-medium"
                                >
                                    <template v-for="(token, idx) in currentTranslationTokens" :key="idx">
                                        <span v-if="token.type === 'text'">{{ token.content }}</span>
                                        <button 
                                            v-else-if="token.type === 'footnote'"
                                            @click.stop="openFootnote(token.id, token.number)"
                                            type="button"
                                            class="inline-flex items-center justify-center px-1.5 py-0.5 mx-0.5 rounded-md text-xs font-bold bg-primary/15 text-primary hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer align-baseline select-none"
                                            :title="`Klik untuk melihat Catatan Kaki [${token.number}]`"
                                        >
                                            [{{ token.number }}]
                                        </button>
                                    </template>
                                </p>
                            </div>
                        </div>
                    </Transition>
                </main>

                <!-- Bottom Zen Player Control Bar -->
                <footer class="relative z-10 p-4 sm:p-6 border-t border-border/40 backdrop-blur-md bg-background/70">
                    <div class="max-w-3xl mx-auto space-y-3">
                        <!-- Seekbar Timeline Slider -->
                        <div class="flex items-center gap-3">
                            <span class="text-xs font-mono font-medium text-muted-foreground tabular-nums w-12 text-right shrink-0">
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
                                    class="w-full h-2 rounded-lg bg-muted appearance-none cursor-pointer accent-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                                    aria-label="Timeline Audio"
                                />
                            </div>

                            <span class="text-xs font-mono font-medium text-muted-foreground tabular-nums w-12 shrink-0">
                                {{ audioPlayer.formattedDuration.value }}
                            </span>
                        </div>

                        <!-- Transport Buttons & Utilities -->
                        <div class="flex items-center justify-between gap-4">
                            <!-- Left: Speed & Repeat Mode -->
                            <div class="flex items-center gap-2">
                                <!-- Speed Menu Button -->
                                <div class="relative">
                                    <button
                                        type="button"
                                        @click="showSpeedMenu = !showSpeedMenu"
                                        class="px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-muted/60 hover:bg-muted text-foreground border border-border/50 transition-colors"
                                        title="Kecepatan Pemutaran"
                                    >
                                        {{ audioPlayer.playbackRate.value }}x
                                    </button>

                                    <div 
                                        v-if="showSpeedMenu" 
                                        class="absolute bottom-full left-0 mb-2 w-28 rounded-xl border border-border bg-popover/95 backdrop-blur-md p-1 shadow-lg z-50 flex flex-col gap-0.5 animate-scale-in"
                                    >
                                        <button
                                            v-for="rate in speedOptions"
                                            :key="rate"
                                            type="button"
                                            @click="selectSpeed(rate)"
                                            class="w-full text-left px-2.5 py-1.5 text-xs rounded-lg font-mono transition-colors flex items-center justify-between"
                                            :class="audioPlayer.playbackRate.value === rate ? 'bg-primary/15 text-primary font-bold' : 'text-foreground hover:bg-muted'"
                                        >
                                            <span>{{ rate }}x</span>
                                            <span v-if="audioPlayer.playbackRate.value === rate" class="h-1.5 w-1.5 rounded-full bg-primary" />
                                        </button>
                                    </div>
                                </div>

                                <!-- Repeat Mode Toggle -->
                                <button
                                    type="button"
                                    @click="audioPlayer.cycleRepeatMode"
                                    class="p-2 rounded-xl border transition-colors relative"
                                    :class="audioPlayer.repeatMode.value !== 'none' 
                                        ? 'bg-primary/15 border-primary/40 text-primary' 
                                        : 'bg-muted/60 border-border/50 text-muted-foreground hover:text-foreground'"
                                    :title="audioPlayer.repeatMode.value === 'ayah' ? 'Ulangi Ayat Ini' : audioPlayer.repeatMode.value === 'surah' ? 'Ulangi Surah' : 'Tanpa Pengulangan'"
                                >
                                    <Repeat1 v-if="audioPlayer.repeatMode.value === 'ayah'" class="h-4 w-4" />
                                    <Repeat v-else class="h-4 w-4" />
                                </button>
                            </div>

                            <!-- Center: Prev, Play/Pause, Next Main Controls -->
                            <div class="flex items-center gap-3">
                                <button
                                    type="button"
                                    @click="audioPlayer.prevAyah"
                                    class="p-2.5 rounded-2xl bg-muted/60 hover:bg-muted text-foreground active:scale-95 transition-all"
                                    title="Ayat Sebelumnya"
                                >
                                    <SkipBack class="h-5 w-5" />
                                </button>

                                <button
                                    type="button"
                                    @click="audioPlayer.togglePlay"
                                    class="p-4 rounded-3xl bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 shadow-lg shadow-primary/25 transition-all flex items-center justify-center"
                                    :title="audioPlayer.isPlaying.value ? 'Jeda Audio' : 'Putar Audio'"
                                >
                                    <Loader2 v-if="audioPlayer.isLoading.value" class="h-6 w-6 animate-spin" />
                                    <Pause v-else-if="audioPlayer.isPlaying.value" class="h-6 w-6 fill-current" />
                                    <Play v-else class="h-6 w-6 fill-current ml-0.5" />
                                </button>

                                <button
                                    type="button"
                                    @click="audioPlayer.nextAyah"
                                    class="p-2.5 rounded-2xl bg-muted/60 hover:bg-muted text-foreground active:scale-95 transition-all"
                                    title="Ayat Selanjutnya"
                                >
                                    <SkipForward class="h-5 w-5" />
                                </button>
                            </div>

                            <!-- Right: Volume Mute & Settings Trigger -->
                            <div class="flex items-center gap-2">
                                <button
                                    type="button"
                                    @click="audioPlayer.toggleMute"
                                    class="p-2 rounded-xl bg-muted/60 hover:bg-muted border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
                                    :title="audioPlayer.isMuted.value ? 'Nyalakan Suara' : 'Bisukan Suara'"
                                >
                                    <VolumeX v-if="audioPlayer.isMuted.value || audioPlayer.volume.value === 0" class="h-4 w-4 text-destructive" />
                                    <Volume2 v-else class="h-4 w-4" />
                                </button>

                                <button
                                    type="button"
                                    @click="emit('open-settings')"
                                    class="p-2 rounded-xl bg-muted/60 hover:bg-muted border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
                                    title="Pengaturan Tampilan"
                                >
                                    <SlidersHorizontal class="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </footer>

                <!-- Footnote Dialog Inside Zen Mode -->
                <FootnoteDialog
                    v-model:open="showFootnoteDialog"
                    :footnote-id="selectedFootnoteId"
                    :footnote-number="selectedFootnoteNumber"
                />
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-enter-from {
    opacity: 0;
    transform: translateY(8px) scale(0.99);
}

.fade-leave-to {
    opacity: 0;
    transform: translateY(-8px) scale(0.99);
}
</style>
