<script setup>
import { useI18n } from '@/composables/useI18n';
import {
    BookOpen,
    List,
    SlidersHorizontal,
    Maximize2,
    Film,
} from '@lucide/vue';

defineProps({
    readingMode: {
        type: String,
        required: true,
    },
    mushafType: {
        type: String,
        required: true,
    },
    arabicFontSize: {
        type: Number,
        required: true,
    },
});

const emit = defineEmits([
    'update:readingMode',
    'update:mushafType',
    'decrease-font',
    'increase-font',
    'open-khusyu',
    'open-tadabbur',
    'open-settings',
]);

const { t } = useI18n();
</script>

<template>
    <section
        :aria-label="t('surah.toolbar_label')"
        class="sm:sticky sm:top-18 z-30 flex flex-wrap items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-2xl border border-border bg-background/90 backdrop-blur-md shadow-xs transition-all"
    >
        <!-- Reading Mode Switcher: Per Ayat vs Mushaf Fisik -->
        <div
            role="group"
            :aria-label="t('surah.reading_mode_group')"
            class="flex items-center gap-1 bg-muted/70 p-1 rounded-xl text-xs"
        >
            <button
                @click="emit('update:readingMode', 'ayah')"
                type="button"
                :aria-pressed="readingMode === 'ayah'"
                :class="[
                    'inline-flex min-h-11 items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer',
                    readingMode === 'ayah'
                        ? 'bg-card text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                ]"
                :title="t('surah.mode_ayah')"
            >
                <List class="h-3.5 w-3.5 shrink-0" />
                <span>{{ t('surah.mode_ayah') }}</span>
            </button>
            <button
                @click="emit('update:readingMode', 'mushaf')"
                type="button"
                :aria-pressed="readingMode === 'mushaf'"
                :class="[
                    'inline-flex min-h-11 items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer',
                    readingMode === 'mushaf'
                        ? 'bg-card text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                ]"
                :title="t('surah.mode_mushaf')"
            >
                <BookOpen class="h-3.5 w-3.5 shrink-0" />
                <span>{{ t('surah.mode_mushaf') }}</span>
            </button>
        </div>

        <!-- Right Controls: Rasm, Font Size, Sanctuary Triggers & Settings Button -->
        <div class="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <!-- Rasm Mushaf Switcher -->
            <div
                role="group"
                :aria-label="t('surah.rasm_group')"
                class="flex items-center gap-1 bg-muted/70 p-1 rounded-xl text-xs"
            >
                <button
                    @click="emit('update:mushafType', 'uthmani')"
                    type="button"
                    :aria-pressed="mushafType === 'uthmani'"
                    :class="[
                        'inline-flex min-h-11 min-w-11 items-center justify-center px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer',
                        mushafType === 'uthmani' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                    ]"
                >
                    Uthmani
                </button>
                <button
                    @click="emit('update:mushafType', 'indopak')"
                    type="button"
                    :aria-pressed="mushafType === 'indopak'"
                    :class="[
                        'inline-flex min-h-11 min-w-11 items-center justify-center px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer',
                        mushafType === 'indopak' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                    ]"
                >
                    IndoPak
                </button>
            </div>

            <!-- Font Size Buttons -->
            <div
                role="group"
                :aria-label="t('surah.font_size_group')"
                class="flex items-center gap-1 bg-muted/70 p-1 rounded-xl text-xs"
            >
                <button
                    @click="emit('decrease-font')"
                    type="button"
                    class="inline-flex min-h-11 min-w-11 items-center justify-center px-2.5 py-2 rounded-lg font-bold text-muted-foreground hover:text-foreground hover:bg-card transition-colors cursor-pointer"
                    :title="t('surah.font_decrease')"
                    :aria-label="t('surah.font_decrease')"
                >
                    A-
                </button>
                <span class="px-1.5 text-[11px] font-semibold text-foreground tabular-nums">{{ arabicFontSize }}px</span>
                <button
                    @click="emit('increase-font')"
                    type="button"
                    class="inline-flex min-h-11 min-w-11 items-center justify-center px-2.5 py-2 rounded-lg font-bold text-muted-foreground hover:text-foreground hover:bg-card transition-colors cursor-pointer"
                    :title="t('surah.font_increase')"
                    :aria-label="t('surah.font_increase')"
                >
                    A+
                </button>
            </div>

            <!-- Mode Khusyu' Trigger Button -->
            <button
                type="button"
                @click="emit('open-khusyu')"
                class="inline-flex min-h-11 items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                :title="t('surah.khusyu_mode')"
            >
                <Maximize2 class="h-3.5 w-3.5 shrink-0" />
                <span>{{ t('surah.khusyu_mode') }}</span>
            </button>

            <!-- Mode Tadabbur Alam Trigger Button -->
            <button
                type="button"
                @click="emit('open-tadabbur')"
                class="inline-flex min-h-11 items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent/70 hover:bg-accent text-accent-foreground border border-border text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                :title="t('tadabbur.open_tadabbur')"
            >
                <Film class="h-3.5 w-3.5 shrink-0 text-primary" />
                <span>{{ t('tadabbur.title') }}</span>
            </button>

            <!-- Settings Drawer Trigger Button -->
            <button
                type="button"
                @click="emit('open-settings')"
                class="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-colors cursor-pointer"
                :title="t('surah.open_full_settings')"
                :aria-label="t('surah.open_full_settings')"
            >
                <SlidersHorizontal class="h-4 w-4 text-primary" />
            </button>
        </div>
    </section>
</template>
