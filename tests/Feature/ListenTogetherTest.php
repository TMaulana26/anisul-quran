<?php

use App\Events\RoomClosedEvent;
use App\Events\RoomSyncEvent;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Event;
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
        'api.quran.com/api/v4/resources/recitations*' => Http::response([
            'recitations' => [
                ['id' => 7, 'reciter_name' => 'Mishari Rashid al-`Afasy'],
            ],
        ], 200),
        'api.quran.com/api/v4/chapter_recitations/7/1*' => Http::response([
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

it('can retrieve current room state without leaking hostDeviceId', function () {
    $create = $this->postJson('/api/rooms', [
        'surahId' => 1,
        'ayahNumber' => 1,
        'hostDeviceId' => 'secret-host-id',
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
        ])
        ->assertJsonMissingPath('room.hostDeviceId');
});

it('can sync playback state from authorized host', function () {
    $create = $this->postJson('/api/rooms', [
        'surahId' => 1,
        'ayahNumber' => 1,
        'status' => 'paused',
        'hostDeviceId' => 'host-device-abc',
    ]);

    $code = $create->json('room.code');

    $syncResponse = $this->postJson("/api/rooms/{$code}/sync", [
        'hostDeviceId' => 'host-device-abc',
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
        ])
        ->assertJsonMissingPath('room.hostDeviceId');
});

it('rejects room sync and destruction from unauthorized non-host callers', function () {
    $create = $this->postJson('/api/rooms', [
        'surahId' => 1,
        'ayahNumber' => 1,
        'hostDeviceId' => 'real-host-device',
    ]);

    $code = $create->json('room.code');

    // Attempt sync without hostDeviceId or with wrong hostDeviceId
    $this->postJson("/api/rooms/{$code}/sync", [
        'hostDeviceId' => 'attacker-device',
        'surahId' => 114,
        'ayahNumber' => 6,
    ])->assertStatus(403);

    // Attempt destroy without hostDeviceId or with wrong hostDeviceId
    $this->deleteJson("/api/rooms/{$code}", [
        'hostDeviceId' => 'attacker-device',
    ])->assertStatus(403);

    // Verify room was not modified or deleted
    $this->getJson("/api/rooms/{$code}")
        ->assertStatus(200)
        ->assertJsonPath('room.surahId', 1);
});

it('tracks active listeners via heartbeat without reverting synced state', function () {
    $create = $this->postJson('/api/rooms', [
        'hostDeviceId' => 'host-device',
        'surahId' => 1,
        'ayahNumber' => 1,
    ]);

    $code = $create->json('room.code');

    // Host updates ayah to 5
    $this->postJson("/api/rooms/{$code}/sync", [
        'hostDeviceId' => 'host-device',
        'ayahNumber' => 5,
        'timestampMs' => 18000,
        'status' => 'playing',
    ])->assertStatus(200);

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

    // Ensure room state was not reverted by heartbeats
    $this->getJson("/api/rooms/{$code}")
        ->assertStatus(200)
        ->assertJsonPath('room.ayahNumber', 5)
        ->assertJsonPath('room.timestampMs', 18000);
});

it('can close and destroy a room session when authorized as host', function () {
    $create = $this->postJson('/api/rooms', [
        'hostDeviceId' => 'host-device-xyz',
    ]);
    $code = $create->json('room.code');

    $deleteResponse = $this->deleteJson("/api/rooms/{$code}", [
        'hostDeviceId' => 'host-device-xyz',
    ]);
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

it('broadcasts RoomSyncEvent when host syncs playback without leaking hostDeviceId', function () {
    Event::fake([
        RoomSyncEvent::class,
    ]);

    $create = $this->postJson('/api/rooms', [
        'surahId' => 1,
        'ayahNumber' => 1,
        'hostDeviceId' => 'host-device-secret',
    ]);
    $code = $create->json('room.code');

    $this->postJson("/api/rooms/{$code}/sync", [
        'hostDeviceId' => 'host-device-secret',
        'surahId' => 1,
        'ayahNumber' => 5,
        'timestampMs' => 20000,
        'status' => 'playing',
    ])->assertStatus(200);

    Event::assertDispatched(RoomSyncEvent::class, function ($event) use ($code) {
        $channels = $event->broadcastOn();
        $payload = $event->broadcastWith();

        return $event->roomCode === $code
            && $event->room['ayahNumber'] === 5
            && $event->room['status'] === 'playing'
            && ! array_key_exists('hostDeviceId', $payload['room'])
            && $channels[0]->name === "room.{$code}"
            && $event->broadcastAs() === 'RoomSyncEvent';
    });
});

it('broadcasts RoomClosedEvent when host closes room', function () {
    Event::fake([
        RoomClosedEvent::class,
    ]);

    $create = $this->postJson('/api/rooms', [
        'hostDeviceId' => 'host-device-close',
    ]);
    $code = $create->json('room.code');

    $this->deleteJson("/api/rooms/{$code}", [
        'hostDeviceId' => 'host-device-close',
    ])->assertStatus(200);

    Event::assertDispatched(RoomClosedEvent::class, function ($event) use ($code) {
        $channels = $event->broadcastOn();

        return $event->roomCode === $code
            && $channels[0]->name === "room.{$code}"
            && $event->broadcastAs() === 'RoomClosedEvent';
    });
});

it('persists and broadcasts readingMode and isKhusyuMode state', function () {
    Event::fake([
        RoomSyncEvent::class,
    ]);

    $create = $this->postJson('/api/rooms', [
        'surahId' => 1,
        'ayahNumber' => 1,
        'readingMode' => 'khusyu',
        'isKhusyuMode' => true,
        'hostDeviceId' => 'host-device-mode',
    ]);

    $create->assertStatus(201)
        ->assertJson([
            'success' => true,
            'room' => [
                'readingMode' => 'khusyu',
                'isKhusyuMode' => true,
            ],
        ]);

    $code = $create->json('room.code');

    $syncResponse = $this->postJson("/api/rooms/{$code}/sync", [
        'hostDeviceId' => 'host-device-mode',
        'surahId' => 1,
        'ayahNumber' => 2,
        'readingMode' => 'mushaf',
        'isKhusyuMode' => false,
    ]);

    $syncResponse->assertStatus(200)
        ->assertJson([
            'success' => true,
            'room' => [
                'readingMode' => 'mushaf',
                'isKhusyuMode' => false,
            ],
        ]);

    Event::assertDispatched(RoomSyncEvent::class, function ($event) use ($code) {
        return $event->roomCode === $code
            && $event->room['readingMode'] === 'mushaf'
            && $event->room['isKhusyuMode'] === false;
    });
});
