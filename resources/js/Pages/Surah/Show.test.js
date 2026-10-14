import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import Show from './Show.vue';
import { useUserPreferences } from '@/composables/useUserPreferences';

vi.mock('@inertiajs/vue3', () => ({
    Link: {
        name: 'Link',
        template: '<a><slot /></a>',
    },
    router: {
        visit: vi.fn(),
        reload: vi.fn(),
    },
    usePage: () => ({
        props: {
            locale: 'id',
            translationInfo: {
                resourceId: 33,
                sourceName: 'Kemenag RI',
            },
            reciters: [],
        },
    }),
}));

vi.mock('@/composables/useRoomSync', () => ({
    useRoomSync: () => ({
        isHost: ref(false),
        isListener: ref(false),
        isConnected: ref(false),
        roomCode: ref(null),
        roomState: ref(null),
        listenerCount: ref(1),
        broadcastState: vi.fn(),
    }),
}));

describe('Surah/Show.vue', () => {
    const mockChapter = {
        id: 1,
        name_simple: 'Al-Fatihah',
        name_arabic: 'الفاتحة',
        revelation_place: 'makkah',
        verses_count: 7,
        translated_name: { name: 'Pembukaan' },
    };

    const mockVerses = [
        {
            id: 1,
            verse_number: 1,
            verse_key: '1:1',
            text_uthmani: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
            translations: [{ resource_id: 33, text: 'Dengan nama Allah...' }],
            words: [],
        },
    ];

    const mockRecitation = {
        audio_url: 'https://audio.qurancdn.com/Alafasy/001.mp3',
        verse_timings: [{ verse_key: '1:1', timestamp_from: 0, timestamp_to: 5000 }],
    };

    const mockReciters = [{ id: 7, name: 'Mishary Rashid Alafasy', reciter_name: 'Mishary Rashid Alafasy' }];

    beforeEach(() => {
        const prefs = useUserPreferences();
        prefs.setReadingMode('ayah');
    });

    const mountShow = (extraProps = {}) =>
        mount(Show, {
            props: {
                chapter: mockChapter,
                verses: mockVerses,
                recitation: mockRecitation,
                reciters: mockReciters,
                selectedReciterId: 7,
                prevChapter: null,
                nextChapter: { id: 2, name_simple: 'Al-Baqarah', name_arabic: 'البقرة' },
                ...extraProps,
            },
            global: {
                stubs: {
                    AppLayout: { template: '<div><slot /></div>' },
                    AyahItem: {
                        props: ['verse'],
                        template: '<div class="ayah-item-stub">{{ verse.verse_key }}</div>',
                    },
                    MushafPageView: {
                        template: '<div class="mushaf-view-stub" />',
                    },
                    AudioPlayerBar: {
                        name: 'AudioPlayerBar',
                        template: '<div class="audio-player-bar-stub" />',
                    },
                    ReciterSelectorModal: {
                        props: ['open'],
                        template: '<div class="reciter-modal-stub" :data-open="open" />',
                    },
                    KhusyuPlayerView: {
                        props: ['open'],
                        template: '<div class="khusyu-view-stub" :data-open="open" />',
                    },
                    TadabburPlayerView: {
                        props: ['open'],
                        template: '<div class="tadabbur-view-stub" :data-open="open" />',
                    },
                    ListenTogetherModal: {
                        props: ['open'],
                        template: '<div class="listen-modal-stub" :data-open="open" />',
                    },
                    SurahCompletionModal: true,
                },
            },
        });

    it('renders surah header, verses in ayah mode, and next chapter navigation', () => {
        const wrapper = mountShow();
        expect(wrapper.text()).toContain('Al-Fatihah');
        expect(wrapper.text()).toContain('الفاتحة');
        expect(wrapper.findAll('.ayah-item-stub')).toHaveLength(1);
        expect(wrapper.find('.mushaf-view-stub').exists()).toBe(false);
        expect(wrapper.text()).toContain('Al-Baqarah');
    });

    it('switches between ayah view and mushaf page view', async () => {
        const wrapper = mountShow();
        const prefs = useUserPreferences();

        prefs.setReadingMode('mushaf');
        await wrapper.vm.$nextTick();

        expect(wrapper.find('.mushaf-view-stub').exists()).toBe(true);
        expect(wrapper.findAll('.ayah-item-stub')).toHaveLength(0);
    });

    it('opens Khusyu and Tadabbur modes when triggered from AudioPlayerBar events', async () => {
        const wrapper = mountShow();
        const playerBar = wrapper.findComponent({ name: 'AudioPlayerBar' });

        await playerBar.vm.$emit('open-tadabbur-mode');
        await wrapper.vm.$nextTick();
        expect(wrapper.find('.tadabbur-view-stub').attributes('data-open')).toBe('true');

        await playerBar.vm.$emit('open-listen-together');
        await wrapper.vm.$nextTick();
        expect(wrapper.find('.listen-modal-stub').attributes('data-open')).toBe('true');
    });
});
