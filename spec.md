# 📋 Anisul Qur'an - Technical Specification & VPS Capacity Planning

Dokumen spesifikasi teknis dan analisis kapasitas server untuk aplikasi **Anisul Qur'an** (Web Quran Karaoke Player & Real-time "Listen Together" Sync).  
Gunakan dokumen ini sebagai acuan langsung saat berkonsultasi dengan asisten AI (**Hermes**) atau administrator server di VPS Anda.

---

## 🏗️ 1. Arsitektur & Karakteristik Beban Kerja (App Profile)

| Komponen | Teknologi | Keterangan & Dampak pada Server |
|:---|:---|:---|
| **Backend Framework** | Laravel 12 (PHP 8.3+) | Menangani routing, Inertia SSR-less response, proksi & caching Quran Foundation API, serta endpoint sinkronisasi Room. |
| **Frontend Framework** | Inertia.js v3 + Vue 3 (SPA) | **100% Client-Side Rendered**. Tidak memerlukan runtime Node.js aktif di VPS saat produksi. Browser pengguna yang merender tampilan & audio highlight. |
| **Styling & Assets** | Tailwind CSS v4 + Vite | Aset statis dikompilasi ke folder `public/build/` (ukuran total < 1 MB gzipped). |
| **Audio Streaming** | Quran Foundation Audio CDN | **ZERO Audio Bandwidth Egress**: Audio Murottal di-stream langsung oleh browser client dari `audio.qurancdn.com`. VPS **tidak** menyimpan file audio dan **tidak** menyalurkan bandwidth streaming audio. |
| **Database** | SQLite (Default) / MySQL / PostgreSQL | **Sangat Ringan**: Konten ayat/surah tidak disimpan di tabel relasional raksasa, melainkan diambil dari upstream API lalu disimpan di cache. Database utama hanya dipakai untuk auth/sessions/jobs dasar. |
| **Cache Store** | Laravel Cache (`file`, `database`, atau `redis`) | Cache memegang data ayat (TTL 7 hari) dan status aktif Room Listen Together (TTL 2 jam). |
| **Realtime Sync** | Polling HTTP Presisi Cepat (`/api/rooms/{code}`) | Pendengar (Listener) mengirim HTTP GET setiap 1 - 2 detik untuk mengambil status playback Host. Host mengirim HTTP POST saat berpindah ayat/surah atau pause/seek. |

---

## 💻 2. Rekomendasi Spesifikasi Hardware VPS

### A. Spesifikasi Minimum (Trafik Pribadi / Uji Coba)
Cocok untuk penggunaan sendiri, keluarga, atau pengujian fitur.
- **CPU**: 1 vCPU (Shared)
- **RAM**: 512 MB – 1 GB
- **Penyimpanan**: 10 GB SSD / NVMe
- **OS**: Ubuntu 22.04 / 24.04 LTS atau Debian 12
- **PHP**: PHP 8.2 / 8.3 / 8.4 dengan ekstensi: `pdo_sqlite`, `curl`, `mbstring`, `xml`, `bcmath`, `tokenizer`
- **Web Server**: Nginx atau Caddy (dengan HTTPS / Let's Encrypt aktif)
- **Cache**: File Cache atau SQLite Cache

### B. Spesifikasi Rekomendasi (Trafik Komunitas / Staging Ramai)
Cocok untuk website yang dibagikan ke publik, pengajian, atau komunitas.
- **CPU**: 1 – 2 vCPU
- **RAM**: 1 GB – 2 GB
- **Penyimpanan**: 20 GB SSD / NVMe
- **Stack Tambahan**: **Redis** (in-memory cache untuk Room Sync & Sessions)
- **Web Server**: Nginx + PHP-FPM (dengan OPcache aktif)

---

## 📊 3. Hipotesis & Simulasi Kinerja Berdasarkan Tingkat Trafik

Berikut adalah proyeksi kebutuhan server dari kondisi paling sepi hingga kondisi puncak (viral / ramai):

### 🟢 Skenario 1: Trafik Sepi (Low / Personal & Family)
- **Concurrent Users (CCU)**: 1 – 20 pengguna aktif bersamaan.
- **Aktivitas**: 1 – 3 Room Listen Together aktif, sisanya membaca surah sendiri.
- **Beban Request**: ~2 – 5 Request Per Second (RPS).
- **Konsumsi Sumber Daya**:
  - **CPU**: < 5% pada 1 vCPU
  - **RAM**: ~250 MB – 400 MB (termasuk OS + Nginx + PHP-FPM)
  - **Bandwidth**: Sangat hemat (< 100 MB/hari untuk aset statis awal).
- **Kesimpulan**: VPS paling ekonomis ($3 – $5/bulan) sanggup berjalan dengan sangat santai dan dingin.

---

### 🟡 Skenario 2: Trafik Sedang (Medium / Komunitas / Grup Pengajian)
- **Concurrent Users (CCU)**: 20 – 150 pengguna aktif bersamaan.
- **Aktivitas**: 10 – 30 Room Listen Together aktif serentak (tiap room memiliki 2–10 pendengar yang melakukan polling status tiap 1–2 detik).
- **Beban Request**: ~20 – 80 Request Per Second (RPS).
- **Konsumsi Sumber Daya**:
  - **CPU**: ~15% – 35% pada 1–2 vCPU
  - **RAM**: ~600 MB – 1.2 GB
- **Bottleneck Potensial**:
  - Jika menggunakan `CACHE_STORE=file` atau `database` (SQLite), operasi I/O disk untuk lock & write polling room bisa antre.
- **Solusi & Rekomendasi**:
  - Wajib pasang **Redis** di VPS (`CACHE_STORE=redis`, `SESSION_DRIVER=redis`). Dengan Redis, 80 RPS diselesaikan dalam < 1 milidetik di memori RAM tanpa menyentuh disk I/O.
  - Aktifkan **PHP OPcache** (`opcache.enable=1`, `opcache.memory_consumption=128`).

---

### 🟠 Skenario 3: Trafik Ramai (High / Momentum Jum'at & Ramadhan)
- **Concurrent Users (CCU)**: 150 – 800 pengguna aktif bersamaan.
- **Aktivitas**: 50 – 150 Room aktif bersamaan, ribuan pembaca surah mandiri.
- **Beban Request**: ~150 – 400 Request Per Second (RPS).
- **Konsumsi Sumber Daya**:
  - **CPU**: ~40% – 75% pada 2 vCPU
  - **RAM**: ~1.5 GB – 2.5 GB
- **Optimasi Kunci**:
  - Pasang **Cloudflare CDN** (Gratis) di depan domain:
    - Seluruh aset frontend (`.js`, `.css`, fonts `.woff2`, favicon) dicache di edge Cloudflare $\rightarrow$ **Beban web server ke aset statis menjadi 0%**.
  - Tuning PHP-FPM pool:
    ```ini
    pm = dynamic
    pm.max_children = 40
    pm.start_servers = 10
    pm.min_spare_servers = 5
    pm.max_spare_servers = 15
    pm.max_requests = 500
    ```
  - Caching Quran Foundation API disetel 7–30 hari (data surah & ayat bersifat statis abadi).

---

### 🔴 Skenario 4: Trafik Sangat Padat / Viral (Spike > 1.000 – 5.000 CCU)
- **Concurrent Users (CCU)**: 1.000 – 5.000 pengguna serentak.
- **Beban Request**: 800 – 3.000+ Request Per Second (RPS) akibat ribuan listener yang melakukan polling room sinkronisasi secara bersamaan.
- **Analisis Kebutuhan**:
  - Pada arsitektur PHP-FPM standar, 1.000+ RPS konstan membutuhkan banyak PHP workers dan CPU yang memadai (4 vCPU / 4–8 GB RAM).
- **Strategi Skalabilitas Lanjutan**:
  1. **Terapkan Laravel Octane (FrankenPHP atau RoadRunner)**:
     - Aplikasi di-load sekali di memori, meniadakan overhead booting Laravel tiap request. 1 instance FrankenPHP mampu menangani 2.000 – 5.000 RPS hanya pada 2–4 vCPU dengan latensi < 5ms.
  2. **Migrasi Polling ke Laravel Reverb (WebSockets)**:
     - Mengubah polling HTTP interval 1-2 detik menjadi koneksi persistent WebSocket tunggal via Reverb, memangkas 90% overhead HTTP handshake.

---

## ⚙️ 4. Variabel Lingkungan Produksi Utama (`.env`)

```ini
APP_NAME="Anisul Qur'an"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://quran.domainanda.com

# Drivers
DB_CONNECTION=sqlite
CACHE_STORE=redis          # Sangat disarankan redis (fallback: file)
SESSION_DRIVER=redis       # Sangat disarankan redis (fallback: file)
QUEUE_CONNECTION=database

# Redis (Bila menggunakan Redis di VPS)
REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Logging
LOG_CHANNEL=stack
LOG_LEVEL=error
```

---

## 🤖 5. Template Prompt untuk Ditanyakan ke Hermes (VPS Assistant)

Salin pesan berikut dan tanyakan langsung ke Hermes di terminal VPS Anda:

```text
Halo Hermes, saya ingin mendeploy aplikasi web Laravel 12 + Inertia Vue 3 ("Anisul Qur'an") ke VPS ini.
Karakteristik aplikasinya:
1. Audio murottal di-stream langsung oleh browser client dari CDN eksternal (zero audio egress dari VPS).
2. Frontend 100% Client-Side SPA (tidak perlu Node.js SSR background process).
3. Menggunakan SQLite untuk database dasar dan Cache (Redis/File) untuk menyimpan data ayat & room sinkronisasi realtime.
4. Terdapat fitur "Listen Together" yang melakukan polling HTTP ringan setiap 1-2 detik per listener yang aktif.

Tolong periksa spesifikasi VPS ini saat ini (CPU cores, RAM total/free, disk space, versi PHP, dan ekstensi yang terpasang). Apakah VPS ini sudah cukup kuat untuk menjalankan aplikasi ini dari trafik sepi (1-20 pengguna) hingga sedang (50-150 pengguna)? Apa saja konfigurasi Nginx/PHP-FPM/Redis yang kamu rekomendasikan untuk server ini?
```
