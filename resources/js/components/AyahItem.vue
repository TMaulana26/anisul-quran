<script setup>
import { ref, computed } from 'vue';
import { Play, Volume2, Bookmark, Share2 } from '@lucide/vue';
import { getFormattedArabicText, getFormattedWordText, parseTranslationTokens } from '@/lib/quranUtils';
import FootnoteDialog from '@/components/FootnoteDialog.vue';
import AyahEndOrnament from '@/components/AyahEndOrnament.vue';

const props = defineProps({
    verse: {
        type: Object,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    isPlaying: {
        type: Boolean,
        default: false,
    },
    activeWordIndex: {
        type: Number,
        default: null,
    },
    mushafType: {
        type: String,
        default: 'uthmani', // 'uthmani' or 'indopak'
    },
    showTranslation: {
        type: Boolean,
        default: true,
    },
    showTransliteration: {
        type: Boolean,
        default: true,
    },
    arabicFontSize: {
        type: Number,
        default: 28,
    },
});

const emit = defineEmits(['play']);

// Footnote Dialog State
const showFootnoteDialog = ref(false);
const selectedFootnoteId = ref(null);
const selectedFootnoteNumber = ref('1');

const openFootnote = (id, number) => {
    selectedFootnoteId.value = id;
    selectedFootnoteNumber.value = number;
    showFootnoteDialog.value = true;
};

// Extract structured translation tokens (plain text & interactive footnote badges)
const translationTokens = computed(() => {
    if (!props.verse.translations || props.verse.translations.length === 0) return [];
    
    return parseTranslationTokens(props.verse.translations[0].text || '');
});

// Extract transliteration from words if available
const transliterationText = computed(() => {
    if (props.verse.words && props.verse.words.length > 0) {
        return props.verse.words
            .map(w => w.transliteration?.text)
            .filter(Boolean)
            .join(' ');
    }
    return '';
});

// Arabic text cleaned and normalized for the selected rasm mushaf
const arabicText = computed(() => {
    return getFormattedArabicText(props.verse, props.mushafType);
});

// Check if verse has rich Arabic word tokens available
const hasArabicWords = computed(() => {
    return Array.isArray(props.verse.words) && props.verse.words.some(w => Boolean(w.text_uthmani || w.text_indopak || w.text));
});
</script>

<template>
    <div 
        :id="`ayah-${verse.verse_number}`"
        :class="[
            'group relative p-5 sm:p-6 rounded-2xl border transition-all duration-300',
            isActive 
                ? 'bg-primary/10 border-primary/60 shadow-md ring-2 ring-primary/30' 
                : 'bg-card border-border/80 hover:border-border hover:bg-muted/20'
        ]"
    >
        <!-- Top Metadata & Control Bar -->
        <div class="flex items-center justify-between gap-2 pb-4 border-b border-border/50 text-xs text-muted-foreground">
            <!-- Ayah Key Badge & Play Button -->
            <div class="flex items-center gap-2">
                <span class="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-muted text-foreground font-semibold">
                    {{ verse.verse_key }}
                </span>
                
                <button 
                    @click="emit('play', verse)"
                    type="button"
                    :class="[
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer',
                        isActive 
                            ? 'bg-primary text-primary-foreground shadow-xs' 
                            : 'bg-muted hover:bg-primary/10 hover:text-primary text-foreground'
                    ]"
                    :title="`Putar Ayat ${verse.verse_number}`"
                >
                    <Volume2 v-if="isActive && isPlaying" class="h-3.5 w-3.5 animate-pulse" />
                    <Play v-else class="h-3.5 w-3.5" />
                    <span>{{ isActive ? (isPlaying ? 'Sedang Diputar' : 'Jeda') : 'Putar' }}</span>
                </button>
            </div>

            <!-- Juz & Page Info -->
            <div class="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                <span v-if="verse.juz_number">Juz {{ verse.juz_number }}</span>
                <span v-if="verse.juz_number && verse.page_number">•</span>
                <span v-if="verse.page_number">Halaman {{ verse.page_number }}</span>
            </div>
        </div>

        <!-- Arabic Verse Text Display (Right Aligned) -->
        <div class="py-6 text-right" dir="rtl">
            <p 
                :class="[
                    'text-right leading-[2.6] select-text transition-colors duration-200',
                    mushafType === 'indopak' ? 'font-indopak' : 'font-arabic',
                    isActive ? 'text-foreground' : 'text-foreground'
                ]"
                :style="{ fontSize: `${arabicFontSize}px` }"
            >
                <!-- Word by Word rendering with active highlight -->
                <template v-if="hasArabicWords">
                    <template v-for="word in verse.words" :key="word.id || word.position">
                        <AyahEndOrnament
                            v-if="word.char_type_name === 'end'"
                            :verse-number="verse.verse_number"
                            size="md"
                            :is-active="isActive"
                        />
                        <span
                            v-else
                            :class="[
                                'inline-block transition-all duration-150 mx-0.5 px-1 py-0.5 rounded-lg',
                                isActive && isPlaying && activeWordIndex === word.position
                                    ? 'bg-primary/20 text-primary font-bold scale-105'
                                    : ''
                            ]"
                        >
                            {{ getFormattedWordText(word, mushafType) }}
                        </span>
                    </template>
                </template>
                <template v-else>
                    {{ arabicText }}
                    <!-- Ayah End Ornament Symbol -->
                    <AyahEndOrnament
                        :verse-number="verse.verse_number"
                        size="md"
                        :is-active="isActive"
                    />
                </template>
            </p>
        </div>

        <!-- Transliteration & Indonesian Translation (Left Aligned) -->
        <div v-if="showTransliteration || showTranslation" class="space-y-2.5 pt-4 border-t border-border/40 text-left" dir="ltr">
            <!-- Latin Transliteration -->
            <p 
                v-if="showTransliteration && transliterationText" 
                class="text-xs sm:text-sm italic text-muted-foreground/90 leading-relaxed font-serif text-left"
            >
                {{ transliterationText }}
            </p>

            <!-- Translation (Kemenag RI) with Interactive Footnotes -->
            <p 
                v-if="showTranslation && translationTokens.length > 0" 
                :class="[
                    'text-sm sm:text-base leading-relaxed text-foreground/90 text-left transition-colors',
                    isActive ? 'font-medium text-foreground' : ''
                ]"
            >
                <template v-for="(token, idx) in translationTokens" :key="idx">
                    <span v-if="token.type === 'text'">{{ token.content }}</span>
                    <button 
                        v-else-if="token.type === 'footnote'"
                        @click.stop="openFootnote(token.id, token.number)"
                        type="button"
                        class="inline-flex items-center justify-center px-1.5 py-0.5 mx-0.5 rounded-md text-[11px] font-bold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer align-baseline select-none"
                        :title="`Klik untuk melihat Catatan Kaki [${token.number}]`"
                    >
                        [{{ token.number }}]
                    </button>
                </template>
            </p>
        </div>

        <!-- Footnote Popover / Dialog Modal -->
        <FootnoteDialog 
            v-model="showFootnoteDialog"
            :footnote-id="selectedFootnoteId"
            :footnote-number="selectedFootnoteNumber"
            :verse-key="verse.verse_key"
        />
    </div>
</template>
