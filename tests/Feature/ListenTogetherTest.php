<?php

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    Cache::flush();

    Http::fake([
        'api.quran.com/api/v4/chapters*' => Http::response([
            'chapter' => [
                'id' => 1,
                'name_simple' => 'Al-Fatihah',
                'name_arabic' => 'الفاتحة',
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
                        ['resource_id' => 33, 'text' => 'Dengan nama Allah...'],
                    ],
                ],
            ],
        ], 200),
        'api.quran.com/api/v4/recitations/7/by_chapter/1*' => Http::response([
            'audio_file' => [
                'audio_url' => 'https://audio.qurancdn.com/Alafasy/001.mp3',
                'verse_timings' => [
                    ['verse_key' => '1:1', 'timestamp_from' => 0, 'timestamp_to' => 5000],
                ],
            ],
        ], 200),
    ]);
});

it('can create a new listen together room', function () {
    $response = $this->postJson('/api/rooms', [
        'surahId' => 2,
        'ayahNumber' => 10,
        'timestampMs' => 45000,
        'status' => 'playing',
        'reciterId' => 7,
        'mushafType' => 'uthmani',
        'hostDeviceId' => 'device-host-123',
    ]);

    $response->assertStatus(201)
        ->assertJson([
            'success' => true,
            'room' => [
                'surahId' => 2,
                'ayahNumber' => 10,
                'timestampMs' => 45000,
                'status' => 'playing',
                'reciterId' => 7,
                'mushafType' => 'uthmani',
                'hostDeviceId' => 'device-host-123',
                'listenerCount' => 1,
            ],
        ]);

    $data = $response->json('room');
    expect($data['code'])->toHaveLength(6);
    expect($data['joinUrl'])->toContain('/listen/'.$data['code']);
});

it('returns 404 for nonexistent room code', function () {
    $response = $this->getJson('/api/rooms/NONEXIST');

    $response->assertStatus(404)
        ->assertJson([
            'success' => false,
            'message' => 'Sesi room tidak ditemukan atau telah berakhir.',
        ]);
});

it('can retrieve current room state', function () {
    $create = $this->postJson('/api/rooms', [
        'surahId' => 1,
        'ayahNumber' => 1,
    ]);

    $code = $create->json('room.code');

    $response = $this->getJson("/api/rooms/{$code}");

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'room' => [
                'code' => $code,
                'surahId' => 1,
                'ayahNumber' => 1,
                'listenerCount' => 1,
            ],
        ]);
});

it('can sync playback state from host', function () {
    $create = $this->postJson('/api/rooms', [
        'surahId' => 1,
        'ayahNumber' => 1,
        'status' => 'paused',
    ]);

    $code = $create->json('room.code');

    $syncResponse = $this->postJson("/api/rooms/{$code}/sync", [
        'surahId' => 1,
        'ayahNumber' => 3,
        'timestampMs' => 12500,
        'status' => 'playing',
    ]);

    $syncResponse->assertStatus(200)
        ->assertJson([
            'success' => true,
            'room' => [
                'code' => $code,
                'surahId' => 1,
                'ayahNumber' => 3,
                'timestampMs' => 12500,
                'status' => 'playing',
            ],
        ]);
});

it('tracks active listeners via heartbeat', function () {
    $create = $this->postJson('/api/rooms', [
        'hostDeviceId' => 'host-device',
    ]);

    $code = $create->json('room.code');

    // Add listener 1
    $this->postJson("/api/rooms/{$code}/heartbeat", [
        'deviceId' => 'listener-1',
    ])->assertStatus(200)
        ->assertJson(['success' => true, 'listenerCount' => 2]);

    // Add listener 2
    $this->postJson("/api/rooms/{$code}/heartbeat", [
        'deviceId' => 'listener-2',
    ])->assertStatus(200)
        ->assertJson(['success' => true, 'listenerCount' => 3]);
});

it('can close and destroy a room session', function () {
    $create = $this->postJson('/api/rooms');
    $code = $create->json('room.code');

    $deleteResponse = $this->deleteJson("/api/rooms/{$code}");
    $deleteResponse->assertStatus(200)
        ->assertJson([
            'success' => true,
            'message' => 'Sesi room berhasil ditutup.',
        ]);

    $this->getJson("/api/rooms/{$code}")->assertStatus(404);
});

it('renders Inertia page for valid room join', function () {
    $create = $this->postJson('/api/rooms', [
        'surahId' => 1,
        'reciterId' => 7,
    ]);
    $code = $create->json('room.code');

    $response = $this->get("/listen/{$code}");

    $response->assertStatus(200)
        ->assertInertia(fn (Assert $page) => $page
            ->component('Listen/Room')
            ->where('roomCode', $code)
            ->where('error', null)
            ->has('room')
            ->has('chapter')
            ->has('verses')
        );
});

it('renders Inertia page with error when room code is invalid or expired', function () {
    $response = $this->get('/listen/INVALID');

    $response->assertStatus(200)
        ->assertInertia(fn (Assert $page) => $page
            ->component('Listen/Room')
            ->where('room', null)
            ->where('roomCode', 'INVALID')
            ->where('error', 'Sesi Listen Together tidak ditemukan atau telah ditutup oleh Host.')
        );
});
