<script setup>
import { computed } from 'vue';
import { Volume2, Play } from '@lucide/vue';

const props = defineProps({
    verses: {
        type: Array,
        required: true,
    },
    chapter: {
        type: Object,
        required: true,
    },
    mushafType: {
        type: String,
        default: 'uthmani',
    },
    arabicFontSize: {
        type: Number,
        default: 28,
    },
    activeAyahNumber: {
        type: Number,
        default: null,
    },
});

const emit = defineEmits(['play']);

// Group verses by physical mushaf page number
const pages = computed(() => {
    const map = new Map();
    
    props.verses.forEach(verse => {
        const pageNum = verse.page_number || 1;
        if (!map.has(pageNum)) {
            map.set(pageNum, {
                pageNumber: pageNum,
                juzNumber: verse.juz_number || 1,
                verses: [],
            });
        }
        map.get(pageNum).verses.push(verse);
    });

    return Array.from(map.values());
});

const getArabicText = (verse) => {
    if (props.mushafType === 'indopak' && verse.text_indopak) {
        return verse.text_indopak;
    }
    return verse.text_uthmani || verse.text_imlaei || '';
};
</script>

<template>
    <div class="space-y-10">
        <!-- Physical Mushaf Pages Stack -->
        <article 
            v-for="page in pages" 
            :key="page.pageNumber"
            class="relative rounded-2xl border border-border/80 bg-card p-6 sm:p-10 shadow-sm space-y-6 transition-all duration-200"
        >
            <!-- Page Header Ornament (Juz, Surah Name, Page) -->
            <header class="flex items-center justify-between pb-4 border-b border-border/60 text-xs text-muted-foreground font-medium select-none">
                <span class="inline-flex items-center gap-1">
                    <span>Juz {{ page.juzNumber }}</span>
                </span>
                <span class="font-heading font-semibold text-foreground text-sm">
                    Surah {{ chapter.name_simple }} ({{ chapter.name_arabic }})
                </span>
                <span class="inline-flex items-center gap-1">
                    <span>Hal. {{ page.pageNumber }}</span>
                </span>
            </header>

            <!-- Continuous Flowing Arabic Text Block -->
            <div 
                class="py-4 text-justify font-arabic leading-[2.6] select-text" 
                dir="rtl"
                :style="{ fontSize: `${arabicFontSize}px` }"
            >
                <template v-for="verse in page.verses" :key="verse.id">
                    <span 
                        :id="`mushaf-ayah-${verse.verse_number}`"
                        :class="[
                            'inline rounded-md px-1 py-0.5 transition-colors cursor-pointer group',
                            activeAyahNumber === verse.verse_number 
                                ? 'bg-primary/20 text-foreground font-bold shadow-xs' 
                                : 'hover:bg-muted/60 text-foreground'
                        ]"
                        :title="`Klik untuk memutar Ayat ${verse.verse_number}`"
                        @click="emit('play', verse)"
                    >
                        {{ getArabicText(verse) }}
                        <!-- Inline Ornamented Ayah Circle Number -->
                        <span 
                            class="inline-flex items-center justify-center mx-1.5 align-middle text-primary font-sans text-xs px-2 py-0.5 rounded-full border border-primary/30 bg-primary/5 select-none group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        >
                            {{ verse.verse_number }}
                        </span>
                    </span>
                    {{ ' ' }}
                </template>
            </div>

            <!-- Page Footer -->
            <footer class="flex items-center justify-center pt-4 border-t border-border/60 text-xs text-muted-foreground font-medium select-none">
                <div class="flex items-center gap-2">
                    <span class="h-1 w-6 bg-border rounded-full"></span>
                    <span>Halaman {{ page.pageNumber }}</span>
                    <span class="h-1 w-6 bg-border rounded-full"></span>
                </div>
            </footer>
        </article>
    </div>
</template>
