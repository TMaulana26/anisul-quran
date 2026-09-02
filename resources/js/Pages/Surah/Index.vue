<script setup>
import { ref, computed } from 'vue';
import AppLayout from '@/Layouts/AppLayout.vue';
import SurahCard from '@/components/SurahCard.vue';
import DecorativeMoon from '@/components/DecorativeMoon.vue';
import { Search, X, Sparkles, BookOpen, Layers } from '@lucide/vue';

const props = defineProps({
    chapters: {
        type: Array,
        default: () => [],
    },
    reciters: {
        type: Array,
        default: () => [],
    },
});

const searchQuery = ref('');
const activeFilter = ref('all'); // 'all', 'makkah', 'madinah'

// Filter chapters dynamically
const filteredChapters = computed(() => {
    let list = props.chapters;

    // Filter by revelation place if not 'all'
    if (activeFilter.value === 'makkah') {
        list = list.filter(c => c.revelation_place === 'makkah');
    } else if (activeFilter.value === 'madinah') {
        list = list.filter(c => c.revelation_place === 'madinah');
    }

    // Filter by search query (name, number, translation, arabic)
    const query = searchQuery.value.trim().toLowerCase();
    if (!query) return list;

    return list.filter(chapter => {
        const idMatch = chapter.id.toString() === query;
        const nameSimpleMatch = chapter.name_simple.toLowerCase().includes(query);
        const nameArabicMatch = chapter.name_arabic.includes(query);
        const translatedMatch = chapter.translated_name?.name?.toLowerCase().includes(query);

        return idMatch || nameSimpleMatch || nameArabicMatch || translatedMatch;
    });
});

const clearSearch = () => {
    searchQuery.value = '';
};
</script>

<template>
    <AppLayout title="Daftar 114 Surah">
        <div class="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
            <!-- Hero Banner & Intro -->
            <section class="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-muted/40 p-6 sm:p-10 lg:p-12 shadow-sm animate-scale-in">
                <!-- Celestial ambient background glow & glare -->
                <div class="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
                <div class="pointer-events-none absolute right-12 top-12 h-64 w-64 rounded-full bg-primary/15 blur-2xl" />
                <div class="pointer-events-none absolute -left-16 -bottom-16 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />

                <div class="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                    <!-- Left Hero Content -->
                    <div class="max-w-2xl space-y-4">
                        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold shadow-2xs">
                            <Sparkles class="h-3.5 w-3.5" />
                            <span>Interactive Quran Player & Karaoke Sync</span>
                        </div>

                        <h1 class="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-foreground leading-[1.2] sm:leading-[1.25] text-balance">
                            Dengarkan & Hayati Lantunan Suci <span class="text-primary whitespace-nowrap">Al-Qur'an</span>
                        </h1>

                        <p class="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xl text-pretty">
                            Pilih surah untuk membaca teks ayat, transliterasi Latin, dan terjemahan resmi Kemenag RI yang bergerak selaras dengan lantunan qari favorit Anda.
                        </p>
                    </div>

                    <!-- Right Decorative Crescent Moon with Radiant Glare Effect -->
                    <div class="hidden sm:flex items-center justify-center shrink-0 pr-0 lg:pr-2 select-none pointer-events-none relative">
                        <!-- Radiant Glare Core -->
                        <div class="absolute inset-0 m-auto w-56 h-56 lg:w-72 lg:h-72 rounded-full bg-primary/20 blur-2xl animate-pulse-glow" />
                        <div class="absolute -top-4 right-12 w-24 h-24 rounded-full bg-primary/30 blur-xl" />

                        <!-- Decorative Moon with Celestial Drop Shadows -->
                        <div class="relative z-10 flex items-center justify-center">
                            <DecorativeMoon class="w-56 h-56 sm:w-68 sm:h-68 md:w-80 md:h-80 lg:w-[350px] lg:h-[350px] text-primary opacity-95 drop-shadow-[0_0_25px_rgba(4,120,87,0.45)] dark:drop-shadow-[0_0_35px_rgba(52,211,153,0.6)] transform hover:scale-105 transition-all duration-700" />
                        </div>
                    </div>
                </div>
            </section>

            <!-- Search Bar & Filters -->
            <section class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <!-- Search Input Box -->
                <div class="relative flex-1 max-w-md">
                    <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input 
                        v-model="searchQuery"
                        type="text"
                        placeholder="Cari nama surah, nomor, atau arti..."
                        class="w-full h-11 pl-10 pr-10 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
                    />
                    <button 
                        v-if="searchQuery" 
                        @click="clearSearch"
                        type="button" 
                        class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                        title="Hapus pencarian"
                    >
                        <X class="h-4 w-4" />
                    </button>
                </div>

                <!-- Filter Tabs: Semua, Makkiyah, Madaniyah -->
                <div class="flex items-center gap-1.5 p-1 rounded-xl border border-border bg-card self-start sm:self-auto shadow-sm">
                    <button 
                        @click="activeFilter = 'all'"
                        type="button"
                        :class="[
                            'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                            activeFilter === 'all' 
                                ? 'bg-primary text-primary-foreground shadow-xs' 
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        ]"
                    >
                        Semua ({{ chapters.length }})
                    </button>
                    <button 
                        @click="activeFilter = 'makkah'"
                        type="button"
                        :class="[
                            'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                            activeFilter === 'makkah' 
                                ? 'bg-primary text-primary-foreground shadow-xs' 
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        ]"
                    >
                        Makkiyah
                    </button>
                    <button 
                        @click="activeFilter = 'madinah'"
                        type="button"
                        :class="[
                            'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                            activeFilter === 'madinah' 
                                ? 'bg-primary text-primary-foreground shadow-xs' 
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        ]"
                    >
                        Madaniyah
                    </button>
                </div>
            </section>

            <!-- Surah Cards Grid -->
            <section v-if="filteredChapters.length > 0">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <SurahCard 
                        v-for="chapter in filteredChapters" 
                        :key="chapter.id" 
                        :chapter="chapter" 
                    />
                </div>
            </section>

            <!-- Empty State -->
            <section v-else class="text-center py-16 px-4 space-y-3 rounded-2xl border border-dashed border-border bg-card/30">
                <div class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Search class="h-6 w-6" />
                </div>
                <h3 class="font-heading font-semibold text-lg text-foreground">
                    Surah tidak ditemukan
                </h3>
                <p class="text-sm text-muted-foreground max-w-sm mx-auto">
                    Tidak ada surah yang cocok dengan kata kunci "<span class="font-medium text-foreground">{{ searchQuery }}</span>". Coba cari dengan ejaan lain.
                </p>
                <button 
                    @click="clearSearch"
                    type="button"
                    class="mt-2 inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                >
                    Tampilkan Semua Surah
                </button>
            </section>
        </div>
    </AppLayout>
</template>
