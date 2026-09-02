import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import SurahCard from './SurahCard.vue';

describe('SurahCard Component', () => {
    const mockChapter = {
        id: 1,
        name_simple: 'Al-Fatihah',
        name_arabic: 'الفاتحة',
        name_complex: 'Al-Fātihah',
        revelation_place: 'makkah',
        verses_count: 7,
        translated_name: {
            name: 'Pembukaan',
            language_name: 'indonesian',
        },
    };

    it('renders chapter metadata correctly', () => {
        const wrapper = mount(SurahCard, {
            props: {
                chapter: mockChapter,
            },
            global: {
                stubs: {
                    Link: {
                        template: '<a><slot /></a>',
                        props: ['href'],
                    },
                },
            },
        });

        expect(wrapper.text()).toContain('Al-Fatihah');
        expect(wrapper.text()).toContain('الفاتحة');
        expect(wrapper.text()).toContain('Pembukaan');
        expect(wrapper.text()).toContain('Makkiyah');
        expect(wrapper.text()).toContain('7 Ayat');
    });

    it('formats madaniyah revelation place correctly', () => {
        const madaniChapter = {
            ...mockChapter,
            id: 2,
            name_simple: 'Al-Baqarah',
            revelation_place: 'madinah',
            verses_count: 286,
        };

        const wrapper = mount(SurahCard, {
            props: {
                chapter: madaniChapter,
            },
            global: {
                stubs: {
                    Link: {
                        template: '<a><slot /></a>',
                        props: ['href'],
                    },
                },
            },
        });

        expect(wrapper.text()).toContain('Madaniyah');
        expect(wrapper.text()).toContain('286 Ayat');
    });
});
