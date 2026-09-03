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

    // Remove remaining unmapped PUA characters & zero-width / directional artifacts that cause tofu boxes (□)
    cleaned = cleaned
        .replace(/[\uE000-\uF8FF]/g, '')
        .replace(/[\uFEFF\u200B-\u200F\u202A-\u202E\u2060-\u206F]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    return cleaned;
}

/**
 * Format Arabic text for an individual word based on selected mushaf type.
 *
 * @param {Object} word
 * @param {string} mushafType - 'uthmani' | 'indopak'
 * @returns {string}
 */
export function getFormattedWordText(word, mushafType = 'uthmani') {
    if (!word) return '';

    const raw = mushafType === 'indopak'
        ? (word.text_indopak || word.text || '')
        : (word.text_uthmani || word.text || '');

    return cleanArabicText(raw);
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

/**
 * Parse raw translation text into structured tokens of plain text and interactive footnotes.
 *
 * @param {string} rawText
 * @returns {Array<{ type: 'text'|'footnote', content?: string, id?: number, number?: string }>}
 */
export function parseTranslationTokens(rawText) {
    if (!rawText || typeof rawText !== 'string') return [];

    const tokens = [];
    const footnoteRegex = /<sup\s+foot_note=["']?(\d+)["']?>([\s\S]*?)<\/sup>/gi;

    let lastIndex = 0;
    let match;

    while ((match = footnoteRegex.exec(rawText)) !== null) {
        // Text preceding the footnote
        if (match.index > lastIndex) {
            const textChunk = rawText.slice(lastIndex, match.index)
                .replace(/<[^>]*>/g, '');
            if (textChunk) {
                tokens.push({ type: 'text', content: textChunk });
            }
        }

        const footnoteId = parseInt(match[1], 10);
        const footnoteNumber = match[2].trim() || '1';

        tokens.push({
            type: 'footnote',
            id: footnoteId,
            number: footnoteNumber,
        });

        lastIndex = footnoteRegex.lastIndex;
    }

    // Remaining text after last footnote
    if (lastIndex < rawText.length) {
        const textChunk = rawText.slice(lastIndex)
            .replace(/<[^>]*>/g, '');
        if (textChunk) {
            tokens.push({ type: 'text', content: textChunk });
        }
    }

    // If no footnotes were found, return the cleaned whole text
    if (tokens.length === 0) {
        tokens.push({ type: 'text', content: cleanTranslationText(rawText) });
    }

    return tokens;
}

/**
 * Convert standard western integer to Eastern Arabic-Indic numeral (e.g. 1 -> ١, 255 -> ٢٥٥).
 *
 * @param {number|string} num
 * @returns {string}
 */
export function toArabicIndic(num) {
    if (num === null || num === undefined || num === '') return '';
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(num).replace(/[0-9]/g, (w) => arabicDigits[+w] ?? w);
}

