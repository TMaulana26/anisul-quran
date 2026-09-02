<script setup>
import { 
    X, 
    SlidersHorizontal, 
    Type, 
    BookOpen, 
    Sparkles, 
    Eye, 
    RotateCcw,
    Check
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
});

const emit = defineEmits([
    'update:open',
    'update:readingMode',
    'update:mushafType',
    'update:arabicFontSize',
    'update:showTranslation',
    'update:showTransliteration',
    'update:autoScrollEnabled',
    'reset-defaults'
]);

const close = () => {
    emit('update:open', false);
};

const setReadingMode = (mode) => {
    emit('update:readingMode', mode);
    localStorage.setItem('anisul_reading_mode', mode);
};

const setMushafType = (type) => {
    emit('update:mushafType', type);
    localStorage.setItem('anisul_mushaf', type);
};

const onFontSizeChange = (event) => {
    const val = parseInt(event.target.value, 10);
    emit('update:arabicFontSize', val);
    localStorage.setItem('anisul_font_size', val);
};

const toggleTranslation = () => {
    const val = !props.showTranslation;
    emit('update:showTranslation', val);
    localStorage.setItem('anisul_show_translation', val);
};

const toggleTransliteration = () => {
    const val = !props.showTransliteration;
    emit('update:showTransliteration', val);
    localStorage.setItem('anisul_show_transliteration', val);
};

const toggleAutoScroll = () => {
    const val = !props.autoScrollEnabled;
    emit('update:autoScrollEnabled', val);
};

const resetDefaults = () => {
    emit('update:readingMode', 'ayah');
    emit('update:mushafType', 'uthmani');
    emit('update:arabicFontSize', 28);
    emit('update:showTranslation', true);
    emit('update:showTransliteration', true);
    emit('update:autoScrollEnabled', true);

    localStorage.setItem('anisul_reading_mode', 'ayah');
    localStorage.setItem('anisul_mushaf', 'uthmani');
    localStorage.setItem('anisul_font_size', 28);
    localStorage.setItem('anisul_show_translation', 'true');
    localStorage.setItem('anisul_show_transliteration', 'true');

    emit('reset-defaults');
};
</script>

<template>
    <Teleport to="body">
        <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div 
                v-if="open" 
                class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
                role="dialog"
                aria-modal="true"
                aria-labelledby="settings-drawer-title"
            >
                <!-- Backdrop Blur -->
                <div 
                    class="fixed inset-0 bg-background/80 backdrop-blur-md transition-opacity" 
                    @click="close"
                />

                <!-- Dialog Content Card -->
                <div 
                    class="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-3xl border border-border/80 bg-card p-6 shadow-2xl z-10 animate-scale-in text-card-foreground overflow-hidden"
                >
                    <!-- Header -->
                    <div class="flex items-center justify-between pb-4 border-b border-border/60">
                        <div class="flex items-center gap-2.5">
                            <div class="p-2 rounded-xl bg-primary/10 text-primary">
                                <SlidersHorizontal class="h-5 w-5" />
                            </div>
                            <div>
                                <h2 id="settings-drawer-title" class="font-heading font-bold text-lg sm:text-xl text-foreground">
                                    Pengaturan Tampilan & Mushaf
                                </h2>
                                <p class="text-xs text-muted-foreground">
                                    Sesuaikan ukuran huruf, rasm, dan preferensi bacaan Anda
                                </p>
                            </div>
                        </div>

                        <!-- Close Button -->
                        <button
                            type="button"
                            @click="close"
                            class="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                            aria-label="Tutup Pengaturan"
                        >
                            <X class="h-5 w-5" />
                        </button>
                    </div>

                    <!-- Scrollable Settings Body -->
                    <div class="flex-1 overflow-y-auto space-y-6 py-4 pr-1 -mr-1 text-sm">
                        <!-- 1. Mode Baca (Per Ayat vs Mushaf Fisik) -->
                        <div class="space-y-2.5">
                            <label class="block font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground">
                                Mode Tampilan Bacaan
                            </label>
                            <div class="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    @click="setReadingMode('ayah')"
                                    class="flex items-center justify-center gap-2 p-3 rounded-2xl border text-sm font-semibold transition-all"
                                    :class="readingMode === 'ayah' 
                                        ? 'bg-primary/10 border-primary/50 text-primary ring-1 ring-primary/20 shadow-xs' 
                                        : 'bg-card border-border/60 hover:bg-muted/50 text-foreground'"
                                >
                                    <Type class="h-4 w-4" />
                                    <span>Mode Ayat</span>
                                </button>
                                <button
                                    type="button"
                                    @click="setReadingMode('mushaf')"
                                    class="flex items-center justify-center gap-2 p-3 rounded-2xl border text-sm font-semibold transition-all"
                                    :class="readingMode === 'mushaf' 
                                        ? 'bg-primary/10 border-primary/50 text-primary ring-1 ring-primary/20 shadow-xs' 
                                        : 'bg-card border-border/60 hover:bg-muted/50 text-foreground'"
                                >
                                    <BookOpen class="h-4 w-4" />
                                    <span>Mushaf Fisik</span>
                                </button>
                            </div>
                        </div>

                        <!-- 2. Jenis Rasm Font Arab -->
                        <div class="space-y-2.5">
                            <label class="block font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground">
                                Jenis Tulisan Rasm Arab
                            </label>
                            <div class="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    @click="setMushafType('uthmani')"
                                    class="flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all"
                                    :class="mushafType === 'uthmani' 
                                        ? 'bg-primary/10 border-primary/50 text-primary ring-1 ring-primary/20 shadow-xs' 
                                        : 'bg-card border-border/60 hover:bg-muted/50 text-foreground'"
                                >
                                    <span class="font-arabic font-bold text-lg">عُثْمَانِي</span>
                                    <span class="text-xs font-medium mt-0.5">Uthmani (Madinah)</span>
                                </button>
                                <button
                                    type="button"
                                    @click="setMushafType('indopak')"
                                    class="flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all"
                                    :class="mushafType === 'indopak' 
                                        ? 'bg-primary/10 border-primary/50 text-primary ring-1 ring-primary/20 shadow-xs' 
                                        : 'bg-card border-border/60 hover:bg-muted/50 text-foreground'"
                                >
                                    <span class="font-indopak font-bold text-lg">اِنْڈوپَاک</span>
                                    <span class="text-xs font-medium mt-0.5">IndoPak (Asia)</span>
                                </button>
                            </div>
                        </div>

                        <!-- 3. Ukuran Font Arab Slider -->
                        <div class="space-y-2.5">
                            <div class="flex items-center justify-between">
                                <label class="font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground">
                                    Ukuran Huruf Arab
                                </label>
                                <span class="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded-lg bg-primary/10">
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
                                class="w-full h-2 rounded-lg bg-muted appearance-none cursor-pointer accent-primary"
                                aria-label="Ukuran Font Arab"
                            />
                            <!-- Preview Box -->
                            <div class="p-3.5 rounded-2xl border border-border/60 bg-muted/30 text-right" dir="rtl">
                                <p 
                                    :class="mushafType === 'indopak' ? 'font-indopak' : 'font-arabic'"
                                    :style="{ fontSize: `${arabicFontSize}px` }"
                                    class="leading-relaxed text-foreground transition-all duration-200"
                                >
                                    بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                                </p>
                            </div>
                        </div>

                        <!-- 4. Toggles Fitur Teks -->
                        <div class="space-y-3 pt-2 border-t border-border/60">
                            <label class="block font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground">
                                Pilihan Elemen Teks
                            </label>

                            <!-- Toggle Terjemahan Kemenag RI -->
                            <div class="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/50">
                                <div>
                                    <p class="font-semibold text-foreground text-sm">Terjemahan Indonesia</p>
                                    <p class="text-xs text-muted-foreground">Terjemahan resmi Kemenag RI & catatan kaki</p>
                                </div>
                                <button
                                    type="button"
                                    @click="toggleTranslation"
                                    class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                                    :class="showTranslation ? 'bg-primary' : 'bg-muted-foreground/30'"
                                >
                                    <span 
                                        class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
                                        :class="showTranslation ? 'translate-x-5' : 'translate-x-0'"
                                    />
                                </button>
                            </div>

                            <!-- Toggle Transliterasi Latin -->
                            <div class="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/50">
                                <div>
                                    <p class="font-semibold text-foreground text-sm">Transliterasi Latin</p>
                                    <p class="text-xs text-muted-foreground">Teks lafaz bacaan dalam alfabet Latin</p>
                                </div>
                                <button
                                    type="button"
                                    @click="toggleTransliteration"
                                    class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                                    :class="showTransliteration ? 'bg-primary' : 'bg-muted-foreground/30'"
                                >
                                    <span 
                                        class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
                                        :class="showTransliteration ? 'translate-x-5' : 'translate-x-0'"
                                    />
                                </button>
                            </div>

                            <!-- Toggle Auto-Scroll Sync -->
                            <div class="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/50">
                                <div>
                                    <p class="font-semibold text-foreground text-sm">Auto-Scroll Audio</p>
                                    <p class="text-xs text-muted-foreground">Otomatis menggulir layar mengikuti ayat yang diputar</p>
                                </div>
                                <button
                                    type="button"
                                    @click="toggleAutoScroll"
                                    class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                                    :class="autoScrollEnabled ? 'bg-primary' : 'bg-muted-foreground/30'"
                                >
                                    <span 
                                        class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
                                        :class="autoScrollEnabled ? 'translate-x-5' : 'translate-x-0'"
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Footer Action: Reset to Defaults -->
                    <div class="pt-4 border-t border-border/60 flex items-center justify-between">
                        <button
                            type="button"
                            @click="resetDefaults"
                            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
                        >
                            <RotateCcw class="h-3.5 w-3.5" />
                            <span>Kembalikan Default</span>
                        </button>

                        <button
                            type="button"
                            @click="close"
                            class="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-xs hover:bg-primary/90 transition-colors"
                        >
                            <span>Selesai</span>
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
