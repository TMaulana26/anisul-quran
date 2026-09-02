<script setup>
import { ref, computed, onMounted } from 'vue';
import { Link } from '@inertiajs/vue3';
import AppLayout from '@/Layouts/AppLayout.vue';
import AyahItem from '@/components/AyahItem.vue';
import MushafPageView from '@/components/MushafPageView.vue';
import { 
    ChevronLeft, 
    ChevronRight, 
    ArrowLeft, 
    Volume2, 
    Settings2, 
    Type, 
    Sparkles, 
    BookOpen,
    List,
    SlidersHorizontal
} from '@lucide/vue';

const props = defineProps({
    chapter: {
        type: Object,
        required: true,
    },
    chapterInfo: {
        type: Object,
        default: null,
    },
    verses: {
        type: Array,
        default: () => [],
    },
    pagination: {
        type: Object,
        default: null,
    },
    recitation: {
        type: Object,
        default: null,
    },
    reciters: {
        type: Array,
        default: () => [],
    },
    selectedReciterId: {
        type: Number,
        default: 7,
    },
    allChapters: {
        type: Array,
        default: () => [],
    },
});

// View & Customization States
const readingMode = ref('ayah'); // 'ayah' (per ayat) | 'mushaf' (per lembar)
const mushafType = ref('uthmani'); // 'uthmani' or 'indopak'
const arabicFontSize = ref(28); // 20 - 40px
const showTranslation = ref(true);
const showTransliteration = ref(true);
const activeAyahNumber = ref(null);

// Previous and Next Surah Navigation
const prevChapter = computed(() => {
    if (props.chapter.id > 1) {
        return props.allChapters.find(c => c.id === props.chapter.id - 1);
    }
    return null;
});

const nextChapter = computed(() => {
    if (props.chapter.id < 114) {
        return props.allChapters.find(c => c.id === props.chapter.id + 1);
    }
    return null;
});

// Load preferences from localStorage
onMounted(() => {
    const savedReadingMode = localStorage.getItem('anisul_reading_mode');
    if (savedReadingMode) readingMode.value = savedReadingMode;

    const savedMushaf = localStorage.getItem('anisul_mushaf');
    if (savedMushaf) mushafType.value = savedMushaf;

    const savedFontSize = localStorage.getItem('anisul_font_size');
    if (savedFontSize) arabicFontSize.value = parseInt(savedFontSize, 10);
});

const setReadingMode = (mode) => {
    readingMode.value = mode;
    localStorage.setItem('anisul_reading_mode', mode);
};

const setMushafType = (type) => {
    mushafType.value = type;
    localStorage.setItem('anisul_mushaf', type);
};

const increaseFontSize = () => {
    if (arabicFontSize.value < 42) {
        arabicFontSize.value += 2;
        localStorage.setItem('anisul_font_size', arabicFontSize.value);
    }
};

const decreaseFontSize = () => {
    if (arabicFontSize.value > 20) {
        arabicFontSize.value -= 2;
        localStorage.setItem('anisul_font_size', arabicFontSize.value);
    }
};

// Play individual verse
const handlePlayVerse = (verse) => {
    activeAyahNumber.value = verse.verse_number;
};
</script>

<template>
    <AppLayout :title="`Surah ${chapter.name_simple} (${chapter.name_arabic})`">
        <div class="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in">
            <!-- Top Breadcrumb & Navigation -->
            <div class="flex items-center justify-between gap-4">
                <Link 
                    href="/"
                    class="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                    <ArrowLeft class="h-4 w-4" />
                    <span>Kembali ke Daftar Surah</span>
                </Link>

                <!-- Quick Prev / Next Surah Jump -->
                <div class="flex items-center gap-1">
                    <Link 
                        v-if="prevChapter"
                        :href="`/surah/${prevChapter.id}`"
                        class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:bg-muted transition-colors shadow-2xs"
                        :title="`Surah Sebelumnya: ${prevChapter.name_simple}`"
                    >
                        <ChevronLeft class="h-3.5 w-3.5" />
                        <span class="hidden sm:inline">{{ prevChapter.name_simple }}</span>
                    </Link>

                    <Link 
                        v-if="nextChapter"
                        :href="`/surah/${nextChapter.id}`"
                        class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:bg-muted transition-colors shadow-2xs"
                        :title="`Surah Berikutnya: ${nextChapter.name_simple}`"
                    >
                        <span class="hidden sm:inline">{{ nextChapter.name_simple }}</span>
                        <ChevronRight class="h-3.5 w-3.5" />
                    </Link>
                </div>
            </div>

            <!-- Surah Hero Header Card -->
            <header class="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-b from-card via-card to-muted/30 p-6 sm:p-10 shadow-sm text-center space-y-4">
                <div class="flex flex-col items-center justify-center space-y-2">
                    <div class="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        <span>Surah Ke-{{ chapter.id }} • {{ chapter.revelation_place === 'makkah' ? 'Makkiyah' : 'Madaniyah' }}</span>
                    </div>

                    <h1 class="font-arabic font-bold text-4xl sm:text-5xl text-foreground pt-2 pb-1" dir="rtl">
                        {{ chapter.name_arabic }}
                    </h1>

                    <h2 class="font-heading font-extrabold text-2xl sm:text-3xl text-foreground">
                        {{ chapter.name_simple }}
                    </h2>

                    <p class="text-sm text-muted-foreground font-medium">
                        {{ chapter.translated_name?.name }} • {{ chapter.verses_count }} Ayat
                    </p>
                </div>

                <!-- Bismillah Header (Except Surah 9 At-Tawbah & Surah 1 Al-Fatihah) -->
                <div 
                    v-if="chapter.id !== 1 && chapter.id !== 9" 
                    class="pt-6 pb-2 border-t border-border/60"
                >
                    <p class="font-arabic text-2xl sm:text-3xl text-foreground/90 tracking-wide" dir="rtl">
                        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                    </p>
                    <p class="text-xs text-muted-foreground mt-2 italic">
                        Dengan nama Allah Yang Maha Pengasih, Maha Penyayang
                    </p>
                </div>
            </header>

            <!-- Reader Controls Bar (Reading Mode, Rasm & Font Sizing) -->
            <section class="sticky top-18 z-30 flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-border bg-background/90 backdrop-blur-md shadow-xs transition-all">
                <!-- Reading Mode Switcher: Per Ayat vs Mushaf Fisik -->
                <div class="flex items-center gap-1 bg-muted p-1 rounded-lg text-xs">
                    <button 
                        @click="setReadingMode('ayah')"
                        type="button"
                        :class="[
                            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors',
                            readingMode === 'ayah' 
                                ? 'bg-card text-foreground shadow-xs' 
                                : 'text-muted-foreground hover:text-foreground'
                        ]"
                        title="Mode Baca Per Ayat dengan Terjemahan"
                    >
                        <List class="h-3.5 w-3.5" />
                        <span>Per Ayat</span>
                    </button>
                    <button 
                        @click="setReadingMode('mushaf')"
                        type="button"
                        :class="[
                            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors',
                            readingMode === 'mushaf' 
                                ? 'bg-card text-foreground shadow-xs' 
                                : 'text-muted-foreground hover:text-foreground'
                        ]"
                        title="Mode Baca Per Lembar Seperti Mushaf Fisik"
                    >
                        <BookOpen class="h-3.5 w-3.5" />
                        <span>Mushaf Fisik</span>
                    </button>
                </div>

                <!-- Right Controls: Rasm, Font Size & Toggle Translation -->
                <div class="flex flex-wrap items-center gap-2 sm:gap-3">
                    <!-- Rasm Mushaf Switcher -->
                    <div class="flex items-center gap-1 bg-muted p-1 rounded-lg text-xs">
                        <button 
                            @click="setMushafType('uthmani')"
                            type="button"
                            :class="[
                                'px-2.5 py-1 rounded-md font-medium transition-colors',
                                mushafType === 'uthmani' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                            ]"
                        >
                            Uthmani
                        </button>
                        <button 
                            @click="setMushafType('indopak')"
                            type="button"
                            :class="[
                                'px-2.5 py-1 rounded-md font-medium transition-colors',
                                mushafType === 'indopak' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                            ]"
                        >
                            IndoPak
                        </button>
                    </div>

                    <!-- Font Size Buttons -->
                    <div class="flex items-center gap-1 bg-muted p-1 rounded-lg text-xs">
                        <button 
                            @click="decreaseFontSize" 
                            type="button" 
                            class="px-2 py-1 rounded-md font-bold text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
                            title="Perkecil Ukuran Huruf Arab"
                        >
                            A-
                        </button>
                        <span class="px-1.5 text-[11px] font-semibold text-foreground">{{ arabicFontSize }}px</span>
                        <button 
                            @click="increaseFontSize" 
                            type="button" 
                            class="px-2 py-1 rounded-md font-bold text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
                            title="Perbesar Ukuran Huruf Arab"
                        >
                            A+
                        </button>
                    </div>

                    <!-- Toggle Terjemahan (Only relevant in Ayat mode) -->
                    <button 
                        v-if="readingMode === 'ayah'"
                        @click="showTranslation = !showTranslation"
                        type="button"
                        :class="[
                            'px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors',
                            showTranslation ? 'bg-primary/10 border-primary/40 text-primary' : 'bg-card border-border text-muted-foreground'
                        ]"
                        title="Tampilkan / Sembunyikan Terjemahan"
                    >
                        Terjemahan
                    </button>
                </div>
            </section>

            <!-- Main Reading View: Either Mode Ayat OR Mode Mushaf -->
            <div class="transition-all duration-300">
                <!-- 1. Mode Baca Per Ayat -->
                <section v-if="readingMode === 'ayah'" class="space-y-4">
                    <AyahItem 
                        v-for="verse in verses" 
                        :key="verse.id" 
                        :verse="verse"
                        :is-active="activeAyahNumber === verse.verse_number"
                        :mushaf-type="mushafType"
                        :show-translation="showTranslation"
                        :show-transliteration="showTransliteration"
                        :arabic-font-size="arabicFontSize"
                        @play="handlePlayVerse"
                    />
                </section>

                <!-- 2. Mode Baca Per Lembar (Mushaf Fisik) -->
                <section v-else class="space-y-6">
                    <MushafPageView 
                        :verses="verses" 
                        :chapter="chapter"
                        :mushaf-type="mushafType"
                        :arabic-font-size="arabicFontSize"
                        :active-ayah-number="activeAyahNumber"
                        @play="handlePlayVerse"
                    />
                </section>
            </div>

            <!-- Bottom Prev / Next Navigation Footer -->
            <div class="flex items-center justify-between gap-4 pt-8 border-t border-border">
                <Link 
                    v-if="prevChapter"
                    :href="`/surah/${prevChapter.id}`"
                    class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors shadow-xs"
                >
                    <ChevronLeft class="h-4 w-4" />
                    <span>Surah Sebelumnya: {{ prevChapter.name_simple }}</span>
                </Link>
                <div v-else></div>

                <Link 
                    v-if="nextChapter"
                    :href="`/surah/${nextChapter.id}`"
                    class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors shadow-xs"
                >
                    <span>Surah Berikutnya: {{ nextChapter.name_simple }}</span>
                    <ChevronRight class="h-4 w-4" />
                </Link>
            </div>
        </div>
    </AppLayout>
</template>
