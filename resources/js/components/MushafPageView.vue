<script setup>
import { computed } from 'vue';
import { Volume2, Play } from '@lucide/vue';
import { getFormattedArabicText, getFormattedWordText } from '@/lib/quranUtils';
import AyahEndOrnament from '@/components/AyahEndOrnament.vue';

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
    activeWordIndex: {
        type: Number,
        default: null,
    },
    isPlaying: {
        type: Boolean,
        default: false,
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
    return getFormattedArabicText(verse, props.mushafType);
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
                :class="[
                    'py-4 text-justify leading-[2.6] select-text [text-align-last:right] [text-justify:inter-word]',
                    mushafType === 'indopak' ? 'font-indopak' : 'font-arabic'
                ]" 
                dir="rtl"
                :style="{ fontSize: `${arabicFontSize}px` }"
            >
                <template v-for="verse in page.verses" :key="verse.id">
                    <span 
                        :id="`mushaf-ayah-${verse.verse_number}`"
                        :class="[
                            'inline transition-colors cursor-pointer group',
                            activeAyahNumber === verse.verse_number 
                                ? 'text-primary font-medium' 
                                : 'text-foreground'
                        ]"
                        :title="`Klik untuk memutar Ayat ${verse.verse_number}`"
                        @click="emit('play', verse)"
                    ><template v-if="Array.isArray(verse.words) && verse.words.length > 0"><template v-for="(word, wIdx) in verse.words" :key="word.id || word.position"><AyahEndOrnament
                                    v-if="word.char_type_name === 'end'"
                                    :verse-number="verse.verse_number"
                                    size="mushaf"
                                    :is-active="activeAyahNumber === verse.verse_number"
                                /><span
                                    v-else
                                    class="inline transition-all duration-150"
                                    :class="[
                                        activeAyahNumber === verse.verse_number && isPlaying && activeWordIndex === word.position
                                            ? 'text-primary font-bold underline decoration-primary decoration-2 underline-offset-8 bg-primary/15 rounded-xs'
                                            : ''
                                    ]"
                                >{{ getFormattedWordText(word, mushafType) }}</span>{{ wIdx < verse.words.length - 1 && word.char_type_name !== 'end' ? ' ' : '' }}</template></template><template v-else>{{ getArabicText(verse) }}<AyahEndOrnament
                                :verse-number="verse.verse_number"
                                size="mushaf"
                                :is-active="activeAyahNumber === verse.verse_number"
                            /></template></span>{{ ' ' }}
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
