import { computed } from 'vue';
import { useUserPreferences } from '@/composables/useUserPreferences';
import idLocale from '@/locales/id.json';
import enLocale from '@/locales/en.json';

const dictionaries = {
    id: idLocale,
    en: enLocale,
};

export const SUPPORTED_LOCALES = [
    {
        code: 'id',
        name: 'Bahasa Indonesia',
        shortName: 'ID',
        flag: '🇮🇩',
        translationLabel: 'Kemenag RI',
        translationResourceId: 33,
    },
    {
        code: 'en',
        name: 'English',
        shortName: 'EN',
        flag: '🇬🇧',
        translationLabel: 'The Clear Quran',
        translationResourceId: 131,
    },
];

export function useI18n() {
    const userPreferences = useUserPreferences();
    const currentLocale = computed(() => userPreferences.preferences.appLocale || 'id');
    const isEnglish = computed(() => currentLocale.value === 'en');
    const isIndonesian = computed(() => currentLocale.value === 'id');

    /**
     * Translate a key path with optional parameter interpolation.
     * Example: t('index.filter_all', { count: 114 })
     *
     * @param {string} path Dot-delimited string (e.g. 'common.loading')
     * @param {Record<string, string|number>} params Object of key-value pairs to interpolate
     * @returns {string}
     */
    const t = (path, params = {}) => {
        if (!path || typeof path !== 'string') return '';

        const keys = path.split('.');
        const localeDict = dictionaries[currentLocale.value] || dictionaries.id;

        let val = keys.reduce((obj, k) => (obj && obj[k] !== undefined ? obj[k] : null), localeDict);

        // Fallback to Indonesian if key is missing in active locale
        if (val === null && currentLocale.value !== 'id') {
            val = keys.reduce((obj, k) => (obj && obj[k] !== undefined ? obj[k] : null), dictionaries.id);
        }

        // Final fallback to the path itself
        if (val === null || val === undefined) {
            return path;
        }

        if (typeof val !== 'string') {
            return String(val);
        }

        // Interpolate {paramName}
        if (params && typeof params === 'object') {
            return Object.entries(params).reduce((str, [k, v]) => {
                return str.replace(new RegExp(`{${k}}`, 'g'), String(v));
            }, val);
        }

        return val;
    };

    /**
     * Switch application locale.
     *
     * @param {'id' | 'en'} newLocale
     */
    const setLocale = (newLocale) => {
        if (!['id', 'en'].includes(newLocale)) return;
        userPreferences.setAppLocale(newLocale);
    };

    return {
        currentLocale,
        isEnglish,
        isIndonesian,
        t,
        setLocale,
        supportedLocales: SUPPORTED_LOCALES,
    };
}
