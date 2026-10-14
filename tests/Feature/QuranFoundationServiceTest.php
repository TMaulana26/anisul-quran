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
        'api.quran.com/api/v4/chapter_recitations/7/1*' => Http::response([
            'audio_file' => [
                'audio_url' => 'https://audio.qurancdn.com/Alafasy/001.mp3',
                'format' => 'mp3',
                'timestamps' => [
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

it('does not poison cache when upstream API returns error or empty failure', function () {
    Http::fake([
        'api.quran.com/api/v4/chapters*' => Http::sequence()
            ->push(['error' => 'Bad Gateway'], 502)
            ->push(['error' => 'Service Unavailable'], 503)
            ->push(['error' => 'Gateway Timeout'], 504)
            ->push([
                'chapters' => [
                    ['id' => 1, 'name_simple' => 'Al-Fatihah', 'name_arabic' => 'الفاتحة', 'verses_count' => 7],
                ],
            ], 200),
    ]);

    $service = new QuranFoundationService;

    // First call fails (all 3 retry attempts hit 502/503/504) -> returns fallback [] without caching
    $failedChapters = $service->getChapters('id');
    expect($failedChapters)->toBe([])
        ->and(Cache::has('quran:chapters:id'))->toBeFalse();

    // Subsequent call succeeds and caches the valid payload
    $recoveredChapters = $service->getChapters('id');
    expect($recoveredChapters)->toHaveCount(1)
        ->and($recoveredChapters[0]['name_simple'])->toBe('Al-Fatihah')
        ->and(Cache::has('quran:chapters:id'))->toBeTrue();
});

it('searches verses across Quran Foundation API and handles upstream failures gracefully', function () {
    Http::fake([
        'api.quran.com/api/v4/search*' => Http::sequence()
            ->push([
                'search' => [
                    'query' => 'kursi',
                    'total_results' => 1,
                    'results' => [
                        ['verse_key' => '2:255', 'text' => 'Ayat Kursi'],
                    ],
                ],
            ], 200)
            ->push(['error' => 'Server Error'], 500)
            ->push(['error' => 'Server Error'], 500)
            ->push(['error' => 'Server Error'], 500),
    ]);

    $service = new QuranFoundationService;

    $results = $service->search('kursi', 1, 20, 'id');
    expect($results)->toHaveKey('results')
        ->and($results['results'])->toHaveCount(1)
        ->and($results['results'][0]['verse_key'])->toBe('2:255');

    $failedResults = $service->search('kursi', 1, 20, 'id');
    expect($failedResults)->toBe([]);
});

it('falls back to preceding footnote (id - 1) when Kemenag footnote is merged on 404', function () {
    Http::fake([
        'api.quran.com/api/v4/foot_notes/135061' => Http::response(['status' => 404], 404),
        'api.quran.com/api/v4/foot_notes/135060' => Http::response([
            'foot_note' => [
                'id' => 135060,
                'text' => 'Catatan kaki gabungan dari ayat sebelumnya.',
                'language_name' => 'indonesian',
            ],
        ], 200),
        'api.quran.com/api/v4/foot_notes/999999' => Http::response(['status' => 404], 404),
        'api.quran.com/api/v4/foot_notes/999998' => Http::response(['status' => 404], 404),
    ]);

    $service = new QuranFoundationService;

    $merged = $service->getFootnote(135061);
    expect($merged)->not->toBeNull()
        ->and($merged['id'])->toBe(135060)
        ->and($merged['text'])->toBe('Catatan kaki gabungan dari ayat sebelumnya.');

    $missingBoth = $service->getFootnote(999999);
    expect($missingBoth)->not->toBeNull()
        ->and($missingBoth['id'])->toBe(999999)
        ->and($missingBoth['text'])->toContain('digabungkan pada catatan sebelumnya');
});

it('normalizes PUA waqf glyphs and strips unmapped PUA and zero-width characters in sanitizeArabicText', function () {
    $service = new QuranFoundationService;

    expect($service->sanitizeArabicText(null))->toBe('')
        ->and($service->sanitizeArabicText(''))->toBe('');

    $rawArabic = "ٱلرَّحْمَٰنِ\u{E01B}\u{E020}\u{E099}\u{200B}\u{FEFF}";
    $sanitized = $service->sanitizeArabicText($rawArabic);

    expect($sanitized)->toContain('ۚ')
        ->and($sanitized)->toContain('۩')
        ->and($sanitized)->not->toContain("\u{E099}")
        ->and($sanitized)->not->toContain("\u{200B}")
        ->and($sanitized)->not->toContain("\u{FEFF}");
});
