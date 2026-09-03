<script setup>
import { ref, computed, watch } from 'vue';
import { usePage } from '@inertiajs/vue3';
import { useUserPreferences } from '@/composables/useUserPreferences';
import { 
    X, 
    SlidersHorizontal, 
    Type, 
    BookOpen, 
    Sparkles, 
    Eye, 
    RotateCcw,
    Check,
    Maximize2,
    User,
    Volume2,
    Globe,
    FileText,
    Bookmark
} from '@lucide/vue';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const props = defineProps({
    open: {
        type: Boolean,
        default: undefined,
    },
    readingMode: {
        type: String,
        default: undefined, // 'ayah' | 'mushaf'
    },
    mushafType: {
        type: String,
        default: undefined, // 'uthmani' | 'indopak'
    },
    arabicFontSize: {
        type: Number,
        default: undefined,
    },
    showTranslation: {
        type: Boolean,
        default: undefined,
    },
    showTransliteration: {
        type: Boolean,
        default: undefined,
    },
    autoScrollEnabled: {
        type: Boolean,
        default: undefined,
    },
    autoKhusyuOnPlay: {
        type: Boolean,
        default: undefined,
    },
    autoZenOnPlay: {
        type: Boolean,
        default: undefined,
    },
    reciters: {
        type: Array,
        default: () => [],
    },
    selectedReciterId: {
        type: Number,
        default: undefined,
    },
    chapter: {
        type: Object,
        default: null,
    },
});

const emit = defineEmits([
    'update:open',
    'update:readingMode',
    'update:mushafType',
    'update:arabicFontSize',
    'update:showTranslation',
    'update:showTransliteration',
    'update:autoScrollEnabled',
    'update:autoKhusyuOnPlay',
    'update:autoZenOnPlay',
    'select-reciter',
    'reset-defaults'
]);

const page = usePage();
const userPreferences = useUserPreferences();

// Detect active Surah context
const activeChapter = computed(() => {
    return props.chapter || page?.props?.chapter || null;
});

// Tab state: 'surah' (Surah saat ini) vs 'global' (Preferensi umum aplikasi)
const activeTab = ref(activeChapter.value ? 'surah' : 'global');

watch(activeChapter, (newChapter) => {
    if (!newChapter) {
        activeTab.value = 'global';
    }
});

// Active preferences with fallback to global composable
const isOpen = computed(() => props.open !== undefined ? props.open : userPreferences.isDrawerOpen.value);
const currentReadingMode = computed(() => props.readingMode !== undefined ? props.readingMode : userPreferences.preferences.readingMode);
const currentMushafType = computed(() => props.mushafType !== undefined ? props.mushafType : userPreferences.preferences.mushafType);
const currentFontSize = computed(() => props.arabicFontSize !== undefined ? props.arabicFontSize : userPreferences.preferences.arabicFontSize);
const currentShowTranslation = computed(() => props.showTranslation !== undefined ? props.showTranslation : userPreferences.preferences.showTranslation);
const currentShowTransliteration = computed(() => props.showTransliteration !== undefined ? props.showTransliteration : userPreferences.preferences.showTransliteration);
const currentAutoScroll = computed(() => props.autoScrollEnabled !== undefined ? props.autoScrollEnabled : userPreferences.preferences.autoScrollEnabled);
const currentAutoKhusyu = computed(() => {
    if (props.autoKhusyuOnPlay !== undefined) return props.autoKhusyuOnPlay;
    if (props.autoZenOnPlay !== undefined) return props.autoZenOnPlay;
    return userPreferences.preferences.autoKhusyuOnPlay;
});
const currentAutoZen = currentAutoKhusyu;
const currentReciterId = computed(() => props.selectedReciterId !== undefined ? props.selectedReciterId : userPreferences.preferences.selectedReciterId);

// Dynamic reciters list resolution
const effectiveReciters = computed(() => {
    if (props.reciters && props.reciters.length > 0) return props.reciters;
    if (page?.props?.reciters && Array.isArray(page.props.reciters) && page.props.reciters.length > 0) {
        return page.props.reciters;
    }
    return [
        { id: 7, name: 'Mishary Rashid Alafasy', style: 'Murattal' },
        { id: 4, name: 'Mahmoud Khalil Al-Husary', style: 'Murattal' },
        { id: 1, name: 'AbdulBaset AbdulSamad', style: 'Mujawwad' },
        { id: 5, name: 'Saad Al-Ghamdi', style: 'Murattal' },
        { id: 6, name: 'Abu Bakr al-Shatri', style: 'Murattal' },
        { id: 3, name: 'Abdur-Rahman as-Sudais', style: 'Murattal' },
    ];
});

const getReciterName = (reciter) => {
    return reciter?.name || reciter?.reciter_name || reciter?.translated_name?.name || 'Qari Murottal';
};

const close = () => {
    emit('update:open', false);
    userPreferences.closeDrawer();
};

const setReadingMode = (mode) => {
    userPreferences.setReadingMode(mode);
    emit('update:readingMode', mode);
};

const setMushafType = (type) => {
    userPreferences.setMushafType(type);
    emit('update:mushafType', type);
};

const onFontSizeChange = (event) => {
    const val = parseInt(event.target.value, 10);
    userPreferences.setArabicFontSize(val);
    emit('update:arabicFontSize', val);
};

const toggleTranslation = () => {
    const nextVal = !currentShowTranslation.value;
    userPreferences.setShowTranslation(nextVal);
    emit('update:showTranslation', nextVal);
};

const toggleTransliteration = () => {
    const nextVal = !currentShowTransliteration.value;
    userPreferences.setShowTransliteration(nextVal);
    emit('update:showTransliteration', nextVal);
};

const toggleAutoScroll = () => {
    const nextVal = !currentAutoScroll.value;
    userPreferences.setAutoScrollEnabled(nextVal);
    emit('update:autoScrollEnabled', nextVal);
};

const toggleAutoKhusyu = () => {
    const nextVal = !currentAutoKhusyu.value;
    userPreferences.setAutoKhusyuOnPlay(nextVal);
    emit('update:autoKhusyuOnPlay', nextVal);
    emit('update:autoZenOnPlay', nextVal);
};
const toggleAutoZen = toggleAutoKhusyu;

const selectedReciterLabel = computed(() => {
    const found = effectiveReciters.value.find(r => r.id === currentReciterId.value);
    if (found) {
        return `${getReciterName(found)} (${found.style || 'Murattal'})`;
    }
    return 'Pilih Qari...';
});

const onReciterSelectChange = (val) => {
    const rawId = typeof val === 'object' && val?.target ? val.target.value : val;
    const reciterId = parseInt(rawId, 10);
    if (!isNaN(reciterId)) {
        userPreferences.setSelectedReciterId(reciterId);
        const reciter = effectiveReciters.value.find(r => r.id === reciterId);
        if (reciter) {
            emit('select-reciter', reciter);
        }
    }
};

const resetDefaults = () => {
    userPreferences.resetDefaults();
    emit('update:readingMode', 'ayah');
    emit('update:mushafType', 'uthmani');
    emit('update:arabicFontSize', 28);
    emit('update:showTranslation', true);
    emit('update:showTransliteration', true);
    emit('update:autoScrollEnabled', true);
    emit('update:autoKhusyuOnPlay', true);
    emit('update:autoZenOnPlay', true);
    emit('reset-defaults');
};
</script>

<template>
    <Teleport to="body">
        <div v-if="isOpen" class="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
            <!-- Backdrop Overlay with Fade -->
            <Transition
                enter-active-class="transition-opacity duration-300 ease-out"
                enter-from-class="opacity-0"
                enter-to-class="opacity-100"
                leave-active-class="transition-opacity duration-200 ease-in"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
                appear
            >
                <div 
                    class="fixed inset-0 bg-background/80 backdrop-blur-sm cursor-pointer" 
                    @click="close"
                />
            </Transition>

            <!-- Slide-over Right Drawer Panel -->
            <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
                <Transition
                    enter-active-class="transition-transform duration-300 ease-out"
                    enter-from-class="translate-x-full"
                    enter-to-class="translate-x-0"
                    leave-active-class="transition-transform duration-200 ease-in"
                    leave-from-class="translate-x-0"
                    leave-to-class="translate-x-full"
                    appear
                >
                    <div 
                        class="w-screen max-w-md bg-card border-l border-border/80 shadow-2xl flex flex-col text-card-foreground"
                    >
                        <!-- Header -->
                        <div class="p-5 border-b border-border/60 bg-muted/20 space-y-3">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <div class="p-2.5 rounded-2xl bg-primary/10 text-primary">
                                        <SlidersHorizontal class="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 class="font-heading font-bold text-lg text-foreground">
                                            Pengaturan & Preferensi
                                        </h2>
                                        <p class="text-xs text-muted-foreground">
                                            Sesuaikan bacaan surah & preferensi aplikasi
                                        </p>
                                    </div>
                                </div>

                                <!-- Close Button -->
                                <button
                                    type="button"
                                    @click="close"
                                    class="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                                    aria-label="Tutup Pengaturan"
                                >
                                    <X class="h-5 w-5" />
                                </button>
                            </div>

                            <!-- Context Indicator Banner: Surah Aktif vs Global -->
                            <div 
                                v-if="activeChapter" 
                                class="p-3 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-between gap-3 text-xs"
                            >
                                <div class="flex items-center gap-2.5 min-w-0">
                                    <div class="p-1.5 rounded-xl bg-primary text-primary-foreground shrink-0">
                                        <BookOpen class="h-4 w-4" />
                                    </div>
                                    <div class="min-w-0">
                                        <p class="font-bold text-foreground truncate">
                                            Surah {{ activeChapter.name_simple }} ({{ activeChapter.name_arabic }})
                                        </p>
                                        <p class="text-[11px] text-muted-foreground truncate">
                                            {{ activeChapter.verses_count }} Ayat • Surah ke-{{ activeChapter.id }}
                                        </p>
                                    </div>
                                </div>
                                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/30 shrink-0">
                                    Surah Aktif
                                </span>
                            </div>

                            <div 
                                v-else 
                                class="p-3 rounded-2xl bg-muted/50 border border-border/70 flex items-center justify-between gap-3 text-xs"
                            >
                                <div class="flex items-center gap-2.5 min-w-0">
                                    <div class="p-1.5 rounded-xl bg-muted-foreground/20 text-foreground shrink-0">
                                        <Globe class="h-4 w-4" />
                                    </div>
                                    <div class="min-w-0">
                                        <p class="font-bold text-foreground">
                                            Mode Global Aplikasi
                                        </p>
                                        <p class="text-[11px] text-muted-foreground">
                                            Berlaku otomatis untuk semua surah
                                        </p>
                                    </div>
                                </div>
                                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border shrink-0">
                                    Global
                                </span>
                            </div>

                            <!-- Context Scope Tabs (Only visible when viewing a Surah) -->
                            <div v-if="activeChapter" class="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/60">
                                <button
                                    type="button"
                                    @click="activeTab = 'surah'"
                                    class="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                                    :class="activeTab === 'surah'
                                        ? 'bg-card text-foreground shadow-xs ring-1 ring-border font-bold'
                                        : 'text-muted-foreground hover:text-foreground'"
                                >
                                    <BookOpen class="h-3.5 w-3.5 text-primary" />
                                    <span>Surah Ini</span>
                                    <span class="h-1.5 w-1.5 rounded-full bg-primary" />
                                </button>

                                <button
                                    type="button"
                                    @click="activeTab = 'global'"
                                    class="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                                    :class="activeTab === 'global'
                                        ? 'bg-card text-foreground shadow-xs ring-1 ring-border font-bold'
                                        : 'text-muted-foreground hover:text-foreground'"
                                >
                                    <Globe class="h-3.5 w-3.5 text-muted-foreground" />
                                    <span>Preferensi Global</span>
                                </button>
                            </div>
                        </div>

                        <!-- Scrollable Settings Body -->
                        <div class="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6 space-y-6 text-sm">
                            <!-- ============================================== -->
                            <!-- TAB 1: PENGATURAN KHUSUS SURAH YANG DIBACA -->
                            <!-- ============================================== -->
                            <template v-if="activeTab === 'surah' && activeChapter">
                                <div class="p-3 rounded-xl bg-muted/30 border border-border/50 text-xs text-muted-foreground leading-relaxed">
                                    <p>
                                        💡 Pengaturan di tab ini langsung mengubah tampilan kaligrafi, audio, dan terjemahan pada <span class="font-bold text-foreground">Surah {{ activeChapter.name_simple }}</span>.
                                    </p>
                                </div>

                                <!-- 1. Qari Surah Ini -->
                                <div class="space-y-2.5">
                                    <div class="flex items-center justify-between">
                                        <label class="block font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                            <User class="h-3.5 w-3.5 text-primary" />
                                            <span>Qari Surah {{ activeChapter.name_simple }}</span>
                                        </label>
                                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                            Surah Ini
                                        </span>
                                    </div>

                                    <Select
                                        :model-value="String(currentReciterId)"
                                        @update:model-value="onReciterSelectChange"
                                    >
                                        <SelectTrigger class="w-full h-11 rounded-2xl bg-muted/50 border border-border/70 hover:border-primary/50 text-sm font-semibold cursor-pointer transition-all flex items-center justify-between px-3.5">
                                            <div class="flex items-center gap-2.5 truncate min-w-0 pr-2">
                                                <Volume2 class="h-4 w-4 text-primary shrink-0" />
                                                <span class="truncate text-foreground font-semibold">{{ selectedReciterLabel }}</span>
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent class="z-[60] max-h-72 rounded-2xl border-border bg-card shadow-xl custom-scrollbar">
                                            <SelectGroup>
                                                <SelectLabel class="text-[11px] text-muted-foreground uppercase font-bold tracking-wider px-3 py-2">
                                                    Daftar Qari Murottal & Mujawwad
                                                </SelectLabel>
                                                <SelectItem
                                                    v-for="reciter in effectiveReciters"
                                                    :key="reciter.id"
                                                    :value="String(reciter.id)"
                                                    class="cursor-pointer py-2.5 px-3 rounded-xl focus:bg-primary/10 focus:text-primary transition-colors my-0.5"
                                                >
                                                    <div class="flex items-center justify-between w-full gap-3 pr-2">
                                                        <span class="font-semibold text-sm truncate text-foreground">{{ getReciterName(reciter) }}</span>
                                                        <span
                                                            class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 border"
                                                            :class="reciter.style === 'Mujawwad' 
                                                                ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' 
                                                                : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'"
                                                        >
                                                            {{ reciter.style || 'Murattal' }}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <!-- 2. Gaya Rasm Kaligrafi Surah Ini -->
                                <div class="space-y-2.5">
                                    <div class="flex items-center justify-between">
                                        <label class="block font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                            <Sparkles class="h-3.5 w-3.5 text-primary" />
                                            <span>Gaya Kaligrafi Surah Ini</span>
                                        </label>
                                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                            Surah Ini
                                        </span>
                                    </div>

                                    <div class="grid grid-cols-2 gap-2.5">
                                        <button
                                            type="button"
                                            @click="setMushafType('uthmani')"
                                            class="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl border text-xs font-semibold transition-all cursor-pointer"
                                            :class="currentMushafType === 'uthmani' 
                                                ? 'bg-primary/10 border-primary text-primary ring-2 ring-primary/20 shadow-xs' 
                                                : 'bg-card border-border/70 hover:bg-muted/50 text-foreground'"
                                        >
                                            <span class="font-arabic text-lg">عثماني</span>
                                            <span>Utsmani</span>
                                            <span class="text-[10px] text-muted-foreground font-normal">Standar Madinah</span>
                                        </button>

                                        <button
                                            type="button"
                                            @click="setMushafType('indopak')"
                                            class="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl border text-xs font-semibold transition-all cursor-pointer"
                                            :class="currentMushafType === 'indopak' 
                                                ? 'bg-primary/10 border-primary text-primary ring-2 ring-primary/20 shadow-xs' 
                                                : 'bg-card border-border/70 hover:bg-muted/50 text-foreground'"
                                        >
                                            <span class="font-indopak text-lg">هندوباك</span>
                                            <span>IndoPak</span>
                                            <span class="text-[10px] text-muted-foreground font-normal">Standar Kemenag / Asia</span>
                                        </button>
                                    </div>
                                </div>

                                <!-- 3. Ukuran Huruf Kaligrafi Surah Ini -->
                                <div class="space-y-3">
                                    <div class="flex items-center justify-between">
                                        <label class="block font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground">
                                            Ukuran Huruf Surah Ini
                                        </label>
                                        <span class="px-2.5 py-0.5 rounded-lg bg-primary/15 text-primary text-xs font-mono font-bold">
                                            {{ currentFontSize }}px
                                        </span>
                                    </div>

                                    <input
                                        type="range"
                                        min="20"
                                        max="44"
                                        step="2"
                                        :value="currentFontSize"
                                        @input="onFontSizeChange"
                                        class="w-full h-2 rounded-lg bg-muted appearance-none cursor-pointer accent-primary focus:outline-none"
                                        aria-label="Ukuran Huruf Kaligrafi Arab"
                                    />

                                    <!-- Live Preview Box -->
                                    <div 
                                        class="p-4 rounded-2xl border border-border/80 bg-muted/20 text-center transition-all overflow-hidden"
                                    >
                                        <p class="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                                            Pratinjau Surah {{ activeChapter.name_simple }}
                                        </p>
                                        <p 
                                            dir="rtl" 
                                            :class="currentMushafType === 'indopak' ? 'font-indopak' : 'font-arabic'"
                                            :style="{ fontSize: `${currentFontSize}px` }"
                                            class="leading-relaxed text-foreground transition-all duration-150"
                                        >
                                            {{ currentMushafType === 'indopak' ? 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ' : 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ' }}
                                        </p>
                                    </div>
                                </div>

                                <!-- 4. Teks Tambahan Surah Ini -->
                                <div class="space-y-2.5 pt-2 border-t border-border/50">
                                    <div class="flex items-center justify-between">
                                        <label class="block font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                            <Eye class="h-3.5 w-3.5 text-primary" />
                                            <span>Teks Tambahan Surah Ini</span>
                                        </label>
                                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                            Surah Ini
                                        </span>
                                    </div>

                                    <div class="space-y-2">
                                        <div class="flex items-center justify-between p-3 rounded-2xl bg-card border border-border/60">
                                            <div>
                                                <p class="font-semibold text-xs text-foreground">Terjemahan Bahasa Indonesia</p>
                                                <p class="text-[11px] text-muted-foreground">Kemenag RI</p>
                                            </div>
                                            <button
                                                type="button"
                                                role="switch"
                                                :aria-checked="currentShowTranslation"
                                                @click="toggleTranslation"
                                                class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out"
                                                :class="currentShowTranslation ? 'bg-primary' : 'bg-muted-foreground/30'"
                                            >
                                                <span
                                                    class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
                                                    :class="currentShowTranslation ? 'translate-x-4' : 'translate-x-0'"
                                                />
                                            </button>
                                        </div>

                                        <div class="flex items-center justify-between p-3 rounded-2xl bg-card border border-border/60">
                                            <div>
                                                <p class="font-semibold text-xs text-foreground">Transliterasi Huruf Latin</p>
                                                <p class="text-[11px] text-muted-foreground">Panduan pelafalan</p>
                                            </div>
                                            <button
                                                type="button"
                                                role="switch"
                                                :aria-checked="currentShowTransliteration"
                                                @click="toggleTransliteration"
                                                class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out"
                                                :class="currentShowTransliteration ? 'bg-primary' : 'bg-muted-foreground/30'"
                                            >
                                                <span
                                                    class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
                                                    :class="currentShowTransliteration ? 'translate-x-4' : 'translate-x-0'"
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </template>

                            <!-- ============================================== -->
                            <!-- TAB 2: PREFERENSI GLOBAL (DEFAULT SELURUH APP) -->
                            <!-- ============================================== -->
                            <template v-else>
                                <div class="p-3 rounded-xl bg-muted/30 border border-border/50 text-xs text-muted-foreground leading-relaxed">
                                    <p>
                                        🌐 Pengaturan di tab ini tersimpan di browser sebagai <span class="font-bold text-foreground">preferensi default</span> untuk setiap surah yang Anda buka berikutnya.
                                    </p>
                                </div>

                                <!-- 1. Qari Default Global -->
                                <div class="space-y-2.5">
                                    <div class="flex items-center justify-between">
                                        <label class="block font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                            <User class="h-3.5 w-3.5 text-primary" />
                                            <span>Qari Default Aplikasi</span>
                                        </label>
                                        <span class="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                                            🌐 Default Global
                                        </span>
                                    </div>

                                    <Select
                                        :model-value="String(currentReciterId)"
                                        @update:model-value="onReciterSelectChange"
                                    >
                                        <SelectTrigger class="w-full h-11 rounded-2xl bg-muted/50 border border-border/70 hover:border-primary/50 text-sm font-semibold cursor-pointer transition-all flex items-center justify-between px-3.5">
                                            <div class="flex items-center gap-2.5 truncate min-w-0 pr-2">
                                                <Volume2 class="h-4 w-4 text-primary shrink-0" />
                                                <span class="truncate text-foreground font-semibold">{{ selectedReciterLabel }}</span>
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent class="z-[60] max-h-72 rounded-2xl border-border bg-card shadow-xl custom-scrollbar">
                                            <SelectGroup>
                                                <SelectLabel class="text-[11px] text-muted-foreground uppercase font-bold tracking-wider px-3 py-2">
                                                    Daftar Qari Murottal & Mujawwad
                                                </SelectLabel>
                                                <SelectItem
                                                    v-for="reciter in effectiveReciters"
                                                    :key="reciter.id"
                                                    :value="String(reciter.id)"
                                                    class="cursor-pointer py-2.5 px-3 rounded-xl focus:bg-primary/10 focus:text-primary transition-colors my-0.5"
                                                >
                                                    <div class="flex items-center justify-between w-full gap-3 pr-2">
                                                        <span class="font-semibold text-sm truncate text-foreground">{{ getReciterName(reciter) }}</span>
                                                        <span
                                                            class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 border"
                                                            :class="reciter.style === 'Mujawwad' 
                                                                ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' 
                                                                : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'"
                                                        >
                                                            {{ reciter.style || 'Murattal' }}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <!-- 2. Mode Tampilan Bacaan Default Global -->
                                <div class="space-y-2.5">
                                    <div class="flex items-center justify-between">
                                        <label class="block font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                            <Type class="h-3.5 w-3.5 text-primary" />
                                            <span>Mode Baca Default</span>
                                        </label>
                                        <span class="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                                            🌐 Default Global
                                        </span>
                                    </div>

                                    <div class="grid grid-cols-2 gap-2.5">
                                        <button
                                            type="button"
                                            @click="setReadingMode('ayah')"
                                            class="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl border text-xs font-semibold transition-all cursor-pointer"
                                            :class="currentReadingMode === 'ayah' 
                                                ? 'bg-primary/10 border-primary text-primary ring-2 ring-primary/20 shadow-xs' 
                                                : 'bg-card border-border/70 hover:bg-muted/50 text-foreground'"
                                        >
                                            <Type class="h-5 w-5" />
                                            <span>Per Ayat</span>
                                            <span class="text-[10px] text-muted-foreground font-normal">Sinkronisasi kata</span>
                                        </button>

                                        <button
                                            type="button"
                                            @click="setReadingMode('mushaf')"
                                            class="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl border text-xs font-semibold transition-all cursor-pointer"
                                            :class="currentReadingMode === 'mushaf' 
                                                ? 'bg-primary/10 border-primary text-primary ring-2 ring-primary/20 shadow-xs' 
                                                : 'bg-card border-border/70 hover:bg-muted/50 text-foreground'"
                                        >
                                            <BookOpen class="h-5 w-5" />
                                            <span>Mushaf Fisik</span>
                                            <span class="text-[10px] text-muted-foreground font-normal">Format per lembar</span>
                                        </button>
                                    </div>
                                </div>

                                <!-- 3. Otomatis Masuk Mode Khusyu' (خُشُوع) Saat Putar Audio -->
                                <div class="p-4 rounded-2xl bg-muted/40 border border-border/70 flex items-center justify-between gap-3">
                                    <div class="space-y-1">
                                        <div class="flex items-center gap-2">
                                            <p class="font-heading font-bold text-sm text-foreground flex items-center gap-1.5">
                                                <Maximize2 class="h-4 w-4 text-primary" />
                                                <span>Mode Khusyu' (خُشُوع) Saat Putar</span>
                                            </p>
                                            <span class="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                                                🌐 Global
                                            </span>
                                        </div>
                                        <p class="text-xs text-muted-foreground leading-relaxed">
                                            Langsung fokus ke layar penuh Mode Khusyu' (خُشُوع) saat tombol putar ditekan
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        role="switch"
                                        :aria-checked="currentAutoKhusyu"
                                        @click="toggleAutoKhusyu"
                                        class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                        :class="currentAutoKhusyu ? 'bg-primary' : 'bg-muted-foreground/30'"
                                    >
                                        <span
                                            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
                                            :class="currentAutoKhusyu ? 'translate-x-5' : 'translate-x-0'"
                                        />
                                    </button>
                                </div>

                                <!-- 4. Gaya Rasm Kaligrafi Bawaan Global -->
                                <div class="space-y-2.5">
                                    <div class="flex items-center justify-between">
                                        <label class="block font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                            <Sparkles class="h-3.5 w-3.5 text-primary" />
                                            <span>Gaya Rasm Bawaan</span>
                                        </label>
                                        <span class="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                                            🌐 Default Global
                                        </span>
                                    </div>

                                    <div class="grid grid-cols-2 gap-2.5">
                                        <button
                                            type="button"
                                            @click="setMushafType('uthmani')"
                                            class="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl border text-xs font-semibold transition-all cursor-pointer"
                                            :class="currentMushafType === 'uthmani' 
                                                ? 'bg-primary/10 border-primary text-primary ring-2 ring-primary/20 shadow-xs' 
                                                : 'bg-card border-border/70 hover:bg-muted/50 text-foreground'"
                                        >
                                            <span class="font-arabic text-lg">عثماني</span>
                                            <span>Utsmani</span>
                                            <span class="text-[10px] text-muted-foreground font-normal">Standar Madinah</span>
                                        </button>

                                        <button
                                            type="button"
                                            @click="setMushafType('indopak')"
                                            class="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl border text-xs font-semibold transition-all cursor-pointer"
                                            :class="currentMushafType === 'indopak' 
                                                ? 'bg-primary/10 border-primary text-primary ring-2 ring-primary/20 shadow-xs' 
                                                : 'bg-card border-border/70 hover:bg-muted/50 text-foreground'"
                                        >
                                            <span class="font-indopak text-lg">هندوباك</span>
                                            <span>IndoPak</span>
                                            <span class="text-[10px] text-muted-foreground font-normal">Standar Kemenag / Asia</span>
                                        </button>
                                    </div>
                                </div>

                                <!-- 5. Ukuran Kaligrafi Bawaan Global -->
                                <div class="space-y-3">
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center gap-2">
                                            <label class="block font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground">
                                                Ukuran Kaligrafi Bawaan
                                            </label>
                                            <span class="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                                                🌐 Global
                                            </span>
                                        </div>
                                        <span class="px-2.5 py-0.5 rounded-lg bg-primary/15 text-primary text-xs font-mono font-bold">
                                            {{ currentFontSize }}px
                                        </span>
                                    </div>

                                    <input
                                        type="range"
                                        min="20"
                                        max="44"
                                        step="2"
                                        :value="currentFontSize"
                                        @input="onFontSizeChange"
                                        class="w-full h-2 rounded-lg bg-muted appearance-none cursor-pointer accent-primary focus:outline-none"
                                        aria-label="Ukuran Huruf Kaligrafi Arab"
                                    />

                                    <!-- Live Preview Box -->
                                    <div 
                                        class="p-4 rounded-2xl border border-border/80 bg-muted/20 text-center transition-all overflow-hidden"
                                    >
                                        <p class="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                                            Pratinjau Huruf Default
                                        </p>
                                        <p 
                                            dir="rtl" 
                                            :class="currentMushafType === 'indopak' ? 'font-indopak' : 'font-arabic'"
                                            :style="{ fontSize: `${currentFontSize}px` }"
                                            class="leading-relaxed text-foreground transition-all duration-150"
                                        >
                                            {{ currentMushafType === 'indopak' ? 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ' : 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ' }}
                                        </p>
                                    </div>
                                </div>
                            </template>
                        </div>

                        <!-- Footer Actions -->
                        <div class="p-4 sm:p-5 border-t border-border/60 bg-muted/20 flex items-center justify-between gap-3">
                            <button
                                type="button"
                                @click="resetDefaults"
                                class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                            >
                                <RotateCcw class="h-3.5 w-3.5" />
                                <span>Reset Default</span>
                            </button>

                            <button
                                type="button"
                                @click="close"
                                class="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
                            >
                                Selesai
                            </button>
                        </div>
                    </div>
                </Transition>
            </div>
        </div>
    </Teleport>
</template>
