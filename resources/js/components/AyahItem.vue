<script setup>
import { computed } from 'vue';
import { Play, Volume2, Bookmark, Share2 } from '@lucide/vue';

const props = defineProps({
    verse: {
        type: Object,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: false,
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

// Extract Indonesian translation (Kemenag)
const translationText = computed(() => {
    if (!props.verse.translations || props.verse.translations.length === 0) return '';
    
    // Clean any HTML tags in translation (e.g. <sup> footnotes)
    const rawText = props.verse.translations[0].text || '';
    return rawText.replace(/<[^>]*>/g, '');
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

// Arabic text based on selected rasm mushaf
const arabicText = computed(() => {
    if (props.mushafType === 'indopak' && props.verse.text_indopak) {
        return props.verse.text_indopak;
    }
    return props.verse.text_uthmani || props.verse.text_imlaei || '';
});
</script>

<template>
    <div 
        :id="`ayah-${verse.verse_number}`"
        :class="[
            'group relative p-5 sm:p-6 rounded-2xl border transition-all duration-300',
            isActive 
                ? 'bg-primary/10 border-primary/60 shadow-xs ring-1 ring-primary/20' 
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
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-colors',
                        isActive 
                            ? 'bg-primary text-primary-foreground shadow-xs' 
                            : 'bg-muted hover:bg-primary/10 hover:text-primary text-foreground'
                    ]"
                    :title="`Putar Ayat ${verse.verse_number}`"
                >
                    <Volume2 v-if="isActive" class="h-3.5 w-3.5 animate-pulse" />
                    <Play v-else class="h-3.5 w-3.5" />
                    <span>{{ isActive ? 'Sedang Diputar' : 'Putar' }}</span>
                </button>
            </div>

            <!-- Juz & Page Info -->
            <div class="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                <span v-if="verse.juz_number">Juz {{ verse.juz_number }}</span>
                <span v-if="verse.juz_number && verse.page_number">•</span>
                <span v-if="verse.page_number">Halaman {{ verse.page_number }}</span>
            </div>
        </div>

        <!-- Arabic Verse Text Display -->
        <div class="py-6 flex justify-end" dir="rtl">
            <p 
                :class="[
                    'font-arabic text-right leading-[2.4] select-text transition-colors duration-200',
                    isActive ? 'text-foreground font-semibold' : 'text-foreground'
                ]"
                :style="{ fontSize: `${arabicFontSize}px` }"
            >
                {{ arabicText }}
                <!-- Ayah End Ornament Symbol -->
                <span class="inline-flex items-center justify-center mx-2 text-primary font-sans text-xs px-2 py-0.5 rounded-full border border-primary/30 bg-primary/5">
                    {{ verse.verse_number }}
                </span>
            </p>
        </div>

        <!-- Transliteration & Indonesian Translation -->
        <div v-if="showTransliteration || showTranslation" class="space-y-2.5 pt-2 border-t border-border/40">
            <!-- Latin Transliteration -->
            <p 
                v-if="showTransliteration && transliterationText" 
                class="text-xs sm:text-sm italic text-muted-foreground/90 leading-relaxed font-serif"
            >
                {{ transliterationText }}
            </p>

            <!-- Translation (Kemenag RI) -->
            <p 
                v-if="showTranslation && translationText" 
                :class="[
                    'text-sm sm:text-base leading-relaxed text-foreground/90 transition-colors',
                    isActive ? 'font-medium text-foreground' : ''
                ]"
            >
                {{ translationText }}
            </p>
        </div>
    </div>
</template>
