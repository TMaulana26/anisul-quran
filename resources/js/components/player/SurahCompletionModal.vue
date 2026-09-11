<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import { 
    X, 
    Play, 
    BookOpen, 
    RotateCcw, 
    CheckCircle2, 
    Sparkles, 
    ChevronRight 
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
    nextChapter: {
        type: Object,
        default: null,
    },
    reciter: {
        type: Object,
        default: null,
    },
});

const emit = defineEmits(['update:open', 'play-next', 'back-to-index', 'replay']);

const close = () => {
    emit('update:open', false);
};

// If there is a next chapter, use it. If current surah is 114 (An-Nas), loop back to Surah 1 (Al-Fatihah)
const nextTarget = computed(() => {
    if (props.nextChapter && props.nextChapter.id) {
        return props.nextChapter;
    }
    // Loop back to Surah 1 Al-Fatihah
    return {
        id: 1,
        name_simple: 'Al-Fatihah',
        name_arabic: 'الفاتحة',
    };
});

const reciterName = computed(() => {
    return props.reciter?.name || props.reciter?.reciter_name || props.reciter?.translated_name?.name || 'Qari Murottal';
});

const handlePlayNext = () => {
    emit('play-next', nextTarget.value);
};

const handleBackToIndex = () => {
    emit('back-to-index');
};

const handleReplay = () => {
    emit('replay');
};

const handleKeyDown = (e) => {
    if (props.open && e.key === 'Escape') {
        close();
    }
};

onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
    <Teleport to="body">
        <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div 
                v-if="open" 
                class="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 select-none"
                role="dialog"
                aria-modal="true"
                aria-labelledby="completion-modal-title"
            >
                <!-- Backdrop Blur -->
                <div 
                    class="fixed inset-0 bg-background/80 backdrop-blur-md transition-opacity cursor-pointer" 
                    @click="close"
                />

                <!-- Dialog Content Card -->
                <div 
                    class="relative w-full max-w-md flex flex-col rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-2xl z-10 animate-scale-in text-card-foreground overflow-hidden"
                >
                    <!-- Decorative Background Glow -->
                    <div class="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-56 h-56 bg-primary/15 rounded-full blur-3xl" />

                    <!-- Top Bar: Badge & Close Button -->
                    <div class="flex items-center justify-between pb-2">
                        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold ring-1 ring-primary/20">
                            <Sparkles class="h-3.5 w-3.5" />
                            <span>Surah Selesai</span>
                        </div>

                        <button
                            type="button"
                            @click="close"
                            class="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                            aria-label="Tutup Dialog"
                        >
                            <X class="h-5 w-5" />
                        </button>
                    </div>

                    <!-- Header Content -->
                    <div class="text-center pt-2 pb-5 space-y-2">
                        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs ring-1 ring-primary/25 mb-3">
                            <CheckCircle2 class="h-7 w-7" />
                        </div>

                        <h2 id="completion-modal-title" class="font-heading font-bold text-xl sm:text-2xl text-foreground">
                            Alhamdulillah
                        </h2>
                        
                        <p class="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                            Selesai mendengarkan lantunan 
                            <span class="font-semibold text-foreground">Surah {{ chapter.name_simple }}</span> 
                            <span class="font-arabic text-primary font-bold ml-1">({{ chapter.name_arabic }})</span>.
                        </p>

                        <p v-if="reciterName" class="text-xs text-muted-foreground/80">
                            Tilawah oleh <span class="text-foreground/90 font-medium">{{ reciterName }}</span>
                        </p>
                    </div>

                    <!-- Action Buttons -->
                    <div class="space-y-2.5 pt-1">
                        <!-- Primary Action: Putar Surah Selanjutnya -->
                        <button
                            type="button"
                            @click="handlePlayNext"
                            class="w-full group flex items-center justify-between px-4 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:bg-primary/90 active:scale-[0.98] transition-all cursor-pointer"
                        >
                            <div class="flex items-center gap-3 text-left">
                                <div class="p-2 rounded-xl bg-white/20 text-white group-hover:scale-105 transition-transform">
                                    <Play class="h-4 w-4 fill-white" />
                                </div>
                                <div>
                                    <div class="font-semibold">Putar Surah Selanjutnya</div>
                                    <div class="text-xs opacity-90 font-normal">
                                        Surah {{ nextTarget.name_simple }} ({{ nextTarget.name_arabic }})
                                    </div>
                                </div>
                            </div>
                            <ChevronRight class="h-5 w-5 opacity-80 group-hover:translate-x-0.5 transition-transform" />
                        </button>

                        <!-- Secondary Action: Kembali ke Daftar Surah -->
                        <button
                            type="button"
                            @click="handleBackToIndex"
                            class="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl border border-border/80 bg-muted/50 hover:bg-muted text-foreground font-medium text-sm transition-all hover:border-border cursor-pointer"
                        >
                            <BookOpen class="h-4 w-4 text-muted-foreground" />
                            <span>Kembali ke Daftar Surah</span>
                        </button>

                        <!-- Tertiary Action: Putar Ulang & Tutup Grid -->
                        <div class="flex items-center gap-2 pt-1">
                            <button
                                type="button"
                                @click="handleReplay"
                                class="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-border/60 hover:bg-muted/60 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            >
                                <RotateCcw class="h-3.5 w-3.5" />
                                <span>Putar Ulang</span>
                            </button>

                            <button
                                type="button"
                                @click="close"
                                class="flex-1 flex items-center justify-center py-2.5 px-3 rounded-xl border border-border/60 hover:bg-muted/60 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            >
                                <span>Tutup</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
