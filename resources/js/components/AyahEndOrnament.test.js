import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AyahEndOrnament from './AyahEndOrnament.vue';

describe('AyahEndOrnament.vue', () => {
    it('renders Eastern Arabic-Indic numeral for single digit', () => {
        const wrapper = mount(AyahEndOrnament, {
            props: {
                verseNumber: 2,
            },
        });

        expect(wrapper.text()).toContain('٢');
        expect(wrapper.attributes('title')).toBe('Ayat 2');
    });

    it('renders Eastern Arabic-Indic numeral for multi-digit numbers (e.g. 255)', () => {
        const wrapper = mount(AyahEndOrnament, {
            props: {
                verseNumber: 255,
                size: 'zen',
                isActive: true,
            },
        });

        expect(wrapper.text()).toContain('٢٥٥');
        expect(wrapper.classes()).toContain('w-8.5');
    });
});
