import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import AudioPlayerBar from './AudioPlayerBar.vue';
import { useQuranAudioPlayer } from '@/composables/useQuranAudioPlayer';

describe('AudioPlayerBar.vue', () => {
    it('renders player bar when a Surah is loaded', () => {
        const player = useQuranAudioPlayer();
        player.loadSurah(
            { id: 1, name_simple: 'Al-Fatihah' },
            { audio_url: 'https://example.com/1.mp3', verse_timings: [] },
            { id: 7, name: 'Mishary Rashid Alafasy' }
        );

        const wrapper = mount(AudioPlayerBar);
        expect(wrapper.text()).toContain('Al-Fatihah');
        expect(wrapper.text()).toContain('Mishary Rashid Alafasy');
    });

    it('emits open-reciter-modal when Qari button is clicked', async () => {
        const player = useQuranAudioPlayer();
        player.loadSurah(
            { id: 1, name_simple: 'Al-Fatihah' },
            { audio_url: 'https://example.com/1.mp3', verse_timings: [] },
            { id: 7, name: 'Mishary Rashid Alafasy' }
        );

        const wrapper = mount(AudioPlayerBar);
        const qariBtn = wrapper.find('button[title="Ganti Qari / Pembaca"]');
        expect(qariBtn.exists()).toBe(true);

        await qariBtn.trigger('click');
        expect(wrapper.emitted('open-reciter-modal')).toBeTruthy();
    });

    it('emits open-listen-together when Listen Together button is clicked', async () => {
        const wrapper = mount(AudioPlayerBar);
        const listenTogetherBtn = wrapper.find('button[title="Dengarkan Bersama (Realtime Sync)"]');
        expect(listenTogetherBtn.exists()).toBe(true);

        await listenTogetherBtn.trigger('click');
        expect(wrapper.emitted('open-listen-together')).toBeTruthy();
    });
});
