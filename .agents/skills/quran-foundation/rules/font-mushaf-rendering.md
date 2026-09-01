# Quran Fonts & Mushaf Page Layout

Quran Foundation provides high-precision font rendering and page layouts for digital Mushafs.

## Font Standards & Glyph Encodings

1. **King Fahd Complex QCF v1 / v2 (Page-by-page fonts)**:
   - Encodes specific font files per page (`p1.woff2`, `p2.woff2`, ..., `p604.woff2`).
   - Ensures authentic 15-line Madinah Mushaf layout where every ayah aligns exactly to the physical page.

2. **IndoPak Script**:
   - `text_indopak` representation with Nastaliq/IndoPak diacritics and ligatures for South Asian / Indonesian style reading.

3. **Uthmani Script**:
   - `text_uthmani` standard Unicode Hafs text.
   - `text_uthmani_tajweed` with color-coded Tajweed rule glyphs (Ghunnah, Ikhfa, Idgham, Qalqalah, Madd).

## Layout Principles in Vue 3 / CSS

- Apply `direction: rtl` and font family with `dir="rtl"` attribute.
- Word-by-word tooltip mapping: each word includes `audio_url`, `translation`, and `transliteration`.
- Highlighting active word during audio playback via word timestamp markers.
