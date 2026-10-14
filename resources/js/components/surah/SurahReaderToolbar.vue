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
    <section class="sticky top-18 z-30 flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl border border-border bg-background/90 backdrop-blur-md shadow-xs transition-all">
        <!-- Reading Mode Switcher: Per Ayat vs Mushaf Fisik -->
        <div class="flex items-center gap-1 bg-muted/70 p-1 rounded-xl text-xs">
            <button
                @click="emit('update:readingMode', 'ayah')"
                type="button"
                :class="[
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer',
                    readingMode === 'ayah'
                        ? 'bg-card text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                ]"
                :title="t('surah.mode_ayah')"
            >
                <List class="h-3.5 w-3.5" />
                <span>{{ t('surah.mode_ayah') }}</span>
            </button>
            <button
                @click="emit('update:readingMode', 'mushaf')"
                type="button"
                :class="[
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer',
                    readingMode === 'mushaf'
                        ? 'bg-card text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                ]"
                :title="t('surah.mode_mushaf')"
            >
                <BookOpen class="h-3.5 w-3.5" />
                <span>{{ t('surah.mode_mushaf') }}</span>
            </button>
        </div>

        <!-- Right Controls: Rasm, Font Size, Sanctuary Triggers & Settings Button -->
        <div class="flex flex-wrap items-center gap-2 sm:gap-3">
            <!-- Rasm Mushaf Switcher -->
            <div class="flex items-center gap-1 bg-muted/70 p-1 rounded-xl text-xs">
                <button
                    @click="emit('update:mushafType', 'uthmani')"
                    type="button"
                    :class="[
                        'px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer',
                        mushafType === 'uthmani' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                    ]"
                >
                    Uthmani
                </button>
                <button
                    @click="emit('update:mushafType', 'indopak')"
                    type="button"
                    :class="[
                        'px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer',
                        mushafType === 'indopak' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                    ]"
                >
                    IndoPak
                </button>
            </div>

            <!-- Font Size Buttons -->
            <div class="flex items-center gap-1 bg-muted/70 p-1 rounded-xl text-xs">
                <button
                    @click="emit('decrease-font')"
                    type="button"
                    class="px-2 py-1 rounded-lg font-bold text-muted-foreground hover:text-foreground hover:bg-card transition-colors cursor-pointer"
                    title="A-"
                >
                    A-
                </button>
                <span class="px-1.5 text-[11px] font-semibold text-foreground">{{ arabicFontSize }}px</span>
                <button
                    @click="emit('increase-font')"
                    type="button"
                    class="px-2 py-1 rounded-lg font-bold text-muted-foreground hover:text-foreground hover:bg-card transition-colors cursor-pointer"
                    title="A+"
                >
                    A+
                </button>
            </div>

            <!-- Mode Khusyu' Trigger Button in Sticky Bar -->
            <button
                type="button"
                @click="emit('open-khusyu')"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                :title="t('surah.khusyu_mode')"
            >
                <Maximize2 class="h-3.5 w-3.5" />
                <span>{{ t('surah.khusyu_mode') }}</span>
            </button>

            <!-- Mode Tadabbur Alam Trigger Button in Sticky Bar -->
            <button
                type="button"
                @click="emit('open-tadabbur')"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                :title="t('tadabbur.open_tadabbur')"
            >
                <Film class="h-3.5 w-3.5" />
                <span>{{ t('tadabbur.title') }}</span>
            </button>

            <!-- Settings Drawer Trigger Button -->
            <button
                type="button"
                @click="emit('open-settings')"
                class="p-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-colors cursor-pointer"
                title="Buka Pengaturan Tampilan Lengkap"
            >
                <SlidersHorizontal class="h-4 w-4 text-primary" />
            </button>
        </div>
    </section>
</template>
