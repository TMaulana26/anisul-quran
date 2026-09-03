<script setup>
import { ref, computed } from 'vue';
import { Search, X, User, Check, Sparkles, Volume2, Music2 } from '@lucide/vue';

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

const getReciterName = (reciter) => {
    return reciter?.name || reciter?.reciter_name || reciter?.translated_name?.name || 'Qari Murottal';
};

const getStyleType = (reciter) => {
    const s = `${reciter?.style || ''} ${getReciterName(reciter)}`.toLowerCase();
    if (s.includes('mujawwad')) return 'mujawwad';
    return 'murattal';
};

// Filter reciters by search query and style
const filteredReciters = computed(() => {
    let list = props.reciters || [];

    if (activeFilter.value === 'murattal') {
        list = list.filter(r => getStyleType(r) === 'murattal');
    } else if (activeFilter.value === 'mujawwad') {
        list = list.filter(r => getStyleType(r) === 'mujawwad');
    }

    const q = searchQuery.value.trim().toLowerCase();
    if (!q) return list;

    return list.filter(r => {
        const nameMatch = getReciterName(r).toLowerCase().includes(q);
        const styleMatch = (r.style || '').toLowerCase().includes(q);
        return nameMatch || styleMatch;
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
                class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
                role="dialog"
                aria-modal="true"
                aria-labelledby="reciter-modal-title"
            >
                <!-- Backdrop Blur -->
                <div 
                    class="fixed inset-0 bg-background/80 backdrop-blur-md transition-opacity cursor-pointer" 
                    @click="close"
                />

                <!-- Dialog Content Card (Wider 3x4 Grid Layout) -->
                <div 
                    class="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xl z-10 animate-scale-in text-card-foreground overflow-hidden"
                >
                    <!-- Header -->
                    <div class="flex items-center justify-between pb-4 border-b border-border/60">
                        <div class="flex items-center gap-3">
                            <div class="p-2.5 rounded-2xl bg-primary/10 text-primary">
                                <User class="h-5 w-5" />
                            </div>
                            <div>
                                <h2 id="reciter-modal-title" class="font-heading font-bold text-lg sm:text-xl text-foreground">
                                    Pilih Qari Murottal & Mujawwad
                                </h2>
                                <p class="text-xs text-muted-foreground">
                                    Pilih pembaca Al-Qur'an favorit Anda untuk sinkronisasi audio presisi
                                </p>
                            </div>
                        </div>

                        <!-- Close Button -->
                        <button
                            type="button"
                            @click="close"
                            class="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                            aria-label="Tutup Dialog"
                        >
                            <X class="h-5 w-5" />
                        </button>
                    </div>

                    <!-- Search Input Box & Style Filter Chips -->
                    <div class="py-4 space-y-3">
                        <div class="flex flex-col sm:flex-row gap-3">
                            <!-- Search Field -->
                            <div class="relative flex-1">
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
                                    class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                                >
                                    <X class="h-3.5 w-3.5" />
                                </button>
                            </div>

                            <!-- Filter Chips: Semua, Murattal (Hijau), Mujawwad (Biru) -->
                            <div class="flex items-center gap-1.5 p-1 rounded-xl bg-muted/50 border border-border/50 self-start shrink-0">
                                <button
                                    type="button"
                                    @click="activeFilter = 'all'"
                                    class="px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                                    :class="activeFilter === 'all' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'"
                                >
                                    Semua
                                </button>
                                <button
                                    type="button"
                                    @click="activeFilter = 'murattal'"
                                    class="px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                                    :class="activeFilter === 'murattal' 
                                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-xs ring-1 ring-emerald-500/30 font-bold' 
                                        : 'text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400'"
                                >
                                    <span class="h-2 w-2 rounded-full bg-emerald-500" />
                                    <span>Murattal</span>
                                </button>
                                <button
                                    type="button"
                                    @click="activeFilter = 'mujawwad'"
                                    class="px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                                    :class="activeFilter === 'mujawwad' 
                                        ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 shadow-xs ring-1 ring-blue-500/30 font-bold' 
                                        : 'text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400'"
                                >
                                    <span class="h-2 w-2 rounded-full bg-blue-500" />
                                    <span>Mujawwad</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Reciters Scrollable 3x4 Grid -->
                    <div class="flex-1 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar max-h-[60vh]">
                        <div 
                            v-if="filteredReciters.length === 0" 
                            class="py-16 text-center text-muted-foreground text-sm"
                        >
                            <User class="h-10 w-10 mx-auto mb-2 opacity-40 text-muted-foreground" />
                            <p>Tidak ada Qari yang cocok dengan pencarian "{{ searchQuery }}".</p>
                        </div>

                        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-1">
                            <button
                                v-for="reciter in filteredReciters"
                                :key="reciter.id"
                                type="button"
                                @click="selectReciter(reciter)"
                                class="flex flex-col justify-between p-3.5 rounded-2xl border transition-all text-left group cursor-pointer relative overflow-hidden"
                                :class="reciter.id === selectedReciterId
                                    ? 'bg-primary/10 border-primary shadow-md ring-2 ring-primary/30'
                                    : 'bg-card border-border/70 hover:border-primary/50 hover:bg-muted/40 text-foreground/90'"
                            >
                                <!-- Top Row: Initial Avatar + Style Badge + Selected Indicator -->
                                <div class="flex items-center justify-between gap-2 w-full mb-3">
                                    <div class="flex items-center gap-2.5 min-w-0">
                                        <!-- Avatar Circle with Initial -->
                                        <div 
                                            class="h-9 w-9 rounded-xl flex items-center justify-center font-heading font-bold text-sm shrink-0 transition-colors"
                                            :class="reciter.id === selectedReciterId
                                                ? 'bg-primary text-primary-foreground shadow-xs'
                                                : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'"
                                        >
                                            {{ (getReciterName(reciter)).charAt(0) }}
                                        </div>

                                        <!-- Murattal (Hijau) / Mujawwad (Biru) Badge -->
                                        <span
                                            class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border"
                                            :class="getStyleType(reciter) === 'mujawwad'
                                                ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                                                : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'"
                                        >
                                            {{ getStyleType(reciter) === 'mujawwad' ? 'Mujawwad' : 'Murattal' }}
                                        </span>
                                    </div>

                                    <!-- Selected Checkmark -->
                                    <div v-if="reciter.id === selectedReciterId" class="flex items-center gap-1 text-primary shrink-0">
                                        <Volume2 class="h-3.5 w-3.5 animate-pulse" />
                                        <Check class="h-4 w-4 stroke-[3]" />
                                    </div>
                                </div>

                                <!-- Bottom Row: Qari Name -->
                                <div class="w-full">
                                    <p 
                                        class="text-sm font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors"
                                        :title="getReciterName(reciter)"
                                    >
                                        {{ getReciterName(reciter) }}
                                    </p>
                                </div>
                            </button>
                        </div>
                    </div>

                    <!-- Footer Note -->
                    <div class="pt-4 mt-3 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Menampilkan {{ filteredReciters.length }} Qari</span>
                        <span>Pilihan qari otomatis tersimpan</span>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
