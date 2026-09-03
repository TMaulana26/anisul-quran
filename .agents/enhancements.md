# 💡 Anisul Qur'an - Log Saran, Penambahan Fitur & Bug Fixes (Enhancements Tracker)

> File pelacak riwayat saran pengguna, permintaan fitur baru, dan perbaikan bug (*QA fixes*) di luar scope awal [`.agents/tasks.md`](tasks.md).  
> **Status Legenda**: `[ ]` Direncanakan · `[/]` Sedang dikerjakan · `[x]` Selesai & Terverifikasi

---

## 📌 Daftar Saran & Penyempurnaan Fitur (Enhancements)

| No | Fitur / Saran | Kategori | Target File | Status |
|:---|:---|:---:|:---|:---:|
| **E-01** | **Halaman Custom Error (404, 500, 403, 503)** | UX & Resilience | `resources/js/Pages/Error.vue`, `bootstrap/app.php` | `[x]` |
| **E-02** | **Dual Reading Modes (Mode Ayat vs Mode Mushaf Fisik)** | Core Feature | `resources/js/Pages/Surah/Show.vue`, `resources/js/components/MushafPageView.vue` | `[x]` |
| **E-03** | **Pembuatan Logo Khusus & Favicon Aplikasi** | Branding & Identity | `resources/js/components/AppLogo.vue`, `public/favicon.svg` | `[x]` |
| **E-04** | **Penerapan Impeccable Motion & Animate pada Fase 1** | Animation & Polish | `resources/css/app.css`, `Surah/Index.vue`, `SurahCard.vue` | `[x]` |
| **E-05** | **Interactive Footnote Popover (Catatan Kaki Kemenag)** | Interactivity & Tafsir | `resources/js/components/AyahItem.vue`, `QuranFoundationService.php` | `[x]` |
| **E-06** | **Penggunaan Font "Fraunces Variable" untuk Heading & Logo** | Typography & Identity | `public/fonts/Fraunces.woff2`, `resources/css/app.css` | `[x]` |
| **E-07** | **Ornamen Seni Islami Bulan Sabit & Animasi Impeccable** | Visual Design & Motion | `resources/js/components/DecorativeMoon.vue`, `Surah/Index.vue` | `[x]` |
| **E-08** | **Mode Fokus Zen (Distraction-Free Karaoke View)** | Player UX & Meditative Reading | `resources/js/components/player/ZenPlayerView.vue`, `Surah/Show.vue`, `AudioPlayerBar.vue` | `[x]` |
| **E-09** | **Ornamen Tanda Akhir Ayat Al-Qur'an (Quranic Ayah Rosette Medallion)** | Islamic Art & Typography | `resources/js/components/AyahEndOrnament.vue`, `quranUtils.js`, `ZenPlayerView.vue`, `AyahItem.vue`, `MushafPageView.vue` | `[x]` |
| **E-10** | **Modal Pemilihan Qari 3x4 Grid & Highlight Murattal (Hijau) / Mujawwad (Biru)** | Player UI & Layout | `resources/js/components/player/ReciterSelectorModal.vue`, `resources/css/app.css` | `[x]` |
| **E-11** | **Popover Kecepatan & Volume dengan Outside Click & Anti-Clipping** | UX & Micro-interactions | `resources/js/components/player/AudioPlayerBar.vue` | `[x]` |
| **E-12** | **Kontrol Volume Interaktif (Slider & Mute) pada Layar Penuh Mode Zen** | Player UX & Feature Parity | `resources/js/components/player/ZenPlayerView.vue` | `[x]` |
| **E-13** | **Elevasi & Spacing Bottom Margin Player Bar Saat Dikecilkan (Collapsed)** | Responsive UX & Polish | `resources/js/components/player/AudioPlayerBar.vue` | `[x]` |
| **E-14** | **Right Drawer Slide-over Pengaturan & Preferensi Pengguna Lengkap** | User Preferences & Settings | `resources/js/components/player/SettingsDrawer.vue`, `Surah/Show.vue` | `[x]` |
| **E-15** | **Global User Preferences Architecture & Top Navbar Drawer Integration** | Global State & Architecture | `resources/js/composables/useUserPreferences.js`, `resources/js/Layouts/AppLayout.vue`, `HandleInertiaRequests.php` | `[x]` |
| **E-16** | **Komponen Select shadcn-vue Berstandar Aksesibilitas (Reka UI) untuk Pemilihan Qari** | UI Components & Accessibility | `resources/js/components/ui/select/*`, `SettingsDrawer.vue`, `package.json` | `[x]` |

---

## 🐛 Daftar Perbaikan Bug & Polishing Post-Fase 1 (QA Fixes)

| No | Masalah / Bug Fix | Penyebab Utama | Solusi yang Diterapkan | Status |
|:---|:---|:---|:---|:---:|
| **B-01** | **Karakter Kotak Kosong (Tofu `□`) pada Rasm IndoPak** | API `text_indopak` memiliki karakter stop signs PUA (`U+E000`-`U+F8FF`) dan *zero-width* BOM yang tidak didukung font standar. | Dibuat `resources/js/lib/quranUtils.js` untuk memetakan tanda waqf PUA ke standar Unicode Al-Qur'an (` ۚ`, ` ۘ`, ` ۗ`, dll.) & menambahkan font IndoPak (`Gulzar`, `Scheherazade New`). | `[x]` |
| **B-02** | **Tombol Toggle Transliterasi (Latin) Belum Tersedia** | Tombol toggle belum dipasang di kontrol bar dan status preferensi belum dipersistensikan. | Menambahkan tombol toggle `Latin` di kontrol bar `Surah/Show.vue` dan menyimpan preferensi di `localStorage` (`anisul_show_transliteration`). | `[x]` |
| **B-03** | **Posisi Teks Arab Pendek Rata Kiri di Kartu Ayat** | Container teks Arab menggunakan `flex justify-end` di dalam container `dir="rtl"`, yang membalikkan posisi ke kiri. | Mengubah container teks Arab menjadi `text-right` tegas dan memastikan terjemahan/Latin tetap `text-left` (LTR). | `[x]` |
| **B-04** | **Angka Catatan Kaki Menempel pada Teks Terjemahan** | Regex pembersih HTML sebelumnya hanya menghapus tag `<sup>`, meninggalkan angka indeks footnote (misal: `.1`). | Dibuat fungsi `cleanTranslationText()` yang menghapus seluruh blok `<sup foot_note=...>...</sup>` beserta angka footnote di dalamnya dan merapikan spasi tanda baca. | `[x]` |
| **B-05** | **Error 404 pada Catatan Kaki yang Digabungkan (Merged Footnotes)** | Upstream Quran Foundation API menggabungkan penjelasan catatan berurutan pada record pertama (`id - 1`), sehingga ID kedua bernilai 404 (misal: 3:7 catatan no. 2). | Diterapkan *smart fallback lookup* otomatis ke `id - 1` pada `QuranFoundationService.php` dan sanitasi teks HTML di `FootnoteDialog.vue`. | `[x]` |
| **B-06** | **Animasi Reset / Patah Saat Kursor Keluar dari Hover DecorativeMoon** | CSS rule `:hover` menimpa properti `transform` pada elemen yang sama dengan `animation: celestialFloat`, menyebabkan *reset snap* saat kursor keluar. | Memisahkan lapisan gerak menjadi 2 layer independen: outer layer untuk loop *celestial float* kontinu dan inner layer untuk mikro-interaksi *hover transition*. | `[x]` |
| **B-07** | **Karakter Terbaca "أ ب ب ب" pada Teks Kata Per Kata (Word-by-word)** | Quran Foundation API secara default mengembalikan kode glif QCF (`code_v1`) pada `word.text` jika parameter `word_fields` tidak disertakan, yang dirender sebagai huruf acak pada font standar. | Menambahkan `word_fields=text_uthmani,text_indopak` pada API request dan memetakan kata ke `text_uthmani`/`text_indopak` standar Unicode. | `[x]` |
| **B-08** | **Allowed Memory Size Exhausted (128MB) pada Surah Panjang (Surah 2 Al-Baqarah)** | Mengambil 286 ayat sekaligus dengan ribuan objek `words` yang tidak disanitasi serta mengoper seluruh 114 objek `allChapters` ke Inertia melebihi batas memori PHP 128M. | Memangkas (*sanitize*) payload `words` & `verses` hanya ke kolom esensial di backend, serta mengganti `allChapters` dengan `prevChapter` dan `nextChapter` ringan, menurunkan konsumsi memori dari >128MB ke <15MB. | `[x]` |
| **B-10** | **Error 404 Saat Mengganti Qari / Reciter (`/api/recitation/{id}`)** | Modal ganti qari memanggil route `/api/recitation/{id}?reciter=...` sedangkan route di `web.php` sebelumnya bernama `/api/surah/{id}/recitation`. | Menambahkan route alias `Route::get('/api/recitation/{id}', ...)` di `routes/web.php` dan menyinkronkan client fetch dengan fallback aman. | `[x]` |
| **B-11** | **Karakter Kotak Tofu (`□`) pada Teks Kata Per Kata IndoPak** | Array `words` dari Quran Foundation API memuat karakter waqf PUA khusus (`U+E021`, `U+E022`) yang sebelumnya belum disanitasi saat perulangan kata individual di template. | Menambahkan fungsi `getFormattedWordText()` di `quranUtils.js` dan sanitasi backend di `QuranFoundationService.php` untuk memfilter seluruh PUA glyph & artifak zero-width pada level kata. | `[x]` |
| **B-12** | **Nama Qari Hilang / Kosong di Dropdown Pengaturan & Modal (`(Murattal)`)** | Upstream Quran Foundation API `/resources/recitations` menggunakan key `reciter_name`, bukan `name`, sehingga pemanggilan `reciter.name` menghasilkan nilai `undefined`. | Menormalisasi data qari di `QuranFoundationService.php` agar memiliki properti `name` & `reciter_name`, serta menambahkan helper `getReciterName()` di frontend `SettingsDrawer.vue` dan `ReciterSelectorModal.vue`. | `[x]` |

---

## 📝 Rincian Spesifikasi & Implementasi

### 1. [E-01] Halaman Custom Error (404, 500, 403, 503)
- **Kebutuhan**: Menyediakan tampilan error ramah pengguna dengan nuansa islami, tombol kembali ke beranda, dan navigasi cepat saat terjadi route/halaman tidak ditemukan atau kegagalan server.
- **Implementasi**:
  - Buat komponen `resources/js/Pages/Error.vue` yang menangani status code `404`, `500`, `403`, `503`.
  - Integrasikan handler di `bootstrap/app.php` agar Inertia otomatis merender `Error.vue` saat ada HTTPException.

### 2. [E-02] Dual Reading Modes (Mode Ayat vs Mode Mushaf Fisik)
- **Kebutuhan**: Di halaman Surah, pengguna dapat memilih 2 mode pembacaan:
  1. **Mode Baca Per Ayat**: Tampilan baris per baris dengan terjemahan, transliterasi, dan tombol putar individual.
  2. **Mode Baca Per Lembar / Mushaf Fisik**: Tampilan teks Arab mengalir (*continuous flowing text*) yang dikelompokkan per nomor halaman Mushaf Madinah (halaman 1 - 604) lengkap dengan ornamen nomor ayat inline (`۝`).
- **Implementasi**:
  - Tambahkan toggle switch di kontrol bar `Surah/Show.vue`.
  - Buat komponen `MushafPageView.vue` untuk layout per halaman mushaf dengan header halaman, teks Arab rata kanan-kiri (*justified*), dan nomor halaman bawah.

### 3. [E-03] Pembuatan Logo Khusus, Reusable Component & Favicon Aplikasi
- **Kebutuhan**: Menghasilkan logo islami modern yang elegan untuk Anisul Qur'an dengan perpaduan mushaf terbuka dan equalizer gelombang audio (*M1-V1 Swiss Geometric Soundwave*), tipografi resmi `Fraunces`, warna `primary: sage emerald` pada kata *Qur'an*, serta komponen reusable yang mendukung 3 varian (*clean icon*, *stacked vertical*, dan *horizontal navbar*) dengan dukungan i18n untuk subtitle.
- **Implementasi**:
  - Dibuat komponen SVG murni `resources/js/components/AppLogo.vue` yang fleksibel dengan prop `variant` (`'clean'`, `'stacked'`, `'horizontal'`), `size`, `subtitle`, `subtitleKey`, serta slot `#subtitle`.
  - Terintegrasi dengan font `Fraunces` (`font-heading font-bold`), kata "Anisul" berwarna foreground dan "Qur'an" berwarna `text-primary`.
  - Diterapkan efek micro-interaction hover shimmer pada bilah equalizer dan proteksi `prefers-reduced-motion`.
  - Diperbarui `public/favicon.svg`, `public/logo.svg`, `public/logo.png` dan header `AppLayout.vue`.
  - Dibuat unit test komprehensif `resources/js/components/AppLogo.test.js` (5 test cases passed).

### 4. [E-04] Penerapan Impeccable Motion & Animate pada Fase 1
- **Kebutuhan**: Menerapkan motion bertujuan (*purposeful animation*) dengan standar Impeccable:
  - Staggered card entrance pada grid surah.
  - Smooth layout transition saat berganti mode baca (Ayat ↔ Mushaf).
  - Micro-interaction saat hover kartu surah dan tombol play.
  - Menghormati preferensi `prefers-reduced-motion`.

### 5. [E-05] Interactive Footnote Popover (Catatan Kaki Kemenag RI)
- **Kebutuhan**: Menampilkan nomor catatan kaki sebagai badge interaktif `⁽¹⁾` pada teks terjemahan yang jika diklik akan membuka tooltip/popover berisi penjelasan resmi dari endpoint `GET /foot_notes/{id}` Quran Foundation API.
- **Implementasi Rencana**:
  - Tambahkan method `getFootnote(int $id)` di `QuranFoundationService.php`.
  - Buat endpoint backend `GET /api/footnote/{id}` dengan caching.
  - Buat komponen popover/modal interaktif pada `AyahItem.vue`.
