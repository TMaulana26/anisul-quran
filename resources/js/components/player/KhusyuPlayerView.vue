<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useQuranAudioPlayer } from '@/composables/useQuranAudioPlayer';
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
    User,
    Minimize2,
    Loader2,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal,
    BookOpen,
    Eye,
    Moon,
    Layers,
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

// Active Atmosphere Theme ('noor' | 'midnight' | 'warqah')
const currentTheme = ref('noor');
const showCompareModal = ref(false);
const showFullTranslationDialog = ref(false);

onMounted(() => {
    try {
        const saved = localStorage.getItem('anisul_khusyu_theme');
        if (saved && ['noor', 'midnight', 'warqah'].includes(saved)) {
            currentTheme.value = saved;
        }
    } catch (e) {}
});

const setTheme = (theme) => {
    currentTheme.value = theme;
    try {
        localStorage.setItem('anisul_khusyu_theme', theme);
    } catch (e) {}
};

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

// Line-by-Line Grouping: Group words by line_number from Quran Foundation API
const linesOfVerse = computed(() => {
    if (!currentVerse.value || !Array.isArray(currentVerse.value.words) || currentVerse.value.words.length === 0) {
        return [];
    }

    const words = currentVerse.value.words;
    const lineMap = new Map();

    words.forEach((word) => {
        const lineKey = (word.line_number !== undefined && word.line_number !== null)
            ? `${word.page_number || 0}_${word.line_number}`
            : Math.ceil((word.position || 1) / 8);

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

    return lines.map((line, index) => {
        const lineWords = line.words;
        const nonEndWords = lineWords.filter(w => w.char_type_name !== 'end');

        // Assembled flowing Indonesian translation for this line
        const lineTranslation = nonEndWords
            .map(w => w.translation?.text?.trim())
            .filter(Boolean)
            .join(' ');

        // Assembled Latin transliteration for this line
        const lineTransliteration = nonEndWords
            .map(w => w.transliteration?.text?.trim())
            .filter(Boolean)
            .join(' ');

        const startPosition = lineWords[0]?.position || 1;
        const endPosition = lineWords[lineWords.length - 1]?.position || startPosition;
        const hasEndSymbol = lineWords.some(w => w.char_type_name === 'end');

        return {
            index: index + 1,
            totalLines: lines.length,
            words: lineWords,
            nonEndWords,
            lineTranslation: lineTranslation || currentVerse.value?.translations?.[0]?.text || '',
            lineTransliteration,
            startPosition,
            endPosition,
            hasEndSymbol,
        };
    });
});

// Active Line Index
const activeLineIndex = ref(1);

// Sync active line automatically with audioPlayer.currentWordIndex
watch(() => audioPlayer.currentWordIndex.value, (wordPos) => {
    if (!wordPos || linesOfVerse.value.length === 0) return;
    const foundLine = linesOfVerse.value.find(l => wordPos >= l.startPosition && wordPos <= l.endPosition);
    if (foundLine) {
        activeLineIndex.value = foundLine.index;
    }
}, { immediate: true });

// Reset activeLineIndex to 1 when verse changes
watch(() => currentVerse.value?.id, () => {
    activeLineIndex.value = 1;
});

const currentLine = computed(() => {
    if (linesOfVerse.value.length === 0) return null;
    const idx = Math.min(Math.max(1, activeLineIndex.value), linesOfVerse.value.length);
    return linesOfVerse.value[idx - 1] || linesOfVerse.value[0];
});

// Seek audio to specific word position
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

const goToLine = (lineIdx) => {
    if (lineIdx < 1 || lineIdx > linesOfVerse.value.length) return;
    activeLineIndex.value = lineIdx;
    const targetLine = linesOfVerse.value[lineIdx - 1];
    if (targetLine) {
        seekToWord(targetLine.startPosition);
    }
};

const nextLine = () => {
    if (activeLineIndex.value < linesOfVerse.value.length) {
        goToLine(activeLineIndex.value + 1);
    } else {
        audioPlayer.nextAyah();
    }
};

const prevLine = () => {
    if (activeLineIndex.value > 1) {
        goToLine(activeLineIndex.value - 1);
    } else {
        audioPlayer.prevAyah();
    }
};

const closeKhusyuMode = () => {
    emit('update:open', false);
};
const closeZenMode = closeKhusyuMode;

// Keyboard shortcut (Escape, Left/Right for lines, Space for play)
const handleKeyDown = (e) => {
    if (!props.open) return;
    if (e.key === 'Escape') {
        if (showCompareModal.value) {
            showCompareModal.value = false;
        } else if (showFullTranslationDialog.value) {
            showFullTranslationDialog.value = false;
        } else {
            closeKhusyuMode();
        }
    } else if (e.key === ' ' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
        e.preventDefault();
        audioPlayer.togglePlay();
    } else if (e.key === 'ArrowRight' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        nextLine();
    } else if (e.key === 'ArrowLeft' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        prevLine();
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
                <!-- Meditative Radial Glow Ambient Background -->
                <div class="pointer-events-none absolute inset-0 overflow-hidden">
                    <!-- Noor Theme Ambient -->
                    <template v-if="currentTheme === 'noor'">
                        <div class="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary/10 rounded-full blur-[140px]" />
                        <div class="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-teal-500/10 rounded-full blur-[130px]" />
                    </template>

                    <!-- Midnight Theme Ambient (Golden Tahajjud Glow) -->
                    <template v-else-if="currentTheme === 'midnight'">
                        <div class="absolute -top-40 left-1/2 -translate-x-1/2 w-[650px] h-[450px] bg-amber-500/10 rounded-full blur-[160px]" />
                        <div class="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-500/10 rounded-full blur-[150px]" />
                    </template>

                    <!-- Warqah Theme Ambient (Warm Parchment Glow) -->
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
                    <!-- Left: Surah Info & Line Progress -->
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
                                <span v-if="currentLine && currentLine.totalLines > 1" class="ml-1 opacity-90 font-semibold">
                                    • Baris {{ currentLine.index }} dari {{ currentLine.totalLines }}
                                </span>
                            </p>
                        </div>
                    </div>

                    <!-- Center / Right Controls: Atmosphere Switcher, Latin Toggle, Full Translation, Exit -->
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
                                title="Konsep 1: Noor Sanctuary (Modern Bersih)"
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
                                title="Konsep 2: Midnight Mushaf (Tahajjud Malam Emas)"
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
                                title="Konsep 3: Warqah Turath (Manuskrip Perkamen Klasik)"
                            >
                                <ScrollText class="h-3.5 w-3.5" />
                                <span class="hidden md:inline">Warqah</span>
                            </button>
                        </div>

                        <!-- Button to compare all 3 mockups side by side -->
                        <button
                            type="button"
                            @click="showCompareModal = true"
                            :class="[
                                'hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer',
                                currentTheme === 'noor' ? 'bg-muted/60 border-border/60 hover:bg-muted' : '',
                                currentTheme === 'midnight' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20' : '',
                                currentTheme === 'warqah' ? 'bg-amber-900/10 dark:bg-amber-400/10 border-amber-900/25 dark:border-amber-400/25 hover:bg-amber-900/20' : ''
                            ]"
                            title="Bandingkan Ketiga Konsep Mockup Secara Langsung"
                        >
                            <Layers class="h-3.5 w-3.5" />
                            <span>3 Preview</span>
                        </button>

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

                        <!-- Full Translation Modal Trigger -->
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
                            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/80 hover:bg-destructive/15 hover:text-destructive hover:border-destructive/30 border border-border text-xs font-semibold transition-all cursor-pointer ml-1"
                            title="Keluar dari Mode Khusyu' (Esc)"
                        >
                            <Minimize2 class="h-3.5 w-3.5" />
                            <span class="hidden sm:inline">Keluar Khusyu'</span>
                        </button>
                    </div>
                </header>

                <!-- Center Stage: Pure Isolated Line Sanctuary (Zero-Scrollbar Guaranteed) -->
                <main class="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-4 sm:px-12 sm:py-8 overflow-hidden max-w-5xl mx-auto w-full text-center">
                    <!-- Previous Line / Verse Floating Arrow (Left) -->
                    <button
                        type="button"
                        @click="prevLine"
                        class="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full opacity-40 hover:opacity-100 hover:scale-110 active:scale-95 transition-all cursor-pointer z-20 backdrop-blur-md"
                        :title="activeLineIndex > 1 ? 'Baris Sebelumnya (Panah Kiri)' : 'Ayat Sebelumnya'"
                    >
                        <ChevronLeft class="h-6 w-6 sm:h-8 sm:w-8" />
                    </button>

                    <!-- Next Line / Verse Floating Arrow (Right) -->
                    <button
                        type="button"
                        @click="nextLine"
                        class="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full opacity-40 hover:opacity-100 hover:scale-110 active:scale-95 transition-all cursor-pointer z-20 backdrop-blur-md"
                        :title="activeLineIndex < linesOfVerse.length ? 'Baris Selanjutnya (Panah Kanan)' : 'Ayat Selanjutnya'"
                    >
                        <ChevronRight class="h-6 w-6 sm:h-8 sm:w-8" />
                    </button>

                    <!-- Active Line Card Container with Gentle Elevation & Dissolve Transition -->
                    <Transition name="khusyu-line" mode="out-in">
                        <div 
                            v-if="currentLine"
                            :key="`${currentVerse?.id}_${currentLine.index}_${currentTheme}`"
                            :class="[
                                'w-full max-w-4xl mx-auto flex flex-col items-center justify-center p-6 sm:p-10 transition-all duration-500 select-text',
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
                            <!-- Line Indicator Badge -->
                            <div 
                                :class="[
                                    'inline-flex items-center justify-center px-4 py-1 rounded-full text-xs font-bold mb-6 tracking-wide transition-colors',
                                    currentTheme === 'noor' ? 'bg-primary/10 text-primary border border-primary/25' : '',
                                    currentTheme === 'midnight' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/35' : '',
                                    currentTheme === 'warqah' ? 'bg-amber-800/15 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-800/25 dark:border-amber-500/30' : ''
                                ]"
                            >
                                <span v-if="currentLine.totalLines > 1">
                                    Ayat {{ currentVerse.verse_number }} • Bagian {{ currentLine.index }} dari {{ currentLine.totalLines }}
                                </span>
                                <span v-else>
                                    Ayat {{ currentVerse.verse_number }}
                                </span>
                            </div>

                            <!-- 1. Teks Arab Murni Baris Tersebut (Besar, Agung, Megah) -->
                            <div class="w-full mb-6 text-center" dir="rtl">
                                <p 
                                    :class="[
                                        'leading-[2.4] sm:leading-[2.8] tracking-normal transition-all duration-300',
                                        mushafType === 'indopak' ? 'font-indopak' : 'font-arabic',
                                        currentTheme === 'noor' ? 'text-foreground' : '',
                                        currentTheme === 'midnight' ? 'text-[#faebd7] drop-shadow-[0_2px_12px_rgba(245,158,11,0.2)]' : '',
                                        currentTheme === 'warqah' ? 'text-[#2b1810] dark:text-[#f8ecd0]' : ''
                                    ]"
                                    :style="{ fontSize: `${arabicFontSize + 8}px` }"
                                >
                                    <template v-for="word in currentLine.words" :key="word.id || word.position">
                                        <AyahEndOrnament
                                            v-if="word.char_type_name === 'end'"
                                            :verse-number="currentVerse.verse_number"
                                            size="khusyu"
                                            :is-active="audioPlayer.isPlaying.value"
                                        />
                                        <span 
                                            v-else 
                                            class="inline-block mx-1.5 transition-colors duration-200"
                                        >
                                            {{ getFormattedWordText(word, mushafType) }}
                                        </span>
                                    </template>
                                </p>
                            </div>

                            <!-- 2. Transliterasi Latin Penggalan Baris (Opsional) -->
                            <div 
                                v-if="showTransliteration && currentLine.lineTransliteration"
                                class="w-full max-w-2xl mx-auto mb-3 text-center"
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
                                    {{ currentLine.lineTransliteration }}
                                </p>
                            </div>

                            <!-- 3. Terjemahan Penggalan Baris (Kalimat Mengalir Tenang) -->
                            <div 
                                class="w-full max-w-2xl mx-auto text-center"
                                dir="ltr"
                            >
                                <p 
                                    :class="[
                                        'leading-relaxed sm:leading-loose text-base sm:text-lg transition-colors duration-300',
                                        currentTheme === 'noor' ? 'font-sans font-medium text-foreground/85' : '',
                                        currentTheme === 'midnight' ? 'font-serif italic text-amber-100/90 text-lg sm:text-xl' : '',
                                        currentTheme === 'warqah' ? 'font-serif text-[#463024] dark:text-[#d3c2aa] text-base sm:text-lg' : ''
                                    ]"
                                >
                                    “{{ currentLine.lineTranslation }}”
                                </p>
                            </div>

                            <!-- Line Pagination Dots (if multi-line) -->
                            <div 
                                v-if="currentLine.totalLines > 1" 
                                class="flex items-center justify-center gap-1.5 mt-6"
                            >
                                <button
                                    v-for="l in linesOfVerse"
                                    :key="l.index"
                                    type="button"
                                    @click="goToLine(l.index)"
                                    :class="[
                                        'h-1.5 rounded-full transition-all cursor-pointer',
                                        l.index === currentLine.index 
                                            ? (currentTheme === 'midnight' ? 'w-6 bg-amber-400' : 'w-6 bg-primary')
                                            : 'w-1.5 opacity-30 hover:opacity-80 bg-foreground'
                                    ]"
                                    :title="`Menuju Baris ${l.index}`"
                                />
                            </div>
                        </div>
                    </Transition>
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
                                        'w-full h-2 rounded-lg bg-muted appearance-none cursor-pointer focus:outline-none focus-visible:ring-2',
                                        currentTheme === 'midnight' ? 'accent-amber-400 focus-visible:ring-amber-400/40' : 'accent-primary focus-visible:ring-primary/40'
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
                                <!-- Speed Menu Button -->
                                <div ref="speedMenuRef" class="relative">
                                    <button
                                        type="button"
                                        @click="showSpeedMenu = !showSpeedMenu"
                                        class="px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-muted/60 hover:bg-muted border border-border/50 transition-colors cursor-pointer"
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

                                <!-- Repeat Mode Toggle -->
                                <button
                                    type="button"
                                    @click="audioPlayer.cycleRepeatMode"
                                    class="p-2 rounded-xl border transition-colors relative cursor-pointer"
                                    :class="audioPlayer.repeatMode.value !== 'none' 
                                        ? 'bg-primary/15 border-primary/40 text-primary' 
                                        : 'bg-muted/60 border-border/50 opacity-75 hover:opacity-100'"
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
                                    class="p-2.5 rounded-2xl bg-muted/60 hover:bg-muted active:scale-95 transition-all cursor-pointer"
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
                                    class="p-2.5 rounded-2xl bg-muted/60 hover:bg-muted active:scale-95 transition-all cursor-pointer"
                                    title="Ayat Selanjutnya"
                                >
                                    <SkipForward class="h-5 w-5" />
                                </button>
                            </div>

                            <!-- Right: Volume Popover Slider & Settings Trigger -->
                            <div class="flex items-center gap-2">
                                <div ref="volumeContainerRef" class="relative flex items-center">
                                    <button
                                        type="button"
                                        @click="showVolumeSlider = !showVolumeSlider"
                                        @mouseenter="showVolumeSlider = true"
                                        class="p-2 rounded-xl bg-muted/60 hover:bg-muted border border-border/50 opacity-75 hover:opacity-100 transition-colors cursor-pointer"
                                        :title="audioPlayer.isMuted.value ? 'Nyalakan Suara' : 'Pengaturan Volume'"
                                    >
                                        <VolumeX v-if="audioPlayer.isMuted.value || audioPlayer.volume.value === 0" class="h-4 w-4 text-destructive" />
                                        <Volume2 v-else class="h-4 w-4" />
                                    </button>

                                    <!-- Volume Slider Popover -->
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
                                    class="p-2 rounded-xl bg-muted/60 hover:bg-muted border border-border/50 opacity-75 hover:opacity-100 transition-colors cursor-pointer"
                                    title="Pengaturan Tampilan"
                                >
                                    <SlidersHorizontal class="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </footer>

                <!-- MODAL 1: Compare 3 Atmosphere Concepts Side by Side (/impeccable live preview) -->
                <div 
                    v-if="showCompareModal" 
                    class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-xl select-text animate-fade-in"
                    role="dialog"
                >
                    <div class="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto scrollbar-none rounded-3xl bg-background border border-border p-6 sm:p-8 shadow-2xl flex flex-col gap-6">
                        <!-- Header Modal -->
                        <div class="flex items-center justify-between border-b border-border/50 pb-4">
                            <div>
                                <h2 class="font-heading font-extrabold text-lg sm:text-xl flex items-center gap-2">
                                    <Layers class="h-5 w-5 text-primary" />
                                    <span>3 Pratinjau Konsep Visual Mode Khusyu' (خُشُوع)</span>
                                </h2>
                                <p class="text-xs text-muted-foreground mt-0.5">
                                    Pilih suasana yang paling menenteramkan batin Anda untuk tilawah dan tadabbur.
                                </p>
                            </div>

                            <button
                                type="button"
                                @click="showCompareModal = false"
                                class="p-2 rounded-xl bg-muted/60 hover:bg-muted transition-colors cursor-pointer"
                            >
                                <X class="h-5 w-5" />
                            </button>
                        </div>

                        <!-- 3 Cards Grid -->
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
                            <!-- Konsep 1: Noor Sanctuary -->
                            <div 
                                @click="setTheme('noor'); showCompareModal = false;"
                                class="group relative flex flex-col justify-between p-6 rounded-3xl border-2 transition-all cursor-pointer bg-card hover:scale-[1.02] shadow-lg"
                                :class="currentTheme === 'noor' ? 'border-primary ring-2 ring-primary/30' : 'border-border/60 hover:border-primary/50'"
                            >
                                <div class="space-y-4">
                                    <div class="flex items-center justify-between">
                                        <span class="px-3 py-1 rounded-full text-xs font-bold bg-primary/15 text-primary border border-primary/25 flex items-center gap-1.5">
                                            <Sparkles class="h-3.5 w-3.5" />
                                            1. Noor Sanctuary
                                        </span>
                                        <span v-if="currentTheme === 'noor'" class="text-xs font-bold text-primary">Aktif ✓</span>
                                    </div>
                                    <p class="text-xs text-muted-foreground leading-relaxed">
                                        Modern, sejuk, lapang dengan aksen zamrud fajar dan font sans modern yang bersih.
                                    </p>

                                    <!-- Mini Preview Box -->
                                    <div class="p-4 rounded-2xl bg-muted/30 border border-border/50 text-center space-y-3">
                                        <p class="font-arabic text-xl leading-loose" dir="rtl">
                                            {{ currentLine?.words?.slice(0, 4)?.map(w => getFormattedWordText(w, mushafType))?.join(' ') || 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ' }}
                                        </p>
                                        <p class="text-xs font-sans text-foreground/80 leading-relaxed">
                                            “{{ currentLine?.lineTranslation?.slice(0, 60) || 'Dengan nama Allah Yang Maha Pengasih...' }}...”
                                        </p>
                                    </div>
                                </div>

                                <button 
                                    type="button" 
                                    class="w-full mt-4 py-2 rounded-xl text-xs font-bold transition-colors bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                                >
                                    Gunakan Konsep Noor
                                </button>
                            </div>

                            <!-- Konsep 2: Midnight Mushaf -->
                            <div 
                                @click="setTheme('midnight'); showCompareModal = false;"
                                class="group relative flex flex-col justify-between p-6 rounded-3xl border-2 transition-all cursor-pointer bg-[#0a0e17] text-[#faebd7] hover:scale-[1.02] shadow-lg"
                                :class="currentTheme === 'midnight' ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-amber-500/20 hover:border-amber-400/50'"
                            >
                                <div class="space-y-4">
                                    <div class="flex items-center justify-between">
                                        <span class="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                                            <Moon class="h-3.5 w-3.5" />
                                            2. Midnight Mushaf
                                        </span>
                                        <span v-if="currentTheme === 'midnight'" class="text-xs font-bold text-amber-400">Aktif ✓</span>
                                    </div>
                                    <p class="text-xs text-amber-100/70 leading-relaxed">
                                        Suasana hening malam tahajjud, obsidian pekat dengan kaligrafi emas hangat dan font terjemahan serif puitis.
                                    </p>

                                    <!-- Mini Preview Box -->
                                    <div class="p-4 rounded-2xl bg-white/5 border border-amber-500/20 text-center space-y-3">
                                        <p class="font-arabic text-xl leading-loose text-amber-200" dir="rtl">
                                            {{ currentLine?.words?.slice(0, 4)?.map(w => getFormattedWordText(w, mushafType))?.join(' ') || 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ' }}
                                        </p>
                                        <p class="text-xs font-serif italic text-amber-100/80 leading-relaxed">
                                            “{{ currentLine?.lineTranslation?.slice(0, 60) || 'Dengan nama Allah Yang Maha Pengasih...' }}...”
                                        </p>
                                    </div>
                                </div>

                                <button 
                                    type="button" 
                                    class="w-full mt-4 py-2 rounded-xl text-xs font-bold transition-colors bg-amber-500/20 text-amber-300 group-hover:bg-amber-400 group-hover:text-slate-950"
                                >
                                    Gunakan Konsep Midnight
                                </button>
                            </div>

                            <!-- Konsep 3: Warqah Turath -->
                            <div 
                                @click="setTheme('warqah'); showCompareModal = false;"
                                class="group relative flex flex-col justify-between p-6 rounded-3xl border-2 transition-all cursor-pointer bg-[#fcf8f0] text-[#2c1d11] dark:bg-[#1f1a15] dark:text-[#f4ebd0] hover:scale-[1.02] shadow-lg"
                                :class="currentTheme === 'warqah' ? 'border-amber-800 dark:border-amber-500 ring-2 ring-amber-800/30' : 'border-amber-800/20 dark:border-amber-600/30 hover:border-amber-800/50'"
                            >
                                <div class="space-y-4">
                                    <div class="flex items-center justify-between">
                                        <span class="px-3 py-1 rounded-full text-xs font-bold bg-amber-800/15 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-800/25 dark:border-amber-500/30 flex items-center gap-1.5">
                                            <ScrollText class="h-3.5 w-3.5" />
                                            3. Warqah Turath
                                        </span>
                                        <span v-if="currentTheme === 'warqah'" class="text-xs font-bold text-amber-700 dark:text-amber-400">Aktif ✓</span>
                                    </div>
                                    <p class="text-xs opacity-75 leading-relaxed">
                                        Nuansa lembaran perkamen naskah klasik kuno (linen/sepia) dengan ornamen border warisan Islam.
                                    </p>

                                    <!-- Mini Preview Box -->
                                    <div class="p-4 rounded-2xl bg-amber-900/5 dark:bg-white/5 border border-amber-900/15 dark:border-amber-600/20 text-center space-y-3">
                                        <p class="font-arabic text-xl leading-loose text-[#2b1810] dark:text-[#f8ecd0]" dir="rtl">
                                            {{ currentLine?.words?.slice(0, 4)?.map(w => getFormattedWordText(w, mushafType))?.join(' ') || 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ' }}
                                        </p>
                                        <p class="text-xs font-serif text-[#463024] dark:text-[#d3c2aa] leading-relaxed">
                                            “{{ currentLine?.lineTranslation?.slice(0, 60) || 'Dengan nama Allah Yang Maha Pengasih...' }}...”
                                        </p>
                                    </div>
                                </div>

                                <button 
                                    type="button" 
                                    class="w-full mt-4 py-2 rounded-xl text-xs font-bold transition-colors bg-amber-800/15 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 group-hover:bg-amber-800 dark:group-hover:bg-amber-500 group-hover:text-white"
                                >
                                    Gunakan Konsep Warqah
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- MODAL 2: Full Verse Translation Dialog (Kemenag RI Resmi) -->
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
                    v-model:open="showFootnoteDialog"
                    :footnote-id="selectedFootnoteId"
                    :footnote-number="selectedFootnoteNumber"
                />
            </div>
        </Transition>
    </Teleport>
</template>
