import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import SettingsDrawer from './SettingsDrawer.vue';

describe('SettingsDrawer.vue', () => {
    const defaultProps = {
        open: true,
        readingMode: 'ayah',
        mushafType: 'uthmani',
        arabicFontSize: 28,
        showTranslation: true,
        showTransliteration: true,
        autoScrollEnabled: true,
        autoZenOnPlay: true,
        reciters: [
            { id: 7, name: 'Mishary Rashid Alafasy', style: 'Murattal' },
            { id: 1, name: 'AbdulBaset AbdulSamad', style: 'Mujawwad' },
        ],
        selectedReciterId: 7,
    };

    it('renders right drawer settings when open is true in global mode', () => {
        const wrapper = mount(SettingsDrawer, {
            props: defaultProps,
            global: {
                stubs: {
                    Teleport: true,
                    Transition: false,
                },
            },
        });

        expect(wrapper.text()).toContain('Pengaturan & Preferensi');
        expect(wrapper.text()).toContain('Qari Default');
        expect(wrapper.text()).toContain('Mode Baca Default');
        expect(wrapper.text()).toContain('Mode Zen Saat Putar');
        expect(wrapper.text()).toContain('Gaya Rasm Bawaan');
        expect(wrapper.text()).toContain('Ukuran Kaligrafi Bawaan');
        expect(wrapper.text()).toContain('Global');
    });

    it('renders contextual surah indicator and tabs when chapter prop is passed', () => {
        const wrapper = mount(SettingsDrawer, {
            props: {
                ...defaultProps,
                chapter: {
                    id: 1,
                    name_simple: 'Al-Fatihah',
                    name_arabic: 'الفاتحة',
                    verses_count: 7,
                },
            },
            global: {
                stubs: {
                    Teleport: true,
                    Transition: false,
                },
            },
        });

        expect(wrapper.text()).toContain('Surah Al-Fatihah');
        expect(wrapper.text()).toContain('Surah Aktif');
        expect(wrapper.text()).toContain('Surah Ini');
        expect(wrapper.text()).toContain('Preferensi Global');
    });

    it('emits update:autoZenOnPlay when toggle is clicked', async () => {
        const wrapper = mount(SettingsDrawer, {
            props: defaultProps,
            global: {
                stubs: {
                    Teleport: true,
                    Transition: false,
                },
            },
        });

        const switches = wrapper.findAll('button[role="switch"]');
        expect(switches.length).toBeGreaterThan(0);

        // Click the first switch (auto zen)
        await switches[0].trigger('click');
        expect(wrapper.emitted('update:autoZenOnPlay')).toBeTruthy();
        expect(wrapper.emitted('update:autoZenOnPlay')[0]).toEqual([false]);
    });

    it('emits select-reciter when reciter dropdown changes', async () => {
        const wrapper = mount(SettingsDrawer, {
            props: defaultProps,
            global: {
                stubs: {
                    Teleport: true,
                    Transition: false,
                },
            },
        });

        const select = wrapper.find('select');
        await select.setValue('1');

        expect(wrapper.emitted('select-reciter')).toBeTruthy();
        expect(wrapper.emitted('select-reciter')[0][0].id).toBe(1);
    });

    it('emits update:readingMode when reading mode buttons are clicked', async () => {
        const wrapper = mount(SettingsDrawer, {
            props: defaultProps,
            global: {
                stubs: {
                    Teleport: true,
                    Transition: false,
                },
            },
        });

        const buttons = wrapper.findAll('button');
        const mushafBtn = buttons.find(b => b.text().includes('Mushaf Fisik'));
        expect(mushafBtn).toBeTruthy();

        await mushafBtn.trigger('click');
        expect(wrapper.emitted('update:readingMode')).toBeTruthy();
        expect(wrapper.emitted('update:readingMode')[0]).toEqual(['mushaf']);
    });
});
