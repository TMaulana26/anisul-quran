import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Index from './Index.vue';

vi.mock('@inertiajs/vue3', () => ({
    Link: {
        name: 'Link',
        template: '<a><slot /></a>',
    },
    Head: {
        name: 'Head',
        template: '<div />',
    },
    usePage: () => ({
        props: {
            locale: 'id',
            reciters: [],
        },
    }),
    router: {
        reload: vi.fn(),
    },
}));

describe('Surah/Index.vue', () => {
    const mockChapters = [
        {
            id: 1,
            name_simple: 'Al-Fatihah',
            name_arabic: 'الفاتحة',
            revelation_place: 'makkah',
            verses_count: 7,
            translated_name: { name: 'Pembukaan' },
        },
        {
            id: 2,
            name_simple: 'Al-Baqarah',
            name_arabic: 'البقرة',
            revelation_place: 'madinah',
            verses_count: 286,
            translated_name: { name: 'Sapi Betina' },
        },
    ];

    const mountIndex = (chapters = mockChapters) =>
        mount(Index, {
            props: {
                chapters,
                reciters: [{ id: 7, name: 'Mishari Rashid Alafasy' }],
            },
            global: {
                stubs: {
                    AppLayout: { template: '<div><slot /></div>' },
                    DecorativeMoon: true,
                    SurahCard: {
                        props: ['chapter'],
                        template: '<div class="surah-card-stub">{{ chapter.name_simple }}</div>',
                    },
                },
            },
        });

    it('renders all surah cards by default', () => {
        const wrapper = mountIndex();
        const cards = wrapper.findAll('.surah-card-stub');
        expect(cards).toHaveLength(2);
        expect(wrapper.text()).toContain('Al-Fatihah');
        expect(wrapper.text()).toContain('Al-Baqarah');
    });

    it('filters chapters by search query', async () => {
        const wrapper = mountIndex();
        const searchInput = wrapper.find('input[type="text"]');

        await searchInput.setValue('Baqarah');
        const cards = wrapper.findAll('.surah-card-stub');
        expect(cards).toHaveLength(1);
        expect(cards[0].text()).toBe('Al-Baqarah');
    });

    it('filters chapters by revelation place (Makkiyah vs Madaniyah)', async () => {
        const wrapper = mountIndex();
        const buttons = wrapper.findAll('button');
        const madinahBtn = buttons.find((b) => b.text().includes('Madaniyah'));

        expect(madinahBtn).toBeDefined();
        await madinahBtn.trigger('click');

        const cards = wrapper.findAll('.surah-card-stub');
        expect(cards).toHaveLength(1);
        expect(cards[0].text()).toBe('Al-Baqarah');
    });

    it('shows empty state and resets search when no chapters match', async () => {
        const wrapper = mountIndex();
        const searchInput = wrapper.find('input[type="text"]');

        await searchInput.setValue('SurahTidakAda');
        expect(wrapper.findAll('.surah-card-stub')).toHaveLength(0);

        const resetButtons = wrapper.findAll('button');
        const clearBtn = resetButtons[resetButtons.length - 1];
        await clearBtn.trigger('click');

        expect(wrapper.findAll('.surah-card-stub')).toHaveLength(2);
    });
});
