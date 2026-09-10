import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ListenTogetherModal from './ListenTogetherModal.vue';

describe('ListenTogetherModal.vue', () => {
    it('renders modal when open is true', () => {
        const wrapper = mount(ListenTogetherModal, {
            props: {
                open: true,
            },
            global: {
                stubs: {
                    Teleport: true,
                    Transition: true,
                },
            },
        });

        expect(wrapper.text()).toContain('Dengar Bersama');
        expect(wrapper.text()).toContain('Mulai Sesi Dengar Bersama');
    });

    it('emits update:open false when close button is clicked', async () => {
        const wrapper = mount(ListenTogetherModal, {
            props: {
                open: true,
            },
            global: {
                stubs: {
                    Teleport: true,
                    Transition: true,
                },
            },
        });

        const closeBtn = wrapper.find('button[aria-label="Tutup Dialog"]');
        expect(closeBtn.exists()).toBe(true);
        await closeBtn.trigger('click');

        expect(wrapper.emitted('update:open')).toBeTruthy();
        expect(wrapper.emitted('update:open')[0]).toEqual([false]);
    });
});
