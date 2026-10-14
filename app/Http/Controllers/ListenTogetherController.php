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
            'readingMode' => ['nullable', 'string', 'in:ayah,mushaf,khusyu'],
            'isKhusyuMode' => ['nullable', 'boolean'],
            'hostDeviceId' => ['nullable', 'string', 'max:100'],
        ]);

        $code = $this->generateUniqueRoomCode();
        $hostDeviceId = $validated['hostDeviceId'] ?? (string) Str::uuid();
        $now = (int) (microtime(true) * 1000);

        $isKhusyu = isset($validated['isKhusyuMode'])
            ? (bool) $validated['isKhusyuMode']
            : (($validated['readingMode'] ?? '') === 'khusyu');
        $readingMode = $validated['readingMode'] ?? ($isKhusyu ? 'khusyu' : 'ayah');

        $roomData = [
            'code' => $code,
            'hostDeviceId' => $hostDeviceId,
            'surahId' => (int) ($validated['surahId'] ?? 1),
            'ayahNumber' => (int) ($validated['ayahNumber'] ?? 1),
            'timestampMs' => (int) ($validated['timestampMs'] ?? 0),
            'status' => $validated['status'] ?? 'paused',
            'reciterId' => (int) ($validated['reciterId'] ?? 7),
            'mushafType' => $validated['mushafType'] ?? 'uthmani',
            'readingMode' => $readingMode,
            'isKhusyuMode' => $isKhusyu,
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
            'room' => $this->toPublicRoom($room, $listenerCount),
        ]);
    }

    /**
     * Sync state updates from Host.
     */
    public function sync(string $code, Request $request): JsonResponse
    {
        $normalizedCode = strtoupper(trim($code));

        $validated = $request->validate([
            'surahId' => ['nullable', 'integer', 'between:1,114'],
            'ayahNumber' => ['nullable', 'integer', 'min:1'],
            'timestampMs' => ['nullable', 'integer', 'min:0'],
            'status' => ['nullable', 'in:playing,paused'],
            'reciterId' => ['nullable', 'integer'],
            'mushafType' => ['nullable', 'in:uthmani,indopak'],
            'readingMode' => ['nullable', 'string', 'in:ayah,mushaf,khusyu'],
            'isKhusyuMode' => ['nullable', 'boolean'],
            'hostDeviceId' => ['nullable', 'string', 'max:100'],
        ]);

        $result = Cache::lock("room_{$normalizedCode}:lock", 5)->block(2, function () use ($normalizedCode, $request, $validated) {
            $room = Cache::get("room_{$normalizedCode}");

            if (! $room) {
                return ['status' => 404];
            }

            if (! $this->isAuthorizedHost($room, $request)) {
                return ['status' => 403];
            }

            $updates = $validated;
            unset($updates['hostDeviceId']);

            foreach ($updates as $key => $val) {
                if ($val !== null) {
                    $room[$key] = $val;
                }
            }

            if (array_key_exists('isKhusyuMode', $updates) && $updates['isKhusyuMode'] !== null) {
                $room['isKhusyuMode'] = (bool) $updates['isKhusyuMode'];
                if (! isset($updates['readingMode'])) {
                    $room['readingMode'] = $room['isKhusyuMode'] ? 'khusyu' : ($room['readingMode'] === 'khusyu' ? 'ayah' : ($room['readingMode'] ?? 'ayah'));
                }
            } elseif (array_key_exists('readingMode', $updates) && $updates['readingMode'] !== null) {
                $room['isKhusyuMode'] = ($updates['readingMode'] === 'khusyu');
            }

            $room['updatedAt'] = (int) (microtime(true) * 1000);

            Cache::put("room_{$normalizedCode}", $room, self::ROOM_TTL_SECONDS);

            return [
                'status' => 200,
                'room' => $room,
            ];
        });

        if ($result['status'] === 404) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi room tidak ditemukan atau telah berakhir.',
            ], 404);
        }

        if ($result['status'] === 403) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya Host yang memiliki izin untuk menyinkronkan sesi room ini.',
            ], 403);
        }

        $listenerCount = $this->getCleanedListenerCount($normalizedCode);
        $publicRoom = $this->toPublicRoom($result['room'], $listenerCount);

        try {
            broadcast(new RoomSyncEvent($normalizedCode, $publicRoom))->toOthers();
        } catch (\Throwable $e) {
            report($e);
        }

        return response()->json([
            'success' => true,
            'room' => $publicRoom,
        ]);
    }

    /**
     * Update heartbeat presence and touch room TTL.
     */
    public function heartbeat(string $code, Request $request): JsonResponse
    {
        $normalizedCode = strtoupper(trim($code));

        $validated = $request->validate([
            'deviceId' => ['nullable', 'string', 'max:100'],
        ]);

        $deviceId = $validated['deviceId'] ?? (string) Str::uuid();

        $listenerCount = Cache::lock("room_{$normalizedCode}:lock", 5)->block(2, function () use ($normalizedCode, $deviceId) {
            $room = Cache::get("room_{$normalizedCode}");

            if (! $room) {
                return null;
            }

            $listeners = Cache::get("room_{$normalizedCode}_listeners", []);
            $listeners[$deviceId] = now()->timestamp;

            // Prune stale listeners older than threshold
            $cutoff = now()->timestamp - self::PRESENCE_THRESHOLD_SECONDS;
            $activeListeners = array_filter($listeners, fn ($timestamp) => $timestamp >= $cutoff);

            Cache::put("room_{$normalizedCode}_listeners", $activeListeners, self::ROOM_TTL_SECONDS);
            Cache::put("room_{$normalizedCode}", $room, self::ROOM_TTL_SECONDS);

            return max(1, count($activeListeners));
        });

        if ($listenerCount === null) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi room tidak ditemukan atau telah berakhir.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'listenerCount' => $listenerCount,
            'serverTime' => (int) (microtime(true) * 1000),
        ]);
    }

    /**
     * Close and delete a room session.
     */
    public function destroy(string $code, Request $request): JsonResponse
    {
        $normalizedCode = strtoupper(trim($code));

        $status = Cache::lock("room_{$normalizedCode}:lock", 5)->block(2, function () use ($normalizedCode, $request) {
            $room = Cache::get("room_{$normalizedCode}");

            if (! $room) {
                return 404;
            }

            if (! $this->isAuthorizedHost($room, $request)) {
                return 403;
            }

            Cache::forget("room_{$normalizedCode}");
            Cache::forget("room_{$normalizedCode}_listeners");

            return 200;
        });

        if ($status === 404) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi room tidak ditemukan atau telah berakhir.',
            ], 404);
        }

        if ($status === 403) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya Host yang memiliki izin untuk menutup sesi room ini.',
            ], 403);
        }

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
            'room' => $this->toPublicRoom($room, $listenerCount),
            'roomCode' => $normalizedCode,
            'error' => null,
            'chapter' => $chapter,
            'verses' => $versesData['verses'] ?? [],
            'recitation' => $recitation,
        ]);
    }

    /**
     * Verify whether the incoming request originates from the room host.
     *
     * @param  array<string, mixed>  $room
     */
    protected function isAuthorizedHost(array $room, Request $request): bool
    {
        $expectedHostId = (string) ($room['hostDeviceId'] ?? '');
        $providedHostId = (string) ($request->input('hostDeviceId') ?? $request->header('X-Host-Device-Id', ''));

        if ($expectedHostId === '' || $providedHostId === '') {
            return false;
        }

        return hash_equals($expectedHostId, $providedHostId);
    }

    /**
     * Serialize room state for public listeners without exposing host credentials.
     *
     * @param  array<string, mixed>  $room
     * @return array<string, mixed>
     */
    protected function toPublicRoom(array $room, int $listenerCount): array
    {
        unset($room['hostDeviceId']);

        return array_merge($room, [
            'listenerCount' => $listenerCount,
            'serverTime' => (int) (microtime(true) * 1000),
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
