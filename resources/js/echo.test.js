import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isEchoConfigured, getEcho, disconnectEcho } from './echo.js';

describe('echo.js - Laravel Echo Reverb Client', () => {
    beforeEach(() => {
        disconnectEcho();
        vi.clearAllMocks();
    });

    it('detects whether Reverb key is configured', () => {
        expect(typeof isEchoConfigured()).toBe('boolean');
    });

    it('provides getEcho singleton or null in SSR', () => {
        const instance = getEcho();
        if (isEchoConfigured()) {
            expect(instance).not.toBeNull();
            expect(window.Pusher).toBeDefined();
            expect(window.Echo).toBe(instance);
        } else {
            expect(instance).toBeNull();
        }
    });

    it('disconnects and resets echo instance cleanly', () => {
        const instance = getEcho();
        disconnectEcho();
        expect(window.Echo).toBeUndefined();
    });
});
