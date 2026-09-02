<script setup>
import { Link } from '@inertiajs/vue3';
import { Volume2 } from '@lucide/vue';

const props = defineProps({
    chapter: {
        type: Object,
        required: true,
    },
});

// Format revelation place in Indonesian
const formatRevelation = (place) => {
    return place === 'makkah' ? 'Makkiyah' : 'Madaniyah';
};
</script>

<template>
    <Link 
        :href="`/surah/${chapter.id}`"
        class="group relative flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/40 hover:border-primary/50 hover:shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
    >
        <!-- Left Section: Number & Latin Details -->
        <div class="flex items-center gap-3.5 min-w-0">
            <!-- Surah Number Box -->
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground font-semibold text-sm transition-colors duration-200">
                <span>{{ chapter.id }}</span>
            </div>

            <!-- Latin Title, Translation & Metadata -->
            <div class="flex flex-col truncate">
                <span class="font-heading font-bold text-base text-foreground group-hover:text-primary transition-colors truncate">
                    {{ chapter.name_simple }}
                </span>
                <span class="text-xs text-muted-foreground truncate">
                    {{ chapter.translated_name?.name || chapter.name_complex }}
                </span>
                <div class="flex items-center gap-2 mt-1">
                    <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                        {{ formatRevelation(chapter.revelation_place) }}
                    </span>
                    <span class="text-[11px] text-muted-foreground">
                        {{ chapter.verses_count }} Ayat
                    </span>
                </div>
            </div>
        </div>

        <!-- Right Section: Arabic Typography Name -->
        <div class="flex flex-col items-end pl-2">
            <span class="font-arabic font-bold text-2xl text-foreground group-hover:text-primary transition-colors text-right" dir="rtl">
                {{ chapter.name_arabic }}
            </span>
        </div>
    </Link>
</template>
