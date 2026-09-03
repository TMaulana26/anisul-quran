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
});
