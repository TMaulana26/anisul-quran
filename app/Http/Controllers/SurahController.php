<?php

namespace App\Http\Controllers;

use App\Services\QuranFoundationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SurahController extends Controller
{
    public function __construct(
        protected QuranFoundationService $quran
    ) {}

    /**
     * Display a listing of all 114 Surahs.
     */
    public function index(Request $request): Response
    {
        $language = $request->query('lang', 'id');
        $chapters = $this->quran->getChapters($language);
        $reciters = $this->quran->getReciters($language);

        return Inertia::render('Surah/Index', [
            'chapters' => $chapters,
            'reciters' => $reciters,
        ]);
    }

    /**
     * Display a specific Surah with its verses, translations, and audio timestamps.
     */
    public function show(int $id, Request $request): Response
    {
        if ($id < 1 || $id > 114) {
            abort(404, 'Surah tidak ditemukan.');
        }

        $language = $request->query('lang', 'id');
        $chapter = $this->quran->getChapter($id, $language);

        if (! $chapter) {
            abort(404, 'Surah tidak ditemukan.');
        }

        $reciterId = (int) $request->query('reciter', 7); // 7: Mishary Rashid Alafasy default
        $versesData = $this->quran->getVersesByChapter($id, [
            'language' => $language,
            'words' => true,
            'translations' => '33', // Kemenag RI
        ]);

        $chapterInfo = $this->quran->getChapterInfo($id, $language);
        $reciters = $this->quran->getReciters($language);
        $recitation = $this->quran->getChapterRecitation($reciterId, $id);

        $prevChapter = $id > 1 ? $this->quran->getChapter($id - 1, $language) : null;
        $nextChapter = $id < 114 ? $this->quran->getChapter($id + 1, $language) : null;

        return Inertia::render('Surah/Show', [
            'chapter' => $chapter,
            'chapterInfo' => $chapterInfo,
            'verses' => $versesData['verses'] ?? [],
            'pagination' => $versesData['pagination'] ?? null,
            'recitation' => $recitation,
            'reciters' => $reciters,
            'selectedReciterId' => $reciterId,
            'prevChapter' => $prevChapter ? [
                'id' => $prevChapter['id'],
                'name_simple' => $prevChapter['name_simple'],
                'name_arabic' => $prevChapter['name_arabic'],
            ] : null,
            'nextChapter' => $nextChapter ? [
                'id' => $nextChapter['id'],
                'name_simple' => $nextChapter['name_simple'],
                'name_arabic' => $nextChapter['name_arabic'],
            ] : null,
        ]);
    }

    /**
     * Fetch recitation audio & timestamp markers for dynamic Qari switching.
     */
    public function recitation(int $id, Request $request): JsonResponse
    {
        $reciterId = (int) $request->query('reciter', 7);
        $recitation = $this->quran->getChapterRecitation($reciterId, $id);

        if (! $recitation) {
            return response()->json([
                'message' => 'Audio tidak tersedia untuk qari yang dipilih.',
            ], 404);
        }

        return response()->json([
            'recitation' => $recitation,
            'reciter_id' => $reciterId,
            'chapter_id' => $id,
        ]);
    }

    /**
     * Fetch footnote explanation by ID.
     */
    public function footnote(int $id): JsonResponse
    {
        $footnote = $this->quran->getFootnote($id);

        return response()->json([
            'footnote' => $footnote,
        ]);
    }
}
