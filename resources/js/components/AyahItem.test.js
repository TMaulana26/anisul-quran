import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AyahItem from './AyahItem.vue';

describe('AyahItem Component', () => {
    const mockVerse = {
        id: 1,
        verse_number: 1,
        verse_key: '1:1',
        text_uthmani: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
        text_indopak: 'بِسۡمِ اللّٰهِ الرَّحۡمٰنِ الرَّحِيۡمِ',
        juz_number: 1,
        page_number: 1,
        translations: [
            {
                resource_id: 33,
                text: 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.',
            },
        ],
        words: [
            { id: 1, transliteration: { text: 'bismi' } },
            { id: 2, transliteration: { text: 'Allahi' } },
        ],
    };

    it('renders Arabic text and Indonesian translation', () => {
        const wrapper = mount(AyahItem, {
            props: {
                verse: mockVerse,
                isActive: false,
                mushafType: 'uthmani',
                showTranslation: true,
            },
        });

        expect(wrapper.text()).toContain('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ');
        expect(wrapper.text()).toContain('Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.');
        expect(wrapper.text()).toContain('1:1');
    });

    it('switches to IndoPak rasm text when selected', () => {
        const wrapper = mount(AyahItem, {
            props: {
                verse: mockVerse,
                isActive: false,
                mushafType: 'indopak',
            },
        });

        expect(wrapper.text()).toContain('بِسۡمِ اللّٰهِ الرَّحۡمٰنِ الرَّحِيۡمِ');
    });

    it('emits play event when play button is clicked', async () => {
        const wrapper = mount(AyahItem, {
            props: {
                verse: mockVerse,
                isActive: false,
            },
        });

        const playBtn = wrapper.find('button');
        await playBtn.trigger('click');

        expect(wrapper.emitted()).toHaveProperty('play');
        expect(wrapper.emitted('play')[0][0]).toEqual(mockVerse);
    });

    it('applies active styling when isActive is true', () => {
        const wrapper = mount(AyahItem, {
            props: {
                verse: mockVerse,
                isActive: true,
            },
        });

        expect(wrapper.text()).toContain('Sedang Diputar');
        expect(wrapper.classes()).toContain('bg-primary/10');
    });
});
