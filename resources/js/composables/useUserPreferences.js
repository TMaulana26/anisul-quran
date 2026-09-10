import { reactive, ref, computed } from 'vue';

const DEFAULT_PREFERENCES = {
    readingMode: 'ayah', // 'ayah' | 'mushaf'
    mushafType: 'uthmani', // 'uthmani' | 'indopak'
    arabicFontSize: 28, // 20 - 44
    showTranslation: true,
    showTransliteration: true,
    autoScrollEnabled: true,
    autoKhusyuOnPlay: true,
    autoZenOnPlay: true, // Alias for autoKhusyuOnPlay
    selectedReciterId: 7, // Mishary Rashid Alafasy default
    appVibe: 'noor', // 'noor' | 'midnight' | 'warqah'
};

const safeGetItem = (key, fallback) => {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            const val = window.localStorage.getItem(key);
            if (val !== null) return val;
        }
    } catch (e) {
        // Fallback for SSR or restricted environments
    }
    return fallback;
};

const safeSetItem = (key, value) => {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(key, String(value));
        }
    } catch (e) {
        // Fallback for SSR or restricted environments
    }
};

// Global singleton reactive state
const isDrawerOpen = ref(false);
const isDark = ref(false);
const preferences = reactive({ ...DEFAULT_PREFERENCES });
let isInitialized = false;

export function useUserPreferences() {
    const init = () => {
        if (isInitialized) return;
        isInitialized = true;

        const savedReadingMode = safeGetItem('anisul_reading_mode', null);
        if (savedReadingMode) preferences.readingMode = savedReadingMode;

        const savedMushaf = safeGetItem('anisul_mushaf', null);
        if (savedMushaf) preferences.mushafType = savedMushaf;

        const savedFontSize = safeGetItem('anisul_font_size', null);
        if (savedFontSize) preferences.arabicFontSize = parseInt(savedFontSize, 10) || 28;

        const savedShowTranslation = safeGetItem('anisul_show_translation', null);
        if (savedShowTranslation !== null) preferences.showTranslation = savedShowTranslation === 'true';

        const savedShowTransliteration = safeGetItem('anisul_show_transliteration', null);
        if (savedShowTransliteration !== null) preferences.showTransliteration = savedShowTransliteration === 'true';

        const savedAutoScroll = safeGetItem('anisul_auto_scroll', null);
        if (savedAutoScroll !== null) preferences.autoScrollEnabled = savedAutoScroll === 'true';

        const savedAutoKhusyu = safeGetItem('anisul_auto_khusyu', null) ?? safeGetItem('anisul_auto_zen', null);
        if (savedAutoKhusyu !== null) {
            const boolVal = savedAutoKhusyu === 'true';
            preferences.autoKhusyuOnPlay = boolVal;
            preferences.autoZenOnPlay = boolVal;
        }

        const savedReciterId = safeGetItem('anisul_selected_reciter', null);
        if (savedReciterId) preferences.selectedReciterId = parseInt(savedReciterId, 10) || 7;

        const savedVibe = safeGetItem('anisul_app_vibe', null) || safeGetItem('anisul_khusyu_theme', null);
        if (savedVibe && ['noor', 'midnight', 'warqah'].includes(savedVibe)) {
            preferences.appVibe = savedVibe;
        }
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-vibe', preferences.appVibe);
        }

        // Initialize Light / Dark Mode
        const savedTheme = safeGetItem('anisul_theme', null);
        const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            isDark.value = true;
            if (typeof document !== 'undefined') {
                document.documentElement.classList.add('dark');
            }
        } else {
            isDark.value = false;
            if (typeof document !== 'undefined') {
                document.documentElement.classList.remove('dark');
            }
        }
    };

    init();

    const openDrawer = () => {
        isDrawerOpen.value = true;
    };

    const closeDrawer = () => {
        isDrawerOpen.value = false;
    };

    const toggleDrawer = () => {
        isDrawerOpen.value = !isDrawerOpen.value;
    };

    const setReadingMode = (mode) => {
        preferences.readingMode = mode;
        safeSetItem('anisul_reading_mode', mode);
    };

    const setMushafType = (type) => {
        preferences.mushafType = type;
        safeSetItem('anisul_mushaf', type);
    };

    const setArabicFontSize = (size) => {
        const num = Math.min(44, Math.max(20, parseInt(size, 10) || 28));
        preferences.arabicFontSize = num;
        safeSetItem('anisul_font_size', num);
    };

    const setShowTranslation = (val) => {
        preferences.showTranslation = Boolean(val);
        safeSetItem('anisul_show_translation', val);
    };

    const setShowTransliteration = (val) => {
        preferences.showTransliteration = Boolean(val);
        safeSetItem('anisul_show_transliteration', val);
    };

    const setAutoScrollEnabled = (val) => {
        preferences.autoScrollEnabled = Boolean(val);
        safeSetItem('anisul_auto_scroll', val);
    };

    const setAutoKhusyuOnPlay = (val) => {
        const boolVal = Boolean(val);
        preferences.autoKhusyuOnPlay = boolVal;
        preferences.autoZenOnPlay = boolVal;
        safeSetItem('anisul_auto_khusyu', boolVal);
        safeSetItem('anisul_auto_zen', boolVal);
    };

    const setAutoZenOnPlay = (val) => {
        setAutoKhusyuOnPlay(val);
    };

    const setSelectedReciterId = (id) => {
        const num = parseInt(id, 10) || 7;
        preferences.selectedReciterId = num;
        safeSetItem('anisul_selected_reciter', num);
    };

    const withThemeTransition = (callback) => {
        if (typeof document === 'undefined') {
            callback();
            return;
        }

        const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (typeof document.startViewTransition === 'function' && !prefersReducedMotion) {
            document.startViewTransition(() => {
                callback();
            });
        } else {
            callback();
        }
    };

    const setAppVibe = (vibe) => {
        withThemeTransition(() => {
            const valid = ['noor', 'midnight', 'warqah'].includes(vibe) ? vibe : 'noor';
            preferences.appVibe = valid;
            safeSetItem('anisul_app_vibe', valid);
            safeSetItem('anisul_khusyu_theme', valid);
            if (typeof document !== 'undefined') {
                document.documentElement.setAttribute('data-vibe', valid);
            }
        });
    };

    const toggleTheme = () => {
        withThemeTransition(() => {
            isDark.value = !isDark.value;
            const themeStr = isDark.value ? 'dark' : 'light';
            safeSetItem('anisul_theme', themeStr);
            if (typeof document !== 'undefined') {
                if (isDark.value) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            }
        });
    };

    const setTheme = (theme) => {
        withThemeTransition(() => {
            isDark.value = theme === 'dark';
            safeSetItem('anisul_theme', isDark.value ? 'dark' : 'light');
            if (typeof document !== 'undefined') {
                if (isDark.value) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            }
        });
    };

    const resetDefaults = () => {
        Object.assign(preferences, DEFAULT_PREFERENCES);
        safeSetItem('anisul_reading_mode', DEFAULT_PREFERENCES.readingMode);
        safeSetItem('anisul_mushaf', DEFAULT_PREFERENCES.mushafType);
        safeSetItem('anisul_font_size', DEFAULT_PREFERENCES.arabicFontSize);
        safeSetItem('anisul_show_translation', DEFAULT_PREFERENCES.showTranslation);
        safeSetItem('anisul_show_transliteration', DEFAULT_PREFERENCES.showTransliteration);
        safeSetItem('anisul_auto_scroll', DEFAULT_PREFERENCES.autoScrollEnabled);
        safeSetItem('anisul_auto_khusyu', DEFAULT_PREFERENCES.autoKhusyuOnPlay);
        safeSetItem('anisul_auto_zen', DEFAULT_PREFERENCES.autoZenOnPlay);
        safeSetItem('anisul_selected_reciter', DEFAULT_PREFERENCES.selectedReciterId);
        safeSetItem('anisul_app_vibe', DEFAULT_PREFERENCES.appVibe);
        safeSetItem('anisul_khusyu_theme', DEFAULT_PREFERENCES.appVibe);
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-vibe', DEFAULT_PREFERENCES.appVibe);
        }
    };

    const readingMode = computed(() => preferences.readingMode);
    const mushafType = computed(() => preferences.mushafType);
    const arabicFontSize = computed(() => preferences.arabicFontSize);
    const showTranslation = computed(() => preferences.showTranslation);
    const showTransliteration = computed(() => preferences.showTransliteration);
    const autoScrollEnabled = computed(() => preferences.autoScrollEnabled);
    const autoKhusyuOnPlay = computed(() => preferences.autoKhusyuOnPlay);
    const selectedReciterId = computed(() => preferences.selectedReciterId);
    const appVibe = computed(() => preferences.appVibe);

    return {
        isDrawerOpen,
        isDark,
        preferences,
        readingMode,
        mushafType,
        arabicFontSize,
        showTranslation,
        showTransliteration,
        autoScrollEnabled,
        autoKhusyuOnPlay,
        selectedReciterId,
        appVibe,
        openDrawer,
        closeDrawer,
        toggleDrawer,
        toggleTheme,
        setTheme,
        setReadingMode,
        setMushafType,
        setArabicFontSize,
        setShowTranslation,
        setShowTransliteration,
        setAutoScrollEnabled,
        setAutoKhusyuOnPlay,
        setAutoZenOnPlay,
        setSelectedReciterId,
        setAppVibe,
        resetDefaults,
    };
}
