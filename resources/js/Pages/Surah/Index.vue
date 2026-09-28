<script setup>
import { ref, computed } from 'vue';
import AppLayout from '@/Layouts/AppLayout.vue';
import SurahCard from '@/components/SurahCard.vue';
import DecorativeMoon from '@/components/DecorativeMoon.vue';
import { useI18n } from '@/composables/useI18n';
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

const { t } = useI18n();
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

const makkahCount = computed(() => props.chapters.filter(c => c.revelation_place === 'makkah').length);
const madinahCount = computed(() => props.chapters.filter(c => c.revelation_place === 'madinah').length);

const clearSearch = () => {
    searchQuery.value = '';
};
</script>

<template>
    <AppLayout :title="t('nav.surah_list')">
        <div class="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
            <!-- Hero Banner & Intro -->
            <section class="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-muted/40 p-6 sm:p-10 lg:p-12 shadow-sm animate-scale-in">
                <div class="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                    <!-- Left Hero Content -->
                    <div class="max-w-2xl space-y-4">
                        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold shadow-2xs">
                            <Sparkles class="h-3.5 w-3.5" />
                            <span>{{ t('index.hero_badge') }}</span>
                        </div>

                        <h1 class="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-foreground leading-[1.2] sm:leading-[1.25] text-balance">
                            {{ t('index.hero_title') }}
                        </h1>

                        <p class="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xl text-pretty">
                            {{ t('index.hero_subtitle') }}
                        </p>
                    </div>

                    <!-- Right Decorative Crescent Moon (With Looping & Micro-Interactions) -->
                    <div class="hidden sm:flex items-center justify-center shrink-0 pr-0 lg:pr-2 select-none">
                        <div class="relative flex items-center justify-center">
                            <DecorativeMoon class="w-56 h-56 sm:w-68 sm:h-68 md:w-80 md:h-80 lg:w-[350px] lg:h-[350px] text-primary opacity-90" />
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
                        :placeholder="t('index.search_placeholder')"
                        class="w-full h-11 pl-10 pr-10 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
                    />
                    <button 
                        v-if="searchQuery" 
                        @click="clearSearch"
                        type="button" 
                        class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        :title="t('index.clear_search')"
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
                            'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                            activeFilter === 'all' 
                                ? 'bg-primary text-primary-foreground shadow-xs' 
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        ]"
                    >
                        {{ t('index.filter_all', { count: chapters.length }) }}
                    </button>
                    <button 
                        @click="activeFilter = 'makkah'"
                        type="button"
                        :class="[
                            'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                            activeFilter === 'makkah' 
                                ? 'bg-primary text-primary-foreground shadow-xs' 
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        ]"
                    >
                        {{ t('index.filter_makkah', { count: makkahCount }) }}
                    </button>
                    <button 
                        @click="activeFilter = 'madinah'"
                        type="button"
                        :class="[
                            'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                            activeFilter === 'madinah' 
                                ? 'bg-primary text-primary-foreground shadow-xs' 
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        ]"
                    >
                        {{ t('index.filter_madinah', { count: madinahCount }) }}
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
                    {{ t('index.no_results_title') }}
                </h3>
                <p class="text-sm text-muted-foreground max-w-sm mx-auto">
                    {{ t('index.no_results_desc', { query: searchQuery }) }}
                </p>
                <button 
                    @click="clearSearch"
                    type="button"
                    class="mt-2 inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors cursor-pointer"
                >
                    {{ t('index.clear_search') }}
                </button>
            </section>
        </div>
    </AppLayout>
</template>
