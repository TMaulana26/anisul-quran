<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { X, BookOpen, Loader2, Info } from '@lucide/vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
    footnoteId: {
        type: Number,
        default: null,
    },
    footnoteNumber: {
        type: [String, Number],
        default: '1',
    },
    verseKey: {
        type: String,
        default: '',
    },
});

const emit = defineEmits(['update:modelValue']);

const loading = ref(false);
const footnoteText = ref('');
const error = ref('');

// Global in-memory cache for footnote contents
const cache = new Map();

const fetchFootnote = async (id) => {
    if (!id) return;

    if (cache.has(id)) {
        footnoteText.value = cache.get(id);
        loading.value = false;
        return;
    }

    loading.value = true;
    error.value = '';

    try {
        const response = await fetch(`/api/footnote/${id}`);
        if (!response.ok) throw new Error('Gagal memuat penjelasan catatan kaki.');
        const data = await response.json();
        
        const text = data.footnote?.text || 'Penjelasan tidak tersedia.';
        cache.set(id, text);
        footnoteText.value = text;
    } catch (e) {
        error.value = e.message || 'Terjadi kesalahan jaringan.';
    } finally {
        loading.value = false;
    }
};

watch(() => props.modelValue, (isOpen) => {
    if (isOpen && props.footnoteId) {
        fetchFootnote(props.footnoteId);
    }
});

watch(() => props.footnoteId, (newId) => {
    if (props.modelValue && newId) {
        fetchFootnote(newId);
    }
});

const close = () => {
    emit('update:modelValue', false);
};

const handleKeydown = (e) => {
    if (e.key === 'Escape' && props.modelValue) {
        close();
    }
};

onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
    <Teleport to="body">
        <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div 
                v-if="modelValue" 
                class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs"
                @click.self="close"
            >
                <!-- Modal Card -->
                <div 
                    class="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4 animate-scale-in"
                    role="dialog"
                    aria-modal="true"
                >
                    <!-- Header -->
                    <div class="flex items-start justify-between gap-3 pb-3 border-b border-border">
                        <div class="flex items-center gap-2.5">
                            <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <BookOpen class="h-4 w-4" />
                            </div>
                            <div>
                                <h3 class="font-heading font-bold text-base text-foreground">
                                    Catatan Kaki Kemenag RI
                                </h3>
                                <p class="text-xs text-muted-foreground">
                                    Ayat {{ verseKey }} • Penjelasan No. {{ footnoteNumber }}
                                </p>
                            </div>
                        </div>

                        <button 
                            @click="close"
                            type="button"
                            class="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title="Tutup dialog"
                        >
                            <X class="h-4 w-4" />
                        </button>
                    </div>

                    <!-- Body Content -->
                    <div class="py-2 min-h-[80px] flex items-center">
                        <!-- Loading State -->
                        <div v-if="loading" class="w-full flex flex-col items-center justify-center gap-2 py-4 text-muted-foreground text-xs">
                            <Loader2 class="h-5 w-5 animate-spin text-primary" />
                            <span>Memuat penjelasan dari Kemenag RI...</span>
                        </div>

                        <!-- Error State -->
                        <div v-else-if="error" class="w-full text-center py-4 text-xs text-destructive">
                            <p>{{ error }}</p>
                            <button 
                                @click="fetchFootnote(footnoteId)" 
                                type="button"
                                class="mt-2 text-primary underline"
                            >
                                Coba lagi
                            </button>
                        </div>

                        <!-- Content Display -->
                        <div v-else class="w-full space-y-3">
                            <p class="text-sm sm:text-base leading-relaxed text-foreground font-sans bg-muted/40 p-4 rounded-xl border border-border/60">
                                "{{ footnoteText }}"
                            </p>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground">
                        <div class="flex items-center gap-1">
                            <Info class="h-3.5 w-3.5 text-primary" />
                            <span>Kementerian Agama Republik Indonesia</span>
                        </div>
                        <button 
                            @click="close"
                            type="button"
                            class="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-2xs"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
