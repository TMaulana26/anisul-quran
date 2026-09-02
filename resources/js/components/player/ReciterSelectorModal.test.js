import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ReciterSelectorModal from './ReciterSelectorModal.vue';

describe('ReciterSelectorModal.vue', () => {
    const mockReciters = [
        { id: 7, name: 'Mishary Rashid Alafasy', style: 'Murattal' },
        { id: 4, name: 'Mahmoud Khalil Al-Husary', style: 'Murattal' },
        { id: 1, name: 'AbdulBaset AbdulSamad', style: 'Mujawwad' },
    ];

    it('renders list of reciters when open is true', () => {
        const wrapper = mount(ReciterSelectorModal, {
            props: {
                open: true,
                reciters: mockReciters,
                selectedReciterId: 7,
            },
            global: {
                stubs: {
                    Teleport: true,
                },
            },
        });

        expect(wrapper.text()).toContain('Pilih Qari Murottal');
        expect(wrapper.text()).toContain('Mishary Rashid Alafasy');
        expect(wrapper.text()).toContain('Mahmoud Khalil Al-Husary');
        expect(wrapper.text()).toContain('AbdulBaset AbdulSamad');
    });

    it('filters reciters by search input', async () => {
        const wrapper = mount(ReciterSelectorModal, {
            props: {
                open: true,
                reciters: mockReciters,
                selectedReciterId: 7,
            },
            global: {
                stubs: {
                    Teleport: true,
                },
            },
        });

        const input = wrapper.find('input[type="text"]');
        await input.setValue('Husary');

        expect(wrapper.text()).toContain('Mahmoud Khalil Al-Husary');
        expect(wrapper.text()).not.toContain('Mishary Rashid Alafasy');
    });

    it('emits select-reciter when a reciter card is clicked', async () => {
        const wrapper = mount(ReciterSelectorModal, {
            props: {
                open: true,
                reciters: mockReciters,
                selectedReciterId: 7,
            },
            global: {
                stubs: {
                    Teleport: true,
                },
            },
        });

        const buttons = wrapper.findAll('button[type="button"]');
        const husaryBtn = buttons.find(b => b.text().includes('Mahmoud Khalil Al-Husary'));
        expect(husaryBtn).toBeDefined();

        await husaryBtn.trigger('click');
        expect(wrapper.emitted('select-reciter')).toBeTruthy();
        expect(wrapper.emitted('select-reciter')[0][0].id).toBe(4);
    });
});
