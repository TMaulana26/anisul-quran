<?php

use App\Services\QuranFoundationService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Cache::flush();
});

it('fetches chapters with caching', function () {
    Http::fake([
        'api.quran.com/api/v4/chapters*' => Http::response([
            'chapters' => [
                ['id' => 1, 'name_simple' => 'Al-Fatihah', 'name_arabic' => 'الفاتحة', 'verses_count' => 7],
                ['id' => 2, 'name_simple' => 'Al-Baqarah', 'name_arabic' => 'البقرة', 'verses_count' => 286],
            ],
        ], 200),
    ]);

    $service = new QuranFoundationService;
    $chapters = $service->getChapters('id');

    expect($chapters)->toHaveCount(2)
        ->and($chapters[0]['name_simple'])->toBe('Al-Fatihah')
        ->and(Cache::has('quran:chapters:id'))->toBeTrue();

    // Verify cache hit (no additional HTTP requests)
    $cachedChapters = $service->getChapters('id');
    expect($cachedChapters)->toHaveCount(2);
    Http::assertSentCount(1);
});

it('fetches single chapter detail', function () {
    Http::fake([
        'api.quran.com/api/v4/chapters/1*' => Http::response([
            'chapter' => [
                'id' => 1,
                'name_simple' => 'Al-Fatihah',
                'name_arabic' => 'الفاتحة',
                'revelation_place' => 'makkah',
                'verses_count' => 7,
            ],
        ], 200),
    ]);

    $service = new QuranFoundationService;
    $chapter = $service->getChapter(1, 'id');

    expect($chapter)->not->toBeNull()
        ->and($chapter['id'])->toBe(1)
        ->and($chapter['name_simple'])->toBe('Al-Fatihah');
});

it('fetches verses by chapter with words and translations', function () {
    Http::fake([
        'api.quran.com/api/v4/verses/by_chapter/1*' => Http::response([
            'verses' => [
                [
                    'id' => 1,
                    'verse_number' => 1,
                    'verse_key' => '1:1',
                    'text_uthmani' => 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
                    'translations' => [
                        ['resource_id' => 33, 'text' => 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.'],
                    ],
                ],
            ],
        ], 200),
    ]);

    $service = new QuranFoundationService;
    $result = $service->getVersesByChapter(1);

    expect($result)->toHaveKey('verses')
        ->and($result['verses'])->toHaveCount(1)
        ->and($result['verses'][0]['verse_key'])->toBe('1:1');
});

it('fetches reciters list and recitation timestamps', function () {
    Http::fake([
        'api.quran.com/api/v4/resources/recitations*' => Http::response([
            'recitations' => [
                ['id' => 7, 'reciter_name' => 'Mishari Rashid al-`Afasy', 'style' => 'Murattal'],
            ],
        ], 200),
        'api.quran.com/api/v4/recitations/7/by_chapter/1*' => Http::response([
            'audio_file' => [
                'audio_url' => 'https://audio.qurancdn.com/Alafasy/001.mp3',
                'format' => 'mp3',
                'verse_timings' => [
                    ['verse_key' => '1:1', 'timestamp_from' => 0, 'timestamp_to' => 5400],
                ],
            ],
        ], 200),
    ]);

    $service = new QuranFoundationService;
    $reciters = $service->getReciters();
    $audio = $service->getChapterRecitation(7, 1);

    expect($reciters)->toHaveCount(1)
        ->and($reciters[0]['reciter_name'])->toBe('Mishari Rashid al-`Afasy')
        ->and($audio)->not->toBeNull()
        ->and($audio['audio_url'])->toBe('https://audio.qurancdn.com/Alafasy/001.mp3')
        ->and($audio['verse_timings'])->toHaveCount(1);
});
