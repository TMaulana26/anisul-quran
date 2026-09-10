# 📋 Anisul Qur'an - Task Tracking & Implementation Checklist

> File pelacak progres implementasi proyek **Anisul Qur'an** berdasarkan roadmap di [`.agents/PLANNING.md`](PLANNING.md).  
> **Status Legenda**: `[ ]` Belum dimulai · `[/]` Sedang dikerjakan · `[x]` Selesai & Terverifikasi

---

## 📌 Status Ringkasan Proyek

| Fase | Deskripsi | Status | Progress |
|:---|:---|:---:|:---:|
| **Fase 1** | Fondasi Backend Quran Service, Caching & Halaman Surah | `[x]` | 4 / 4 |
| **Fase 2** | Karaoke Audio Player Engine & Visual Highlighting | `[x]` | 5 / 5 |
| **Fase 3** | Fitur Unggulan "Listen Together" (Realtime Multi-Device Sync) | `[ ]` | 0 / 5 |
| **Fase 4** | Internationalization (i18n), UI Polish (Impeccable) & Full Testing | `[ ]` | 0 / 4 |

---

## 🚀 Fase 1: Fondasi Backend Quran Service & Halaman Surah

- [x] **Task 1.1: Pembuatan `QuranFoundationService` & Smart Caching**
  - **Goal**: Menyediakan service backend Laravel yang mengambil data dari Quran Foundation API (`api.quran.com/api/v4`) dengan caching efisien.
  - **Subtasks**:
    - [x] Buat class `App\Services\QuranFoundationService.php`.
    - [x] Implementasi method `getChapters(string $language = 'id')` dengan caching 7 hari.
    - [x] Implementasi method `getChapter(int $id, string $language = 'id')`.
    - [x] Implementasi method `getVersesByChapter(int $chapterId, array $params = [])` (mendukung `words=true`, `translations=33` Kemenag RI, `fields=text_uthmani,text_indopak`).
    - [x] Implementasi method `getReciters(string $language = 'id')` dan `getChapterRecitation(int $reciterId, int $chapterId)`.
    - [x] Tambahkan unit/feature test backend dengan `Http::fake()`.
  - **File Target**: `app/Services/QuranFoundationService.php`, `tests/Feature/QuranFoundationServiceTest.php`

- [x] **Task 1.2: Pembuatan Controller & Routing Surah**
  - **Goal**: Menyediakan endpoint Inertia untuk menampilkan daftar Surah dan halaman detail Surah.
  - **Subtasks**:
    - [x] Buat `App\Http\Controllers\SurahController.php`.
    - [x] Route `GET /` & `GET /surah` -> `SurahController@index` (render `Surah/Index.vue`).
    - [x] Route `GET /surah/{id}` -> `SurahController@show` (render `Surah/Show.vue`).
    - [x] Pastikan payload props Inertia ringan dan terstruktur.
  - **File Target**: `app/Http/Controllers/SurahController.php`, `routes/web.php`, `tests/Feature/SurahControllerTest.php`

- [x] **Task 1.3: Halaman Daftar Surah (`Surah/Index.vue`) & Layout Utama**
  - **Goal**: Halaman katalog 114 Surah yang interaktif, cepat, dan mudah dicari.
  - **Subtasks**:
    - [x] Buat Main Layout `resources/js/Layouts/AppLayout.vue` (Header elegan, tema dark/light, navigasi cepat).
    - [x] Buat kartu Surah (`SurahCard.vue`) dengan nomor surah, nama Arab, nama Latin, terjemahan nama, tempat turun (Makkiyah/Madaniyah), dan total ayat.
    - [x] Fitur live search / filter instan berdasarkan nomor surah, nama Latin, atau arti nama.
    - [x] Integrasi komponen shadcn-vue (`Input`, `Badge`, `Card`, `Skeleton`).
  - **File Target**: `resources/js/Layouts/AppLayout.vue`, `resources/js/Pages/Surah/Index.vue`, `resources/js/components/SurahCard.vue`

- [x] **Task 1.4: Halaman Bacaan Surah (`Surah/Show.vue`) & Item Ayat**
  - **Goal**: Halaman pembaca ayat Al-Qur'an dengan tipografi Arab yang nyaman dibaca dan terjemahan Indonesia.
  - **Subtasks**:
    - [x] Buat komponen `AyahItem.vue` (nomor ayat berornamen, teks Arab rasm Uthmani/IndoPak, transliterasi Latin, terjemahan Kemenag).
    - [x] Header Surah dengan Bismillah dan informasi surah.
    - [x] Navigasi pindah ke Surah Sebelumnya & Surah Berikutnya.
  - **File Target**: `resources/js/Pages/Surah/Show.vue`, `resources/js/components/AyahItem.vue`

---

## 🎵 Fase 2: Karaoke Audio Player & Visual Highlighting

- [x] **Task 2.1: Composable Audio Engine (`useQuranAudioPlayer.js`)**
  - **Goal**: State management audio terpusat untuk memutar murottal, melacak posisi millisecond, dan mencocokkan stempel waktu ayat.
  - **Subtasks**:
    - [x] Buat composable `resources/js/composables/useQuranAudioPlayer.js`.
    - [x] Dukungan state: `isPlaying`, `currentTime`, `duration`, `currentSurahId`, `currentAyahNumber`, `activeReciter`, `playbackRate`.
    - [x] Event timeupdate presisi tinggi untuk mendeteksi ayat dan kata yang sedang dibacakan.
    - [x] Dukungan preloading audio ayat berikutnya agar perpindahan ayat *gapless*.
  - **File Target**: `resources/js/composables/useQuranAudioPlayer.js`, `resources/js/composables/useQuranAudioPlayer.test.js`

- [x] **Task 2.2: Floating Audio Player Bar (`AudioPlayerBar.vue`)**
  - **Goal**: Player bar responsif yang melayang di bagian bawah layar.
  - **Subtasks**:
    - [x] Tombol Play, Pause, Next Ayah, Prev Ayah, Seekbar slider interaktif.
    - [x] Pengatur kecepatan pemutaran (0.75x, 1x, 1.25x, 1.5x, 2x).
    - [x] Mode repeat (Ulangi Ayat saat ini / Lanjutkan Surah).
    - [x] Tombol pintas untuk membuka modal Qari dan tombol *"Listen Together"*.
  - **File Target**: `resources/js/components/player/AudioPlayerBar.vue`

- [x] **Task 2.3: Visual Karaoke Highlighting & Smooth Auto-Scroll**
  - **Goal**: Ayat dan terjemahan otomatis bersinar (*glow / highlight*) dan viewport ter-scroll secara halus mengikuti bacaan.
  - **Subtasks**:
    - [x] Styling visual aktif pada `AyahItem.vue` saat nomor ayat cocok dengan `currentAyahNumber`.
    - [x] Auto-scroll otomatis ke ayat aktif dengan opsi disable jika user sedang manual scrolling.
    - [x] Tombol "Play Ayat Ini" langsung pada setiap kartu ayat.
  - **File Target**: `resources/js/components/AyahItem.vue`, `resources/js/Pages/Surah/Show.vue`

- [x] **Task 2.4: Modal Pemilih Qari (`ReciterSelectorModal.vue`)**
  - **Goal**: Memungkinkan pengguna memilih qari favorit dengan mudah.
  - **Subtasks**:
    - [x] Modal dialog berbasis shadcn-vue dengan daftar qari populer (Mishary Alafasy, Al-Husary, AbdulBaset, Sudais, Ghamdi, dll.).
    - [x] Filter pencarian nama Qari.
    - [x] Simpan preferensi Qari terakhir di `localStorage`.
  - **File Target**: `resources/js/components/player/ReciterSelectorModal.vue`

- [x] **Task 2.5: Switcher Mushaf & Tampilan (`SettingsDrawer.vue`)**
  - **Goal**: Pengaturan ukuran teks, jenis rasm font Arab, dan toggle transliterasi/terjemahan.
  - **Subtasks**:
    - [x] Switch Rasm: Uthmani Hafs vs IndoPak.
    - [x] Slider ukuran font teks Arab (18px - 40px) dan terjemahan.
    - [x] Toggle sembunyikan/tampilkan terjemahan dan transliterasi Latin.
    - [x] Simpan preferensi tampilan di `localStorage`.
  - **File Target**: `resources/js/components/player/SettingsDrawer.vue`

---

## 👥 Fase 3: Fitur Unggulan "Listen Together" (Real-time Multi-Device Sync)

- [x] **Task 3.1: Backend Room Session Engine**
  - **Goal**: Menyimpan dan mengelola status sesi room sinkronisasi di backend.
  - **Subtasks**:
    - [x] Buat `App\Http\Controllers\ListenTogetherController.php`.
    - [x] Endpoint `POST /api/rooms` — Membuat Room baru (generate Room Code unik 6-karakter).
    - [x] Endpoint `GET /api/rooms/{code}` — Mengambil status sesi room saat ini.
    - [x] Endpoint `POST /api/rooms/{code}/sync` — Host mengirim update state (`surahId`, `ayahNumber`, `timestampMs`, `status`, `reciterId`).
    - [x] Endpoint `POST /api/rooms/{code}/heartbeat` — Mempertahankan masa aktif room.
    - [x] Caching state room di Redis/Cache Laravel dengan TTL otomatis.
  - **File Target**: `app/Http/Controllers/ListenTogetherController.php`, `routes/web.php`, `tests/Feature/ListenTogetherTest.php`

- [x] **Task 3.2: Modal "Listen Together" & QR Code Generator (Host View)**
  - **Goal**: Host dapat mengaktifkan sesi bersama dan menampilkan QR Code untuk di-scan perangkat lain.
  - **Subtasks**:
    - [x] Buat komponen `ListenTogetherModal.vue`.
    - [x] Integrasi generator SVG QR Code client-side mandiri bebas dependensi (`resources/js/lib/qrcode.js`).
    - [x] Tombol Copy Link & info Room Code yang mudah dibagikan.
    - [x] Indikator status live: jumlah listener terhubung & status sync aktif.
  - **File Target**: `resources/js/components/sync/ListenTogetherModal.vue`, `resources/js/lib/qrcode.js`

- [x] **Task 3.3: Halaman & Mode Listener/Follower (`/listen/{roomCode}`)**
  - **Goal**: Halaman khusus untuk perangkat yang melakukan scan QR code.
  - **Subtasks**:
    - [x] Route `GET /listen/{code}` -> render `Listen/Room.vue`.
    - [x] Tampilan pembaca surah otomatis terkunci mengikuti surah & ayat yang sedang diputar Host.
    - [x] Floating Follower Banner: *"Tersinkronisasi dengan Room [Code] — Mode Pendengar"*.
    - [x] Sembunyikan kontrol play/pause/skip lokal pada perangkat Listener (read-only dengan pengatur volume lokal).
  - **File Target**: `resources/js/Pages/Listen/Room.vue`, `resources/js/components/sync/FollowerBanner.vue`

- [x] **Task 3.4: Realtime Sync Loop & Audio Drift Correction**
  - **Goal**: Memastikan suara dan highlight ayat di perangkat Listener berjalan serempak dengan Host tanpa delay atau lagging.
  - **Subtasks**:
    - [x] Composable `useRoomSync.js` untuk polling interval cepat & state sync.
    - [x] Algoritma koreksi drift: jika selisih waktu audio listener > 400ms dari Host, sesuaikan `currentTime` secara halus, atau sesuaikan playback rate saat drift mikro (100-400ms).
    - [x] Reaksi otomatis saat Host melakukan Pause, Play, Seek, atau Ganti Surah.
  - **File Target**: `resources/js/composables/useRoomSync.js`, `resources/js/composables/useRoomSync.test.js`

- [x] **Task 3.5: Uji Coba Sinkronisasi Multi-Device**
  - **Goal**: Verifikasi sinkronisasi antara desktop (Host) dan HP/browser lain (Listener).
  - **Subtasks**:
    - [x] Pengujian skenario Play/Pause oleh Host.
    - [x] Pengujian skenario Ganti Surah & Seek posisi ayat oleh Host.
    - [x] Pengujian reconnect jika koneksi listener sempat terputus atau room kadaluarsa.

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
