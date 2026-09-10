import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
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

    it('copies code and displays tooltip when room is active', async () => {
        const { useRoomSync } = await import('@/composables/useRoomSync');
        const sync = useRoomSync();
        sync.roomCode.value = 'AK7F29';
        sync.joinUrl.value = 'http://anisul-quran.test/listen/AK7F29';

        document.execCommand = vi.fn().mockReturnValue(true);

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

        expect(wrapper.text()).toContain('AK7F29');
        const copyBtn = wrapper.findAll('button').find(b => b.text().includes('Salin Kode'));
        expect(copyBtn).toBeDefined();
        await copyBtn.trigger('click');
        await flushPromises();

        expect(wrapper.text()).toContain('Kode tersalin!');
    });
});
