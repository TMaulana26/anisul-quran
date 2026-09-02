import { describe, it, expect } from 'vitest';
import { cleanArabicText, getFormattedArabicText } from './quranUtils';

describe('quranUtils', () => {
    it('cleans PUA waqf marks and maps them to standard Unicode marks', () => {
        const rawWithPua = 'بِالطَّيِّبِ\uE01B وَلَا تَاۡكُلُوۡۤا اَمۡوَالَهُمۡ\u200B';
        const cleaned = cleanArabicText(rawWithPua);

        expect(cleaned).toContain(' ۚ');
        expect(cleaned).not.toContain('\uE01B');
        expect(cleaned).not.toContain('\u200B');
    });

    it('cleans zero-width BOM and formatting artifacts', () => {
        const textWithArtifacts = '\uFEFFكَبِيۡرًا\u200F\u200F \uFEFF';
        const cleaned = cleanArabicText(textWithArtifacts);

        expect(cleaned).toBe('كَبِيۡرًا');
    });

    it('returns formatted text according to mushafType', () => {
        const mockVerse = {
            text_uthmani: 'بِسْمِ ٱللَّهِ',
            text_indopak: 'بِسۡمِ اللّٰهِ\uE01B',
        };

        expect(getFormattedArabicText(mockVerse, 'uthmani')).toBe('بِسْمِ ٱللَّهِ');
        expect(getFormattedArabicText(mockVerse, 'indopak')).toContain('بِسۡمِ اللّٰهِ ۚ');
    });
});
