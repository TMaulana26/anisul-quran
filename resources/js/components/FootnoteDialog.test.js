import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import FootnoteDialog from './FootnoteDialog.vue';

describe('FootnoteDialog Component', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('renders footnote details when open', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                footnote: {
                    id: 135060,
                    text: 'Allah mengatur langit dan bumi serta isinya.',
                },
            }),
        });

        const wrapper = mount(FootnoteDialog, {
            props: {
                modelValue: true,
                footnoteId: 135060,
                footnoteNumber: '1',
                verseKey: '3:2',
            },
            attachTo: document.body,
        });

        expect(document.body.textContent).toContain('Catatan Kaki Kemenag RI');
        expect(document.body.textContent).toContain('Ayat 3:2');
    });

    it('emits update:modelValue false when closed', async () => {
        const wrapper = mount(FootnoteDialog, {
            props: {
                modelValue: true,
                footnoteId: 135060,
            },
            attachTo: document.body,
        });

        const closeBtn = document.body.querySelector('button');
        expect(closeBtn).not.toBeNull();
        closeBtn.click();

        expect(wrapper.emitted('update:modelValue')).toBeTruthy();
        expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
    });
});
