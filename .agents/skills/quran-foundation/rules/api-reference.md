# Quran Foundation API Reference

Base URL for Content & Search APIs:
- API Base: `https://api.quran.com/api/v4` (or Quran Foundation Gateway)

## Core Content Endpoints

### 1. Chapters (Surah)
- `GET /chapters` — List all 114 Surahs with name, revelation place, verses count.
- `GET /chapters/{id}` — Get single Surah info.
- `GET /chapters/{id}/info` — Get comprehensive historical context and background info of a Surah.

### 2. Verses (Ayat)
- `GET /verses/by_chapter/{chapter_number}` — Get verses by Surah.
  - Parameters:
    - `language` (e.g. `id`, `en`)
    - `words=true` (word-by-word data, audio, transliteration)
    - `translations` (comma-separated translation IDs, e.g. Indonesian Kemenag: `33`)
    - `tafsirs` (comma-separated tafsir IDs)
    - `fields` (e.g. `text_uthmani`, `text_indopak`, `image_url`, `chapter_id`)
    - `page`, `per_page` (pagination)
- `GET /verses/by_page/{page_number}` — Get verses for a specific Mushaf page (pages 1 to 604).
- `GET /verses/by_juz/{juz_number}` — Get verses by Juz (1 to 30).
- `GET /verses/by_key/{verse_key}` — Get single verse by key (e.g. `1:1`, `2:255`).

### 3. Translations & Tafsirs
- `GET /resources/translations` — List available translation resources with language codes and author names.
- `GET /resources/tafsirs` — List available tafsir books (e.g., Tafsir Ibn Kathir, Tafsir Jalalayn, Kemenag).
- `GET /tafsirs/{tafsir_id}/by_ayah/{verse_key}` — Fetch tafsir text for a specific ayah.

### 4. Audio Recitations (Qari)
- `GET /resources/recitations` — List available reciters (e.g., Mishary Rashid Alafasy, AbdulBaset, Mahmoud Khalil Al-Husary).
- `GET /recitations/{reciter_id}/by_chapter/{chapter_number}` — Get audio file URLs and timestamp markers for a surah.
- `GET /recitations/{reciter_id}/by_ayah/{verse_key}` — Get audio stream for a specific verse.

### 5. Search API
- `GET /search` — Full-text search across Quran verses and translations.
  - Parameters: `q` (query term), `size`, `page`, `language`.

### 6. Juzs & Rubs
- `GET /juzs` — List all 30 Juzs with start/end verse mapping.
