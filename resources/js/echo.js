import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

let echoInstance = null;

export function isEchoConfigured() {
    const windowKey = typeof window !== 'undefined' ? window.__REVERB_CONFIG__?.key : null;
    const viteKey = import.meta.env.VITE_REVERB_APP_KEY;
    return Boolean(windowKey || viteKey);
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

    const windowConfig = window.__REVERB_CONFIG__ || {};
    const key = windowConfig.key || import.meta.env.VITE_REVERB_APP_KEY;
    const isHttps = window.location.protocol === 'https:';
    const envHost = windowConfig.host || import.meta.env.VITE_REVERB_HOST;
    const host = window.location.hostname || envHost || 'localhost';
    const rawPort = windowConfig.port || import.meta.env.VITE_REVERB_PORT;
    const port = isHttps ? 443 : parseInt(rawPort || '8080', 10);
    const rawScheme = windowConfig.scheme || import.meta.env.VITE_REVERB_SCHEME;
    const forceTLS = isHttps || rawScheme === 'https';

    try {
        echoInstance = new Echo({
            broadcaster: 'reverb',
            key: key,
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
