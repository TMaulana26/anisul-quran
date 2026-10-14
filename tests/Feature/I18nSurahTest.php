<?php

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Cache::flush();

    Http::fake([
        'api.quran.com/api/v4/chapters/1/info*' => Http::response([
            'chapter_info' => [
                'short_text' => 'Surah pembuka Al-Quran.',
            ],
        ], 200),
        'api.quran.com/api/v4/chapters*' => Http::response([
            'chapters' => [
                ['id' => 1, 'name_simple' => 'Al-Fatihah', 'name_arabic' => 'الفاتحة', 'verses_count' => 7],
            ],
            'chapter' => [
                'id' => 1,
                'name_simple' => 'Al-Fatihah',
                'name_arabic' => 'الفاتحة',
                'revelation_place' => 'makkah',
                'verses_count' => 7,
            ],
        ], 200),
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
        'api.quran.com/api/v4/resources/recitations*' => Http::response([
            'recitations' => [
                ['id' => 7, 'reciter_name' => 'Mishari Rashid al-`Afasy'],
            ],
        ], 200),
        'api.quran.com/api/v4/chapter_recitations/*' => Http::response([
            'audio_file' => [
                'audio_url' => 'https://audio.qurancdn.com/Alafasy/001.mp3',
                'timestamps' => [
                    ['verse_key' => '1:1', 'timestamp_from' => 0, 'timestamp_to' => 5400],
                ],
            ],
        ], 200),
    ]);
});

test('index page serves Indonesian by default', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Surah/Index')
        ->has('chapters')
        ->where('locale', 'id')
    );
});

test('index page respects English lang query parameter and cookie', function () {
    $response = $this->get('/?lang=en');

    $response->assertStatus(200);
    $response->assertPlainCookie('anisul_locale', 'en');
    $response->assertInertia(fn ($page) => $page
        ->component('Surah/Index')
        ->has('chapters')
        ->where('locale', 'en')
    );
});

test('surah show page loads English translations (Saheeh International) when requested', function () {
    $response = $this->withUnencryptedCookie('anisul_locale', 'en')->get('/surah/1');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Surah/Show')
        ->where('locale', 'en')
        ->where('translationInfo.resourceId', 20)
        ->where('translationInfo.sourceName', 'Saheeh International')
        ->has('verses')
    );
});

test('surah show page loads Indonesian translations (Kemenag RI) by default', function () {
    $response = $this->get('/surah/1');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Surah/Show')
        ->where('locale', 'id')
        ->where('translationInfo.resourceId', 33)
        ->where('translationInfo.sourceName', 'Kemenag RI')
        ->has('verses')
    );
});
