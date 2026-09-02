import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MushafPageView from './MushafPageView.vue';

describe('MushafPageView Component', () => {
    const mockChapter = {
        id: 1,
        name_simple: 'Al-Fatihah',
        name_arabic: 'الفاتحة',
    };

    const mockVerses = [
        {
            id: 1,
            verse_number: 1,
            page_number: 1,
            juz_number: 1,
            text_uthmani: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
            text_indopak: 'بِسۡمِ اللّٰهِ الرَّحۡمٰنِ الرَّحِيۡمِ',
        },
        {
            id: 2,
            verse_number: 2,
            page_number: 1,
            juz_number: 1,
            text_uthmani: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
            text_indopak: 'الۡحَمۡدُ لِلّٰهِ رَبِّ الۡعٰلَمِيۡنَ',
        },
    ];

    it('renders continuous mushaf page text with page headers and footers', () => {
        const wrapper = mount(MushafPageView, {
            props: {
                verses: mockVerses,
                chapter: mockChapter,
                mushafType: 'uthmani',
                arabicFontSize: 28,
            },
        });

        expect(wrapper.text()).toContain('Juz 1');
        expect(wrapper.text()).toContain('Hal. 1');
        expect(wrapper.text()).toContain('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ');
        expect(wrapper.text()).toContain('ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ');
        expect(wrapper.text()).toContain('Halaman 1');
    });

    it('switches to IndoPak rasm text', () => {
        const wrapper = mount(MushafPageView, {
            props: {
                verses: mockVerses,
                chapter: mockChapter,
                mushafType: 'indopak',
            },
        });

        expect(wrapper.text()).toContain('بِسۡمِ اللّٰهِ الرَّحۡمٰنِ الرَّحِيۡمِ');
    });

    it('emits play event when an ayah is clicked', async () => {
        const wrapper = mount(MushafPageView, {
            props: {
                verses: mockVerses,
                chapter: mockChapter,
            },
        });

        const ayahSpan = wrapper.find('#mushaf-ayah-1');
        await ayahSpan.trigger('click');

        expect(wrapper.emitted()).toHaveProperty('play');
        expect(wrapper.emitted('play')[0][0]).toEqual(mockVerses[0]);
    });
});
