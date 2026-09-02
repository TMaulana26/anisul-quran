import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ZenPlayerView from './ZenPlayerView.vue';
import { useQuranAudioPlayer } from '@/composables/useQuranAudioPlayer';

describe('ZenPlayerView.vue', () => {
    const mockChapter = { id: 1, name_simple: 'Al-Fatihah', name_arabic: 'الفاتحة', verses_count: 7 };
    const mockVerses = [
        {
            id: 1,
            verse_number: 1,
            verse_key: '1:1',
            text_uthmani: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
            translations: [{ id: 1, text: 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.' }],
            words: [
                { id: 1, position: 1, text_uthmani: 'بِسْمِ', transliteration: { text: 'bismi' } },
                { id: 2, position: 2, text_uthmani: 'ٱللَّهِ', transliteration: { text: 'Allahi' } },
            ],
        },
    ];

    it('renders Zen mode when open is true', () => {
        const player = useQuranAudioPlayer();
        player.loadSurah(mockChapter, { audio_url: 'https://example.com/1.mp3', verse_timings: [] });

        const wrapper = mount(ZenPlayerView, {
            props: {
                open: true,
                chapter: mockChapter,
                verses: mockVerses,
            },
            global: {
                stubs: {
                    Teleport: true,
                },
            },
        });

        expect(wrapper.text()).toContain('Al-Fatihah');
        expect(wrapper.text()).toContain('Ayat 1');
        expect(wrapper.text()).toContain('Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.');
    });

    it('emits update:open false when Exit Zen button is clicked', async () => {
        const wrapper = mount(ZenPlayerView, {
            props: {
                open: true,
                chapter: mockChapter,
                verses: mockVerses,
            },
            global: {
                stubs: {
                    Teleport: true,
                },
            },
        });

        const exitBtn = wrapper.find('button[title="Keluar dari Mode Zen (Esc)"]');
        expect(exitBtn.exists()).toBe(true);

        await exitBtn.trigger('click');
        expect(wrapper.emitted('update:open')).toBeTruthy();
        expect(wrapper.emitted('update:open')[0][0]).toBe(false);
    });
});
