import { describe, it, expect } from 'vitest';
import { useUserPreferences } from './useUserPreferences';

describe('useUserPreferences.js Composable', () => {
    it('initializes with default preferences', () => {
        const { preferences, isDrawerOpen } = useUserPreferences();

        expect(isDrawerOpen.value).toBe(false);
        expect(preferences.readingMode).toBe('ayah');
        expect(preferences.mushafType).toBe('uthmani');
        expect(preferences.arabicFontSize).toBe(28);
        expect(preferences.showTranslation).toBe(true);
        expect(preferences.showTransliteration).toBe(true);
        expect(preferences.autoScrollEnabled).toBe(true);
        expect(preferences.autoZenOnPlay).toBe(true);
        expect(preferences.selectedReciterId).toBe(7);
    });

    it('opens, closes, and toggles drawer state', () => {
        const { isDrawerOpen, openDrawer, closeDrawer, toggleDrawer } = useUserPreferences();

        openDrawer();
        expect(isDrawerOpen.value).toBe(true);

        closeDrawer();
        expect(isDrawerOpen.value).toBe(false);

        toggleDrawer();
        expect(isDrawerOpen.value).toBe(true);

        closeDrawer();
    });

    it('updates preferences reactively', () => {
        const {
            preferences,
            setReadingMode,
            setMushafType,
            setArabicFontSize,
            setShowTranslation,
            setShowTransliteration,
            setAutoScrollEnabled,
            setAutoZenOnPlay,
            setSelectedReciterId,
        } = useUserPreferences();

        setReadingMode('mushaf');
        expect(preferences.readingMode).toBe('mushaf');

        setMushafType('indopak');
        expect(preferences.mushafType).toBe('indopak');

        setArabicFontSize(34);
        expect(preferences.arabicFontSize).toBe(34);

        setShowTranslation(false);
        expect(preferences.showTranslation).toBe(false);

        setShowTransliteration(false);
        expect(preferences.showTransliteration).toBe(false);

        setAutoScrollEnabled(false);
        expect(preferences.autoScrollEnabled).toBe(false);

        setAutoZenOnPlay(false);
        expect(preferences.autoZenOnPlay).toBe(false);

        setSelectedReciterId(1);
        expect(preferences.selectedReciterId).toBe(1);

        const { setAppVibe } = useUserPreferences();
        setAppVibe('midnight');
        expect(preferences.appVibe).toBe('midnight');

        setAppVibe('warqah');
        expect(preferences.appVibe).toBe('warqah');

        setAppVibe('invalid_theme');
        expect(preferences.appVibe).toBe('noor');
    });

    it('resets all preferences to default values', () => {
        const { preferences, resetDefaults } = useUserPreferences();

        resetDefaults();

        expect(preferences.readingMode).toBe('ayah');
        expect(preferences.mushafType).toBe('uthmani');
        expect(preferences.arabicFontSize).toBe(28);
        expect(preferences.showTranslation).toBe(true);
        expect(preferences.showTransliteration).toBe(true);
        expect(preferences.autoScrollEnabled).toBe(true);
        expect(preferences.autoZenOnPlay).toBe(true);
        expect(preferences.selectedReciterId).toBe(7);
        expect(preferences.appVibe).toBe('noor');
    });

    it('toggles and sets light/dark theme', () => {
        const { isDark, toggleTheme, setTheme } = useUserPreferences();

        setTheme('light');
        expect(isDark.value).toBe(false);

        toggleTheme();
        expect(isDark.value).toBe(true);

        toggleTheme();
        expect(isDark.value).toBe(false);

        setTheme('dark');
        expect(isDark.value).toBe(true);
    });

    it('sets cookie when reciter preference is changed', () => {
        const { setSelectedReciterId, preferences } = useUserPreferences();
        setSelectedReciterId(4);
        expect(preferences.selectedReciterId).toBe(4);
        expect(document.cookie).toContain('anisul_selected_reciter=4');
    });

    it('manages hybrid per-surah reciter overrides correctly', () => {
        const {
            preferences,
            setSelectedReciterId,
            getReciterIdForSurah,
            hasSurahReciterOverride,
            setSurahReciterOverride,
            clearSurahReciterOverride,
            clearAllSurahReciterOverrides,
            resetDefaults,
        } = useUserPreferences();

        resetDefaults();
        setSelectedReciterId(7);

        // Without overrides, all surahs return global default
        expect(hasSurahReciterOverride(1)).toBe(false);
        expect(getReciterIdForSurah(1)).toBe(7);
        expect(getReciterIdForSurah(2)).toBe(7);

        // Set override for Surah 1 to reciter 4 (Al-Husary)
        setSurahReciterOverride(1, 4);
        expect(hasSurahReciterOverride(1)).toBe(true);
        expect(getReciterIdForSurah(1)).toBe(4);
        // Surah 2 still follows global default
        expect(hasSurahReciterOverride(2)).toBe(false);
        expect(getReciterIdForSurah(2)).toBe(7);

        // Change global default to reciter 1 (AbdulBaset)
        setSelectedReciterId(1);
        expect(preferences.selectedReciterId).toBe(1);
        // Surah 1 still keeps its custom override
        expect(getReciterIdForSurah(1)).toBe(4);
        // Surah 2 reflects the new global default
        expect(getReciterIdForSurah(2)).toBe(1);

        // Clear override for Surah 1
        clearSurahReciterOverride(1);
        expect(hasSurahReciterOverride(1)).toBe(false);
        expect(getReciterIdForSurah(1)).toBe(1);

        // Set multiple overrides and clear all
        setSurahReciterOverride(18, 5);
        setSurahReciterOverride(36, 6);
        expect(hasSurahReciterOverride(18)).toBe(true);
        expect(hasSurahReciterOverride(36)).toBe(true);
        clearAllSurahReciterOverrides();
        expect(hasSurahReciterOverride(18)).toBe(false);
        expect(hasSurahReciterOverride(36)).toBe(false);
    });
});
