import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useTadabburAmbience } from './useTadabburAmbience';

class MockAudio {
    constructor() {
        this.src = '';
        this.volume = 1;
        this.loop = false;
        this.preload = '';
        this.listeners = {};
    }

    addEventListener(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }

    removeEventListener(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
        }
    }

    trigger(event) {
        if (this.listeners[event]) {
            this.listeners[event].forEach((cb) => cb());
        }
    }

    play() {
        this.trigger('playing');
        return Promise.resolve();
    }

    pause() {
        this.trigger('pause');
    }
}

describe('useTadabburAmbience', () => {
    let originalAudio;
    let originalStorage;
    let store = {};

    beforeEach(() => {
        originalAudio = global.Audio;
        global.Audio = MockAudio;

        store = {};
        originalStorage = global.localStorage;
        global.localStorage = {
            getItem: (key) => (key in store ? store[key] : null),
            setItem: (key, val) => {
                store[key] = String(val);
            },
            removeItem: (key) => {
                delete store[key];
            },
            clear: () => {
                store = {};
            },
        };

        const ambience = useTadabburAmbience();
        ambience.reset();
    });

    afterEach(() => {
        global.Audio = originalAudio;
        global.localStorage = originalStorage;
    });

    it('initializes with default volume 0.20 and unmuted state', () => {
        const ambience = useTadabburAmbience();
        ambience.init();

        expect(ambience.ambienceVolume.value).toBe(0.20);
        expect(ambience.isMuted.value).toBe(false);
        expect(ambience.isPlaying.value).toBe(false);
    });

    it('loads saved volume and mute preferences from localStorage', () => {
        store['anisul_tadabbur_volume'] = '0.45';
        store['anisul_tadabbur_muted'] = 'true';

        const ambience = useTadabburAmbience();
        ambience.init();

        expect(ambience.ambienceVolume.value).toBe(0.45);
        expect(ambience.isMuted.value).toBe(true);
    });

    it('plays audio and sets isPlaying to true', async () => {
        const ambience = useTadabburAmbience();
        await ambience.play('ocean');

        expect(ambience.activeThemeId.value).toBe('ocean');
        expect(ambience.isPlaying.value).toBe(true);
    });

    it('pauses audio and updates isPlaying to false', async () => {
        const ambience = useTadabburAmbience();
        await ambience.play('mountain');
        expect(ambience.isPlaying.value).toBe(true);

        ambience.pause();
        expect(ambience.isPlaying.value).toBe(false);
    });

    it('updates volume clamped between 0 and 1 and persists to localStorage', () => {
        const ambience = useTadabburAmbience();
        ambience.init();

        ambience.setVolume(0.65);
        expect(ambience.ambienceVolume.value).toBe(0.65);
        expect(store['anisul_tadabbur_volume']).toBe('0.65');

        ambience.setVolume(1.5);
        expect(ambience.ambienceVolume.value).toBe(1);

        ambience.setVolume(-0.2);
        expect(ambience.ambienceVolume.value).toBe(0);
    });

    it('toggles mute correctly and persists to localStorage', () => {
        const ambience = useTadabburAmbience();
        ambience.init();

        expect(ambience.isMuted.value).toBe(false);
        ambience.toggleMute();
        expect(ambience.isMuted.value).toBe(true);
        expect(store['anisul_tadabbur_muted']).toBe('true');

        ambience.toggleMute();
        expect(ambience.isMuted.value).toBe(false);
        expect(store['anisul_tadabbur_muted']).toBe('false');
    });

    it('changes theme ambience source cleanly', async () => {
        const ambience = useTadabburAmbience();
        await ambience.play('sunrise');
        expect(ambience.activeThemeId.value).toBe('sunrise');

        ambience.setTheme('cosmic');
        expect(ambience.activeThemeId.value).toBe('cosmic');
    });
});
