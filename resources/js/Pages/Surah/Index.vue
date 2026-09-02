<script setup>
import { ref, computed } from 'vue';
import AppLayout from '@/Layouts/AppLayout.vue';
import SurahCard from '@/components/SurahCard.vue';
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
        <div class="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <!-- Hero Banner & Intro -->
            <section class="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-b from-card via-card to-muted/30 p-6 sm:p-10 shadow-sm">
                <div class="max-w-3xl space-y-4">
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        <Sparkles class="h-3.5 w-3.5" />
                        <span>Interactive Quran Player & Karaoke Sync</span>
                    </div>

                    <h1 class="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-foreground tracking-tight">
                        Dengarkan & Hayati Lantunan Suci <span class="text-primary">Al-Qur'an</span>
                    </h1>

                    <p class="text-muted-foreground text-sm sm:text-base leading-relaxed">
                        Pilih surah untuk membaca teks ayat, transliterasi Latin, dan terjemahan resmi Kemenag RI yang bergerak selaras dengan lantunan qari favorit Anda.
                    </p>
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
