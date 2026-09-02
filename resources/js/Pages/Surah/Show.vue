<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import AppLayout from '@/Layouts/AppLayout.vue';
import AyahItem from '@/components/AyahItem.vue';
import MushafPageView from '@/components/MushafPageView.vue';
import AudioPlayerBar from '@/components/player/AudioPlayerBar.vue';
import ReciterSelectorModal from '@/components/player/ReciterSelectorModal.vue';
import SettingsDrawer from '@/components/player/SettingsDrawer.vue';
import { useQuranAudioPlayer } from '@/composables/useQuranAudioPlayer';
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
    SlidersHorizontal,
    User,
    Sliders
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
    prevChapter: {
        type: Object,
        default: null,
    },
    nextChapter: {
        type: Object,
        default: null,
    },
});

// Audio Engine Composable
const audioPlayer = useQuranAudioPlayer();

// View & Customization States
const readingMode = ref('ayah'); // 'ayah' (per ayat) | 'mushaf' (per lembar)
const mushafType = ref('uthmani'); // 'uthmani' or 'indopak'
const arabicFontSize = ref(28); // 20 - 44px
const showTranslation = ref(true);
const showTransliteration = ref(true);

// Modals State
const showReciterModal = ref(false);
const showSettingsDrawer = ref(false);

// Active Reciter computed based on localStorage or prop
const currentReciter = computed(() => {
    const savedId = typeof window !== 'undefined' ? parseInt(localStorage.getItem('anisul_selected_reciter'), 10) : null;
    const targetId = savedId || props.selectedReciterId || 7;
    return props.reciters.find(r => r.id === targetId) || props.reciters[0] || { id: 7, name: 'Mishary Rashid Alafasy' };
});

// Initialize & Load Surah into Audio Engine
onMounted(() => {
    const savedReadingMode = localStorage.getItem('anisul_reading_mode');
    if (savedReadingMode) readingMode.value = savedReadingMode;

    const savedMushaf = localStorage.getItem('anisul_mushaf');
    if (savedMushaf) mushafType.value = savedMushaf;

    const savedFontSize = localStorage.getItem('anisul_font_size');
    if (savedFontSize) arabicFontSize.value = parseInt(savedFontSize, 10);

    const savedShowTranslation = localStorage.getItem('anisul_show_translation');
    if (savedShowTranslation !== null) showTranslation.value = savedShowTranslation === 'true';

    const savedShowTransliteration = localStorage.getItem('anisul_show_transliteration');
    if (savedShowTransliteration !== null) showTransliteration.value = savedShowTransliteration === 'true';

    // Load current surah audio into engine if not already loaded
    if (props.chapter && props.recitation) {
        audioPlayer.loadSurah(props.chapter, props.recitation, currentReciter.value, 1, false);
    }
});

// Watch chapter change to update audio player
watch(() => props.chapter?.id, (newId) => {
    if (newId && props.chapter && props.recitation) {
        audioPlayer.loadSurah(props.chapter, props.recitation, currentReciter.value, 1, false);
    }
});

// Smooth Auto-Scroll to Active Ayah
watch(() => audioPlayer.currentAyahNumber.value, (ayahNum) => {
    if (!ayahNum || !audioPlayer.autoScrollEnabled.value) return;

    const elId = readingMode.value === 'mushaf' ? `mushaf-ayah-${ayahNum}` : `ayah-${ayahNum}`;
    const el = document.getElementById(elId);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
});

const setReadingMode = (mode) => {
    readingMode.value = mode;
    localStorage.setItem('anisul_reading_mode', mode);
};

const setMushafType = (type) => {
    mushafType.value = type;
    localStorage.setItem('anisul_mushaf', type);
};

const toggleTranslation = () => {
    showTranslation.value = !showTranslation.value;
    localStorage.setItem('anisul_show_translation', showTranslation.value);
};

const toggleTransliteration = () => {
    showTransliteration.value = !showTransliteration.value;
    localStorage.setItem('anisul_show_transliteration', showTransliteration.value);
};

const increaseFontSize = () => {
    if (arabicFontSize.value < 44) {
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

// Play or toggle individual verse directly from Ayah Card
const handlePlayVerse = (verse) => {
    if (audioPlayer.currentAyahNumber.value === verse.verse_number && audioPlayer.isPlaying.value) {
        audioPlayer.pause();
    } else {
        audioPlayer.seekToAyah(verse.verse_number, true);
    }
};

// Dynamic Reciter Switch
const handleSelectReciter = async (reciter) => {
    localStorage.setItem('anisul_selected_reciter', reciter.id);
    try {
        const res = await fetch(`/api/recitation/${props.chapter.id}?reciter=${reciter.id}`);
        if (res.ok) {
            const data = await res.json();
            if (data.recitation) {
                const wasPlaying = audioPlayer.isPlaying.value;
                const currentAyah = audioPlayer.currentAyahNumber.value || 1;
                audioPlayer.loadSurah(props.chapter, data.recitation, reciter, currentAyah, wasPlaying);
            }
        }
    } catch (err) {
        console.error('Failed to switch reciter audio:', err);
    }
};

const handleListenTogether = () => {
    // Phase 3 trigger
    alert('Fitur "Listen Together" (Sinkronisasi Realtime Antar-Perangkat) akan hadir di Fase 3! Nantikan peluncurannya segera.');
};
</script>

<template>
    <AppLayout :title="`Surah ${chapter.name_simple} (${chapter.name_arabic})`">
        <div class="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in pb-28">
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
            <header class="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-muted/30 p-6 sm:p-10 shadow-sm text-center space-y-4">
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

            <!-- Reader Controls Bar (Reading Mode, Rasm, Font Sizing & Settings Trigger) -->
            <section class="sticky top-18 z-30 flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl border border-border bg-background/90 backdrop-blur-md shadow-xs transition-all">
                <!-- Reading Mode Switcher: Per Ayat vs Mushaf Fisik -->
                <div class="flex items-center gap-1 bg-muted/70 p-1 rounded-xl text-xs">
                    <button 
                        @click="setReadingMode('ayah')"
                        type="button"
                        :class="[
                            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer',
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
                            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer',
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

                <!-- Right Controls: Rasm, Font Size, Qari & Settings Button -->
                <div class="flex flex-wrap items-center gap-2 sm:gap-3">
                    <!-- Rasm Mushaf Switcher -->
                    <div class="flex items-center gap-1 bg-muted/70 p-1 rounded-xl text-xs">
                        <button 
                            @click="setMushafType('uthmani')"
                            type="button"
                            :class="[
                                'px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer',
                                mushafType === 'uthmani' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                            ]"
                        >
                            Uthmani
                        </button>
                        <button 
                            @click="setMushafType('indopak')"
                            type="button"
                            :class="[
                                'px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer',
                                mushafType === 'indopak' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                            ]"
                        >
                            IndoPak
                        </button>
                    </div>

                    <!-- Font Size Buttons -->
                    <div class="flex items-center gap-1 bg-muted/70 p-1 rounded-xl text-xs">
                        <button 
                            @click="decreaseFontSize" 
                            type="button" 
                            class="px-2 py-1 rounded-lg font-bold text-muted-foreground hover:text-foreground hover:bg-card transition-colors cursor-pointer"
                            title="Perkecil Ukuran Huruf Arab"
                        >
                            A-
                        </button>
                        <span class="px-1.5 text-[11px] font-semibold text-foreground">{{ arabicFontSize }}px</span>
                        <button 
                            @click="increaseFontSize" 
                            type="button" 
                            class="px-2 py-1 rounded-lg font-bold text-muted-foreground hover:text-foreground hover:bg-card transition-colors cursor-pointer"
                            title="Perbesar Ukuran Huruf Arab"
                        >
                            A+
                        </button>
                    </div>

                    <!-- Settings Drawer Trigger Button -->
                    <button
                        type="button"
                        @click="showSettingsDrawer = true"
                        class="p-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-colors cursor-pointer"
                        title="Buka Pengaturan Tampilan Lengkap"
                    >
                        <SlidersHorizontal class="h-4 w-4 text-primary" />
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
                        :is-active="audioPlayer.currentAyahNumber.value === verse.verse_number"
                        :is-playing="audioPlayer.isPlaying.value"
                        :active-word-index="audioPlayer.currentWordIndex.value"
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
                        :active-ayah-number="audioPlayer.currentAyahNumber.value"
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

        <!-- Floating Audio Player Bar -->
        <AudioPlayerBar 
            @open-reciter-modal="showReciterModal = true"
            @open-settings="showSettingsDrawer = true"
            @open-listen-together="handleListenTogether"
        />

        <!-- Reciter Selector Modal Dialog -->
        <ReciterSelectorModal 
            v-model:open="showReciterModal"
            :reciters="reciters"
            :selected-reciter-id="currentReciter.id"
            @select-reciter="handleSelectReciter"
        />

        <!-- Settings Drawer Dialog -->
        <SettingsDrawer 
            v-model:open="showSettingsDrawer"
            v-model:readingMode="readingMode"
            v-model:mushafType="mushafType"
            v-model:arabicFontSize="arabicFontSize"
            v-model:showTranslation="showTranslation"
            v-model:showTransliteration="showTransliteration"
            v-model:autoScrollEnabled="audioPlayer.autoScrollEnabled.value"
        />
    </AppLayout>
</template>
