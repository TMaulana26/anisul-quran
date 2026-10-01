import { describe, it, expect } from 'vitest';
import {
    TADABBUR_THEMES,
    SURAH_THEME_MAP,
    getSurahDefaultTheme,
    getThemeConfig,
    getThemeList,
} from './tadabburThemes';

describe('tadabburThemes', () => {
    it('contains all 5 primary kauniyah themes with complete asset definitions', () => {
        const themeKeys = Object.keys(TADABBUR_THEMES);
        expect(themeKeys).toEqual(['cosmic', 'ocean', 'mountain', 'rain', 'sunrise']);

        themeKeys.forEach((key) => {
            const theme = TADABBUR_THEMES[key];
            expect(theme.id).toBe(key);
            expect(theme.nameKey).toBeDefined();
            expect(theme.icon).toBeDefined();
            expect(theme.video).toBeDefined();
            expect(theme.videoFallback).toBeDefined();
            expect(theme.poster).toBeDefined();
            expect(theme.ambience).toBeDefined();
            expect(theme.gradientOverlay).toBeDefined();
        });
    });

    it('maps all 114 surahs of the Quran without missing any index', () => {
        expect(Object.keys(SURAH_THEME_MAP)).toHaveLength(114);

        for (let i = 1; i <= 114; i++) {
            const theme = SURAH_THEME_MAP[i];
            expect(['cosmic', 'ocean', 'mountain', 'rain', 'sunrise']).toContain(theme);
        }
    });

    it('returns the correct default theme for landmark surahs', () => {
        expect(getSurahDefaultTheme(1)).toBe('sunrise'); // Al-Fatihah
        expect(getSurahDefaultTheme(2)).toBe('rain'); // Al-Baqarah
        expect(getSurahDefaultTheme(3)).toBe('cosmic'); // Ali 'Imran
        expect(getSurahDefaultTheme(7)).toBe('mountain'); // Al-A'raf (Sinai)
        expect(getSurahDefaultTheme(55)).toBe('ocean'); // Ar-Rahman
        expect(getSurahDefaultTheme(67)).toBe('cosmic'); // Al-Mulk
        expect(getSurahDefaultTheme(78)).toBe('mountain'); // An-Naba
        expect(getSurahDefaultTheme(89)).toBe('sunrise'); // Al-Fajr
        expect(getSurahDefaultTheme(114)).toBe('cosmic'); // An-Nas
    });

    it('falls back safely to sunrise for invalid or out-of-range surah IDs', () => {
        expect(getSurahDefaultTheme(0)).toBe('sunrise');
        expect(getSurahDefaultTheme(115)).toBe('sunrise');
        expect(getSurahDefaultTheme('invalid')).toBe('sunrise');
    });

    it('returns valid config object via getThemeConfig', () => {
        const ocean = getThemeConfig('ocean');
        expect(ocean.id).toBe('ocean');
        expect(ocean.accentColor).toBe('#38bdf8');

        // Fallback for unknown theme ID
        const fallback = getThemeConfig('nonexistent');
        expect(fallback.id).toBe('sunrise');
    });

    it('returns array of all 5 themes via getThemeList', () => {
        const list = getThemeList();
        expect(list).toHaveLength(5);
        expect(list.map((t) => t.id)).toEqual(['cosmic', 'ocean', 'mountain', 'rain', 'sunrise']);
    });
});
