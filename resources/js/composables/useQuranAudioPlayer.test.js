import { describe, it, expect } from 'vitest';
import { 
    matchTimestampToVerseAndWord, 
    formatAudioTime,
    useQuranAudioPlayer 
} from './useQuranAudioPlayer';

describe('useQuranAudioPlayer - Helpers & Timestamp Matching', () => {
    const mockVerseTimings = [
        {
            verse_key: '1:1',
            timestamp_from: 0,
            timestamp_to: 5000,
            duration: 5000,
            segments: [
                [1, 0, 1200],
                [2, 1200, 2400],
                [3, 2400, 3600],
                [4, 3600, 5000],
            ],
        },
        {
            verse_key: '1:2',
            timestamp_from: 5001,
            timestamp_to: 11000,
            duration: 5999,
            segments: [
                [1, 5001, 6500],
                [2, 6500, 8000],
                [3, 8000, 11000],
            ],
        },
        {
            verse_key: '1:3',
            timestamp_from: 11001,
            timestamp_to: 16000,
            duration: 4999,
            segments: [
                [1, 11001, 13500],
                [2, 13500, 16000],
            ],
        },
    ];

    it('formats audio seconds into clean MM:SS or HH:MM:SS string', () => {
        expect(formatAudioTime(0)).toBe('00:00');
        expect(formatAudioTime(65)).toBe('01:05');
        expect(formatAudioTime(125)).toBe('02:05');
        expect(formatAudioTime(3599)).toBe('59:59');
        expect(formatAudioTime(3600)).toBe('01:00:00');
        expect(formatAudioTime(7264)).toBe('02:01:04');
        expect(formatAudioTime(null)).toBe('00:00');
        expect(formatAudioTime(-10)).toBe('00:00');

        // When forceHours is true (for synchronized timeline display)
        expect(formatAudioTime(0, true)).toBe('00:00:00');
        expect(formatAudioTime(83, true)).toBe('00:01:23');
        expect(formatAudioTime(7264, true)).toBe('02:01:04');
    });

    it('matches timestamp to correct verse and word segment', () => {
        // Within 1:1, word 2
        const match1 = matchTimestampToVerseAndWord(1500, mockVerseTimings);
        expect(match1.ayahNumber).toBe(1);
        expect(match1.wordIndex).toBe(2);
        expect(match1.verseKey).toBe('1:1');

        // Within 1:2, word 1
        const match2 = matchTimestampToVerseAndWord(5500, mockVerseTimings);
        expect(match2.ayahNumber).toBe(2);
        expect(match2.wordIndex).toBe(1);
        expect(match2.verseKey).toBe('1:2');

        // Within 1:3, word 2
        const match3 = matchTimestampToVerseAndWord(14000, mockVerseTimings);
        expect(match3.ayahNumber).toBe(3);
        expect(match3.wordIndex).toBe(2);
        expect(match3.verseKey).toBe('1:3');
    });

    it('returns empty result when timings array is empty or null', () => {
        const match = matchTimestampToVerseAndWord(1000, []);
        expect(match.ayahNumber).toBeNull();
        expect(match.wordIndex).toBeNull();

        const matchNull = matchTimestampToVerseAndWord(1000, null);
        expect(matchNull.ayahNumber).toBeNull();
    });

    it('cycles repeat mode correctly', () => {
        const player = useQuranAudioPlayer();
        player.setRepeatMode('none');
        expect(player.repeatMode.value).toBe('none');

        player.cycleRepeatMode();
        expect(player.repeatMode.value).toBe('ayah');

        player.cycleRepeatMode();
        expect(player.repeatMode.value).toBe('surah');

        player.cycleRepeatMode();
        expect(player.repeatMode.value).toBe('none');
    });

    it('sets playback rate correctly', () => {
        const player = useQuranAudioPlayer();
        player.setPlaybackRate(1.5);
        expect(player.playbackRate.value).toBe(1.5);

        player.setPlaybackRate(1.0);
        expect(player.playbackRate.value).toBe(1.0);
    });

    it('loads Surah metadata correctly', () => {
        const player = useQuranAudioPlayer();
        const mockChapter = { id: 1, name_simple: 'Al-Fatihah', name_arabic: 'الفاتحة', verses_count: 7 };
        const mockRecitation = { audio_url: 'https://audio.example.com/001.mp3', verse_timings: mockVerseTimings };

        player.loadSurah(mockChapter, mockRecitation, { id: 7, name: 'Mishary Rashid Alafasy' });

        expect(player.currentSurahId.value).toBe(1);
        expect(player.currentSurahName.value).toBe('Al-Fatihah');
        expect(player.activeReciter.value.id).toBe(7);
        expect(player.currentAyahNumber.value).toBe(1);
    });

    it('navigates nextAyah and prevAyah even when audio is not playing', () => {
        const player = useQuranAudioPlayer();
        const mockChapter = { id: 1, name_simple: 'Al-Fatihah', name_arabic: 'الفاتحة', verses_count: 7 };
        const mockRecitation = { audio_url: 'https://audio.example.com/001.mp3', verse_timings: mockVerseTimings };

        player.loadSurah(mockChapter, mockRecitation, null, 1, false);
        expect(player.isPlaying.value).toBe(false);
        expect(player.currentAyahNumber.value).toBe(1);

        // Next Ayah
        player.nextAyah();
        expect(player.currentAyahNumber.value).toBe(2);
        expect(player.isPlaying.value).toBe(false);

        // Next Ayah again
        player.nextAyah();
        expect(player.currentAyahNumber.value).toBe(3);

        // Previous Ayah
        player.prevAyah();
        expect(player.currentAyahNumber.value).toBe(2);

        // Previous Ayah to first
        player.prevAyah();
        expect(player.currentAyahNumber.value).toBe(1);

        // Cannot go below 1
        player.prevAyah();
        expect(player.currentAyahNumber.value).toBe(1);
    });

    it('seamlessly transitions reciter mid-surah preserving active ayah', () => {
        const player = useQuranAudioPlayer();
        const mockChapter = { id: 1, name_simple: 'Al-Fatihah', name_arabic: 'الفاتحة', verses_count: 7 };
        const reciterA = { id: 7, name: 'Mishary Rashid Alafasy' };
        const reciterB = { id: 4, name: 'Mahmoud Khalil Al-Husary' };
        const recitationA = { audio_url: 'https://audio.example.com/reciterA/001.mp3', verse_timings: mockVerseTimings };
        const recitationB = { 
            audio_url: 'https://audio.example.com/reciterB/001.mp3', 
            verse_timings: [
                { verse_key: '1:1', timestamp_from: 0, timestamp_to: 6000 },
                { verse_key: '1:2', timestamp_from: 6001, timestamp_to: 14000 },
                { verse_key: '1:3', timestamp_from: 14001, timestamp_to: 22000 },
            ]
        };

        // Initially load Reciter A on Ayah 1
        player.loadSurah(mockChapter, recitationA, reciterA, 1, false);
        expect(player.activeReciter.value.id).toBe(7);
        expect(player.currentAyahNumber.value).toBe(1);

        // Move to Ayah 2
        player.nextAyah();
        expect(player.currentAyahNumber.value).toBe(2);

        // Switch to Reciter B mid-surah while on Ayah 2
        player.loadSurah(mockChapter, recitationB, reciterB, 2, false);
        expect(player.activeReciter.value.id).toBe(4);
        expect(player.currentAyahNumber.value).toBe(2);
        // Target seconds for Ayah 2 of Reciter B should be 6.001
        expect(player.currentTime.value).toBe(6.001);
    });
});

