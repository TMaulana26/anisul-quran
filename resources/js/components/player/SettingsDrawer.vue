<script setup>
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
    Volume2
} from '@lucide/vue';

const props = defineProps({
    open: {
        type: Boolean,
        default: false,
    },
    readingMode: {
        type: String,
        default: 'ayah', // 'ayah' | 'mushaf'
    },
    mushafType: {
        type: String,
        default: 'uthmani', // 'uthmani' | 'indopak'
    },
    arabicFontSize: {
        type: Number,
        default: 28,
    },
    showTranslation: {
        type: Boolean,
        default: true,
    },
    showTransliteration: {
        type: Boolean,
        default: true,
    },
    autoScrollEnabled: {
        type: Boolean,
        default: true,
    },
    autoZenOnPlay: {
        type: Boolean,
        default: true,
    },
    reciters: {
        type: Array,
        default: () => [],
    },
    selectedReciterId: {
        type: Number,
        default: 7,
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
    'update:autoZenOnPlay',
    'select-reciter',
    'reset-defaults'
]);

const safeSetItem = (key, value) => {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(key, String(value));
        }
    } catch (e) {
        // Safe fallback in restricted environments
    }
};

const close = () => {
    emit('update:open', false);
};

const setReadingMode = (mode) => {
    emit('update:readingMode', mode);
    safeSetItem('anisul_reading_mode', mode);
};

const setMushafType = (type) => {
    emit('update:mushafType', type);
    safeSetItem('anisul_mushaf', type);
};

const onFontSizeChange = (event) => {
    const val = parseInt(event.target.value, 10);
    emit('update:arabicFontSize', val);
    safeSetItem('anisul_font_size', val);
};

const toggleTranslation = () => {
    const val = !props.showTranslation;
    emit('update:showTranslation', val);
    safeSetItem('anisul_show_translation', val);
};

const toggleTransliteration = () => {
    const val = !props.showTransliteration;
    emit('update:showTransliteration', val);
    safeSetItem('anisul_show_transliteration', val);
};

const toggleAutoScroll = () => {
    const val = !props.autoScrollEnabled;
    emit('update:autoScrollEnabled', val);
};

const toggleAutoZen = () => {
    const val = !props.autoZenOnPlay;
    emit('update:autoZenOnPlay', val);
    safeSetItem('anisul_auto_zen', val);
};

const onReciterSelectChange = (event) => {
    const reciterId = parseInt(event.target.value, 10);
    const reciter = props.reciters.find(r => r.id === reciterId);
    if (reciter) {
        emit('select-reciter', reciter);
    }
};

const resetDefaults = () => {
    emit('update:readingMode', 'ayah');
    emit('update:mushafType', 'uthmani');
    emit('update:arabicFontSize', 28);
    emit('update:showTranslation', true);
    emit('update:showTransliteration', true);
    emit('update:autoScrollEnabled', true);
    emit('update:autoZenOnPlay', true);

    safeSetItem('anisul_reading_mode', 'ayah');
    safeSetItem('anisul_mushaf', 'uthmani');
    safeSetItem('anisul_font_size', 28);
    safeSetItem('anisul_show_translation', 'true');
    safeSetItem('anisul_show_transliteration', 'true');
    safeSetItem('anisul_auto_zen', 'true');

    emit('reset-defaults');
};
</script>

<template>
    <Teleport to="body">
        <div v-if="open" class="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
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
                        <div class="flex items-center justify-between p-5 border-b border-border/60 bg-muted/20">
                            <div class="flex items-center gap-3">
                                <div class="p-2.5 rounded-2xl bg-primary/10 text-primary">
                                    <SlidersHorizontal class="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 class="font-heading font-bold text-lg text-foreground">
                                        Preferensi & Pengaturan
                                    </h2>
                                    <p class="text-xs text-muted-foreground">
                                        Sesuaikan tampilan bacaan & audio player
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

                        <!-- Scrollable Settings Body -->
                        <div class="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6 space-y-6 text-sm">
                            <!-- 1. Qari Murottal Default -->
                            <div class="space-y-2.5">
                                <div class="flex items-center justify-between">
                                    <label class="block font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <User class="h-3.5 w-3.5 text-primary" />
                                        <span>Qari Default</span>
                                    </label>
                                    <span class="text-[11px] text-muted-foreground">Otomatis tersimpan</span>
                                </div>

                                <div class="relative">
                                    <select
                                        :value="selectedReciterId"
                                        @change="onReciterSelectChange"
                                        class="w-full appearance-none px-3.5 py-2.5 rounded-2xl bg-muted/50 border border-border/70 focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-semibold transition-all cursor-pointer text-foreground"
                                    >
                                        <option 
                                            v-for="reciter in reciters" 
                                            :key="reciter.id" 
                                            :value="reciter.id"
                                        >
                                            {{ reciter.name }} ({{ reciter.style || 'Murattal' }})
                                        </option>
                                    </select>
                                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                                        <Volume2 class="h-4 w-4" />
                                    </div>
                                </div>
                            </div>

                            <!-- 2. Mode Tampilan Bacaan Default -->
                            <div class="space-y-2.5">
                                <label class="block font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Type class="h-3.5 w-3.5 text-primary" />
                                    <span>Mode Baca Default</span>
                                </label>
                                <div class="grid grid-cols-2 gap-2.5">
                                    <button
                                        type="button"
                                        @click="setReadingMode('ayah')"
                                        class="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl border text-xs font-semibold transition-all cursor-pointer"
                                        :class="readingMode === 'ayah' 
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
                                        :class="readingMode === 'mushaf' 
                                            ? 'bg-primary/10 border-primary text-primary ring-2 ring-primary/20 shadow-xs' 
                                            : 'bg-card border-border/70 hover:bg-muted/50 text-foreground'"
                                    >
                                        <BookOpen class="h-5 w-5" />
                                        <span>Mushaf Fisik</span>
                                        <span class="text-[10px] text-muted-foreground font-normal">Format per lembar</span>
                                    </button>
                                </div>
                            </div>

                            <!-- 3. Otomatis Masuk Mode Zen Saat Putar Audio -->
                            <div class="p-4 rounded-2xl bg-muted/40 border border-border/70 flex items-center justify-between gap-3">
                                <div class="space-y-1">
                                    <p class="font-heading font-bold text-sm text-foreground flex items-center gap-1.5">
                                        <Maximize2 class="h-4 w-4 text-primary" />
                                        <span>Mode Zen Saat Putar</span>
                                    </p>
                                    <p class="text-xs text-muted-foreground leading-relaxed">
                                        Langsung fokus ke layar penuh Zen saat tombol putar ditekan
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    role="switch"
                                    :aria-checked="autoZenOnPlay"
                                    @click="toggleAutoZen"
                                    class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                    :class="autoZenOnPlay ? 'bg-primary' : 'bg-muted-foreground/30'"
                                >
                                    <span
                                        class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
                                        :class="autoZenOnPlay ? 'translate-x-5' : 'translate-x-0'"
                                    />
                                </button>
                            </div>

                            <!-- 4. Gaya Rasm / Kaligrafi Arab -->
                            <div class="space-y-2.5">
                                <label class="block font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Sparkles class="h-3.5 w-3.5 text-primary" />
                                    <span>Gaya Penulisan Rasm Arab</span>
                                </label>
                                <div class="grid grid-cols-2 gap-2.5">
                                    <button
                                        type="button"
                                        @click="setMushafType('uthmani')"
                                        class="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl border text-xs font-semibold transition-all cursor-pointer"
                                        :class="mushafType === 'uthmani' 
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
                                        :class="mushafType === 'indopak' 
                                            ? 'bg-primary/10 border-primary text-primary ring-2 ring-primary/20 shadow-xs' 
                                            : 'bg-card border-border/70 hover:bg-muted/50 text-foreground'"
                                    >
                                        <span class="font-indopak text-lg">هندوباك</span>
                                        <span>IndoPak</span>
                                        <span class="text-[10px] text-muted-foreground font-normal">Standar Kemenag / Asia</span>
                                    </button>
                                </div>
                            </div>

                            <!-- 5. Ukuran Huruf Arab & Live Preview -->
                            <div class="space-y-3">
                                <div class="flex items-center justify-between">
                                    <label class="block font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground">
                                        Ukuran Kaligrafi Arab
                                    </label>
                                    <span class="px-2.5 py-0.5 rounded-lg bg-primary/15 text-primary text-xs font-mono font-bold">
                                        {{ arabicFontSize }}px
                                    </span>
                                </div>

                                <input
                                    type="range"
                                    min="20"
                                    max="44"
                                    step="2"
                                    :value="arabicFontSize"
                                    @input="onFontSizeChange"
                                    class="w-full h-2 rounded-lg bg-muted appearance-none cursor-pointer accent-primary focus:outline-none"
                                    aria-label="Ukuran Huruf Kaligrafi Arab"
                                />

                                <!-- Live Preview Box -->
                                <div 
                                    class="p-4 rounded-2xl border border-border/80 bg-muted/20 text-center transition-all overflow-hidden"
                                >
                                    <p class="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                                        Pratinjau Huruf
                                    </p>
                                    <p 
                                        dir="rtl" 
                                        :class="mushafType === 'indopak' ? 'font-indopak' : 'font-arabic'"
                                        :style="{ fontSize: `${arabicFontSize}px` }"
                                        class="leading-relaxed text-foreground transition-all duration-150"
                                    >
                                        {{ mushafType === 'indopak' ? 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ' : 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ' }}
                                    </p>
                                </div>
                            </div>

                            <!-- 6. Pengaturan Tampilan Tambahan (Latin & Terjemahan) -->
                            <div class="space-y-2.5 pt-2 border-t border-border/50">
                                <label class="block font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Eye class="h-3.5 w-3.5 text-primary" />
                                    <span>Teks Tambahan</span>
                                </label>

                                <div class="space-y-2">
                                    <!-- Toggle Terjemahan -->
                                    <div class="flex items-center justify-between p-3 rounded-2xl bg-card border border-border/60">
                                        <div>
                                            <p class="font-semibold text-xs text-foreground">Terjemahan Bahasa Indonesia</p>
                                            <p class="text-[11px] text-muted-foreground">Kementerian Agama Republik Indonesia</p>
                                        </div>
                                        <button
                                            type="button"
                                            role="switch"
                                            :aria-checked="showTranslation"
                                            @click="toggleTranslation"
                                            class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out"
                                            :class="showTranslation ? 'bg-primary' : 'bg-muted-foreground/30'"
                                        >
                                            <span
                                                class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
                                                :class="showTranslation ? 'translate-x-4' : 'translate-x-0'"
                                            />
                                        </button>
                                    </div>

                                    <!-- Toggle Transliterasi Latin -->
                                    <div class="flex items-center justify-between p-3 rounded-2xl bg-card border border-border/60">
                                        <div>
                                            <p class="font-semibold text-xs text-foreground">Transliterasi Huruf Latin</p>
                                            <p class="text-[11px] text-muted-foreground">Panduan pelafalan dan tajwid</p>
                                        </div>
                                        <button
                                            type="button"
                                            role="switch"
                                            :aria-checked="showTransliteration"
                                            @click="toggleTransliteration"
                                            class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out"
                                            :class="showTransliteration ? 'bg-primary' : 'bg-muted-foreground/30'"
                                        >
                                            <span
                                                class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
                                                :class="showTransliteration ? 'translate-x-4' : 'translate-x-0'"
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
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
