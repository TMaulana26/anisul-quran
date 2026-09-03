<script setup>
import { computed } from 'vue';
import { toArabicIndic } from '@/lib/quranUtils';

const props = defineProps({
    verseNumber: {
        type: [Number, String],
        required: true,
    },
    size: {
        type: String,
        default: 'md', // 'sm', 'md', 'lg', 'zen'
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    customClass: {
        type: String,
        default: '',
    },
});

const arabicNumber = computed(() => {
    return toArabicIndic(props.verseNumber);
});

// Dynamic font size inside the SVG depending on digit count (1, 2, or 3 digits)
const textFontSize = computed(() => {
    const len = String(props.verseNumber).length;
    if (len >= 3) return '13px';
    if (len === 2) return '15.5px';
    return '17.5px';
});

const sizeClasses = computed(() => {
    switch (props.size) {
        case 'sm':
            return 'w-7.5 h-7.5 mx-1 align-middle';
        case 'mushaf':
            return 'w-8.5 h-8.5 sm:w-9 sm:h-9 mx-1.5 align-middle';
        case 'lg':
            return 'w-10 h-10 mx-2 align-middle';
        case 'khusyu':
        case 'zen':
            return 'w-11 h-11 sm:w-13 sm:h-13 mx-2';
        case 'md':
        default:
            return 'w-8.5 h-8.5 mx-1.5 align-middle';
    }
});
</script>

<template>
    <span
        :class="[
            'inline-flex items-center justify-center align-middle select-none transition-all duration-300 relative shrink-0',
            sizeClasses,
            isActive ? 'text-primary scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-primary/80 hover:text-primary hover:scale-105',
            customClass
        ]"
        :title="`Ayat ${verseNumber}`"
        aria-hidden="true"
    >
        <svg
            viewBox="0 0 38 38"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="w-full h-full"
        >
            <!-- Background Radial Tint -->
            <circle
                cx="19"
                cy="19"
                r="16"
                class="fill-primary/10 transition-colors"
                :class="isActive ? 'fill-primary/20' : ''"
            />

            <!-- Outer 8-Pointed Ornate Islamic Geometric Rosette -->
            <path
                d="M19 2.5
                   C21.2 2.5 22.8 4.6 24.5 5.8
                   C26.2 7 28.5 7.2 29.8 8.9
                   C31.1 10.6 30.8 13 31.7 15
                   C32.6 17 34.5 18.2 34.5 20.5
                   C34.5 22.8 32.6 24 31.7 26
                   C30.8 28 31.1 30.4 29.8 32.1
                   C28.5 33.8 26.2 34 24.5 35.2
                   C22.8 36.4 21.2 38.5 19 38.5
                   C16.8 38.5 15.2 36.4 13.5 35.2
                   C11.8 34 9.5 33.8 8.2 32.1
                   C6.9 30.4 7.2 28 6.3 26
                   C5.4 24 3.5 22.8 3.5 20.5
                   C3.5 18.2 5.4 17 6.3 15
                   C7.2 13 6.9 10.6 8.2 8.9
                   C9.5 7.2 11.8 7 13.5 5.8
                   C15.2 4.6 16.8 2.5 19 2.5 Z"
                transform="translate(0, -1.5)"
                class="stroke-primary fill-primary/5 transition-all"
                stroke-width="1.3"
                stroke-linecap="round"
                stroke-linejoin="round"
            />

            <!-- Inner Decorative Concentric Ring -->
            <circle
                cx="19"
                cy="19"
                r="13.5"
                class="stroke-primary/50"
                stroke-width="0.9"
                stroke-dasharray="2 1.5"
            />

            <!-- 4 Cardinal Accent Diamonds (Top, Right, Bottom, Left) -->
            <polygon points="19,4 20.2,5.2 19,6.4 17.8,5.2" class="fill-primary" />
            <polygon points="34,19 32.8,20.2 31.6,19 32.8,17.8" class="fill-primary" />
            <polygon points="19,34 20.2,32.8 19,31.6 17.8,32.8" class="fill-primary" />
            <polygon points="4,19 5.2,20.2 6.4,19 5.2,17.8" class="fill-primary" />

            <!-- Centered Arabic Indic Numeral -->
            <text
                x="19"
                y="23.5"
                text-anchor="middle"
                class="fill-current font-bold font-arabic select-none pointer-events-none"
                :style="{ fontSize: textFontSize }"
            >
                {{ arabicNumber }}
            </text>
        </svg>
    </span>
</template>
