import { ref, watch } from 'vue';
import { getThemeConfig } from '@/lib/tadabburThemes';

// Shared singleton reactive state
const ambienceVolume = ref(0.20); // Default 20%
const isMuted = ref(false);
const isPlaying = ref(false);
const activeThemeId = ref('sunrise');
const isLoaded = ref(false);

let audioElement = null;
let isInitialized = false;

const safeGetItem = (key, fallback) => {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            const val = window.localStorage.getItem(key);
            if (val !== null) return val;
        }
    } catch (e) {
        // Restricted environment fallback
    }
    return fallback;
};

const safeSetItem = (key, value) => {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(key, String(value));
        }
    } catch (e) {
        // Restricted environment fallback
    }
};

function getOrCreateAudio() {
    if (typeof window === 'undefined') return null;

    if (!audioElement) {
        audioElement = new Audio();
        audioElement.loop = true;
        audioElement.preload = 'auto';

        audioElement.addEventListener('playing', () => {
            isPlaying.value = true;
            isLoaded.value = true;
        });

        audioElement.addEventListener('pause', () => {
            isPlaying.value = false;
        });

        audioElement.addEventListener('ended', () => {
            isPlaying.value = false;
        });

        audioElement.addEventListener('error', () => {
            isPlaying.value = false;
        });
    }

    return audioElement;
}

function updateAudioVolume() {
    if (!audioElement) return;
    audioElement.volume = isMuted.value ? 0 : Math.max(0, Math.min(1, ambienceVolume.value));
}

export function useTadabburAmbience() {
    const init = () => {
        if (isInitialized) return;
        isInitialized = true;

        const savedVol = safeGetItem('anisul_tadabbur_volume', null);
        if (savedVol !== null) {
            const parsed = parseFloat(savedVol);
            if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
                ambienceVolume.value = parsed;
            }
        }

        const savedMuted = safeGetItem('anisul_tadabbur_muted', null);
        if (savedMuted !== null) {
            isMuted.value = savedMuted === 'true';
        }

        getOrCreateAudio();
        updateAudioVolume();
    };

    const setTheme = (themeId) => {
        if (!themeId) return;
        init();

        const theme = getThemeConfig(themeId);
        if (activeThemeId.value === theme.id && audioElement?.src.includes(theme.ambience)) {
            return;
        }

        activeThemeId.value = theme.id;
        const audio = getOrCreateAudio();
        if (!audio) return;

        const wasPlaying = isPlaying.value;
        audio.src = theme.ambience;
        updateAudioVolume();

        if (wasPlaying) {
            audio.play().catch(() => {
                isPlaying.value = false;
            });
        }
    };

    const play = async (themeId = null) => {
        init();
        if (themeId) {
            setTheme(themeId);
        } else if (audioElement && !audioElement.src) {
            setTheme(activeThemeId.value);
        }

        const audio = getOrCreateAudio();
        if (!audio) return;

        updateAudioVolume();
        try {
            await audio.play();
            isPlaying.value = true;
        } catch (e) {
            isPlaying.value = false;
        }
    };

    const pause = () => {
        if (audioElement) {
            audioElement.pause();
            isPlaying.value = false;
        }
    };

    const setVolume = (val) => {
        const clamped = Math.max(0, Math.min(1, val));
        ambienceVolume.value = clamped;
        safeSetItem('anisul_tadabbur_volume', clamped);
        updateAudioVolume();
    };

    const toggleMute = () => {
        isMuted.value = !isMuted.value;
        safeSetItem('anisul_tadabbur_muted', isMuted.value);
        updateAudioVolume();
    };

    const reset = () => {
        pause();
        if (audioElement) {
            audioElement.src = '';
            audioElement = null;
        }
        isInitialized = false;
        isPlaying.value = false;
        isLoaded.value = false;
        isMuted.value = false;
        ambienceVolume.value = 0.20;
        activeThemeId.value = 'sunrise';
    };

    return {
        init,
        ambienceVolume,
        isMuted,
        isPlaying,
        isLoaded,
        activeThemeId,
        setTheme,
        play,
        pause,
        setVolume,
        toggleMute,
        reset,
    };
}
