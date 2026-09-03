<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import AppLayout from '@/Layouts/AppLayout.vue';
import AyahItem from '@/components/AyahItem.vue';
import MushafPageView from '@/components/MushafPageView.vue';
import AudioPlayerBar from '@/components/player/AudioPlayerBar.vue';
import ReciterSelectorModal from '@/components/player/ReciterSelectorModal.vue';
import ZenPlayerView from '@/components/player/ZenPlayerView.vue';
import { useQuranAudioPlayer } from '@/composables/useQuranAudioPlayer';
import { useUserPreferences } from '@/composables/useUserPreferences';
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
    Sliders,
    Maximize2
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

// Global User Preferences Composable
const userPreferences = useUserPreferences();

// View & Customization States synced with global preferences
const readingMode = computed({
    get: () => userPreferences.preferences.readingMode,
    set: (val) => userPreferences.setReadingMode(val),
});
const mushafType = computed({
    get: () => userPreferences.preferences.mushafType,
    set: (val) => userPreferences.setMushafType(val),
});
const arabicFontSize = computed({
    get: () => userPreferences.preferences.arabicFontSize,
    set: (val) => userPreferences.setArabicFontSize(val),
});
const showTranslation = computed({
    get: () => userPreferences.preferences.showTranslation,
    set: (val) => userPreferences.setShowTranslation(val),
});
const showTransliteration = computed({
    get: () => userPreferences.preferences.showTransliteration,
    set: (val) => userPreferences.setShowTransliteration(val),
});
const autoZenOnPlay = computed({
    get: () => userPreferences.preferences.autoZenOnPlay,
    set: (val) => userPreferences.setAutoZenOnPlay(val),
});

// Modals State
const showReciterModal = ref(false);
const isZenMode = ref(false);

// Active Reciter computed based on global preferences or prop
const currentReciter = computed(() => {
    const targetId = userPreferences.preferences.selectedReciterId || props.selectedReciterId || 7;
    return props.reciters.find(r => r.id === targetId) || props.reciters[0] || { id: 7, name: 'Mishary Rashid Alafasy' };
});

// Initialize & Load Surah into Audio Engine
onMounted(() => {
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

// React to reciter preference change from global drawer
watch(() => userPreferences.preferences.selectedReciterId, async (newReciterId) => {
    if (newReciterId && newReciterId !== currentReciter.value?.id) {
        const found = props.reciters.find(r => r.id === newReciterId);
        if (found) {
            await handleSelectReciter(found);
        }
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

const setReadingMode = (mode) => userPreferences.setReadingMode(mode);
const setMushafType = (type) => userPreferences.setMushafType(type);
const toggleTranslation = () => userPreferences.setShowTranslation(!showTranslation.value);
const toggleTransliteration = () => userPreferences.setShowTransliteration(!showTransliteration.value);
const increaseFontSize = () => userPreferences.setArabicFontSize(arabicFontSize.value + 2);
const decreaseFontSize = () => userPreferences.setArabicFontSize(arabicFontSize.value - 2);

// Play or toggle individual verse directly from Ayah Card -> Enter Zen Focus Mode (if autoZenOnPlay enabled)
const handlePlayVerse = (verse) => {
    audioPlayer.seekToAyah(verse.verse_number, true);
    if (autoZenOnPlay.value) {
        isZenMode.value = true;
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

                    <!-- Mode Zen Trigger Button in Sticky Bar -->
                    <button
                        type="button"
                        @click="isZenMode = true"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                        title="Buka Mode Fokus Zen (Immersive)"
                    >
                        <Maximize2 class="h-3.5 w-3.5" />
                        <span>Mode Zen</span>
                    </button>

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
            @open-settings="userPreferences.openDrawer()"
            @open-listen-together="handleListenTogether"
            @open-zen-mode="autoZenOnPlay ? (isZenMode = true) : null"
        />

        <!-- Fullscreen Zen Focus Reading Player View -->
        <ZenPlayerView
            v-model:open="isZenMode"
            :chapter="chapter"
            :verses="verses"
            v-model:mushafType="mushafType"
            v-model:showTranslation="showTranslation"
            v-model:showTransliteration="showTransliteration"
            v-model:arabicFontSize="arabicFontSize"
            @open-reciter-modal="showReciterModal = true"
            @open-settings="userPreferences.openDrawer()"
        />

        <!-- Reciter Selector Modal Dialog -->
        <ReciterSelectorModal 
            v-model:open="showReciterModal"
            :reciters="reciters"
            :selected-reciter-id="currentReciter.id"
            @select-reciter="handleSelectReciter"
        />
    </AppLayout>
</template>
