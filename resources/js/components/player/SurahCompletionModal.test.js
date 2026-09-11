import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import SurahCompletionModal from './SurahCompletionModal.vue';

describe('SurahCompletionModal.vue', () => {
    const mockChapter = {
        id: 1,
        name_simple: 'Al-Fatihah',
        name_arabic: 'الفاتحة',
    };

    const mockNextChapter = {
        id: 2,
        name_simple: 'Al-Baqarah',
        name_arabic: 'البقرة',
    };

    const mockReciter = {
        id: 7,
        name: 'Mishary Rashid Alafasy',
    };

    it('renders completion modal with chapter and next chapter info', () => {
        const wrapper = mount(SurahCompletionModal, {
            props: {
                open: true,
                chapter: mockChapter,
                nextChapter: mockNextChapter,
                reciter: mockReciter,
            },
            global: {
                stubs: {
                    Teleport: true,
                },
            },
        });

        expect(wrapper.text()).toContain('Alhamdulillah');
        expect(wrapper.text()).toContain('Al-Fatihah');
        expect(wrapper.text()).toContain('الفاتحة');
        expect(wrapper.text()).toContain('Putar Surah Selanjutnya');
        expect(wrapper.text()).toContain('Al-Baqarah');
        expect(wrapper.text()).toContain('البقرة');
        expect(wrapper.text()).toContain('Mishary Rashid Alafasy');
    });

    it('emits play-next with next chapter when primary button is clicked', async () => {
        const wrapper = mount(SurahCompletionModal, {
            props: {
                open: true,
                chapter: mockChapter,
                nextChapter: mockNextChapter,
                reciter: mockReciter,
            },
            global: {
                stubs: {
                    Teleport: true,
                },
            },
        });

        const playNextBtn = wrapper.findAll('button').find(b => b.text().includes('Putar Surah Selanjutnya'));
        expect(playNextBtn).toBeDefined();
        await playNextBtn.trigger('click');

        expect(wrapper.emitted('play-next')).toBeTruthy();
        expect(wrapper.emitted('play-next')[0][0]).toEqual(mockNextChapter);
    });

    it('loops back to Surah 1 (Al-Fatihah) when nextChapter is null (Surah 114)', async () => {
        const surahAnNas = {
            id: 114,
            name_simple: 'An-Nas',
            name_arabic: 'الناس',
        };

        const wrapper = mount(SurahCompletionModal, {
            props: {
                open: true,
                chapter: surahAnNas,
                nextChapter: null,
                reciter: mockReciter,
            },
            global: {
                stubs: {
                    Teleport: true,
                },
            },
        });

        expect(wrapper.text()).toContain('Alhamdulillah');
        expect(wrapper.text()).toContain('Putar Surah Selanjutnya');
        expect(wrapper.text()).toContain('Al-Fatihah');

        const playNextBtn = wrapper.findAll('button').find(b => b.text().includes('Putar Surah Selanjutnya'));
        await playNextBtn.trigger('click');

        expect(wrapper.emitted('play-next')).toBeTruthy();
        expect(wrapper.emitted('play-next')[0][0]).toEqual({
            id: 1,
            name_simple: 'Al-Fatihah',
            name_arabic: 'الفاتحة',
        });
    });

    it('emits back-to-index when Kembali ke Daftar Surah is clicked', async () => {
        const wrapper = mount(SurahCompletionModal, {
            props: {
                open: true,
                chapter: mockChapter,
                nextChapter: mockNextChapter,
                reciter: mockReciter,
            },
            global: {
                stubs: {
                    Teleport: true,
                },
            },
        });

        const backBtn = wrapper.findAll('button').find(b => b.text().includes('Kembali ke Daftar Surah'));
        expect(backBtn).toBeDefined();
        await backBtn.trigger('click');

        expect(wrapper.emitted('back-to-index')).toBeTruthy();
    });

    it('emits replay when Putar Ulang is clicked', async () => {
        const wrapper = mount(SurahCompletionModal, {
            props: {
                open: true,
                chapter: mockChapter,
                nextChapter: mockNextChapter,
                reciter: mockReciter,
            },
            global: {
                stubs: {
                    Teleport: true,
                },
            },
        });

        const replayBtn = wrapper.findAll('button').find(b => b.text().includes('Putar Ulang'));
        expect(replayBtn).toBeDefined();
        await replayBtn.trigger('click');

        expect(wrapper.emitted('replay')).toBeTruthy();
    });

    it('emits update:open false when close button (X) is clicked', async () => {
        const wrapper = mount(SurahCompletionModal, {
            props: {
                open: true,
                chapter: mockChapter,
                nextChapter: mockNextChapter,
                reciter: mockReciter,
            },
            global: {
                stubs: {
                    Teleport: true,
                },
            },
        });

        const closeBtn = wrapper.find('button[aria-label="Tutup Dialog"]');
        expect(closeBtn.exists()).toBe(true);
        await closeBtn.trigger('click');

        expect(wrapper.emitted('update:open')).toBeTruthy();
        expect(wrapper.emitted('update:open')[0]).toEqual([false]);
    });

    it('emits update:open false when Tutup button is clicked', async () => {
        const wrapper = mount(SurahCompletionModal, {
            props: {
                open: true,
                chapter: mockChapter,
                nextChapter: mockNextChapter,
                reciter: mockReciter,
            },
            global: {
                stubs: {
                    Teleport: true,
                },
            },
        });

        const tutupBtn = wrapper.findAll('button').find(b => b.text() === 'Tutup');
        expect(tutupBtn).toBeDefined();
        await tutupBtn.trigger('click');

        expect(wrapper.emitted('update:open')).toBeTruthy();
        expect(wrapper.emitted('update:open')[0]).toEqual([false]);
    });
});
