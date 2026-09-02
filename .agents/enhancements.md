# 💡 Anisul Qur'an - Log Saran & Penambahan Fitur (Enhancements Tracker)

> File pelacak riwayat saran, permintaan fitur baru, dan penyempurnaan di luar scope awal [`.agents/tasks.md`](tasks.md).  
> **Status Legenda**: `[ ]` Direncanakan · `[/]` Sedang dikerjakan · `[x]` Selesai & Terverifikasi

---

## 📌 Daftar Saran & Penyempurnaan Terkini (Batch 1)

| No | Fitur / Saran | Kategori | Target File | Status |
|:---|:---|:---:|:---|:---:|
| **E-01** | **Halaman Custom Error (404, 500, 403, 503)** | UX & Resilience | `resources/js/Pages/Error.vue`, `bootstrap/app.php` | `[x]` |
| **E-02** | **Dual Reading Modes (Mode Ayat vs Mode Mushaf Fisik)** | Core Feature | `resources/js/Pages/Surah/Show.vue`, `resources/js/components/MushafPageView.vue` | `[x]` |
| **E-03** | **Pembuatan Logo Khusus & Favicon Aplikasi** | Branding & Identity | `resources/js/components/AppLogo.vue`, `public/favicon.svg` | `[x]` |
| **E-04** | **Penerapan Impeccable Motion & Animate pada Fase 1** | Animation & Polish | `resources/css/app.css`, `Surah/Index.vue`, `SurahCard.vue` | `[x]` |

---

## 📝 Rincian Spesifikasi & Implementasi

### 1. [E-01] Halaman Custom Error (404, 500, 403, 503)
- **Kebutuhan**: Menyediakan tampilan error ramah pengguna dengan nuansa islami, tombol kembali ke beranda, dan navigasi cepat saat terjadi route/halaman tidak ditemukan atau kegagalan server.
- **Implementasi**:
  - Buat komponen `resources/js/Pages/Error.vue` yang menangani status code `404`, `500`, `403`, `503`.
  - Integrasikan handler di `bootstrap/app.php` agar Inertia otomatis merender `Error.vue` saat ada HTTPException.

### 2. [E-02] Dual Reading Modes (Mode Ayat vs Mode Mushaf Fisik)
- **Kebutuhan**: Di halaman Surah, pengguna dapat memilih 2 mode pembacaan:
  1. **Mode Baca Per Ayat**: Tampilan baris per baris dengan terjemahan, transliterasi, dan tombol putar individual (Cocok untuk belajar tafsir dan muroja'ah hafalan).
  2. **Mode Baca Per Lembar / Mushaf Fisik**: Tampilan teks Arab mengalir (*continuous flowing text*) yang dikelompokkan per nomor halaman Mushaf Madinah (halaman 1 - 604) lengkap dengan ornamen nomor ayat inline (`۝`) seperti membaca mushaf cetak.
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
