import { ref, computed, onUnmounted } from 'vue';

// Shared singleton state for rooms
const roomCode = ref(null);
const isHost = ref(false);
const isListener = ref(false);
const isConnected = ref(false);
const listenerCount = ref(1);
const roomState = ref(null);
const isSyncing = ref(false);
const lastSyncError = ref(null);
const joinUrl = ref('');

let pollTimer = null;
let heartbeatTimer = null;
let lastSyncTimestamp = 0;
const SYNC_THROTTLE_MS = 250;

/**
 * Get or generate persistent device identifier
 */
export function getDeviceId() {
    let id = null;
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            id = window.localStorage.getItem('anisul_device_id');
        }
    } catch (e) {
        // Fallback for SSR or environments without localStorage
    }

    if (!id) {
        id = 'dev_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem('anisul_device_id', id);
            }
        } catch (e) {
            // Ignore storage set errors
        }
    }
    return id;
}

/**
 * Calculate drift between listener audio and host playback
 * 
 * @param {number} localSec - Local audio currentTime in seconds
 * @param {number} hostTimestampMs - Host recorded position in milliseconds
 * @param {number} hostUpdatedAtMs - Time Host sent the update in milliseconds
 * @param {number} nowMs - Current time in milliseconds
 * @returns {{ estimatedHostSec: number, driftSec: number, absDriftSec: number }}
 */
export function calculateDrift(localSec, hostTimestampMs, hostUpdatedAtMs, nowMs = Date.now(), isPlaying = true) {
    const elapsedMs = isPlaying ? Math.max(0, nowMs - hostUpdatedAtMs) : 0;
    const estimatedHostSec = Math.max(0, (hostTimestampMs + elapsedMs) / 1000);
    const driftSec = localSec - estimatedHostSec;
    return {
        estimatedHostSec,
        driftSec,
        absDriftSec: Math.abs(driftSec),
    };
}

export function useRoomSync() {
    const deviceId = getDeviceId();

    /**
     * Stop all background timers
     */
    const stopTimers = () => {
        if (pollTimer) {
            clearInterval(pollTimer);
            pollTimer = null;
        }
        if (heartbeatTimer) {
            clearInterval(heartbeatTimer);
            heartbeatTimer = null;
        }
    };

    /**
     * Send heartbeat to keep presence and receive listener count
     */
    const sendHeartbeat = async () => {
        if (!roomCode.value) return;
        try {
            const res = await fetch(`/api/rooms/${roomCode.value}/heartbeat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    deviceId,
                    role: isHost.value ? 'host' : 'listener',
                }),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.listenerCount !== undefined) {
                    listenerCount.value = data.listenerCount;
                }
            }
        } catch (e) {
            // Heartbeat failure is non-fatal; will retry next interval
        }
    };

    /**
     * Host: Create a new room
     */
    const createRoom = async (initialState = {}) => {
        stopTimers();
        isSyncing.value = true;
        lastSyncError.value = null;

        try {
            const res = await fetch('/api/rooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    hostDeviceId: deviceId,
                    surahId: initialState.surahId ?? 1,
                    ayahNumber: initialState.ayahNumber ?? 1,
                    timestampMs: Math.round((initialState.currentTime ?? 0) * 1000),
                    status: initialState.isPlaying ? 'playing' : 'paused',
                    reciterId: initialState.reciterId ?? 7,
                    mushafType: initialState.mushafType ?? 'uthmani',
                }),
            });

            if (!res.ok) {
                throw new Error('Gagal membuat room sesi.');
            }

            const data = await res.json();
            const room = data.room;

            roomCode.value = room.code;
            isHost.value = true;
            isListener.value = false;
            isConnected.value = true;
            listenerCount.value = room.listenerCount || 1;
            roomState.value = room;
            joinUrl.value = room.joinUrl || `${window.location.origin}/listen/${room.code}`;

            // Start host heartbeat (every 15s)
            heartbeatTimer = setInterval(sendHeartbeat, 15000);

            return room;
        } catch (err) {
            lastSyncError.value = err.message;
            throw err;
        } finally {
            isSyncing.value = false;
        }
    };

    /**
     * Host: Broadcast state change to backend with throttling
     */
    const broadcastState = async (state) => {
        if (!isHost.value || !roomCode.value) return;

        const now = Date.now();
        // Skip throttled updates unless forced (e.g. play/pause/surah changes)
        const isCriticalChange = state.force || state.statusChange;
        if (!isCriticalChange && now - lastSyncTimestamp < SYNC_THROTTLE_MS) {
            return;
        }
        lastSyncTimestamp = now;

        const payload = {
            hostDeviceId: deviceId,
            surahId: state.surahId,
            ayahNumber: state.ayahNumber,
            timestampMs: Math.round((state.currentTime ?? 0) * 1000),
            status: state.isPlaying ? 'playing' : 'paused',
            reciterId: state.reciterId,
            mushafType: state.mushafType,
        };

        try {
            const res = await fetch(`/api/rooms/${roomCode.value}/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.room) {
                    roomState.value = data.room;
                    listenerCount.value = data.room.listenerCount;
                }
            }
        } catch (err) {
            // Background sync error - will catch up on next tick
        }
    };

    /**
     * Host: Close and destroy the room session
     */
    const closeRoom = async () => {
        if (!roomCode.value) return;
        const code = roomCode.value;
        stopTimers();

        try {
            await fetch(`/api/rooms/${code}`, {
                method: 'DELETE',
                headers: { 'Accept': 'application/json' },
            });
        } catch (e) {
            // Ignore delete failure
        } finally {
            roomCode.value = null;
            isHost.value = false;
            isListener.value = false;
            isConnected.value = false;
            roomState.value = null;
            listenerCount.value = 1;
            joinUrl.value = '';
        }
    };

    /**
     * Listener: Start listening to a room session
     * 
     * @param {string} code 
     * @param {Function} onSyncUpdate - callback with (newRoomState, drift)
     * @param {Function} onRoomClosed - callback when room ends
     */
    const startListening = (code, onSyncUpdate, onRoomClosed) => {
        stopTimers();
        roomCode.value = code.toUpperCase().trim();
        isHost.value = false;
        isListener.value = true;
        isConnected.value = true;
        joinUrl.value = typeof window !== 'undefined' ? window.location.href : '';

        // Immediate poll
        const poll = async () => {
            if (!roomCode.value) return;
            try {
                const res = await fetch(`/api/rooms/${roomCode.value}`, {
                    headers: { 'Accept': 'application/json' },
                });

                if (res.status === 404) {
                    isConnected.value = false;
                    stopTimers();
                    if (onRoomClosed) onRoomClosed();
                    return;
                }

                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.room) {
                        isConnected.value = true;
                        roomState.value = data.room;
                        listenerCount.value = data.room.listenerCount || 1;
                        if (onSyncUpdate) {
                            onSyncUpdate(data.room);
                        }
                    }
                }
            } catch (err) {
                // Temporary network blip
            }
        };

        poll();
        // High-frequency polling (1800ms) for responsive audio sync
        pollTimer = setInterval(poll, 1800);
        // Listener presence heartbeat (15s)
        heartbeatTimer = setInterval(sendHeartbeat, 15000);
        sendHeartbeat();
    };

    /**
     * Listener: Leave the room
     */
    const leaveRoom = () => {
        stopTimers();
        roomCode.value = null;
        isHost.value = false;
        isListener.value = false;
        isConnected.value = false;
        roomState.value = null;
        listenerCount.value = 1;
    };

    return {
        // State
        roomCode,
        isHost,
        isListener,
        isConnected,
        listenerCount,
        roomState,
        isSyncing,
        lastSyncError,
        joinUrl,
        deviceId,

        // Actions
        createRoom,
        broadcastState,
        closeRoom,
        startListening,
        leaveRoom,
        sendHeartbeat,
    };
}
