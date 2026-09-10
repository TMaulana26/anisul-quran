import { createApp, h } from 'vue'
import { createInertiaApp } from '@inertiajs/vue3'

// Resolve vibe-aware loading progress bar accent color
const getVibeProgressColor = () => {
    try {
        if (typeof window !== 'undefined') {
            const vibe = localStorage.getItem('anisul_app_vibe') || localStorage.getItem('anisul_khusyu_theme') || 'noor';
            const isDark = document.documentElement.classList.contains('dark') || localStorage.getItem('anisul_theme') === 'dark';

            if (vibe === 'midnight') {
                return isDark ? '#fbbf24' : '#d97706'; // Golden amber for Midnight
            }
            if (vibe === 'warqah') {
                return isDark ? '#d97706' : '#92400e'; // Antique bronze / sepia for Warqah
            }
            return isDark ? '#34d399' : '#059669'; // Emerald for Noor
        }
    } catch (e) {}
    return '#10b981';
};

createInertiaApp({
    resolve: name => {
        const pages = import.meta.glob('./Pages/**/*.vue')
        return pages[`./Pages/${name}.vue`]()
    },
    setup({ el, App, props, plugin }) {
        createApp({ render: () => h(App, props) })
            .use(plugin)
            .mount(el)
    },
    progress: {
        color: getVibeProgressColor(),
        showSpinner: true,
    },
})