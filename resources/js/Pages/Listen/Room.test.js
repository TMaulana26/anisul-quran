import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Room from './Room.vue';
import { useQuranAudioPlayer } from '@/composables/useQuranAudioPlayer';

vi.mock('@inertiajs/vue3', () => ({
    router: {
        visit: vi.fn(),
    },
    Link: {
        name: 'Link',
        template: '<a><slot /></a>',
    },
    usePage: () => ({
        props: {
            appUrl: 'http://localhost',
            auth: { user: null },
        },
    }),
}));

import { ref } from 'vue';

vi.mock('@/composables/useRoomSync', () => ({
    useRoomSync: () => ({
        isConnected: ref(true),
        listenerCount: ref(1),
        roomState: ref(null),
        startListening: vi.fn(),
        leaveRoom: vi.fn(),
    }),
    calculateDrift: vi.fn(() => ({ estimatedHostSec: 0, absDriftSec: 0 })),
}));

describe('Room.vue', () => {
    const mockRoom = {
        code: 'X2FXJ8',
        surahId: 1,
        ayahNumber: 1,
        status: 'playing',
        reciterId: 7,
        timestampMs: 0,
        listenerCount: 2,
    };

    const mockChapter = {
        id: 1,
        name_simple: 'Al-Fatihah',
        name_arabic: 'الفاتحة',
        verses_count: 7,
    };

    const mockRecitation = {
        audio_url: 'https://example.com/audio.mp3',
        verse_timings: [],
    };

    it('renders Windows 11 style volume slider and percentage in Room audio control bar', async () => {
        const player = useQuranAudioPlayer();
        player.setVolume(0.75);

        const wrapper = mount(Room, {
            props: {
                room: mockRoom,
                roomCode: 'X2FXJ8',
                chapter: mockChapter,
                verses: [],
                recitation: mockRecitation,
            },
            global: {
                stubs: {
                    AppLayout: {
                        template: '<div><slot /></div>',
                    },
                    AyahItem: true,
                    FollowerBanner: {
                        props: ['roomCode', 'isConnected', 'listenerCount', 'status', 'ayahNumber'],
                        template: '<div class="follower-banner-stub" />',
                    },
                },
            },
        });

        const volumeSlider = wrapper.find('input.volume-slider');
        expect(volumeSlider.exists()).toBe(true);
        expect(volumeSlider.attributes('style')).toContain('--slider-progress: 75%');
        expect(wrapper.text()).toContain('75%');
    });

    it('updates volume percentage to 0% when muted', async () => {
        const player = useQuranAudioPlayer();
        player.setVolume(0.8);
        if (!player.isMuted.value) {
            player.toggleMute();
        }

        const wrapper = mount(Room, {
            props: {
                room: mockRoom,
                roomCode: 'X2FXJ8',
                chapter: mockChapter,
                verses: [],
                recitation: mockRecitation,
            },
            global: {
                stubs: {
                    AppLayout: {
                        template: '<div><slot /></div>',
                    },
                    AyahItem: true,
                    FollowerBanner: {
                        props: ['roomCode', 'isConnected', 'listenerCount', 'status', 'ayahNumber'],
                        template: '<div class="follower-banner-stub" />',
                    },
                },
            },
        });

        const volumeSlider = wrapper.find('input.volume-slider');
        expect(volumeSlider.exists()).toBe(true);
        expect(volumeSlider.attributes('style')).toContain('--slider-progress: 0%');
        expect(wrapper.text()).toContain('0%');

        // Restore mute state
        player.toggleMute();
    });
});
