import { ref, computed, onUnmounted } from 'vue';
import { getEcho } from '@/echo';

// Shared singleton state for rooms
const roomCode = ref(null);
const isHost = ref(false);
const isListener = ref(false);
const isConnected = ref(false);
const isWebSocketConnected = ref(false);
const listenerCount = ref(1);
const roomState = ref(null);
const isSyncing = ref(false);
const lastSyncError = ref(null);
const joinUrl = ref('');

let pollTimer = null;
let heartbeatTimer = null;
let activeChannel = null;
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
     * Clean up Echo channel subscription
     */
    const cleanupEcho = () => {
        if (activeChannel && roomCode.value) {
            const echo = getEcho();
            if (echo) {
                try {
                    echo.leave(`room.${roomCode.value}`);
                } catch {
                    // Ignore channel leave error
                }
            }
            activeChannel = null;
        }
        isWebSocketConnected.value = false;
    };

    /**
     * Host: Close and destroy the room session
     */
    const closeRoom = async () => {
        if (!roomCode.value) return;
        const code = roomCode.value;
        stopTimers();
        cleanupEcho();

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
     * Listener: Start listening to a room session via WebSocket (with HTTP fallback)
     * 
     * @param {string} code 
     * @param {Function} onSyncUpdate - callback with (newRoomState)
     * @param {Function} onRoomClosed - callback when room ends
     */
    const startListening = (code, onSyncUpdate, onRoomClosed) => {
        stopTimers();
        cleanupEcho();

        const normalizedCode = code.toUpperCase().trim();
        roomCode.value = normalizedCode;
        isHost.value = false;
        isListener.value = true;
        isConnected.value = true;
        joinUrl.value = typeof window !== 'undefined' ? window.location.href : '';

        // Fallback polling helper (runs only if WebSocket is disconnected or unavailable)
        const startFallbackPolling = () => {
            if (pollTimer) return;
            pollTimer = setInterval(async () => {
                if (!roomCode.value) return;
                // If WebSocket is connected, suspend HTTP polling
                if (isWebSocketConnected.value) {
                    if (pollTimer) {
                        clearInterval(pollTimer);
                        pollTimer = null;
                    }
                    return;
                }

                try {
                    const res = await fetch(`/api/rooms/${roomCode.value}`, {
                        headers: { 'Accept': 'application/json' },
                    });

                    if (res.status === 404) {
                        isConnected.value = false;
                        stopTimers();
                        cleanupEcho();
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
                } catch {
                    // Temporary network blip
                }
            }, 3000);
        };

        // 1. Immediate initial fetch to load current room state
        const fetchInitialState = async () => {
            if (!roomCode.value) return;
            try {
                const res = await fetch(`/api/rooms/${roomCode.value}`, {
                    headers: { 'Accept': 'application/json' },
                });

                if (res.status === 404) {
                    isConnected.value = false;
                    stopTimers();
                    cleanupEcho();
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
            } catch {
                // Ignore initial network fetch error
            }
        };

        fetchInitialState();

        // 2. Connect to Laravel Reverb via Echo (< 50ms broadcast)
        const echo = getEcho();
        if (echo) {
            try {
                activeChannel = echo.channel(`room.${normalizedCode}`);

                // Real-time audio sync event from Host
                activeChannel.listen('.RoomSyncEvent', (event) => {
                    if (event && event.room) {
                        isConnected.value = true;
                        isWebSocketConnected.value = true;
                        roomState.value = event.room;
                        if (event.room.listenerCount !== undefined) {
                            listenerCount.value = event.room.listenerCount;
                        }
                        if (onSyncUpdate) {
                            onSyncUpdate(event.room);
                        }
                    }
                });

                // Real-time room closed event
                activeChannel.listen('.RoomClosedEvent', () => {
                    isConnected.value = false;
                    stopTimers();
                    cleanupEcho();
                    if (onRoomClosed) {
                        onRoomClosed();
                    }
                });

                // Monitor Pusher connection state for auto-fallback
                const pusher = echo.connector?.pusher;
                if (pusher?.connection) {
                    const connection = pusher.connection;
                    isWebSocketConnected.value = connection.state === 'connected';

                    connection.bind('connected', () => {
                        isWebSocketConnected.value = true;
                        if (pollTimer) {
                            clearInterval(pollTimer);
                            pollTimer = null;
                        }
                    });

                    connection.bind('disconnected', () => {
                        isWebSocketConnected.value = false;
                        startFallbackPolling();
                    });

                    connection.bind('unavailable', () => {
                        isWebSocketConnected.value = false;
                        startFallbackPolling();
                    });

                    connection.bind('failed', () => {
                        isWebSocketConnected.value = false;
                        startFallbackPolling();
                    });
                }
            } catch (err) {
                console.warn('Echo channel error, falling back to HTTP polling:', err);
                startFallbackPolling();
            }
        }

        // 3. If WebSocket is not yet connected or Echo is unavailable, start fallback polling
        if (!isWebSocketConnected.value) {
            startFallbackPolling();
        }

        // 4. Listener presence heartbeat (15s)
        heartbeatTimer = setInterval(sendHeartbeat, 15000);
        sendHeartbeat();
    };

    /**
     * Listener: Leave the room
     */
    const leaveRoom = () => {
        stopTimers();
        cleanupEcho();
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
        isWebSocketConnected,
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
