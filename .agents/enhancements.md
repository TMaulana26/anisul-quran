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
| **E-05** | **Interactive Footnote Popover (Catatan Kaki Kemenag)** | Interactivity & Tafsir | `resources/js/components/AyahItem.vue`, `QuranFoundationService.php` | `[ ]` |

---

## 🐛 Daftar Perbaikan Bug & Polishing Post-Fase 1 (QA Fixes)

| No | Masalah / Bug Fix | Penyebab Utama | Solusi yang Diterapkan | Status |
|:---|:---|:---|:---|:---:|
| **B-01** | **Karakter Kotak Kosong (Tofu `□`) pada Rasm IndoPak** | API `text_indopak` memiliki karakter stop signs PUA (`U+E000`-`U+F8FF`) dan *zero-width* BOM yang tidak didukung font standar. | Dibuat `resources/js/lib/quranUtils.js` untuk memetakan tanda waqf PUA ke standar Unicode Al-Qur'an (` ۚ`, ` ۘ`, ` ۗ`, dll.) & menambahkan font IndoPak (`Gulzar`, `Scheherazade New`). | `[x]` |
| **B-02** | **Tombol Toggle Transliterasi (Latin) Belum Tersedia** | Tombol toggle belum dipasang di kontrol bar dan status preferensi belum dipersistensikan. | Menambahkan tombol toggle `Latin` di kontrol bar `Surah/Show.vue` dan menyimpan preferensi di `localStorage` (`anisul_show_transliteration`). | `[x]` |
| **B-03** | **Posisi Teks Arab Pendek Rata Kiri di Kartu Ayat** | Container teks Arab menggunakan `flex justify-end` di dalam container `dir="rtl"`, yang membalikkan posisi ke kiri. | Mengubah container teks Arab menjadi `text-right` tegas dan memastikan terjemahan/Latin tetap `text-left` (LTR). | `[x]` |
| **B-04** | **Angka Catatan Kaki Menempel pada Teks Terjemahan** | Regex pembersih HTML sebelumnya hanya menghapus tag `<sup>`, meninggalkan angka indeks footnote (misal: `.1`). | Dibuat fungsi `cleanTranslationText()` yang menghapus seluruh blok `<sup foot_note=...>...</sup>` beserta angka footnote di dalamnya dan merapikan spasi tanda baca. | `[x]` |

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

### 3. [E-03] Pembuatan Logo Khusus & Favicon Aplikasi
- **Kebutuhan**: Menghasilkan logo islami modern yang elegan untuk Anisul Qur'an dan memperbarui favicon browser.
- **Implementasi**:
  - Buat komponen SVG `resources/js/components/AppLogo.vue` (Desain Mushaf terbuka berpadu bintang segi delapan islami dan aksen hijau zamrud/emas).
  - Pasang di `public/favicon.svg` dan header `AppLayout.vue`.

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
