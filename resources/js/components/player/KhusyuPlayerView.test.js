import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import KhusyuPlayerView from './KhusyuPlayerView.vue';
import { useQuranAudioPlayer } from '@/composables/useQuranAudioPlayer';

describe('KhusyuPlayerView.vue', () => {
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

    it('renders Mode Khusyu when open is true', () => {
        const player = useQuranAudioPlayer();
        player.loadSurah(mockChapter, { audio_url: 'https://example.com/1.mp3', verse_timings: [] });

        const wrapper = mount(KhusyuPlayerView, {
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

    it('emits update:open false when Exit Khusyu button is clicked', async () => {
        const wrapper = mount(KhusyuPlayerView, {
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

        const exitBtn = wrapper.find('button[title*="Keluar dari Mode Khusyu"]');
        expect(exitBtn.exists()).toBe(true);

        await exitBtn.trigger('click');
        expect(wrapper.emitted('update:open')).toBeTruthy();
        expect(wrapper.emitted('update:open')[0][0]).toBe(false);
    });

    it('navigates to next ayah when right chevron is clicked while paused', async () => {
        const player = useQuranAudioPlayer();
        const mockVersesMultiple = [
            ...mockVerses,
            {
                id: 2,
                verse_number: 2,
                verse_key: '1:2',
                text_uthmani: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
                translations: [{ id: 2, text: 'Segala puji bagi Allah, Tuhan seluruh alam.' }],
                words: [
                    { id: 3, position: 1, text_uthmani: 'ٱلْحَمْدُ', transliteration: { text: 'al-hamdu' } },
                ],
            },
        ];

        player.loadSurah(mockChapter, { audio_url: 'https://example.com/1.mp3', verse_timings: [] }, null, 1, false);

        const wrapper = mount(KhusyuPlayerView, {
            props: {
                open: true,
                chapter: mockChapter,
                verses: mockVersesMultiple,
            },
            global: {
                stubs: {
                    Teleport: true,
                },
            },
        });

        expect(player.currentAyahNumber.value).toBe(1);

        const nextBtn = wrapper.find('button[aria-label="Ayat Selanjutnya"]');
        expect(nextBtn.exists()).toBe(true);

        await nextBtn.trigger('click');
        expect(player.currentAyahNumber.value).toBe(2);

        const prevBtn = wrapper.find('button[aria-label="Ayat Sebelumnya"]');
        expect(prevBtn.exists()).toBe(true);

        await prevBtn.trigger('click');
        expect(player.currentAyahNumber.value).toBe(1);
    });
});
