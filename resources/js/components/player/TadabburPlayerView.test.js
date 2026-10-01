import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TadabburPlayerView from './TadabburPlayerView.vue';
import { useQuranAudioPlayer } from '@/composables/useQuranAudioPlayer';

describe('TadabburPlayerView.vue', () => {
    const mockChapter = { id: 67, name_simple: 'Al-Mulk', name_arabic: 'الملك', verses_count: 30 };
    const mockVerses = [
        {
            id: 1,
            verse_number: 1,
            verse_key: '67:1',
            text_uthmani: 'تَبَٰرَكَ ٱلَّذِى بِيَدِهِ ٱلْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَىْءٍۢ قَدِيرٌ',
            translations: [{ id: 1, text: 'Mahasuci Allah yang di tangan-Nyalah segala kerajaan, dan Dia Mahakuasa atas segala sesuatu.' }],
            words: [
                { id: 1, position: 1, text_uthmani: 'تَبَٰرَكَ', transliteration: { text: 'tabāraka' }, translation: { text: 'Maha Berkah' } },
                { id: 2, position: 2, text_uthmani: 'ٱلَّذِى', transliteration: { text: 'alladhī' }, translation: { text: 'yang' } },
                { id: 3, position: 3, text_uthmani: 'بِيَدِهِ', transliteration: { text: 'biyadihi' }, translation: { text: 'di tangan-Nya' } },
                { id: 4, position: 4, text_uthmani: 'ٱلْمُلْكُ', transliteration: { text: 'al-mulku' }, translation: { text: 'kerajaan' } },
            ],
        },
    ];

    beforeEach(() => {
        const player = useQuranAudioPlayer();
        player.loadSurah(mockChapter, { audio_url: 'https://example.com/67.mp3', verse_timings: [] });
    });

    it('renders Mode Tadabbur Alam correctly when open is true', () => {
        const wrapper = mount(TadabburPlayerView, {
            props: {
                open: true,
                chapter: mockChapter,
                verses: mockVerses,
            },
        });

        expect(wrapper.text()).toContain('Tadabbur Alam');
        expect(wrapper.text()).toContain('Al-Mulk');
        expect(wrapper.text()).toContain('Mahasuci Allah');
    });

    it('does not render anything when open is false', () => {
        const wrapper = mount(TadabburPlayerView, {
            props: {
                open: false,
                chapter: mockChapter,
                verses: mockVerses,
            },
        });

        expect(wrapper.find('header').exists()).toBe(false);
    });

    it('defaults to the thematic preset for the surah (Al-Mulk = Cosmic 🌌)', () => {
        const wrapper = mount(TadabburPlayerView, {
            props: {
                open: true,
                chapter: mockChapter, // 67 is cosmic
                verses: mockVerses,
            },
        });

        // Theme icon for cosmic is 🌌
        expect(wrapper.html()).toContain('🌌');
    });

    it('emits update:open false when close button is clicked', async () => {
        const wrapper = mount(TadabburPlayerView, {
            props: {
                open: true,
                chapter: mockChapter,
                verses: mockVerses,
            },
        });

        const closeBtn = wrapper.find('button[aria-label="Close Tadabbur"]');
        expect(closeBtn.exists()).toBe(true);

        await closeBtn.trigger('click');
        expect(wrapper.emitted('update:open')).toBeTruthy();
        expect(wrapper.emitted('update:open')[0]).toEqual([false]);
    });

    it('allows user to switch theme via quick pills', async () => {
        const wrapper = mount(TadabburPlayerView, {
            props: {
                open: true,
                chapter: mockChapter,
                verses: mockVerses,
            },
        });

        const oceanButton = wrapper.findAll('header button').find((b) => b.text().includes('🌊'));
        expect(oceanButton).toBeDefined();

        await oceanButton.trigger('click');
        expect(wrapper.html()).toContain('ocean.webm');
    });

    it('toggles data saver mode when data saver button is clicked', async () => {
        const wrapper = mount(TadabburPlayerView, {
            props: {
                open: true,
                chapter: mockChapter,
                verses: mockVerses,
            },
        });

        const dataSaverBtn = wrapper.find('button[aria-label="Toggle Data Saver"]');
        expect(dataSaverBtn.exists()).toBe(true);

        await dataSaverBtn.trigger('click');
        // Once data saver is clicked, ken burns poster is rendered instead of video
        expect(wrapper.find('.animate-ken-burns').exists()).toBe(true);
    });
});
