<script setup>
import { useI18n } from '@/composables/useI18n';

defineProps({
    chapter: {
        type: Object,
        required: true,
    },
});

const { t } = useI18n();
</script>

<template>
    <section
        aria-labelledby="surah-hero-title"
        class="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-muted/30 p-6 sm:p-10 shadow-sm text-center space-y-4"
    >
        <div class="flex flex-col items-center justify-center space-y-2.5">
            <h1 id="surah-hero-title" class="flex flex-col items-center gap-1.5">
                <span class="font-arabic font-bold text-4xl sm:text-5xl text-foreground pt-1 pb-1" dir="rtl">
                    {{ chapter.name_arabic }}
                </span>
                <span class="font-heading font-extrabold text-2xl sm:text-3xl text-foreground">
                    {{ chapter.name_simple }}
                </span>
            </h1>

            <p class="text-sm text-muted-foreground font-medium tabular-nums">
                {{ chapter.translated_name?.name }} • {{ t('surah_card.verses_count', { count: chapter.verses_count }) }}
            </p>

            <div class="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tabular-nums">
                <span>Surah Ke-{{ chapter.id }} • {{ chapter.revelation_place === 'makkah' ? t('common.revelation_makkah') : t('common.revelation_madinah') }}</span>
            </div>
        </div>

        <!-- Bismillah Header (Except Surah 9 At-Tawbah & Surah 1 Al-Fatihah) -->
        <div
            v-if="chapter.id !== 1 && chapter.id !== 9"
            class="pt-6 pb-2 border-t border-border/60"
        >
            <p class="font-arabic text-2xl sm:text-3xl text-foreground/90 tracking-wide" dir="rtl">
                بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
            <p class="text-xs text-muted-foreground mt-2 italic">
                {{ t('surah.bismillah') }}
            </p>
        </div>
    </section>
</template>
