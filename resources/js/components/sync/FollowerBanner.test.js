import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import FollowerBanner from './FollowerBanner.vue';

describe('FollowerBanner.vue', () => {
    it('renders room code and connected listener count', () => {
        const wrapper = mount(FollowerBanner, {
            props: {
                roomCode: 'AK7F29',
                isConnected: true,
                listenerCount: 4,
            },
        });

        expect(wrapper.text()).toContain('ROOM AK7F29');
        expect(wrapper.text()).toContain('4 Pendengar');
        expect(wrapper.text()).toContain('Tersinkronisasi');
    });

    it('emits leave event when Keluar button is clicked', async () => {
        const wrapper = mount(FollowerBanner, {
            props: {
                roomCode: 'AK7F29',
            },
        });

        const leaveButton = wrapper.find('button');
        expect(leaveButton.exists()).toBe(true);
        await leaveButton.trigger('click');

        expect(wrapper.emitted('leave')).toBeTruthy();
    });
});
