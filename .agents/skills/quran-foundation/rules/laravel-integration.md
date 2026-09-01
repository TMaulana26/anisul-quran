# Laravel Integration for Quran Foundation

## Service Architecture

Create a dedicated Laravel Service class `App\Services\QuranFoundationService` to encapsulate all API communications with caching and error handling.

### Pattern:
```php
namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class QuranFoundationService
{
    protected string $baseUrl;
    protected ?string $apiKey;

    public function __construct()
    {
        $this->baseUrl = config('services.quran_foundation.base_url', 'https://api.quran.com/api/v4');
        $this->apiKey = config('services.quran_foundation.api_key');
    }

    public function getChapters(string $language = 'id'): array
    {
        return Cache::remember("quran:chapters:{$language}", now()->addDays(7), function () use ($language) {
            $response = Http::baseUrl($this->baseUrl)
                ->timeout(10)
                ->retry(2, 200)
                ->get('/chapters', ['language' => $language]);

            return $response->throw()->json('chapters', []);
        });
    }

    public function getVersesByChapter(int $chapterId, array $params = []): array
    {
        $cacheKey = "quran:chapter:{$chapterId}:" . md5(serialize($params));
        return Cache::remember($cacheKey, now()->addDays(3), function () use ($chapterId, $params) {
            $response = Http::baseUrl($this->baseUrl)
                ->timeout(15)
                ->retry(2, 200)
                ->get("/verses/by_chapter/{$chapterId}", $params);

            return $response->throw()->json();
        });
    }
}
```

### Passing Data to Vue via Inertia
In Controllers:
```php
public function show(int $id, QuranFoundationService $quran)
{
    $chapter = $quran->getChapter($id);
    $verses = $quran->getVersesByChapter($id, [
        'language' => 'id',
        'words' => true,
        'translations' => '33', // Kemenag ID
    ]);

    return Inertia::render('Quran/Show', [
        'chapter' => $chapter,
        'verses' => $verses,
    ]);
}
```
