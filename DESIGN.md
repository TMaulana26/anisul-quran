# Design System & Visual Guidelines

<!-- impeccable:design-schema 1 -->

## 🎨 Visual Identity & Aesthetic World

**Anisul Qur'an** memadukan estetika sakral Al-Qur'an klasik dengan ketajaman antarmuka modern yang tenang, bersih, dan berwibawa (*Spiritual Sanctuary / Modern Oasis*).

- **Tone**: Tenang, khusyuk, berkelas, bebas distraksi visual (*zero-clutter*).
- **Tema Warna Utama**: **Mauve & Emerald Sanctuary** (nuansa batu slate hangat dipadukan aksen hijau zamrud yang sejuk).
- **Mode Tampilan**: Light Mode (lembut, tidak silau) & Dark Mode (deep mauve-slate, sangat nyaman untuk tilawah malam hari).

---

## 🔤 Tipografi (Typography)

### 1. Teks Arab (Quranic Arabic)
- **Font Utama**: `'Amiri'`, `'Scheherazade New'`, `'UthmanicHafs'`, `'IndoPak'`.
- **Pengaturan**:
  - `direction: rtl`
  - Harakat tajam, proporsional, dan tidak bertumpuk.
  - Skala ukuran dinamis: Normal (24px), Besar (30px), Ekstra Besar (38px).
  - Line height lapang (`leading-[2.2]` sampai `leading-[2.6]`) agar baris ayat nyaman ditelusuri.

### 2. Teks Latin & Antarmuka (UI & Translations)
- **Font Utama**: `'Nunito Sans'`, `-apple-system`, `system-ui`, `sans-serif`.
- **Hierarki**:
  - Heading: Weight 600/700, optical tracking `-0.01em`.
  - Body & Terjemahan: Weight 400/500, `text-muted-foreground` / `text-foreground`, `leading-relaxed`.
  - Transliterasi Latin: Italic, `text-sm`, warna muted amber/emerald halus.

---

## 🎭 Palet Warna & Semantic Tokens

Menggunakan format modern **OKLCH** yang dikonfigurasi melalui CSS variables di `resources/css/app.css` & shadcn-vue:

| Token | Light Mode | Dark Mode | Penggunaan |
|:---|:---|:---|:---|
| `--background` | `oklch(0.99 0.005 300)` | `oklch(0.14 0.015 300)` | Latar belakang halaman |
| `--foreground` | `oklch(0.18 0.02 300)` | `oklch(0.98 0.005 300)` | Warna teks utama |
| `--primary` | `oklch(0.42 0.12 160)` | `oklch(0.75 0.13 160)` | Tombol aksi, aksen qari aktif |
| `--primary-foreground` | `oklch(0.99 0 0)` | `oklch(0.12 0.02 160)` | Teks di atas warna primary |
| `--card` | `oklch(1 0 0)` | `oklch(0.18 0.015 300)` | Kartu Surah & wadah ayat |
| `--card-foreground` | `oklch(0.18 0.02 300)` | `oklch(0.98 0.005 300)` | Teks di dalam kartu |
| `--border` | `oklch(0.92 0.01 300)` | `oklch(0.25 0.02 300)` | Garis batas kartu/pembatas |
| `--muted` | `oklch(0.96 0.008 300)` | `oklch(0.22 0.015 300)` | Latar belakang sekunder |
| `--muted-foreground`| `oklch(0.48 0.015 300)` | `oklch(0.68 0.01 300)` | Terjemahan, nomor ayat, label |

### 🌟 Karaoke Active Highlight Token
- **Active Ayah Background**: `bg-primary/10 dark:bg-primary/15` dengan border kiri aksen `border-l-4 border-primary`.
- **Active Word Glow**: Teks Arab yang sedang dibaca qari diberi efek `text-primary font-bold drop-shadow-sm` dengan transisi halus.

---

## 🧩 Komponen & Komposisi Layout

1. **Header Navigasi (`AppLayout.vue`)**:
   - Sticky top bar dengan backdrop blur (`backdrop-blur-md bg-background/80`).
   - Logo Anisul Qur'an, filter pencarian cepat, tombol toggle tema (Dark/Light), dan tombol pengaturan (Rasm/Font size).
2. **Katalog Surah (`SurahCard.vue`)**:
   - Grid kartu responsif (1 kolom di mobile, 2 di tablet, 3-4 di desktop).
   - Menampilkan badge nomor surah berornamen, nama Arab di sisi kanan, nama Latin dan arti di sisi kiri.
3. **Pembaca Ayat (`AyahItem.vue`)**:
   - Blok baris vertikal dengan spacing berirama (`gap-6` antar ayat).
   - Tombol putar individual per-ayat (*Quick Play*).
   - Teks Arab, transliterasi Latin, dan terjemahan Indonesia tertata dalam alur pembacaan natural.
4. **Floating Player Bar (`AudioPlayerBar.vue`)**:
   - Pinned di bottom viewport dengan efek *glassmorphism* elegan.
   - Progres bar interaktif, nama Surah & Qari, kontrol Play/Pause, Next/Prev, Speed, dan tombol *"Listen Together"*.
5. **Modal "Listen Together" (`ListenTogetherModal.vue`)**:
   - Dialog bersih dengan tampilan QR Code SVG kontras tinggi di tengah, tombol salin tautan, dan indikator status live.

---

## ✨ Motion & Transisi

- **Auto-Scroll**: Menggunakan `element.scrollIntoView({ behavior: 'smooth', block: 'center' })` ketika ayat berganti.
- **Ayah Activation**: Transisi fade & border transition (`transition-all duration-300 ease-out`).
- **Player Docking**: Animasi slide-up saat audio pertama kali diputar.

---

## 🚫 Anti-Patterns yang Dihindari
- ❌ Tidak menggunakan gradien ungu norak atau efek neon yang menyilaukan mata.
- ❌ Tidak menumpuk kartu dalam kartu secara berlebihan (*no excessive card nesting*).
- ❌ Tidak menggunakan ikon mengambang (*floating icons*) tanpa fungsi yang jelas.
- ❌ Tidak mengunci scrolling saat audio memutar (pengguna tetap leluasa membaca ayat lain).
