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
        ini_set('memory_limit', '512M');

        $defaultParams = [
            'language' => 'id',
            'words' => true,
            'word_fields' => 'text_uthmani,text_indopak',
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
                    $data = $response->json();
                    $verses = $data['verses'] ?? [];

                    $cleanVerses = array_map(function (array $verse): array {
                        $cleanWords = [];
                        if (! empty($verse['words'])) {
                            foreach ($verse['words'] as $w) {
                                $cleanWords[] = [
                                    'id' => $w['id'] ?? null,
                                    'position' => $w['position'] ?? null,
                                    'char_type_name' => $w['char_type_name'] ?? 'word',
                                    'text_uthmani' => $w['text_uthmani'] ?? $w['text'] ?? '',
                                    'text_indopak' => $w['text_indopak'] ?? $w['text'] ?? '',
                                    'transliteration' => isset($w['transliteration']['text']) ? ['text' => $w['transliteration']['text']] : null,
                                    'translation' => isset($w['translation']['text']) ? ['text' => $w['translation']['text']] : null,
                                ];
                            }
                        }

                        $cleanTranslations = [];
                        if (! empty($verse['translations'])) {
                            foreach ($verse['translations'] as $t) {
                                $cleanTranslations[] = [
                                    'id' => $t['id'] ?? null,
                                    'resource_id' => $t['resource_id'] ?? 33,
                                    'text' => $t['text'] ?? '',
                                ];
                            }
                        }

                        return [
                            'id' => $verse['id'],
                            'verse_number' => $verse['verse_number'],
                            'verse_key' => $verse['verse_key'],
                            'juz_number' => $verse['juz_number'] ?? 1,
                            'page_number' => $verse['page_number'] ?? 1,
                            'text_uthmani' => $verse['text_uthmani'] ?? '',
                            'text_indopak' => $verse['text_indopak'] ?? '',
                            'translations' => $cleanTranslations,
                            'words' => $cleanWords,
                        ];
                    }, $verses);

                    return [
                        'verses' => $cleanVerses,
                        'pagination' => $data['pagination'] ?? null,
                    ];
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
                // Endpoint returns audio_file with audio_url and timestamps / segments
                $response = $this->client()->get("/chapter_recitations/{$reciterId}/{$chapterId}", [
                    'segments' => true,
                ]);

                if ($response->successful()) {
                    $audioFile = $response->json('audio_file');
                    if ($audioFile) {
                        // Standardize verse_timings property (API uses 'timestamps')
                        $audioFile['verse_timings'] = $audioFile['timestamps'] ?? $audioFile['verse_timings'] ?? [];

                        return $audioFile;
                    }
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
     * Retrieve footnote explanation text by ID with smart fallback for merged footnotes.
     *
     * @return array<string, mixed>|null
     */
    public function getFootnote(int $id): ?array
    {
        $cacheKey = "quran:footnote:{$id}";

        return Cache::remember($cacheKey, now()->addDays(7), function () use ($id) {
            try {
                $response = $this->client()->get("/foot_notes/{$id}");

                if ($response->successful() && $response->json('foot_note')) {
                    return $response->json('foot_note');
                }

                // Smart fallback: When adjacent footnotes in Kemenag data are merged into preceding record (id - 1)
                if ($response->status() === 404 && $id > 1) {
                    $fallbackResponse = $this->client()->get('/foot_notes/'.($id - 1));
                    if ($fallbackResponse->successful() && $fallbackResponse->json('foot_note')) {
                        return $fallbackResponse->json('foot_note');
                    }
                }

                return [
                    'id' => $id,
                    'text' => 'Penjelasan catatan kaki ini digabungkan pada catatan sebelumnya atau belum tersedia dari sumber data Kemenag.',
                    'language_name' => 'indonesian',
                ];
            } catch (Throwable $e) {
                Log::error("Exception fetching footnote {$id} from Quran Foundation API", [
                    'message' => $e->getMessage(),
                ]);

                return [
                    'id' => $id,
                    'text' => 'Penjelasan catatan kaki tidak dapat dimuat saat ini. Silakan coba sesaat lagi.',
                    'language_name' => 'indonesian',
                ];
            }
        });
    }
}
