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
| **E-17** | **Smart Dynamic Font Auto-Fit & Zero-Scrollbar Architecture pada Mode Zen** | Typography & Zen Player UX | `ZenPlayerView.vue`, `resources/css/app.css` | `[x]` |
| **E-18** | **Cinematic Focus Window & Karaoke Streaming (Apple Music / Spotify Style) pada Mode Zen** | Immersive Player UX & Motion | `ZenPlayerView.vue`, `resources/css/app.css` | `[x]` |
| **E-19** | **Tri-Stream Word Karaoke (Arab + Latin + Arti per Kata) & Fix Overflow Clipping pada Mode Zen** | Word-by-Word Sync & Layout | `ZenPlayerView.vue`, `useQuranAudioPlayer.js`, `QuranFoundationService.php` | `[x]` |
| **E-20** | **Arsitektur 3-Row Terpisah Selaras (Row 1: Arab, Row 2: Latin, Row 3: Arti) dengan Sinkronisasi Karaoke Multi-Track** | UI/UX & Multi-Row Streaming | `KhusyuPlayerView.vue` | `[x]` |
| **E-21** | **Rebranding & Refactoring Mode Zen Menjadi Mode Khusyu' (خُشُوع) & Rename File KhusyuPlayerView** | Rebranding & Architecture | `KhusyuPlayerView.vue`, `Show.vue`, `AudioPlayerBar.vue`, `SettingsDrawer.vue`, `useUserPreferences.js` | `[x]` |
| **E-22** | **Line-by-Line Sanctuary (Anti-Terburu-buru, Zero Scrollbar) & 3 Live Mockup Konsep Visual Mode Khusyu'** | UI/UX, Immersive Craft & Accessibility | `KhusyuPlayerView.vue`, `app.css` | `[x]` |
| **E-23** | **Smart Adaptive Verse (Full/2-Line Chunks), Stable Card, Upward Exit / Downward Entry, & Word Underline** | Micro-interactions, Motion & UX | `KhusyuPlayerView.vue`, `app.css` | `[x]` |
| **E-24** | **Highlight Underline Kata Aktif di Mode Baca Per Ayat & Mode Mushaf Fisik serta Auto-Scroll Halus Saat Keluar Khusyu'** | Feature Parity & Reading UX | `AyahItem.vue`, `MushafPageView.vue`, `Show.vue` | `[x]` |
| **E-25** | **Suasana & Vibe Visual Global Aplikasi (Noor, Midnight, Warqah) Lintas Dark/Light Mode** | Design Tokens, Theming & Global UX | `app.css`, `AppLayout.vue`, `SettingsDrawer.vue`, `useUserPreferences.js`, `KhusyuPlayerView.vue` | `[x]` |
| **E-26** | **Perbaikan Spacing Cursive Natural & Peningkatan Ukuran Ornamen Nomor Ayat pada Mode Mushaf Fisik** | Typography, Legibility & Spacing | `MushafPageView.vue`, `AyahEndOrnament.vue` | `[x]` |
| **E-27** | **Perbaikan Kontras & Visual Bug Tombol Midnight saat dalam Mode Terang (Light Mode)** | Theming Contrast & Accessibility | `KhusyuPlayerView.vue`, `app.css`, `useUserPreferences.js` | `[x]` |
| **E-28** | **Pelebaran Jarak & Area Nafas Chevron Navigasi (Kiri-Kanan) di Mode Khusyu'** | UI/UX Spacing & Breathing Room | `KhusyuPlayerView.vue` | `[x]` |
| **E-29** | **Impeccable Polish Pass — Pembersihan 5 Anti-Pattern Detector, Harmonisasi Kontras Amber & Penguatan A11y WCAG AAA** | Quality Polish, Accessibility & Theme Tokens | `AppLayout.vue`, `KhusyuPlayerView.vue`, `AyahItem.vue`, `AudioPlayerBar.vue`, `app.css` | `[x]` |
| **E-30** | **Native View Transitions API & Silky Cross-Fade pada Pergantian Suasana (Vibe) dan Mode Light/Dark** | Animation & Theme Transition UX | `useUserPreferences.js`, `app.css`, `AppLayout.vue` | `[x]` |
| **E-31** | **Warna Indikator Loading Bar (NProgress Inertia) Dinamis Mengikuti Suasana / Vibe Aktif** | Navigation Feedback & Vibe Theming | `resources/js/app.js`, `resources/css/app.css` | `[x]` |
| **E-32** | **Impeccable Polish: Pembersihan Desain Top Navbar & Player Bar di Mode Khusyu' (Mobile Serenity)** | Impeccable Polish & Mobile UX | `resources/js/components/player/KhusyuPlayerView.vue`, `FollowerBanner.vue` | `[x]` |
| **E-33** | **Slider Kontrol Volume Bergaya Windows 11 dengan Dynamic Vibe Primary Fill & Live Persentase** | Player UX & Impeccable Polish | `resources/css/app.css`, `Room.vue`, `AudioPlayerBar.vue`, `KhusyuPlayerView.vue` | `[x]` |
| **E-34** | **Integrasi Laravel Reverb (WebSocket) untuk Real-Time Audio Sync (< 50ms), Zero HTTP Polling & Auto-Fallback di Fitur Dengar Bersama** | Real-Time Architecture & Performance | `RoomSyncEvent.php`, `useRoomSync.js`, `echo.js`, `ListenTogetherController.php`, `supervisord.conf`, `nginx.conf` | `[x]` |
| **E-35** | **Next Major: Mode Tadabbur Alam (Cinematic Video Sanctuary & Sacred Verses Background)** | Immersive Sanctuary & Nature Video | `TadabburPlayerView.vue`, `.agents/catatan.md` | `[ ]` |
| **E-36** | **Hybrid User Preference System (Global Visuals + Optional Per-Surah Qari Override)** | State Management & Architecture | `useUserPreferences.js`, `.agents/catatan.md` | `[ ]` |

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
| **B-13** | **ReferenceError: nextTick is not defined saat Keluar dari Mode Khusyu'** | `nextTick` dipanggil di watcher `isKhusyuMode` pada `Surah/Show.vue` tanpa diimpor dari package `'vue'`. | Menambahkan import `nextTick` pada statement import Vue di `resources/js/Pages/Surah/Show.vue`. | `[x]` |
| **B-14** | **Vue Warn: Extraneous non-props attributes (open) pada FootnoteDialog** | `KhusyuPlayerView.vue` memanggil `FootnoteDialog` dengan `v-model:open`, sedangkan `FootnoteDialog.vue` hanya mendefinisikan prop `modelValue` di root `<Teleport>`. | Menambahkan prop `open` dan emit `update:open` di `FootnoteDialog.vue` serta menyelaraskan pemanggilan menjadi `v-model="showFootnoteDialog"`. | `[x]` |
| **B-15** | **Teks HTML Mentah `<sup foot_note=...>` Terlihat pada Terjemahan Kartu Mode Khusyu'** | Teks terjemahan dari API yang memuat tag HTML footnote dirender langsung via string interpolation `{{ }}` tanpa sanitasi/tokenizing. | Mengintegrasikan `cleanTranslationText()` dan `parseTranslationTokens()` pada pembentukan chunk di `KhusyuPlayerView.vue`, serta merender nomor footnote sebagai tombol badge `[1]` interaktif. | `[x]` |
| **B-16** | **Ornamen Nomor Ayat Terpisah Sendirian pada Baris Baru (Orphan Wrap) di Mode Khusyu'** | Di baris akhir ayat, ornamen ayat diperlakukan sebagai elemen inline terpisah sehingga ketika lebar kontainer habis, hanya ornamen yang terdorong ke baris baru sendirian. | Mengikat kata terakhir ayat dengan `AyahEndOrnament` di dalam pembungkus `whitespace-nowrap inline-flex` sehingga kata terakhir dan ornamen selalu turun bersamaan jika baris penuh, serta menyesuaikan skala ornamen `khusyu` menjadi proporsional. | `[x]` |
| **B-17** | **Tombol Toggle Light/Dark Mode Tidak Mengubah Tampilan saat Berada di Suasana Midnight** | Selektor CSS `:root[data-vibe="midnight"], [data-vibe="midnight"]` sebelumnya menimpa seluruh variabel tema menjadi gelap gulita baik dengan atau tanpa kelas `.dark`. | Memisahkan tema Midnight menjadi dua palet: Mode Terang (Fajr Emas / Luminous Ivory) dan Mode Gelap (Tahajjud Velvet Obsidian), memperbarui varian Tailwind v4 `&:where(.dark, .dark *)`, dan memusatkan reactive state `isDark` & `toggleTheme` ke composable `useUserPreferences.js`. | `[x]` |
| **B-18** | **Format Indikator Waktu Audio Player Melebihi 60 Menit (`121:04`) Tanpa Format Jam** | Pada surah berdurasi panjang seperti Al-Baqarah (> 2 jam), format `formatAudioTime` sebelumnya hanya membagi total detik dengan 60 sehingga menghasilkan ratusan menit tanpa jam (misal `121:04` dan `01:23`). | Memperbarui `formatAudioTime(sec, forceHours)` untuk menghitung jam (`HH:MM:SS`), mengaktifkan `hasHours` saat durasi atau waktu putar $\ge 3600$ detik, dan memperlebar span waktu di `AudioPlayerBar.vue` dan `KhusyuPlayerView.vue` agar 8 karakter monospace tampil proporsional tanpa terpotong. | `[x]` |
| **B-19** | **Tombol "Mulai Sesi Dengar Bersama" Tidak Bereaksi Saat Diklik (Uncaught TypeError)** | Pada `ListenTogetherModal.vue`, kode sebelumnya mengakses `userPreferences.selectedReciterId.value` secara langsung padahal `useUserPreferences()` mengembalikan properti di dalam objek `preferences`, menyebabkan error JS `TypeError: Cannot read properties of undefined` dan dibungkam tanpa feedback. | Menambahkan computed getters pada `useUserPreferences.js`, merapikan pembacaan preferensi qari & mushaf di `ListenTogetherModal.vue` dan `Room.vue`, serta menambahkan visual error feedback dan console error logging saat pembuatan room gagal. | `[x]` |
| **B-20** | **Fitur Salin Kode & Tautan Room Tidak Berfungsi pada Non-Secure Context & Tanpa Tooltip Feedback** | Web API `navigator.clipboard` diblokir oleh browser di non-HTTPS/non-localhost (seperti domain Herd `http://anisul-quran.test`), menyebabkan `TypeError: Cannot read properties of undefined` yang gagal dalam `try...catch` tanpa indikator visual, serta ketiadaan tooltips pemberitahuan sukses salin. | Membuat fungsi utilitas `copyToClipboard()` di `resources/js/lib/utils.js` dengan fallback universal `document.execCommand('copy')`, menambahkan tooltip balon interaktif (`"Kode tersalin!"`, `"Tautan tersalin!"`) dengan panah penunjuk pada tombol salin di `ListenTogetherModal.vue`, serta menambahkan floating toast notifikasi sukses di bagian atas modal. | `[x]` |
| **B-21** | **QR Code Fitur "Dengar Bersama" Tidak Bisa Di-scan Kamera HP** | Generator QR kode hand-rolled sebelumnya tidak mendukung spesifikasi ISO/IEC 18004 untuk multi-block Reed-Solomon interleaving pada Version 4 ke atas (URL panjang $\ge 43$ karakter seperti `https://anisulquran.mtim.my.id/listen/AK7F29`), menyebabkan parity bytes korup dan decoder HP gagal membaca kode, serta quiet zone (margin) hanya 2 modul. | Mengimplementasikan generator QR code berstandar ISO/IEC 18004 (berbasis algoritma referensi Project Nayuki berlisensi MIT) tanpa external runtime dependencies di `resources/js/lib/qrcode.js`, mendukung auto-versioning & multi-block RS interleaving presisi, serta menetapkan quiet zone margin berstandar 4 modul di `ListenTogetherModal.vue`. | `[x]` |
| **B-22** | **Chevron Navigasi (Kiri & Kanan) Tidak Berfungsi Saat Surah Belum Diputar** | State `currentAyahNumber` diinisialisasi `null` dan hanya diisi saat audio mulai `play()`. Fungsi `nextAyah()` dan `prevAyah()` di `useQuranAudioPlayer.js` memiliki `guard if (!currentAyahNumber.value)` sehingga klik chevron langsung diabaikan (*return*) saat belum memutar surah. Selain itu, `seekToAyah()` tidak mengupdate nomor ayat jika timing audio belum siap, serta arah transisi tertimpa menjadi 'forward' saat mundur. | Menginisialisasi `currentAyahNumber = 1` saat surah dimuat (`loadSurah`), memperbarui `nextAyah` dan `prevAyah` agar selalu memperbarui nomor ayat terlepas status putar/pause dan ketersediaan timing, memelihara arah transisi slide mundur (`'backward'`) pada watcher di `KhusyuPlayerView.vue`, serta menambahkan visual disabled state pada batas awal (Ayat 1) dan akhir surah. | `[x]` |
| **B-23** | **Audio Listener Tidak Berputar Saat Host Memulai Play di Fitur Dengar Bersama** | Dua faktor: (1) `Room.vue` memanggil nama fungsi yang salah (`loadSurahRecitation` & `seekTo`) yang memicu fatal error di `onMounted` sehingga listener sync polling tidak pernah dimulai, dan (2) Kebijakan mobile autoplay browser (Safari iOS & Chrome Android) memblokir pemutaran media otomatis dari async timer tanpa user gesture (`NotAllowedError`). | Mengoreksi pemanggilan fungsi audio ke `loadSurah` & `seekToTime`, menambahkan alias aman di composable `useQuranAudioPlayer`, mengembalikan status boolean dari `play()`, serta menambahkan floating prompt interaktif dan tombol "Mulai Dengar" / "Aktifkan Audio" saat host memutar bacaan untuk membuka audio context secara legal via user tap. | `[x]` |
| **B-24** | **Perubahan Qari Tidak Ter-apply & Transisi Audio di Tengah Surah Reset ke Awal** | Watcher di `Show.vue` memiliki kondisi logika `newReciterId !== currentReciter.value?.id` yang selalu `false` karena `currentReciter` otomatis diperbarui lebih dulu, event drawer tidak tersambung ke player, dan penggantian `audio.src` secara asinkron memicu race condition yang mereset waktu audio ke detik 0. | Analisis lengkap dan rancangan solusi transisi audio berbasis event `loadedmetadata` serta perbaikan watcher telah didokumentasikan di `.agents/catatan.md`. | `[/]` |

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

### 6. [B-21] QR Code Fitur "Dengar Bersama" Tidak Bisa Di-scan Kamera HP
- **Masalah**: Kamera smartphone (Google Lens, iOS Camera, Samsung Camera) sama sekali tidak merespons atau mendeteksi QR code sesi Dengar Bersama di domain produksi (`https://anisulquran.mtim.my.id/listen/AK7F29`).
- **Akar Masalah**:
  1. **Reed-Solomon Multi-Block Interleaving**: Panjang URL produksi adalah 43 karakter. Untuk Level M, QR Code beralih dari Versi 3 (maksimal 42 karakter) ke Versi 4 (33x33 modul). Pada standar ISO/IEC 18004, Versi 4 mewajibkan pembagian data ke dalam 2 blok Reed-Solomon (masing-masing 32 data bytes + 18 error correction bytes) yang kemudian di-interleave secara selang-seling. Generator hand-rolled sebelumnya memperlakukan data sebagai satu blok tunggal 64 byte dengan hanya 18 byte EC, tanpa interleave, dan sisanya di-nolkan, menghasilkan kode QR korup yang ditolak oleh decoder ISO.
  2. **Quiet Zone Margin**: Margin sebelumnya diatur ke 2 modul, padahal standar ISO 18004 menetapkan minimal 4 modul (*quiet zone*) agar sensor kamera dapat membedakan pola finder sudut QR dari elemen antarmuka sekitar.
- **Solusi**:
  - Memperbarui `resources/js/lib/qrcode.js` menggunakan implementasi generator QR code berstandar ISO/IEC 18004 berbasis algoritma Project Nayuki (MIT License) tanpa dependensi eksternal (`zero external npm dependencies`).
  - Mendukung enkripsi UTF-8 otomatis, auto-versioning dari Versi 1 hingga 40, multi-block Reed-Solomon calculation, interleaving standar, format info BCH (15,5), versi BCH (18,6), dan evaluasi 8 mask pattern untuk penalti visual minimum.
  - Memperbarui `ListenTogetherModal.vue` dengan `margin: 4` (quiet zone standar), memastikan kontras putih sempurna di dalam kartu modal.
  - Menambahkan test komprehensif di `resources/js/lib/qrcode.test.js` untuk URL produksi 43 karakter dan multi-block encoding (5/5 tests passed).

### 7. [B-22] Chevron Navigasi (Kiri & Kanan) Tidak Berfungsi Saat Surah Belum Diputar
- **Masalah**: Pengguna membuka halaman surah dan langsung masuk ke Mode Khusyu' sebelum memutar audio. Saat tombol chevron kanan (`>`) ditekan untuk berpindah ke ayat selanjutnya, tampilan tetap diam di Ayat 1. Tombol chevron kiri (`<`) juga tidak bereaksi.
- **Akar Masalah**:
  1. **Uninitialized State**: `currentAyahNumber` di `useQuranAudioPlayer.js` didefinisikan sebagai `ref(null)`. Fungsi `loadSurah()` hanya memanggil `seekToAyah()` jika `startAyah > 1` atau `autoPlay === true`. Akibatnya, saat halaman pertama kali dimuat dengan `startAyah = 1` dan `autoPlay = false`, `currentAyahNumber.value` tetap bernilai `null`.
  2. **Strict Guard Block**: Fungsi `nextAyah()` dan `prevAyah()` memiliki pengecekan `if (!currentAyahNumber.value || !currentRecitation.value?.verse_timings) return;`. Karena `currentAyahNumber.value` adalah `null`, eksekusi fungsi langsung berhenti (*silent return*).
  3. **Tight Coupling Audio vs Reading**: `seekToAyah()` sebelumnya hanya memperbarui `currentAyahNumber` di dalam blok `if (targetTiming)`, sehingga jika timing audio belum selesai dimuat atau surah dibaca tanpa audio, nomor ayat tidak pernah berubah.
  4. **Transition Overwrite Bug**: Watcher `watch(() => currentVerse.value?.id)` selalu memaksa `transitionDirection.value = 'forward'`, sehingga ketika pengguna mundur dari ayat berikutnya, animasi melompat ke arah maju.
- **Solusi**:
  - Di `useQuranAudioPlayer.js`:
    - Menginisialisasi `currentAyahNumber.value = startAyah || 1` dan memanggil `seekToAyah(initialAyah, false)` di `loadSurah()`.
    - Merombak `seekToAyah()` agar selalu memperbarui `currentAyahNumber.value` secara deterministik (dibatasi antara 1 hingga `verses_count`) dan menyinkronkan waktu audio jika timing tersedia tanpa memaksa audio berputar jika sedang dalam keadaan pause.
    - Menghapus guard `!currentAyahNumber.value` di `nextAyah()` dan `prevAyah()`, menggunakan fallback `currentAyahNumber.value || 1` serta meneruskan parameter `shouldPlay = autoPlay !== null ? autoPlay : isPlaying.value`.
  - Di `KhusyuPlayerView.vue`:
    - Menyelaraskan watcher agar saat mundur (`transitionDirection === 'backward'`), indeks chunk disetel ke chunk terakhir dari ayat sebelumnya (`verseChunks.value.length`).
    - Menambahkan computed properties `isFirstAyahAndChunk` dan `isLastAyahAndChunk` serta atribut `:disabled` dengan penyesuaian visual opacity yang ramah aksesibilitas.
  - Menambahkan pengujian unit komprehensif di `useQuranAudioPlayer.test.js` dan `KhusyuPlayerView.test.js` (68/68 tests passed).

### 8. [B-23] Audio Listener Tidak Berputar Saat Host Memulai Play di Fitur Dengar Bersama
- **Masalah**: Host membuat room Dengar Bersama di laptop dan follower bergabung ke room dengan scan QR code di smartphone. Namun saat host mengklik putar (play) di laptop, perangkat follower (HP) tidak memutar audio atau merespons.
- **Akar Masalah**:
  1. **Fatal JavaScript Exception pada Inisialisasi Listener**: Di file `resources/js/Pages/Listen/Room.vue` (baris 275 & 285), kode follower memanggil `audioPlayer.loadSurahRecitation(...)` dan `audioPlayer.seekTo(...)`. Kedua method tersebut tidak terdefinisi di composable `useQuranAudioPlayer.js` (nama method yang benar adalah `loadSurah` dan `seekToTime`). Akibatnya, terjadi uncaught `TypeError` di lifecycle `onMounted()` yang menghentikan eksekusi script sebelum baris `roomSync.startListening(...)` sempat dipanggil. Smartphone follower sama sekali tidak pernah mulai mendengarkan event room atau melakukan sync polling.
  2. **Browser Autoplay Gesture Policy pada Mobile Device**: Browser mobile modern (iOS WebKit / Safari dan Android Chrome) secara tegas melarang audio HTML5 diputar (`HTMLMediaElement.play()`) yang dipicu oleh asynchronous callback / timer jaringan (seperti polling `fetch` atau WebSocket message) tanpa ada interaksi sentuhan langsung dari pengguna (*user gesture requirement* / `NotAllowedError`). Karena antarmuka follower sebelumnya didesain sebagai tampilan read-only tanpa tombol putar, browser mobile memblokir audio secara senyap.
- **Solusi**:
  - Di `useQuranAudioPlayer.js`:
    - Menambahkan backward-compatibility aliases untuk `seekTo: seekToTime` dan `loadSurahRecitation` agar pemanggilan lama tidak memutus eksekusi.
    - Memperbarui `play()` agar mengembalikan nilai boolean (`true` jika berhasil memutar, `false` jika terhalang kebijakan autoplay browser).
    - Membungkus penetapan waktu `currentTime` di `seekToTime` dalam blok `try...catch` aman agar tidak melempar `InvalidStateError` saat metadata audio belum terisi penuh.
  - Di `resources/js/Pages/Listen/Room.vue`:
    - Menyelaraskan inisialisasi `onMounted()` menggunakan `audioPlayer.loadSurah(props.chapter, props.recitation, ...)` dan `audioPlayer.seekToTime(initialSec)`.
    - Menambahkan reactive state `needsTapToPlay`. Ketika host sedang memutar bacaan tetapi pemutaran audio lokal terhambat oleh kebijakan autoplay, aplikasi menampilkan prompt floating yang elegan (`[🔊 Host Sedang Memutar Audio — Ketuk untuk mendengarkan di perangkat ini]`) dengan tombol interaktif `"Mulai Dengar"`.
    - Menambahkan tombol cepat `"Putar"` / `"Mulai Dengar"` pada player bar follower di layar mobile dan desktop saat audio perlu di-unlock.
    - Menangani klik/tap tersebut via method `unlockAudio()` yang memanggil `audioPlayer.play()`, sehingga browser mobile membuka izin audio context secara legal dan sinkronisasi otomatis berjalan lancar seterusnya.
  - Memverifikasi kelulusan seluruh 68 unit test Vitest dan kelulusan Vite build tanpa error.

### 9. [E-33] Slider Kontrol Volume Bergaya Windows 11 dengan Dynamic Vibe Primary Fill & Live Persentase
- **Kebutuhan Pengguna**: Pada bilah audio player (terutama di layar room Dengar Bersama `Room.vue`, `AudioPlayerBar.vue`, dan `KhusyuPlayerView.vue`), kontrol volume sebelumnya hanya menampilkan track datar dengan bulatan thumb tanpa indikator persentase angka dan tanpa pengisian warna progres. Pengguna menginginkan tampilan persentase (misal `80%`) dan warna slider yang terisi warna `primary` dinamis sesuai suasana / vibe aktif (Noor = Emerald, Midnight = Tahajjud Gold, Warqah = Terracotta Sepia) persis seperti slider volume di Windows 11.
- **Implementasi & Solusi**:
  - Di `resources/css/app.css`:
    - Membuat class utilitas `.volume-slider` berbasis CSS variable `--slider-progress` yang menerapkan `background: linear-gradient(to right, var(--primary) 0%, var(--primary) var(--slider-progress), var(--muted) var(--slider-progress), var(--muted) 100%)`.
    - Merancang thumb slider bergaya Windows 11: lingkaran `var(--primary)` dengan border `2px solid var(--background)`, ring halus dan drop shadow, serta efek scale saat hover/drag.
    - Menyesuaikan styling lintas browser untuk WebKit/Blink (Chromium, Edge, Safari, Android WebKit) dan Gecko (Firefox `::-moz-range-track`, `::-moz-range-thumb`, `::-moz-range-progress`).
  - Di `resources/js/Pages/Listen/Room.vue`:
    - Mengganti input volume menjadi `.volume-slider` dengan binding dinamis `:style="{ '--slider-progress': `${...}%` }"`.
    - Menambahkan label persentase volume monospace tabular (`{{ audioPlayer.isMuted.value ? 0 : Math.round(audioPlayer.volume.value * 100) }}%`).
    - Mengubah `step="0.01"` untuk pergeseran volume yang halus dan presisi.
  - Di `resources/js/components/player/AudioPlayerBar.vue` & `KhusyuPlayerView.vue`:
    - Menerapkan `.volume-slider` dengan dynamic style `--slider-progress` pada popover volume dan menyelaraskan label persentase.
    - Menerapkan `.vibe-slider` pada bilah penunjuk waktu audio (*timeline seekbar*) di Floating Player Bar dan Mode Khusyu', sehingga warna *primary* otomatis mengisi jalur slider mengikuti detik bacaan yang sedang diputar.
  - Pengujian & Verifikasi:
    - Menambahkan pengujian di `AudioPlayerBar.test.js` (slider volume & slider timeline) dan membuat file uji `resources/js/Pages/Listen/Room.test.js`.
    - Seluruh 10/10 pengujian lulus (100% passing) dan asset terkompilasi bersih via `npm run build`.

### 10. [E-34] Integrasi Laravel Reverb (WebSocket) untuk Real-Time Audio Sync (< 50ms), Zero HTTP Polling & Auto-Fallback di Fitur Dengar Bersama
- **Kebutuhan**: Menggantikan mekanisme HTTP Polling berulang (setiap 1.8 detik per listener) pada fitur Dengar Bersama dengan WebSocket native (Laravel Reverb), menurunkan latensi sinkronisasi audio ke sub-frame (< 50ms), memangkas beban request HTTP server hingga ~95%, serta menyediakan mekanisme jaring pengaman (*resilient fallback*) otomatis kembali ke HTTP polling jika koneksi socket terputus.
- **Implementasi & Solusi**:
  1. **Backend Laravel Reverb & Events**:
     - Menginstal `laravel/reverb` v1.11.1 dan mengonfigurasi broadcast connection `reverb` di `.env` dan `config/broadcasting.php`.
     - Membuat event `App\Events\RoomSyncEvent` yang mengimplementasikan `ShouldBroadcastNow` untuk mem-broadcast payload pemutaran (`surahId`, `ayahNumber`, `timestampMs`, `status`, `reciterId`, `mushafType`, `serverTime`) ke public channel `room.{code}`.
     - Membuat event `App\Events\RoomClosedEvent` yang mengimplementasikan `ShouldBroadcastNow` untuk memberi tahu pendengar secara instan saat sesi room ditutup oleh Host.
     - Memperbarui `ListenTogetherController` pada method `sync()` dan `destroy()` untuk memicu broadcast event ke channel room dengan pembungkus `try...catch` aman.
  2. **Frontend Real-Time Client (Laravel Echo & Pusher-js)**:
     - Membuat module client `resources/js/echo.js` berbasis `laravel-echo` dan `pusher-js` dengan deteksi host dinamis (mendukung `localhost:8080` pada development dan `wss://...:443/app` pada production HTTPS).
     - Memperbarui composable `resources/js/composables/useRoomSync.js`:
       - Berlangganan ke channel `room.{code}` via Echo saat `startListening()`.
       - Menangani event `.RoomSyncEvent` untuk update posisi audio instan (< 50ms).
       - Menangani event `.RoomClosedEvent` untuk penutupan room instan.
       - **Dual-Engine Auto-Fallback**: Saat WebSocket berstatus `connected`, polling HTTP otomatis dinonaktifkan (0 request/detik). Jika WebSocket terputus atau gagal (`disconnected` / `failed`), aplikasi secara mulus mengaktifkan polling interval 3000ms sebagai jaring pengaman agar follower tidak kehilangan sinkronisasi.
  3. **Container & Production Deployment (Docker, Supervisord, Nginx)**:
     - Menambahkan service daemon `[program:reverb]` pada `docker/supervisord.conf` (`php artisan reverb:start --host=0.0.0.0 --port=8080`) dengan autostart dan autorestart.
     - Menambahkan reverse proxy path `/app` pada `docker/nginx.conf` dengan header WebSocket (`Upgrade $http_upgrade`, `Connection "Upgrade"`). Seluruh lalu lintas WebSocket melewati port standar 443 HTTPS tanpa memerlukan port firewall tambahan di Tencent Cloud.
     - Memperbarui `deploy.sh` agar otomatis mendeteksi dan mengonfigurasi kredensial `REVERB_APP_KEY`, `REVERB_APP_ID`, dan `REVERB_APP_SECRET` di server produksi jika belum ada.
  4. **Pengujian & Verifikasi**:
     - Menambahkan unit test backend di `tests/Feature/ListenTogetherTest.php` untuk memvalidasi dispatch event `RoomSyncEvent` dan `RoomClosedEvent` (10/10 feature tests passed).
     - Menambahkan frontend test `resources/js/echo.test.js` dan memperbarui `useRoomSync.test.js` serta `Room.test.js` (20/20 test suites, 75/75 tests passed).
     - Seluruh build aset Vite terkompilasi bersih tanpa error (`npm run build`).

