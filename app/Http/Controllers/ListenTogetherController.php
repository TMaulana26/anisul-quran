<?php

namespace App\Http\Controllers;

use App\Events\RoomClosedEvent;
use App\Events\RoomSyncEvent;
use App\Services\QuranFoundationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ListenTogetherController extends Controller
{
    /**
     * Cache TTL in seconds (2 hours).
     */
    protected const ROOM_TTL_SECONDS = 7200;

    /**
     * Heartbeat threshold in seconds for active presence.
     */
    protected const PRESENCE_THRESHOLD_SECONDS = 60;

    public function __construct(
        protected QuranFoundationService $quran
    ) {}

    /**
     * Create a new Listen Together room.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'surahId' => ['nullable', 'integer', 'between:1,114'],
            'ayahNumber' => ['nullable', 'integer', 'min:1'],
            'timestampMs' => ['nullable', 'integer', 'min:0'],
            'status' => ['nullable', 'in:playing,paused'],
            'reciterId' => ['nullable', 'integer'],
            'mushafType' => ['nullable', 'in:uthmani,indopak'],
            'hostDeviceId' => ['nullable', 'string', 'max:100'],
        ]);

        $code = $this->generateUniqueRoomCode();
        $hostDeviceId = $validated['hostDeviceId'] ?? (string) Str::uuid();
        $now = (int) (microtime(true) * 1000);

        $roomData = [
            'code' => $code,
            'hostDeviceId' => $hostDeviceId,
            'surahId' => (int) ($validated['surahId'] ?? 1),
            'ayahNumber' => (int) ($validated['ayahNumber'] ?? 1),
            'timestampMs' => (int) ($validated['timestampMs'] ?? 0),
            'status' => $validated['status'] ?? 'paused',
            'reciterId' => (int) ($validated['reciterId'] ?? 7),
            'mushafType' => $validated['mushafType'] ?? 'uthmani',
            'createdAt' => $now,
            'updatedAt' => $now,
        ];

        Cache::put("room_{$code}", $roomData, self::ROOM_TTL_SECONDS);

        // Initialize listeners array with the host device
        Cache::put("room_{$code}_listeners", [
            $hostDeviceId => now()->timestamp,
        ], self::ROOM_TTL_SECONDS);

        $joinUrl = route('rooms.join', ['code' => $code]);

        return response()->json([
            'success' => true,
            'room' => array_merge($roomData, [
                'listenerCount' => 1,
                'joinUrl' => $joinUrl,
                'serverTime' => $now,
            ]),
        ], 201);
    }

    /**
     * Retrieve the current state of a room.
     */
    public function show(string $code): JsonResponse
    {
        $normalizedCode = strtoupper(trim($code));
        $room = Cache::get("room_{$normalizedCode}");

        if (! $room) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi room tidak ditemukan atau telah berakhir.',
            ], 404);
        }

        $listenerCount = $this->getCleanedListenerCount($normalizedCode);

        return response()->json([
            'success' => true,
            'room' => array_merge($room, [
                'listenerCount' => $listenerCount,
                'serverTime' => (int) (microtime(true) * 1000),
            ]),
        ]);
    }

    /**
     * Sync state updates from Host.
     */
    public function sync(string $code, Request $request): JsonResponse
    {
        $normalizedCode = strtoupper(trim($code));
        $room = Cache::get("room_{$normalizedCode}");

        if (! $room) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi room tidak ditemukan atau telah berakhir.',
            ], 404);
        }

        $validated = $request->validate([
            'surahId' => ['nullable', 'integer', 'between:1,114'],
            'ayahNumber' => ['nullable', 'integer', 'min:1'],
            'timestampMs' => ['nullable', 'integer', 'min:0'],
            'status' => ['nullable', 'in:playing,paused'],
            'reciterId' => ['nullable', 'integer'],
            'mushafType' => ['nullable', 'in:uthmani,indopak'],
            'hostDeviceId' => ['nullable', 'string', 'max:100'],
        ]);

        foreach ($validated as $key => $val) {
            if ($val !== null) {
                $room[$key] = $val;
            }
        }

        $room['updatedAt'] = (int) (microtime(true) * 1000);

        Cache::put("room_{$normalizedCode}", $room, self::ROOM_TTL_SECONDS);

        $listenerCount = $this->getCleanedListenerCount($normalizedCode);
        $fullRoom = array_merge($room, [
            'listenerCount' => $listenerCount,
            'serverTime' => (int) (microtime(true) * 1000),
        ]);

        try {
            broadcast(new RoomSyncEvent($normalizedCode, $fullRoom))->toOthers();
        } catch (\Throwable $e) {
            report($e);
        }

        return response()->json([
            'success' => true,
            'room' => $fullRoom,
        ]);
    }

    /**
     * Update heartbeat presence and touch room TTL.
     */
    public function heartbeat(string $code, Request $request): JsonResponse
    {
        $normalizedCode = strtoupper(trim($code));
        $room = Cache::get("room_{$normalizedCode}");

        if (! $room) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi room tidak ditemukan atau telah berakhir.',
            ], 404);
        }

        $deviceId = $request->input('deviceId') ?: (string) Str::uuid();
        $listeners = Cache::get("room_{$normalizedCode}_listeners", []);
        $listeners[$deviceId] = now()->timestamp;

        // Prune stale listeners older than threshold
        $cutoff = now()->timestamp - self::PRESENCE_THRESHOLD_SECONDS;
        $activeListeners = array_filter($listeners, fn ($timestamp) => $timestamp >= $cutoff);

        Cache::put("room_{$normalizedCode}_listeners", $activeListeners, self::ROOM_TTL_SECONDS);
        Cache::put("room_{$normalizedCode}", $room, self::ROOM_TTL_SECONDS);

        return response()->json([
            'success' => true,
            'listenerCount' => max(1, count($activeListeners)),
            'serverTime' => (int) (microtime(true) * 1000),
        ]);
    }

    /**
     * Close and delete a room session.
     */
    public function destroy(string $code): JsonResponse
    {
        $normalizedCode = strtoupper(trim($code));

        Cache::forget("room_{$normalizedCode}");
        Cache::forget("room_{$normalizedCode}_listeners");

        try {
            broadcast(new RoomClosedEvent($normalizedCode))->toOthers();
        } catch (\Throwable $e) {
            report($e);
        }

        return response()->json([
            'success' => true,
            'message' => 'Sesi room berhasil ditutup.',
        ]);
    }

    /**
     * Inertia page for listeners joining the room.
     */
    public function join(string $code, Request $request): Response
    {
        $normalizedCode = strtoupper(trim($code));
        $room = Cache::get("room_{$normalizedCode}");

        if (! $room) {
            return Inertia::render('Listen/Room', [
                'room' => null,
                'roomCode' => $normalizedCode,
                'error' => 'Sesi Listen Together tidak ditemukan atau telah ditutup oleh Host.',
                'chapter' => null,
                'verses' => [],
                'recitation' => null,
            ]);
        }

        $language = $request->query('lang', 'id');
        $surahId = (int) ($room['surahId'] ?? 1);
        $reciterId = (int) ($room['reciterId'] ?? 7);

        $chapter = $this->quran->getChapter($surahId, $language);
        $versesData = $this->quran->getVersesByChapter($surahId, [
            'language' => $language,
            'words' => true,
            'translations' => '33', // Kemenag RI
        ]);
        $recitation = $this->quran->getChapterRecitation($reciterId, $surahId);

        $listenerCount = $this->getCleanedListenerCount($normalizedCode);

        return Inertia::render('Listen/Room', [
            'room' => array_merge($room, [
                'listenerCount' => $listenerCount,
                'serverTime' => (int) (microtime(true) * 1000),
            ]),
            'roomCode' => $normalizedCode,
            'error' => null,
            'chapter' => $chapter,
            'verses' => $versesData['verses'] ?? [],
            'recitation' => $recitation,
        ]);
    }

    /**
     * Generate an unambiguous, memorable 6-character room code.
     */
    protected function generateUniqueRoomCode(): string
    {
        $characters = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
        $maxAttempts = 10;

        for ($i = 0; $i < $maxAttempts; $i++) {
            $code = '';
            for ($j = 0; $j < 6; $j++) {
                $code .= $characters[random_int(0, strlen($characters) - 1)];
            }

            if (! Cache::has("room_{$code}")) {
                return $code;
            }
        }

        // Fallback with random alphanumeric suffix
        return strtoupper(Str::random(6));
    }

    /**
     * Filter and count active listeners.
     */
    protected function getCleanedListenerCount(string $code): int
    {
        $listeners = Cache::get("room_{$code}_listeners", []);
        $cutoff = now()->timestamp - self::PRESENCE_THRESHOLD_SECONDS;
        $activeListeners = array_filter($listeners, fn ($timestamp) => $timestamp >= $cutoff);

        if (count($activeListeners) !== count($listeners)) {
            Cache::put("room_{$code}_listeners", $activeListeners, self::ROOM_TTL_SECONDS);
        }

        return max(1, count($activeListeners));
    }
}
