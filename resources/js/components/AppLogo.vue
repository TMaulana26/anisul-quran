<script setup>
import { computed } from 'vue';

const props = defineProps({
    /**
     * Display variant:
     * - 'clean' / 'icon' : Icon only (no text)
     * - 'horizontal'     : Icon on the left, brand title & subtitle on the right
     * - 'stacked' / 'vertical' : Icon on top, brand title & subtitle centered below
     */
    variant: {
        type: String,
        default: 'horizontal',
        validator: (val) => ['clean', 'icon', 'horizontal', 'stacked', 'vertical'].includes(val),
    },
    /**
     * Size in pixels for the icon
     */
    size: {
        type: [Number, String],
        default: 40,
    },
    /**
     * Backward compatibility prop for showing text
     */
    showText: {
        type: Boolean,
        default: undefined,
    },
    /**
     * Custom subtitle text (supports i18n by passing translated string or using #subtitle slot)
     */
    subtitle: {
        type: String,
        default: 'Sahabat Tilawah Interaktif',
    },
    /**
     * Optional i18n translation key for future i18n provider
     */
    subtitleKey: {
        type: String,
        default: 'app.tagline',
    },
    /**
     * Additional CSS classes for the root container
     */
    className: {
        type: String,
        default: '',
    },
    /**
     * Enable micro-interaction hover and pulse animations
     */
    animate: {
        type: Boolean,
        default: true,
    },
});

// Determine effective variant with backward compatibility
const resolvedVariant = computed(() => {
    if (props.showText === false) {
        return 'clean';
    }
    if (props.showText === true && props.variant === 'clean') {
        return 'horizontal';
    }
    return props.variant;
});

const isIconOnly = computed(() => ['clean', 'icon'].includes(resolvedVariant.value));
const isStacked = computed(() => ['stacked', 'vertical'].includes(resolvedVariant.value));
const isHorizontal = computed(() => resolvedVariant.value === 'horizontal');

// Formatted numeric size
const numericSize = computed(() => {
    const parsed = parseInt(props.size, 10);
    return isNaN(parsed) ? 40 : parsed;
});
</script>

<template>
    <div 
        class="app-logo-container group inline-flex select-none transition-all duration-300"
        :class="[
            isHorizontal ? 'flex-row items-center gap-3' : '',
            isStacked ? 'flex-col items-center text-center gap-2' : '',
            isIconOnly ? 'items-center justify-center' : '',
            className
        ]"
        role="img"
        aria-label="Logo Anisul Qur'an"
    >
        <!-- SVG Icon Mark (Vectorized M1-V1 Swiss Geometric Equalizer Book) -->
        <div 
            class="app-logo-icon relative shrink-0 flex items-center justify-center transition-transform duration-500 ease-out"
            :class="{ 'group-hover:scale-105 group-active:scale-98': animate }"
            :style="{ width: `${numericSize}px`, height: `${numericSize}px` }"
        >
            <svg 
                viewBox="0 0 1024 1024" 
                xmlns="http://www.w3.org/2000/svg" 
                xml:space="preserve" 
                style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"
                class="w-full h-full drop-shadow-xs transition-colors duration-300"
            >
                <g id="Logo">
                    <!-- Mushaf Book Base (Primary / Sage Emerald Green) -->
                    <path 
                        d="M512.063,765.097c0.485,0.07 0.971,0.14 1.456,0.209c20.195,-59.672 66.548,-93.624 127.614,-125.07c76.216,-39.247 209.024,-66.536 211.085,-66.215c4.445,0.691 3.033,2.481 6.807,9.074c14.052,24.549 40.578,67.743 40.044,70.657c-0.443,2.417 -81.071,18.434 -150.392,42.115c-105.307,35.974 -146.312,70.174 -165.929,84.325c-9.675,6.979 2.45,2.704 2.727,2.587c24.444,-10.421 24.448,-10.047 49.438,-19.334c190.232,-70.697 249.183,-93.571 291.069,-109.2c23.785,-8.875 26.813,12.421 23.035,21.414c-3.298,7.848 -5.905,6.162 -326.778,126.437c-29.714,11.138 -33.64,9.352 -38.916,20.546c-14.863,31.532 -60.879,40.334 -88.719,34.759c-49.984,-10.01 -55.171,-39.291 -56.355,-40.61c-3.757,-4.185 -339.067,-126.806 -357.127,-135.047c-11.878,-5.42 -9.852,-30.206 7.637,-29.956c5.872,0.084 234.214,87.3 305.187,113.345c44.386,16.289 43.622,18.792 47.723,18.72c0.383,-0.007 -0.532,-1.132 -0.149,-1.138c0.153,-0.466 0.307,-0.933 0.46,-1.399c-17.652,-17.188 -89.142,-64.259 -206.478,-98.238c-65.366,-18.929 -103.17,-26.219 -108.435,-27.826c-5.256,-1.605 -1.45,-4.346 31.466,-61.07c10.083,-17.376 10.229,-21.468 17.984,-19.896c129.009,26.151 196.934,60.875 212.875,69.024c106.737,54.564 118.151,115.299 121.356,121.857c0.193,0.395 1.124,-0.464 1.317,-0.069Z" 
                        class="text-primary fill-current transition-colors duration-300"
                    />

                    <!-- Equalizer Soundwave Bars (Mauve Charcoal / Theme Foreground) -->
                    <g class="equalizer-bars text-foreground/85 dark:text-foreground/90 fill-current transition-colors duration-300">
                        <!-- Bar Center -->
                        <path d="M555.445,416.882c0.003,113.376 -0.023,239.292 -0.035,239.915c-0.162,8.061 -1.93,7.546 -11.881,17.087c-25.992,24.923 -24.03,27.246 -30.025,33.846c-1.413,1.556 -6.541,-5.062 -6.98,-5.629c-16.366,-21.122 -35.997,-37.112 -37.077,-39.227c-0.905,-1.772 -1.092,-125.927 -0.985,-241.578c15.515,-8.104 30.138,-13.452 43.5,-13.452c13.192,0 27.834,3.562 43.484,9.038Z" class="bar bar-3-lower" />
                        <path d="M468.461,397.453c0.089,-96.694 0.383,-187.443 0.636,-195.748c11.545,-48.341 57.716,-39.232 71.264,-26.671c17.549,16.27 14.981,35.27 15.009,42.615c0.053,13.918 0.072,91.196 0.074,175.39c-15.65,-5.476 -30.292,-9.038 -43.484,-9.038c-13.362,0 -27.985,5.348 -43.5,13.452Z" class="bar bar-3-upper" />
                        
                        <!-- Bar Right 1 -->
                        <path d="M593.432,408.448c0.139,-27.933 0.271,-49.139 0.308,-55.142c0.003,-0.403 0.014,-2.243 0.118,-4.414c-0.733,-19.456 -0.85,-57.898 1.948,-65.505c16.123,-43.826 79.658,-41.061 84.668,12.505c0.107,4.685 1.179,51.521 -0.076,62.127c0.218,18.884 0.299,51.625 0.31,85.101c-29.566,-8.354 -59.323,-22.379 -87.277,-34.673Z" class="bar bar-4-upper" />
                        <path d="M680.709,466.964c0.016,51.334 -0.138,104.394 -0.229,111.852c-0.273,12.44 -5.919,7.622 -44.186,29.908c-2.928,1.705 -26.487,15.425 -36.046,22.647c-6.36,4.805 -6.713,1.862 -6.732,1.208c-0.795,-27.121 -0.419,-133.14 -0.084,-200.289c27.954,12.294 57.711,26.319 87.277,34.673Z" class="bar bar-4-lower" />
                        
                        <!-- Bar Left 2 (Outer Left) -->
                        <path d="M218.706,466.923c-0.022,-95.079 -2.549,-102.683 16.058,-117.572c26.486,-21.195 70.68,-7.438 70.889,36.013c0.047,9.828 0.032,53.239 0.008,90.768c-31.322,2.66 -61.267,-2.014 -86.955,-9.209Z" class="bar bar-1-upper" />
                        <path d="M305.66,499.975c-0.018,27.989 -0.04,52.708 -0.045,57.785c-0.015,9.13 1.096,23.423 -2.825,22.421c-13.176,-3.368 -12.46,-5.619 -79.853,-22.452c-5.01,-1.251 -4.271,-3.375 -4.232,-62.26c0.001,-1.59 0.001,-3.157 0.001,-4.701c25.688,7.195 55.632,11.868 86.955,9.209Z" class="bar bar-1-lower" />
                        
                        <!-- Bar Right 2 (Outer Right) -->
                        <path d="M720.442,474.66c0.017,36.932 0.053,76.518 0.059,83.099c0.015,9.13 -1.096,23.423 2.825,22.421c13.176,-3.368 12.46,-5.619 79.853,-22.452c5.01,-1.251 4.271,-3.375 4.232,-62.26c-0.005,-7.272 0.006,-14.054 0.023,-20.383c-26.126,2.65 -55.938,3.336 -86.993,-0.424Z" class="bar bar-5-lower" />
                        <path d="M807.435,451.241c0.219,-80.304 1.445,-87.865 -16.082,-101.891c-26.486,-21.195 -70.68,-7.438 -70.889,36.013c-0.037,7.657 -0.036,35.694 -0.022,65.454c31.055,3.76 60.867,3.074 86.993,0.424Z" class="bar bar-5-upper" />
                        
                        <!-- Bar Left 1 -->
                        <path d="M343.554,468.648c0.075,-21.569 0.135,-48.156 0.099,-80.963c0.006,-0.31 0.003,-0.646 -0.006,-1.001c-0.62,-5.421 -0.038,-15.594 -0.026,-33.308c4.703,-35.813 38.923,-43.191 54.913,-37.964c31.255,10.218 32.935,31.503 32.078,70.439c0.046,2.916 -0.176,5.451 -0.176,5.662c0.003,10.128 0.008,19.743 0.013,28.872c-27.866,18.096 -57.406,38.206 -86.896,48.263Z" class="bar bar-2-upper" />
                        <path d="M430.45,444.229c0.095,170.968 0.445,171.703 0.114,188.183c-0.175,8.736 -3.041,-5.389 -82.836,-44.8c-5.063,-2.501 -4.487,-5.119 -4.173,-95.12c29.49,-10.057 59.03,-30.167 86.896,-48.263Z" class="bar bar-2-lower" />
                    </g>
                </g>
            </svg>
        </div>

        <!-- Brand Typography Block (Fraunces Serif + Primary Qur'an) -->
        <div 
            v-if="!isIconOnly" 
            class="flex flex-col"
            :class="isStacked ? 'items-center' : 'items-start'"
        >
            <div 
                class="font-heading font-bold tracking-tight text-foreground transition-colors duration-300"
                :class="[
                    isStacked ? 'text-xl sm:text-2xl leading-tight' : 'text-lg sm:text-xl leading-snug'
                ]"
            >
                <span>Anisul </span>
                <span class="text-primary font-bold">Qur'an</span>
            </div>

            <!-- Subtitle with i18n support -->
            <slot name="subtitle">
                <span 
                    class="text-[11px] sm:text-xs text-muted-foreground font-medium transition-colors duration-300"
                    :class="isStacked ? 'mt-0.5' : '-mt-0.5'"
                    :data-i18n-key="subtitleKey"
                >
                    {{ subtitle }}
                </span>
            </slot>
        </div>
    </div>
</template>

<style scoped>
/* Micro-Interaction: Equalizer Shimmer / Wave movement on hover */
.app-logo-container:hover .bar-3-upper,
.app-logo-container:hover .bar-3-lower {
    transform: translateY(-4px);
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.app-logo-container:hover .bar-2-upper,
.app-logo-container:hover .bar-2-lower,
.app-logo-container:hover .bar-4-upper,
.app-logo-container:hover .bar-4-lower {
    transform: translateY(-2px);
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.bar {
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    transform-origin: center bottom;
}

/* Accessibility: Respect Reduced Motion */
@media (prefers-reduced-motion: reduce) {
    .app-logo-icon,
    .bar {
        animation: none !important;
        transform: none !important;
        transition: none !important;
    }
}
</style>
