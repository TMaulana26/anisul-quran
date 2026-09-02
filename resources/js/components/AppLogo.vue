<script setup>
defineProps({
    size: {
        type: [Number, String],
        default: 36,
    },
    showText: {
        type: Boolean,
        default: false,
    },
});
</script>

<template>
    <div class="inline-flex items-center gap-2.5 select-none">
        <!-- SVG Icon Mark -->
        <svg 
            :width="size" 
            :height="size" 
            viewBox="0 0 48 48" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            class="shrink-0 transition-transform duration-300 group-hover:scale-105"
        >
            <defs>
                <!-- Emerald Gradient -->
                <linearGradient id="emeraldGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#10b981" />
                    <stop offset="50%" stop-color="#059669" />
                    <stop offset="100%" stop-color="#047857" />
                </linearGradient>

                <!-- Gold Sun Accent -->
                <linearGradient id="goldGrad" x1="24" y1="8" x2="24" y2="28" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#fbbf24" />
                    <stop offset="100%" stop-color="#d97706" />
                </linearGradient>

                <!-- Soft Glow Filter -->
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            <!-- Background Rounded Diamond Badge -->
            <rect x="3" y="3" width="42" height="42" rx="12" fill="url(#emeraldGrad)" />

            <!-- Subtle Inner Border -->
            <rect x="4.5" y="4.5" width="39" height="39" rx="10.5" stroke="#ffffff" stroke-opacity="0.15" stroke-width="1.5" />

            <!-- Islamic 8-Point Star Radiant in Center Background -->
            <path 
                d="M24 10L26.5 15.5L32 16L27.5 20L29 25.5L24 22.5L19 25.5L20.5 20L16 16L21.5 15.5L24 10Z" 
                fill="url(#goldGrad)" 
                opacity="0.9"
            />

            <!-- Quran Open Book Base Silhouette -->
            <path 
                d="M12 32C15.5 30.5 19.5 30 24 31.5C28.5 30 32.5 30.5 36 32V23C32.5 21.5 28.5 21 24 22.5C19.5 21 15.5 21.5 12 23V32Z" 
                fill="#ffffff" 
                fill-opacity="0.95"
            />

            <!-- Book Spine & Binding Line -->
            <line x1="24" y1="22.5" x2="24" y2="33.5" stroke="#047857" stroke-width="1.5" stroke-linecap="round" />

            <!-- Page Lines Detail -->
            <path d="M15 25.5C17.5 24.5 20.5 24.2 23 25" stroke="#047857" stroke-width="1" stroke-linecap="round" opacity="0.6" />
            <path d="M15 28C17.5 27 20.5 26.7 23 27.5" stroke="#047857" stroke-width="1" stroke-linecap="round" opacity="0.6" />
            <path d="M33 25.5C30.5 24.5 27.5 24.2 25 25" stroke="#047857" stroke-width="1" stroke-linecap="round" opacity="0.6" />
            <path d="M33 28C30.5 27 27.5 26.7 25 27.5" stroke="#047857" stroke-width="1" stroke-linecap="round" opacity="0.6" />
        </svg>

        <!-- Optional App Text -->
        <div v-if="showText" class="flex flex-col">
            <span class="font-heading font-bold text-lg leading-tight tracking-tight text-foreground">
                Anisul Qur'an
            </span>
            <span class="text-[11px] text-muted-foreground font-medium">
                أنِيسُ القُرْآن • Teman Tilawah
            </span>
        </div>
    </div>
</template>
