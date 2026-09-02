<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class QuranFoundationService
{
    protected string $baseUrl;

    protected ?string $apiKey;

    public function __construct()
    {
        $this->baseUrl = config('services.quran_foundation.base_url', 'https://api.quran.com/api/v4');
        $this->apiKey = config('services.quran_foundation.api_key');
    }

    /**
     * Create a pre-configured HTTP client instance.
     */
    protected function client(): PendingRequest
    {
        $client = Http::baseUrl($this->baseUrl)
            ->timeout(12)
            ->retry(2, 250);

        if ($this->apiKey) {
            $client = $client->withHeaders([
                'x-api-key' => $this->apiKey,
            ]);
        }

        return $client;
    }

    /**
     * Retrieve all 114 chapters (Surahs) of the Quran.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getChapters(string $language = 'id'): array
    {
        $cacheKey = "quran:chapters:{$language}";

        return Cache::remember($cacheKey, now()->addDays(7), function () use ($language) {
            try {
                $response = $this->client()->get('/chapters', [
                    'language' => $language,
                ]);

                if ($response->successful()) {
                    return $response->json('chapters', []);
                }

                Log::warning('Failed to fetch chapters from Quran Foundation API', [
                    'status' => $response->status(),
                ]);

                return [];
            } catch (Throwable $e) {
                Log::error('Exception fetching chapters from Quran Foundation API', [
                    'message' => $e->getMessage(),
                ]);

                return [];
            }
        });
    }

    /**
     * Retrieve a specific chapter (Surah) by ID.
     *
     * @return array<string, mixed>|null
     */
    public function getChapter(int $id, string $language = 'id'): ?array
    {
        $cacheKey = "quran:chapter:{$id}:{$language}";

        return Cache::remember($cacheKey, now()->addDays(7), function () use ($id, $language) {
            try {
                $response = $this->client()->get("/chapters/{$id}", [
                    'language' => $language,
                ]);

                if ($response->successful()) {
                    return $response->json('chapter');
                }

                return null;
            } catch (Throwable $e) {
                Log::error("Exception fetching chapter {$id} from Quran Foundation API", [
                    'message' => $e->getMessage(),
                ]);

                return null;
            }
        });
    }

    /**
     * Retrieve comprehensive background context and historical info for a chapter.
     *
     * @return array<string, mixed>|null
     */
    public function getChapterInfo(int $id, string $language = 'id'): ?array
    {
        $cacheKey = "quran:chapter_info:{$id}:{$language}";

        return Cache::remember($cacheKey, now()->addDays(7), function () use ($id, $language) {
            try {
                $response = $this->client()->get("/chapters/{$id}/info", [
                    'language' => $language,
                ]);

                if ($response->successful()) {
                    return $response->json('chapter_info');
                }

                return null;
            } catch (Throwable $e) {
                Log::error("Exception fetching chapter info {$id} from Quran Foundation API", [
                    'message' => $e->getMessage(),
                ]);

                return null;
            }
        });
    }

    /**
     * Retrieve verses by chapter with words, translations, and font fields.
     *
     * @param  array<string, mixed>  $params
     * @return array<string, mixed>
     */
    public function getVersesByChapter(int $chapterId, array $params = []): array
    {
        $defaultParams = [
            'language' => 'id',
            'words' => true,
            'translations' => '33', // 33: Indonesian Ministry of Religious Affairs (Kemenag RI)
            'fields' => 'text_uthmani,text_indopak,chapter_id,verse_key,verse_number,page_number,juz_number',
            'per_page' => 300, // Fetch all verses of the chapter in one request where possible
        ];

        $queryParams = array_merge($defaultParams, $params);
        $cacheKey = "quran:verses:{$chapterId}:".md5(json_encode($queryParams));

        return Cache::remember($cacheKey, now()->addDays(3), function () use ($chapterId, $queryParams) {
            try {
                $response = $this->client()->get("/verses/by_chapter/{$chapterId}", $queryParams);

                if ($response->successful()) {
                    return $response->json();
                }

                Log::warning("Failed to fetch verses for chapter {$chapterId}", [
                    'status' => $response->status(),
                ]);

                return ['verses' => []];
            } catch (Throwable $e) {
                Log::error("Exception fetching verses for chapter {$chapterId}", [
                    'message' => $e->getMessage(),
                ]);

                return ['verses' => []];
            }
        });
    }

    /**
     * Retrieve list of available Quran reciters (Qari).
     *
     * @return array<int, array<string, mixed>>
     */
    public function getReciters(string $language = 'id'): array
    {
        $cacheKey = "quran:recitations:{$language}";

        return Cache::remember($cacheKey, now()->addDays(7), function () use ($language) {
            try {
                $response = $this->client()->get('/resources/recitations', [
                    'language' => $language,
                ]);

                if ($response->successful()) {
                    return $response->json('recitations', []);
                }

                return [];
            } catch (Throwable $e) {
                Log::error('Exception fetching reciters from Quran Foundation API', [
                    'message' => $e->getMessage(),
                ]);

                return [];
            }
        });
    }

    /**
     * Retrieve audio recitation file & segment timestamps for a chapter.
     *
     * @return array<string, mixed>|null
     */
    public function getChapterRecitation(int $reciterId, int $chapterId): ?array
    {
        $cacheKey = "quran:audio:{$reciterId}:{$chapterId}";

        return Cache::remember($cacheKey, now()->addDays(3), function () use ($reciterId, $chapterId) {
            try {
                // Endpoint returns audio_file with audio_url and timestamps (verse_timings)
                $response = $this->client()->get("/recitations/{$reciterId}/by_chapter/{$chapterId}", [
                    'segments' => true,
                ]);

                if ($response->successful()) {
                    return $response->json('audio_file');
                }

                return null;
            } catch (Throwable $e) {
                Log::error("Exception fetching recitation for chapter {$chapterId} reciter {$reciterId}", [
                    'message' => $e->getMessage(),
                ]);

                return null;
            }
        });
    }

    /**
     * Search across Quran verses and translations.
     *
     * @return array<string, mixed>
     */
    public function search(string $query, int $page = 1, int $size = 20, string $language = 'id'): array
    {
        try {
            $response = $this->client()->get('/search', [
                'q' => $query,
                'page' => $page,
                'size' => $size,
                'language' => $language,
            ]);

            if ($response->successful()) {
                return $response->json('search', []);
            }

            return [];
        } catch (Throwable $e) {
            Log::error('Exception searching Quran Foundation API', [
                'query' => $query,
                'message' => $e->getMessage(),
            ]);

            return [];
        }
    }

    /**
     * Retrieve footnote explanation text by ID.
     *
     * @return array<string, mixed>|null
     */
    public function getFootnote(int $id): ?array
    {
        $cacheKey = "quran:footnote:{$id}";

        return Cache::remember($cacheKey, now()->addDays(7), function () use ($id) {
            try {
                $response = $this->client()->get("/foot_notes/{$id}");

                if ($response->successful()) {
                    return $response->json('foot_note');
                }

                return null;
            } catch (Throwable $e) {
                Log::error("Exception fetching footnote {$id} from Quran Foundation API", [
                    'message' => $e->getMessage(),
                ]);

                return null;
            }
        });
    }
}
