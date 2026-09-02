<script setup>
import { ref, computed, onMounted } from 'vue';
import { Search, X, User, Check, Sparkles, Volume2 } from '@lucide/vue';

const props = defineProps({
    open: {
        type: Boolean,
        default: false,
    },
    reciters: {
        type: Array,
        default: () => [],
    },
    selectedReciterId: {
        type: Number,
        default: 7, // Mishary Rashid Alafasy
    },
});

const emit = defineEmits(['update:open', 'select-reciter']);

const searchQuery = ref('');
const activeFilter = ref('all'); // 'all', 'murattal', 'mujawwad'

const close = () => {
    emit('update:open', false);
};

// Filter reciters by search query and style
const filteredReciters = computed(() => {
    let list = props.reciters || [];

    if (activeFilter.value === 'murattal') {
        list = list.filter(r => (r.style || '').toLowerCase().includes('murattal') || (r.name || '').toLowerCase().includes('murattal'));
    } else if (activeFilter.value === 'mujawwad') {
        list = list.filter(r => (r.style || '').toLowerCase().includes('mujawwad') || (r.name || '').toLowerCase().includes('mujawwad'));
    }

    const q = searchQuery.value.trim().toLowerCase();
    if (!q) return list;

    return list.filter(r => {
        const nameMatch = (r.name || '').toLowerCase().includes(q);
        const translatedMatch = (r.translated_name?.name || '').toLowerCase().includes(q);
        const styleMatch = (r.style || '').toLowerCase().includes(q);
        return nameMatch || translatedMatch || styleMatch;
    });
});

const selectReciter = (reciter) => {
    emit('select-reciter', reciter);
    close();
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
                aria-labelledby="reciter-modal-title"
            >
                <!-- Backdrop Blur -->
                <div 
                    class="fixed inset-0 bg-background/80 backdrop-blur-md transition-opacity" 
                    @click="close"
                />

                <!-- Dialog Content Card -->
                <div 
                    class="relative w-full max-w-xl max-h-[85vh] flex flex-col rounded-3xl border border-border/80 bg-card p-6 shadow-2xl z-10 animate-scale-in text-card-foreground overflow-hidden"
                >
                    <!-- Header -->
                    <div class="flex items-center justify-between pb-4 border-b border-border/60">
                        <div class="flex items-center gap-2.5">
                            <div class="p-2 rounded-xl bg-primary/10 text-primary">
                                <User class="h-5 w-5" />
                            </div>
                            <div>
                                <h2 id="reciter-modal-title" class="font-heading font-bold text-lg sm:text-xl text-foreground">
                                    Pilih Qari Murottal
                                </h2>
                                <p class="text-xs text-muted-foreground">
                                    Pilih pembaca Al-Qur'an favorit Anda untuk sinkronisasi audio
                                </p>
                            </div>
                        </div>

                        <!-- Close Button -->
                        <button
                            type="button"
                            @click="close"
                            class="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                            aria-label="Tutup Dialog"
                        >
                            <X class="h-5 w-5" />
                        </button>
                    </div>

                    <!-- Search Input Box -->
                    <div class="py-4 space-y-3">
                        <div class="relative">
                            <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input 
                                v-model="searchQuery"
                                type="text"
                                placeholder="Cari nama Qari (misal: Mishary, Al-Husary, Sudais)..."
                                class="w-full pl-10 pr-10 py-2.5 rounded-xl bg-muted/60 border border-border/60 focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all placeholder:text-muted-foreground/70"
                            />
                            <button 
                                v-if="searchQuery"
                                @click="searchQuery = ''"
                                type="button"
                                class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                            >
                                <X class="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>

                    <!-- Reciters Scrollable List -->
                    <div class="flex-1 overflow-y-auto space-y-2 pr-1 -mr-1">
                        <div 
                            v-if="filteredReciters.length === 0" 
                            class="py-12 text-center text-muted-foreground text-sm"
                        >
                            <User class="h-8 w-8 mx-auto mb-2 opacity-40 text-muted-foreground" />
                            <p>Tidak ada Qari yang cocok dengan pencarian "{{ searchQuery }}".</p>
                        </div>

                        <button
                            v-for="reciter in filteredReciters"
                            :key="reciter.id"
                            type="button"
                            @click="selectReciter(reciter)"
                            class="w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left group"
                            :class="reciter.id === selectedReciterId
                                ? 'bg-primary/10 border-primary/50 text-foreground font-semibold shadow-xs ring-1 ring-primary/20'
                                : 'bg-card border-border/60 hover:bg-muted/50 hover:border-border text-foreground/90'"
                        >
                            <div class="flex items-center gap-3 min-w-0">
                                <!-- Avatar Circle with Initials -->
                                <div 
                                    class="h-10 w-10 rounded-xl flex items-center justify-center font-heading font-bold text-sm shrink-0 transition-colors"
                                    :class="reciter.id === selectedReciterId
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'"
                                >
                                    {{ (reciter.name || 'Q').charAt(0) }}
                                </div>

                                <div class="min-w-0">
                                    <div class="flex items-center gap-2">
                                        <p class="text-sm font-bold truncate text-foreground">
                                            {{ reciter.name }}
                                        </p>
                                    </div>
                                    <p class="text-xs text-muted-foreground truncate">
                                        {{ reciter.style || reciter.translated_name?.name || 'Murattal' }}
                                    </p>
                                </div>
                            </div>

                            <!-- Selected Checkmark / Volume Icon -->
                            <div v-if="reciter.id === selectedReciterId" class="flex items-center gap-1 text-primary pl-2 shrink-0">
                                <Volume2 class="h-4 w-4 animate-pulse" />
                                <Check class="h-5 w-5" />
                            </div>
                        </button>
                    </div>

                    <!-- Footer Note -->
                    <div class="pt-4 mt-2 border-t border-border/50 text-center">
                        <span class="text-[11px] text-muted-foreground">
                            Pilihan qari akan otomatis tersimpan untuk surah-surah berikutnya.
                        </span>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
