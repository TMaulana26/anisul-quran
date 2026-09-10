import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateDrift, getDeviceId, useRoomSync } from './useRoomSync.js';

describe('useRoomSync - Drift Correction & Room State', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calculates drift accurately when playing', () => {
        const nowMs = 10000;
        const hostUpdatedAtMs = 8000; // 2 seconds ago
        const hostTimestampMs = 15000; // was at 15s when updated

        // Expected host position: 15s + 2s elapsed = 17s
        // Local audio is at 17s (in perfect sync)
        const inSync = calculateDrift(17, hostTimestampMs, hostUpdatedAtMs, nowMs, true);
        expect(inSync.estimatedHostSec).toBeCloseTo(17, 1);
        expect(inSync.absDriftSec).toBeCloseTo(0, 1);

        // Local audio is at 16.5s (0.5s behind host)
        const behind = calculateDrift(16.5, hostTimestampMs, hostUpdatedAtMs, nowMs, true);
        expect(behind.driftSec).toBeCloseTo(-0.5, 1);
        expect(behind.absDriftSec).toBeCloseTo(0.5, 1);

        // Local audio is at 17.8s (0.8s ahead of host)
        const ahead = calculateDrift(17.8, hostTimestampMs, hostUpdatedAtMs, nowMs, true);
        expect(ahead.driftSec).toBeCloseTo(0.8, 1);
        expect(ahead.absDriftSec).toBeCloseTo(0.8, 1);
    });

    it('freezes elapsed time when audio is paused', () => {
        const nowMs = 50000;
        const hostUpdatedAtMs = 10000; // 40 seconds ago
        const hostTimestampMs = 25000; // 25s

        // When paused, host audio position is strictly 25s regardless of elapsed time
        const paused = calculateDrift(25, hostTimestampMs, hostUpdatedAtMs, nowMs, false);
        expect(paused.estimatedHostSec).toBe(25);
        expect(paused.absDriftSec).toBe(0);
    });

    it('generates and persists device ID', () => {
        const id = getDeviceId();
        expect(id).toBeDefined();
        expect(typeof id).toBe('string');
        expect(id.length).toBeGreaterThan(5);
    });

    it('initializes composable with clean initial state', () => {
        const sync = useRoomSync();
        expect(sync.roomCode.value).toBe(null);
        expect(sync.isHost.value).toBe(false);
        expect(sync.isListener.value).toBe(false);
        expect(sync.isConnected.value).toBe(false);
        expect(typeof sync.createRoom).toBe('function');
        expect(typeof sync.broadcastState).toBe('function');
        expect(typeof sync.startListening).toBe('function');
    });
});
