/**
 * Clean and normalize Quran Arabic text for clean cross-browser font rendering.
 * Converts Quran Foundation IndoPak proprietary PUA (Private Use Area) stop signs
 * into standard Unicode Quranic waqf marks and strips zero-width artifacts.
 *
 * @param {string} text
 * @returns {string}
 */
export function cleanArabicText(text) {
    if (!text || typeof text !== 'string') return '';

    // Map Quran Foundation IndoPak PUA stop signs to standard Unicode Quranic marks
    const puaWaqfMap = {
        '\uE01B': ' ۚ', // Waqf Ja'iz (Small High Jeem)
        '\uE01C': ' ۘ', // Waqf Lazim (Small High Meem)
        '\uE022': ' ۗ', // Waqf Mutlaq (Small High Tah/Qaf)
        '\uE01A': ' ۖ', // Waqf Murakhkhas (Small High Sad-Lam)
        '\uE01D': ' ۜ', // Saktah (Small High Sin)
        '\uE01E': ' ۛ', // Mu'anaqah / Three dots
        '\uE01F': ' ۞', // Rub el Hizb
        '\uE020': ' ۩', // Sajdah mark
    };

    let cleaned = text;
    for (const [pua, standard] of Object.entries(puaWaqfMap)) {
        cleaned = cleaned.replaceAll(pua, standard);
    }

    // Remove remaining unmapped PUA characters & zero-width artifacts that cause tofu boxes (□)
    cleaned = cleaned
        .replace(/[\uE000-\uF8FF]/g, '')
        .replace(/[\uFEFF\u200B-\u200F\u202A-\u202E]/g, '')
        .trim();

    return cleaned;
}

/**
 * Format Arabic text for a verse based on selected mushaf type.
 *
 * @param {Object} verse
 * @param {string} mushafType - 'uthmani' | 'indopak'
 * @returns {string}
 */
export function getFormattedArabicText(verse, mushafType = 'uthmani') {
    if (!verse) return '';

    if (mushafType === 'indopak' && verse.text_indopak) {
        return cleanArabicText(verse.text_indopak);
    }

    return cleanArabicText(verse.text_uthmani || verse.text_imlaei || '');
}

/**
 * Clean translation text by stripping HTML footnote tags (<sup foot_note=...>1</sup>),
 * extra formatting tags, and fixing punctuation spacing.
 *
 * @param {string} text
 * @returns {string}
 */
export function cleanTranslationText(text) {
    if (!text || typeof text !== 'string') return '';

    return text
        // Remove <sup>...</sup> along with the inner footnote index numbers
        .replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, '')
        // Strip any other HTML tags
        .replace(/<[^>]*>/g, '')
        // Clean up any extra spacing before punctuation
        .replace(/\s+([,.:;!?])/g, '$1')
        .trim();
}
