# 📋 Anisul Qur'an - Task Tracking & Implementation Checklist

> File pelacak progres implementasi proyek **Anisul Qur'an** berdasarkan roadmap di [`.agents/PLANNING.md`](PLANNING.md).  
> **Status Legenda**: `[ ]` Belum dimulai · `[/]` Sedang dikerjakan · `[x]` Selesai & Terverifikasi

---

## 📌 Status Ringkasan Proyek

| Fase | Deskripsi | Status | Progress |
|:---|:---|:---:|:---:|
| **Fase 1** | Fondasi Backend Quran Service, Caching & Halaman Surah | `[ ]` | 0 / 4 |
| **Fase 2** | Karaoke Audio Player Engine & Visual Highlighting | `[ ]` | 0 / 5 |
| **Fase 3** | Fitur Unggulan "Listen Together" (Realtime Multi-Device Sync) | `[ ]` | 0 / 5 |
| **Fase 4** | Internationalization (i18n), UI Polish (Impeccable) & Full Testing | `[ ]` | 0 / 4 |

---

## 🚀 Fase 1: Fondasi Backend Quran Service & Halaman Surah

- [ ] **Task 1.1: Pembuatan `QuranFoundationService` & Smart Caching**
  - **Goal**: Menyediakan service backend Laravel yang mengambil data dari Quran Foundation API (`api.quran.com/api/v4`) dengan caching efisien.
  - **Subtasks**:
    - [ ] Buat class `App\Services\QuranFoundationService.php`.
    - [ ] Implementasi method `getChapters(string $language = 'id')` dengan caching 7 hari.
    - [ ] Implementasi method `getChapter(int $id, string $language = 'id')`.
    - [ ] Implementasi method `getVersesByChapter(int $chapterId, array $params = [])` (mendukung `words=true`, `translations=33` Kemenag RI, `fields=text_uthmani,text_indopak`).
    - [ ] Implementasi method `getReciters(string $language = 'id')` dan `getChapterRecitation(int $reciterId, int $chapterId)`.
    - [ ] Tambahkan unit/feature test backend dengan `Http::fake()`.
  - **File Target**: `app/Services/QuranFoundationService.php`, `tests/Feature/QuranFoundationServiceTest.php`

- [ ] **Task 1.2: Pembuatan Controller & Routing Surah**
  - **Goal**: Menyediakan endpoint Inertia untuk menampilkan daftar Surah dan halaman detail Surah.
  - **Subtasks**:
    - [ ] Buat `App\Http\Controllers\SurahController.php`.
    - [ ] Route `GET /` & `GET /surah` -> `SurahController@index` (render `Surah/Index.vue`).
    - [ ] Route `GET /surah/{id}` -> `SurahController@show` (render `Surah/Show.vue`).
    - [ ] Pastikan payload props Inertia ringan dan terstruktur.
  - **File Target**: `app/Http/Controllers/SurahController.php`, `routes/web.php`, `tests/Feature/SurahControllerTest.php`

- [ ] **Task 1.3: Halaman Daftar Surah (`Surah/Index.vue`) & Layout Utama**
  - **Goal**: Halaman katalog 114 Surah yang interaktif, cepat, dan mudah dicari.
  - **Subtasks**:
    - [ ] Buat Main Layout `resources/js/Layouts/AppLayout.vue` (Header elegan, tema dark/light, navigasi cepat).
    - [ ] Buat kartu Surah (`SurahCard.vue`) dengan nomor surah, nama Arab, nama Latin, terjemahan nama, tempat turun (Makkiyah/Madaniyah), dan total ayat.
    - [ ] Fitur live search / filter instan berdasarkan nomor surah, nama Latin, atau arti nama.
    - [ ] Integrasi komponen shadcn-vue (`Input`, `Badge`, `Card`, `Skeleton`).
  - **File Target**: `resources/js/Layouts/AppLayout.vue`, `resources/js/Pages/Surah/Index.vue`, `resources/js/components/SurahCard.vue`

- [ ] **Task 1.4: Halaman Bacaan Surah (`Surah/Show.vue`) & Item Ayat**
  - **Goal**: Halaman pembaca ayat Al-Qur'an dengan tipografi Arab yang nyaman dibaca dan terjemahan Indonesia.
  - **Subtasks**:
    - [ ] Buat komponen `AyahItem.vue` (nomor ayat berornamen, teks Arab rasm Uthmani/IndoPak, transliterasi Latin, terjemahan Kemenag).
    - [ ] Header Surah dengan Bismillah dan informasi surah.
    - [ ] Navigasi pindah ke Surah Sebelumnya & Surah Berikutnya.
  - **File Target**: `resources/js/Pages/Surah/Show.vue`, `resources/js/components/AyahItem.vue`

---

## 🎵 Fase 2: Karaoke Audio Player & Visual Highlighting

- [ ] **Task 2.1: Composable Audio Engine (`useQuranAudioPlayer.js`)**
  - **Goal**: State management audio terpusat untuk memutar murottal, melacak posisi millisecond, dan mencocokkan stempel waktu ayat.
  - **Subtasks**:
    - [ ] Buat composable `resources/js/composables/useQuranAudioPlayer.js`.
    - [ ] Dukungan state: `isPlaying`, `currentTime`, `duration`, `currentSurahId`, `currentAyahNumber`, `activeReciter`, `playbackRate`.
    - [ ] Event timeupdate presisi tinggi untuk mendeteksi ayat dan kata yang sedang dibacakan.
    - [ ] Dukungan preloading audio ayat berikutnya agar perpindahan ayat *gapless*.
  - **File Target**: `resources/js/composables/useQuranAudioPlayer.js`, `resources/js/composables/useQuranAudioPlayer.test.js`

- [ ] **Task 2.2: Floating Audio Player Bar (`AudioPlayerBar.vue`)**
  - **Goal**: Player bar responsif yang melayang di bagian bawah layar.
  - **Subtasks**:
    - [ ] Tombol Play, Pause, Next Ayah, Prev Ayah, Seekbar slider interaktif.
    - [ ] Pengatur kecepatan pemutaran (0.75x, 1x, 1.25x, 1.5x).
    - [ ] Mode repeat (Ulangi Ayat saat ini / Lanjutkan Surah).
    - [ ] Tombol pintas untuk membuka modal Qari dan tombol *"Listen Together"*.
  - **File Target**: `resources/js/components/player/AudioPlayerBar.vue`

- [ ] **Task 2.3: Visual Karaoke Highlighting & Smooth Auto-Scroll**
  - **Goal**: Ayat dan terjemahan otomatis bersinar (*glow / highlight*) dan viewport ter-scroll secara halus mengikuti bacaan.
  - **Subtasks**:
    - [ ] Styling visual aktif pada `AyahItem.vue` saat nomor ayat cocok dengan `currentAyahNumber`.
    - [ ] Auto-scroll otomatis ke ayat aktif dengan opsi disable jika user sedang manual scrolling.
    - [ ] Tombol "Play Ayat Ini" langsung pada setiap kartu ayat.
  - **File Target**: `resources/js/components/AyahItem.vue`, `resources/js/Pages/Surah/Show.vue`

- [ ] **Task 2.4: Modal Pemilih Qari (`ReciterSelectorModal.vue`)**
  - **Goal**: Memungkinkan pengguna memilih qari favorit dengan mudah.
  - **Subtasks**:
    - [ ] Modal dialog berbasis shadcn-vue dengan daftar qari populer (Mishary Alafasy, Al-Husary, AbdulBaset, Sudais, Ghamdi, dll.).
    - [ ] Filter pencarian nama Qari.
    - [ ] Simpan preferensi Qari terakhir di `localStorage`.
  - **File Target**: `resources/js/components/player/ReciterSelectorModal.vue`

- [ ] **Task 2.5: Switcher Mushaf & Tampilan (`SettingsDrawer.vue`)**
  - **Goal**: Pengaturan ukuran teks, jenis rasm font Arab, dan toggle transliterasi/terjemahan.
  - **Subtasks**:
    - [ ] Switch Rasm: Uthmani Hafs vs IndoPak.
    - [ ] Slider ukuran font teks Arab (18px - 40px) dan terjemahan.
    - [ ] Toggle sembunyikan/tampilkan terjemahan dan transliterasi Latin.
    - [ ] Simpan preferensi tampilan di `localStorage`.
  - **File Target**: `resources/js/components/settings/SettingsDrawer.vue`

---

## 👥 Fase 3: Fitur Unggulan "Listen Together" (Real-time Multi-Device Sync)

- [ ] **Task 3.1: Backend Room Session Engine**
  - **Goal**: Menyimpan dan mengelola status sesi room sinkronisasi di backend.
  - **Subtasks**:
    - [ ] Buat `App\Http\Controllers\ListenTogetherController.php`.
    - [ ] Endpoint `POST /api/rooms` — Membuat Room baru (generate Room Code unik 6-karakter).
    - [ ] Endpoint `GET /api/rooms/{code}` — Mengambil status sesi room saat ini.
    - [ ] Endpoint `POST /api/rooms/{code}/sync` — Host mengirim update state (`surahId`, `ayahNumber`, `timestampMs`, `status`, `reciterId`).
    - [ ] Endpoint `POST /api/rooms/{code}/heartbeat` — Mempertahankan masa aktif room.
    - [ ] Caching state room di Redis/Cache Laravel dengan TTL otomatis.
  - **File Target**: `app/Http/Controllers/ListenTogetherController.php`, `routes/api.php`, `tests/Feature/ListenTogetherTest.php`

- [ ] **Task 3.2: Modal "Listen Together" & QR Code Generator (Host View)**
  - **Goal**: Host dapat mengaktifkan sesi bersama dan menampilkan QR Code untuk di-scan perangkat lain.
  - **Subtasks**:
    - [ ] Buat komponen `ListenTogetherModal.vue`.
    - [ ] Integrasi generator SVG QR Code client-side (`qrcode` package).
    - [ ] Tombol Copy Link & info Room Code yang mudah dibagikan.
    - [ ] Indikator status live: jumlah listener terhubung & status sync aktif.
  - **File Target**: `resources/js/components/sync/ListenTogetherModal.vue`

- [ ] **Task 3.3: Halaman & Mode Listener/Follower (`/listen/{roomCode}`)**
  - **Goal**: Halaman khusus untuk perangkat yang melakukan scan QR code.
  - **Subtasks**:
    - [ ] Route `GET /listen/{code}` -> render `Listen/Room.vue`.
    - [ ] Tampilan pembaca surah otomatis terkunci mengikuti surah & ayat yang sedang diputar Host.
    - [ ] Floating Follower Banner: *"Tersinkronisasi dengan Room [Code] — Mode Pendengar"*.
    - [ ] Sembunyikan kontrol play/pause/skip lokal pada perangkat Listener.
  - **File Target**: `resources/js/Pages/Listen/Room.vue`, `resources/js/components/sync/FollowerBanner.vue`

- [ ] **Task 3.4: Realtime Sync Loop & Audio Drift Correction**
  - **Goal**: Memastikan suara dan highlight ayat di perangkat Listener berjalan serempak dengan Host tanpa delay atau lagging.
  - **Subtasks**:
    - [ ] Composable `useRoomSync.js` untuk polling interval cepat / SSE / WebSocket state sync.
    - [ ] Algoritma koreksi drift: jika selisih waktu audio listener > 300ms dari Host, sesuaikan `currentTime` secara halus.
    - [ ] Reaksi otomatis saat Host melakukan Pause, Play, Seek, atau Ganti Surah.
  - **File Target**: `resources/js/composables/useRoomSync.js`, `resources/js/composables/useRoomSync.test.js`

- [ ] **Task 3.5: Uji Coba Sinkronisasi Multi-Device**
  - **Goal**: Verifikasi sinkronisasi antara desktop (Host) dan HP/browser lain (Listener).
  - **Subtasks**:
    - [ ] Pengujian skenario Play/Pause oleh Host.
    - [ ] Pengujian skenario Ganti Surah & Seek posisi ayat oleh Host.
    - [ ] Pengujian reconnect jika koneksi listener sempat terputus.

---

## 🌐 Fase 4: Internationalization (i18n), UI Polish & Full Testing

- [ ] **Task 4.1: Setup Arsitektur i18n & Kamus Bahasa**
  - **Goal**: Memisahkan semua teks UI ke dalam file kamus JSON.
  - **Subtasks**:
    - [ ] Buat file kamus `resources/js/locales/id.json` (Bahasa Indonesia - Default).
    - [ ] Buat file kamus `resources/js/locales/en.json` (Bahasa Inggris).
    - [ ] Buat composable `useI18n.js` / helper `$t()` untuk pemanggilan string dinamis di seluruh komponen Vue.
    - [ ] Tambahkan tombol toggle Bahasa (ID / EN) di header/settings.
  - **File Target**: `resources/js/locales/id.json`, `resources/js/locales/en.json`, `resources/js/composables/useI18n.js`

- [ ] **Task 4.2: Audit Desain & UI Polish (Impeccable Standards)**
  - **Goal**: Memastikan estetika kelas atas, tipografi harmonis, kontras warna yang nyaman, dan bebas *AI slop*.
  - **Subtasks**:
    - [ ] Jalankan audit anti-pattern: `npx impeccable detect resources/js/`.
    - [ ] Optimasi responsivitas mobile (tampilan player bar, drawer, dan kartu ayat di layar kecil).
    - [ ] Micro-interactions halus pada tombol play, slider, dan transisi ayat.
  - **File Target**: `resources/js/resources/**`

- [ ] **Task 4.3: Automated Testing Suite (Pest & Vitest)**
  - **Goal**: Memastikan seluruh fungsi backend dan komponen frontend teruji dengan baik.
  - **Subtasks**:
    - [ ] Backend Feature Tests (Pest): `tests/Feature/QuranFoundationServiceTest.php`, `tests/Feature/SurahControllerTest.php`, `tests/Feature/ListenTogetherTest.php`.
    - [ ] Frontend Unit & Component Tests (Vitest): `useQuranAudioPlayer.test.js`, `useRoomSync.test.js`, `utils.test.js`, `AyahItem.test.js`.
    - [ ] Jalankan test terarah: `vendor/bin/pest tests/Feature/` & `npm run test:frontend`.

- [ ] **Task 4.4: Final Polish & Tag Release Milestone `v0.2.0`**
  - **Goal**: Pembungkusan rilis fitur lengkap versi 1.0.
  - **Subtasks**:
    - [ ] Pembersihan kode dan formatting dengan `vendor/bin/pint --dirty --format agent`.
    - [ ] Buat commit lokal terstruktur.
    - [ ] Buat annotated git tag `v0.2.0`.
