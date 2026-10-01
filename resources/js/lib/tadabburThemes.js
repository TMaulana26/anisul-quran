/**
 * Tadabbur Alam Themes Configuration & 114 Surah Thematic Mapping
 * Curated for Anisul Qur'an Cinematic Quran Sanctuary
 */

export const TADABBUR_THEMES = {
    cosmic: {
        id: 'cosmic',
        nameKey: 'tadabbur.theme_cosmic',
        icon: '🌌',
        accentColor: '#818cf8',
        video: '/videos/tadabbur/cosmic.webm',
        videoFallback: '/videos/tadabbur/cosmic.mp4',
        poster: '/images/tadabbur/cosmic-poster.webp',
        ambience: '/audio/ambience/cosmic-ambience.mp3',
        gradientOverlay: 'linear-gradient(to top, rgba(2, 6, 23, 0.90) 0%, rgba(15, 23, 42, 0.35) 50%, rgba(2, 6, 23, 0.70) 100%)',
    },
    ocean: {
        id: 'ocean',
        nameKey: 'tadabbur.theme_ocean',
        icon: '🌊',
        accentColor: '#38bdf8',
        video: '/videos/tadabbur/ocean.webm',
        videoFallback: '/videos/tadabbur/ocean.mp4',
        poster: '/images/tadabbur/ocean-poster.webp',
        ambience: '/audio/ambience/ocean-ambience.mp3',
        gradientOverlay: 'linear-gradient(to top, rgba(4, 30, 48, 0.90) 0%, rgba(8, 47, 73, 0.35) 50%, rgba(4, 30, 48, 0.70) 100%)',
    },
    mountain: {
        id: 'mountain',
        nameKey: 'tadabbur.theme_mountain',
        icon: '🏔️',
        accentColor: '#94a3b8',
        video: '/videos/tadabbur/mountain.webm',
        videoFallback: '/videos/tadabbur/mountain.mp4',
        poster: '/images/tadabbur/mountain-poster.webp',
        ambience: '/audio/ambience/mountain-ambience.mp3',
        gradientOverlay: 'linear-gradient(to top, rgba(15, 23, 42, 0.90) 0%, rgba(30, 41, 59, 0.35) 50%, rgba(15, 23, 42, 0.70) 100%)',
    },
    rain: {
        id: 'rain',
        nameKey: 'tadabbur.theme_rain',
        icon: '🌧️',
        accentColor: '#34d399',
        video: '/videos/tadabbur/rain.webm',
        videoFallback: '/videos/tadabbur/rain.mp4',
        poster: '/images/tadabbur/rain-poster.webp',
        ambience: '/audio/ambience/rain-ambience.mp3',
        gradientOverlay: 'linear-gradient(to top, rgba(6, 44, 33, 0.90) 0%, rgba(6, 78, 59, 0.35) 50%, rgba(6, 44, 33, 0.70) 100%)',
    },
    sunrise: {
        id: 'sunrise',
        nameKey: 'tadabbur.theme_sunrise',
        icon: '🌅',
        accentColor: '#fbbf24',
        video: '/videos/tadabbur/sunrise.webm',
        videoFallback: '/videos/tadabbur/sunrise.mp4',
        poster: '/images/tadabbur/sunrise-poster.webp',
        ambience: '/audio/ambience/sunrise-ambience.mp3',
        gradientOverlay: 'linear-gradient(to top, rgba(41, 23, 6, 0.90) 0%, rgba(69, 39, 10, 0.35) 50%, rgba(41, 23, 6, 0.70) 100%)',
    },
};

export const SURAH_THEME_MAP = {
    1: 'sunrise',
    2: 'rain',
    3: 'cosmic',
    4: 'mountain',
    5: 'rain',
    6: 'cosmic',
    7: 'mountain',
    8: 'rain',
    9: 'sunrise',
    10: 'ocean',
    11: 'ocean',
    12: 'sunrise',
    13: 'rain',
    14: 'sunrise',
    15: 'mountain',
    16: 'rain',
    17: 'cosmic',
    18: 'mountain',
    19: 'rain',
    20: 'sunrise',
    21: 'cosmic',
    22: 'mountain',
    23: 'rain',
    24: 'sunrise',
    25: 'ocean',
    26: 'ocean',
    27: 'mountain',
    28: 'ocean',
    29: 'sunrise',
    30: 'rain',
    31: 'cosmic',
    32: 'sunrise',
    33: 'mountain',
    34: 'rain',
    35: 'ocean',
    36: 'cosmic',
    37: 'cosmic',
    38: 'mountain',
    39: 'sunrise',
    40: 'cosmic',
    41: 'cosmic',
    42: 'ocean',
    43: 'rain',
    44: 'cosmic',
    45: 'ocean',
    46: 'sunrise',
    47: 'rain',
    48: 'sunrise',
    49: 'mountain',
    50: 'cosmic',
    51: 'rain',
    52: 'mountain',
    53: 'cosmic',
    54: 'cosmic',
    55: 'ocean',
    56: 'cosmic',
    57: 'cosmic',
    58: 'sunrise',
    59: 'mountain',
    60: 'sunrise',
    61: 'mountain',
    62: 'sunrise',
    63: 'rain',
    64: 'cosmic',
    65: 'sunrise',
    66: 'sunrise',
    67: 'cosmic',
    68: 'sunrise',
    69: 'cosmic',
    70: 'cosmic',
    71: 'rain',
    72: 'cosmic',
    73: 'cosmic',
    74: 'sunrise',
    75: 'cosmic',
    76: 'rain',
    77: 'rain',
    78: 'mountain',
    79: 'cosmic',
    80: 'rain',
    81: 'cosmic',
    82: 'cosmic',
    83: 'sunrise',
    84: 'cosmic',
    85: 'cosmic',
    86: 'cosmic',
    87: 'rain',
    88: 'mountain',
    89: 'sunrise',
    90: 'mountain',
    91: 'sunrise',
    92: 'cosmic',
    93: 'sunrise',
    94: 'sunrise',
    95: 'mountain',
    96: 'sunrise',
    97: 'cosmic',
    98: 'rain',
    99: 'mountain',
    100: 'sunrise',
    101: 'mountain',
    102: 'sunrise',
    103: 'sunrise',
    104: 'sunrise',
    105: 'mountain',
    106: 'sunrise',
    107: 'rain',
    108: 'ocean',
    109: 'sunrise',
    110: 'sunrise',
    111: 'sunrise',
    112: 'cosmic',
    113: 'sunrise',
    114: 'cosmic',
};

/**
 * Get the default theme ID for a given surah chapter number
 * @param {number|string} chapterId
 * @returns {string} Theme ID ('cosmic' | 'ocean' | 'mountain' | 'rain' | 'sunrise')
 */
export function getSurahDefaultTheme(chapterId) {
    const id = parseInt(chapterId, 10);
    return SURAH_THEME_MAP[id] || 'sunrise';
}

/**
 * Get the full configuration object for a theme
 * @param {string} themeId
 * @returns {object}
 */
export function getThemeConfig(themeId) {
    return TADABBUR_THEMES[themeId] || TADABBUR_THEMES.sunrise;
}

/**
 * Get all available themes as an array
 * @returns {Array<object>}
 */
export function getThemeList() {
    return Object.values(TADABBUR_THEMES);
}
