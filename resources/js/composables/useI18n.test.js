import { describe, it, expect, beforeEach } from 'vitest';
import { useI18n, SUPPORTED_LOCALES } from './useI18n';
import { useUserPreferences } from './useUserPreferences';

describe('useI18n composable', () => {
    beforeEach(() => {
        const prefs = useUserPreferences();
        prefs.resetDefaults();
    });

    it('initializes with default locale id (Bahasa Indonesia)', () => {
        const { currentLocale, isIndonesian, isEnglish } = useI18n();
        expect(currentLocale.value).toBe('id');
        expect(isIndonesian.value).toBe(true);
        expect(isEnglish.value).toBe(false);
    });

    it('translates common keys properly in Indonesian', () => {
        const { t } = useI18n();
        expect(t('common.app_name')).toBe("Anisul Qur'an");
        expect(t('nav.surah_list')).toBe('Daftar Surah');
        expect(t('surah.mode_ayah')).toBe('Per Ayat');
    });

    it('interpolates parameters correctly with {paramName}', () => {
        const { t } = useI18n();
        expect(t('index.filter_all', { count: 114 })).toBe('Semua (114)');
        expect(t('surah.juz', { number: 30 })).toBe('Juz 30');
    });

    it('switches locale to English and translates accordingly', () => {
        const { setLocale, currentLocale, isEnglish, t } = useI18n();
        setLocale('en');

        expect(currentLocale.value).toBe('en');
        expect(isEnglish.value).toBe(true);
        expect(t('nav.surah_list')).toBe('Surah List');
        expect(t('surah.mode_ayah')).toBe('Verse by Verse');
        expect(t('index.filter_all', { count: 114 })).toBe('All (114)');
        expect(t('common.revelation_makkah')).toBe('Meccan');
    });

    it('falls back to key path when key is unknown', () => {
        const { t } = useI18n();
        expect(t('non_existent.nested.key')).toBe('non_existent.nested.key');
    });

    it('exposes supportedLocales with correct metadata', () => {
        const { supportedLocales } = useI18n();
        expect(supportedLocales).toHaveLength(2);
        expect(supportedLocales[0].code).toBe('id');
        expect(supportedLocales[0].translationResourceId).toBe(33);
        expect(supportedLocales[1].code).toBe('en');
        expect(supportedLocales[1].translationResourceId).toBe(131);
    });
});
