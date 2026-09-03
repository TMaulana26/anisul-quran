import { reactive, ref } from 'vue';

const DEFAULT_PREFERENCES = {
    readingMode: 'ayah', // 'ayah' | 'mushaf'
    mushafType: 'uthmani', // 'uthmani' | 'indopak'
    arabicFontSize: 28, // 20 - 44
    showTranslation: true,
    showTransliteration: true,
    autoScrollEnabled: true,
    autoZenOnPlay: true,
    selectedReciterId: 7, // Mishary Rashid Alafasy default
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

        const savedAutoZen = safeGetItem('anisul_auto_zen', null);
        if (savedAutoZen !== null) preferences.autoZenOnPlay = savedAutoZen === 'true';

        const savedReciterId = safeGetItem('anisul_selected_reciter', null);
        if (savedReciterId) preferences.selectedReciterId = parseInt(savedReciterId, 10) || 7;
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

    const setAutoZenOnPlay = (val) => {
        preferences.autoZenOnPlay = Boolean(val);
        safeSetItem('anisul_auto_zen', val);
    };

    const setSelectedReciterId = (id) => {
        const num = parseInt(id, 10) || 7;
        preferences.selectedReciterId = num;
        safeSetItem('anisul_selected_reciter', num);
    };

    const resetDefaults = () => {
        Object.assign(preferences, DEFAULT_PREFERENCES);
        safeSetItem('anisul_reading_mode', DEFAULT_PREFERENCES.readingMode);
        safeSetItem('anisul_mushaf', DEFAULT_PREFERENCES.mushafType);
        safeSetItem('anisul_font_size', DEFAULT_PREFERENCES.arabicFontSize);
        safeSetItem('anisul_show_translation', DEFAULT_PREFERENCES.showTranslation);
        safeSetItem('anisul_show_transliteration', DEFAULT_PREFERENCES.showTransliteration);
        safeSetItem('anisul_auto_scroll', DEFAULT_PREFERENCES.autoScrollEnabled);
        safeSetItem('anisul_auto_zen', DEFAULT_PREFERENCES.autoZenOnPlay);
        safeSetItem('anisul_selected_reciter', DEFAULT_PREFERENCES.selectedReciterId);
    };

    return {
        isDrawerOpen,
        preferences,
        openDrawer,
        closeDrawer,
        toggleDrawer,
        setReadingMode,
        setMushafType,
        setArabicFontSize,
        setShowTranslation,
        setShowTransliteration,
        setAutoScrollEnabled,
        setAutoZenOnPlay,
        setSelectedReciterId,
        resetDefaults,
    };
}
