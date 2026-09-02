import { describe, it, expect } from 'vitest';
import { cleanArabicText, getFormattedArabicText, cleanTranslationText } from './quranUtils';

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

    it('strips footnote sup tags and footnote numbers from translation', () => {
        const rawTranslation = 'Allah, tidak ada tuhan selain Dia. Yang Mahahidup, Yang terus menerus mengurus (makhluk-Nya).<sup foot_note=135060>1</sup>';
        const cleaned = cleanTranslationText(rawTranslation);

        expect(cleaned).toBe('Allah, tidak ada tuhan selain Dia. Yang Mahahidup, Yang terus menerus mengurus (makhluk-Nya).');
        expect(cleaned).not.toContain('1</sup>');
        expect(cleaned).not.toContain('135060');
    });

    it('cleans mid-sentence footnote sup tags cleanly', () => {
        const midSentence = 'saling meminta,<sup foot_note=135123>1</sup> dan (peliharalah)';
        const cleaned = cleanTranslationText(midSentence);

        expect(cleaned).toBe('saling meminta, dan (peliharalah)');
    });
});
