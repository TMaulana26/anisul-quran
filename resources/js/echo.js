import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

let echoInstance = null;

export function isEchoConfigured() {
    return Boolean(import.meta.env.VITE_REVERB_APP_KEY);
}

export function getEcho() {
    if (typeof window === 'undefined') return null;

    if (echoInstance) {
        return echoInstance;
    }

    if (!isEchoConfigured()) {
        return null;
    }

    window.Pusher = Pusher;

    const isHttps = window.location.protocol === 'https:';
    const envHost = import.meta.env.VITE_REVERB_HOST;
    const host = isHttps ? window.location.hostname : (envHost || window.location.hostname || 'localhost');
    const port = isHttps ? 443 : parseInt(import.meta.env.VITE_REVERB_PORT || '8080', 10);
    const forceTLS = isHttps || import.meta.env.VITE_REVERB_SCHEME === 'https';

    try {
        echoInstance = new Echo({
            broadcaster: 'reverb',
            key: import.meta.env.VITE_REVERB_APP_KEY,
            wsHost: host,
            wsPort: port,
            wssPort: port,
            forceTLS,
            enabledTransports: ['ws', 'wss'],
            disableStats: true,
        });

        window.Echo = echoInstance;
        return echoInstance;
    } catch (err) {
        console.warn('Failed to initialize Laravel Echo WebSocket client:', err);
        return null;
    }
}

export function disconnectEcho() {
    if (echoInstance) {
        try {
            echoInstance.disconnect();
        } catch {
            // Ignore disconnect errors
        }
        echoInstance = null;
        if (typeof window !== 'undefined' && window.Echo) {
            delete window.Echo;
        }
    }
}
