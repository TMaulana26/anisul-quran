<?php

use App\Services\QuranFoundationService;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    Http::fake([
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
        'api.quran.com/api/v4/chapters/1/info*' => Http::response([
            'chapter_info' => [
                'short_text' => 'Surah pembuka Al-Quran.',
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
        'api.quran.com/api/v4/recitations/7/by_chapter/1*' => Http::response([
            'audio_file' => [
                'audio_url' => 'https://audio.qurancdn.com/Alafasy/001.mp3',
                'verse_timings' => [
                    ['verse_key' => '1:1', 'timestamp_from' => 0, 'timestamp_to' => 5400],
                ],
            ],
        ], 200),
        'api.quran.com/api/v4/foot_notes/135060*' => Http::response([
            'foot_note' => [
                'id' => 135060,
                'text' => 'Allah mengatur langit dan bumi serta isinya.',
                'language_name' => 'indonesian',
            ],
        ], 200),
    ]);
});

it('renders the surah index page with chapters and reciters', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Surah/Index')
        ->has('chapters')
        ->has('reciters')
    );
});

it('renders the surah show page with chapter details and verses', function () {
    $response = $this->get('/surah/1');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Surah/Show')
        ->has('chapter')
        ->has('verses')
        ->has('recitation')
        ->has('reciters')
        ->where('selectedReciterId', 7)
    );
});

it('returns 404 for invalid surah id', function () {
    $response = $this->get('/surah/999');

    $response->assertStatus(404);
});

it('returns recitation json for dynamic qari switching', function () {
    $response = $this->getJson('/api/surah/1/recitation?reciter=7');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'recitation' => ['audio_url', 'verse_timings'],
            'reciter_id',
            'chapter_id',
        ]);
});

it('returns footnote json for interactive footnote popover', function () {
    $response = $this->getJson('/api/footnote/135060');

    $response->assertStatus(200)
        ->assertJson([
            'footnote' => [
                'id' => 135060,
                'text' => 'Allah mengatur langit dan bumi serta isinya.',
            ],
        ]);
});
