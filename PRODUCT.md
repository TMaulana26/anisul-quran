# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Pengguna Utama**: Umat Muslim, pembelajar Al-Qur'an, pendengar tilawah harian, penghafal (*huffaz*), keluarga, dan kelompok tadarus/halaqah.
- **Situasi Penggunaan**: Mendengarkan lantunan tilawah di laptop/smartphone, muroja'ah hafalan dengan panduan visual karaoke, serta mendengarkan tilawah bersama secara serempak di beberapa perangkat via scan QR Code.

## Product Purpose
- Menyediakan pengalaman membaca dan mendengarkan Al-Qur'an yang imersif dan interaktif dengan format **Karaoke Sync** (teks Arab, transliterasi Latin, dan terjemahan Indonesia otomatis menyala mengikuti lantunan suara qari secara presisi).
- Memungkinkan sinkronisasi audio dan pembacaan Al-Qur'an secara *real-time* multi-perangkat (**Listen Together**) dengan *zero-friction* (tanpa registrasi/login).

## Positioning
- Platform pemutar dan pembaca Al-Qur'an modern berbasis web dengan fitur sinkronisasi *Host-Follower* instan via QR Code dan visualisasi karaoke per-ayat/kata dari data resmi Quran Foundation.

## Operating Context
- Digunakan di lingkungan personal (laptop/HP), keluarga di rumah, atau ruang belajar/masjid/kantor.
- Audio playback streaming dengan Web Audio API dan algoritma koreksi drift waktu nyata, responsif di desktop maupun mobile viewport.

## Capabilities and Constraints
- **Zero-Friction Access**: Bebas digunakan langsung tanpa login atau setup akun.
- **Karaoke Sync Reader**: Highlighting dinamis teks Arab (Uthmani Hafs, IndoPak, Tajweed), transliterasi Latin, dan terjemahan resmi Kemenag RI.
- **Audio Engine**: Pilihan Qari kelas dunia (Mishary Alafasy, Al-Husary, AbdulBaset, Sudais, Ghamdi), seek bar, repeat ayah/surah, speed control (0.75x - 1.5x).
- **Listen Together**: Host membuat sesi -> menghasilkan QR code & share link -> Listener scan & tersinkronisasi otomatis (Host = pengontrol penuh, Listener = pendengar serempak).
- **i18n Ready**: Antarmuka default Bahasa Indonesia dengan struktur kamus modular (`locales/id.json`).

## Brand Commitments
- **Nama**: Anisul Qur'an (*Teman Setia Al-Qur'an*).
- **Estetika & Tone**: Tenang, sakral, elegan, modern, bersih (*Mauve / Deep Slate / Warm Sand accents*), tipografi Arab yang jelas dan berwibawa, kontras yang nyaman untuk tilawah malam hari (*Dark Mode* & *Sepia Mode*).

## Evidence on Hand
- Data resmi Quran Foundation API (`api.quran.com/api/v4`).
- Terjemahan Kementerian Agama Republik Indonesia (Kemenag RI).
- Audio timestamps resmi dari qari-qari terverifikasi.

## Product Principles
1. **Zero Distraction & Reverence**: Antarmuka memprioritaskan ketenangan membaca Al-Qur'an tanpa elemen visual yang mengganggu kekhusyukan.
2. **Instant Sync, Zero Friction**: Memulai tilawah atau berbagi sesi ke perangkat lain hanya membutuhkan 1 klik atau 1 scan QR.
3. **Typography First**: Teks Arab ditampilkan dengan proporsi elegan, harakat tajam, dan terbaca jelas di semua resolusi layar.
4. **Resilient Audio**: Audio berjalan mulus dan tetap sinkron bahkan saat ada fluktuasi koneksi.

## Accessibility & Inclusion
- Dukungan Dark Mode dan kontrol ukuran font Arab yang fleksibel (18px - 40px) untuk berbagai kalangan usia.
