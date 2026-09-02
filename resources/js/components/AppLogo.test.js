import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AppLogo from './AppLogo.vue';

describe('AppLogo Reusable Component', () => {
    it('renders clean icon-only variant correctly without text', () => {
        const wrapper = mount(AppLogo, {
            props: {
                variant: 'clean',
                size: 48,
            },
        });

        expect(wrapper.find('svg').exists()).toBe(true);
        expect(wrapper.text()).toBe('');
        expect(wrapper.find('.app-logo-icon').attributes('style')).toContain('width: 48px');
        expect(wrapper.find('.app-logo-icon').attributes('style')).toContain('height: 48px');
    });

    it('renders horizontal variant with Fraunces font, Anisul and primary Qur\'an text', () => {
        const wrapper = mount(AppLogo, {
            props: {
                variant: 'horizontal',
                subtitle: 'Sahabat Tilawah Interaktif',
            },
        });

        expect(wrapper.find('svg').exists()).toBe(true);
        expect(wrapper.find('.font-heading').exists()).toBe(true);
        expect(wrapper.text()).toContain('Anisul');
        expect(wrapper.text()).toContain('Qur\'an');
        expect(wrapper.find('.font-heading .text-primary').text()).toBe('Qur\'an');
        expect(wrapper.text()).toContain('Sahabat Tilawah Interaktif');
    });

    it('renders stacked / vertical variant correctly', () => {
        const wrapper = mount(AppLogo, {
            props: {
                variant: 'stacked',
                subtitle: 'Teman Mengaji',
            },
        });

        expect(wrapper.find('.app-logo-container').classes()).toContain('flex-col');
        expect(wrapper.text()).toContain('Anisul');
        expect(wrapper.text()).toContain('Qur\'an');
        expect(wrapper.text()).toContain('Teman Mengaji');
    });

    it('supports custom i18n subtitle via slot', () => {
        const wrapper = mount(AppLogo, {
            props: {
                variant: 'horizontal',
            },
            slots: {
                subtitle: '<span class="custom-i18n-slot">Interactive Quran Companion</span>',
            },
        });

        expect(wrapper.find('.custom-i18n-slot').exists()).toBe(true);
        expect(wrapper.text()).toContain('Interactive Quran Companion');
    });

    it('maintains backward compatibility when showText is passed', () => {
        const wrapperWithText = mount(AppLogo, {
            props: {
                showText: true,
                variant: 'clean',
            },
        });
        expect(wrapperWithText.text()).toContain('Anisul');
        expect(wrapperWithText.text()).toContain('Qur\'an');

        const wrapperWithoutText = mount(AppLogo, {
            props: {
                showText: false,
                variant: 'horizontal',
            },
        });
        expect(wrapperWithoutText.text()).toBe('');
    });
});
