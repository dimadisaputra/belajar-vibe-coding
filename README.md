# Belajar Vibe Coding

Belajar Vibe Coding adalah sebuah proyek backend API yang dirancang untuk memanajemen pengguna (user) dan autentikasi (login, logout, dan manajemen sesi) secara sederhana namun efisien. Proyek ini dibangun menggunakan runtime modern yang sangat cepat, kerangka kerja web minimalis, dan ORM yang *type-safe*.

## Teknologi & Library yang Digunakan

- **[Bun](https://bun.sh/):** Runtime JavaScript/TypeScript yang super cepat, sekaligus berfungsi sebagai *package manager* dan *test runner*.
- **[ElysiaJS](https://elysiajs.com/):** Framework web *TypeScript-first* yang cepat dan ringan untuk membuat API.
- **[Drizzle ORM](https://orm.drizzle.team/):** TypeScript ORM yang *type-safe* untuk interaksi dengan database.
- **[PostgreSQL](https://www.postgresql.org/):** Sistem manajemen database relasional (RDBMS) yang digunakan sebagai penyimpanan data utama.

## Arsitektur & Struktur Folder

Aplikasi ini menggunakan arsitektur berlapis (*layered architecture*) untuk memisahkan antara penanganan rute (HTTP) dengan logika bisnis.

```text
src/
├── index.ts           # Entry point aplikasi, inisialisasi server ElysiaJS
├── db.ts              # Konfigurasi koneksi ke database menggunakan Drizzle
├── schema.ts          # Definisi skema tabel database (users, sessions)
├── routes/            # Layer Routing (Controller)
│   └── users-route.ts # File untuk mendefinisikan rute dan validasi request API
└── services/          # Layer Business Logic
    └── users-service.ts # File yang memuat logika spesifik fitur (registrasi, login, dll)
```
**Aturan Penamaan:**
- Folder menggunakan huruf kecil semua.
- File menggunakan format *kebab-case* (contoh: `users-route.ts`, `users-service.ts`).

## Skema Database

Proyek ini memiliki dua entitas utama di dalam database:

### 1. Tabel `users`
Digunakan untuk menyimpan data pengguna yang terdaftar.
- `id` (Serial, Primary Key): ID unik pengguna.
- `name` (Text, Not Null): Nama lengkap pengguna.
- `email` (Text, Not Null, Unique): Alamat email yang unik.
- `password` (Text, Not Null): Kata sandi pengguna.
- `createdAt` (Timestamp, Default Now, Not Null): Waktu ketika data dibuat.

### 2. Tabel `sessions`
Digunakan untuk memanajemen token login.
- `id` (Serial, Primary Key): ID unik sesi.
- `token` (Text, Not Null): Token autentikasi.
- `userId` (Integer, Not Null, Foreign Key ke `users.id`): ID pengguna pemilik sesi.
- `createdAt` (Timestamp, Default Now, Not Null): Waktu ketika sesi dibuat.

## Daftar API Tersedia

Semua endpoint memiliki *prefix* `/api/users`.

### 1. Registrasi User
- **Endpoint:** `POST /api/users`
- **Body:** `{ "name": "...", "email": "...", "password": "..." }`
- **Fungsi:** Mendaftarkan pengguna baru ke dalam database.

### 2. Login User
- **Endpoint:** `POST /api/users/login`
- **Body:** `{ "email": "...", "password": "..." }`
- **Fungsi:** Melakukan autentikasi. Jika berhasil, akan menghasilkan dan mengembalikan token yang disimpan di tabel `sessions`.

### 3. Dapatkan User Saat Ini (Current User)
- **Endpoint:** `GET /api/users/current`
- **Header:** `Authorization: Bearer <token>`
- **Fungsi:** Mengambil data pengguna yang sedang login berdasarkan token yang dikirim. Mengembalikan data tanpa informasi password.

### 4. Logout User
- **Endpoint:** `DELETE /api/users/logout`
- **Header:** `Authorization: Bearer <token>`
- **Fungsi:** Menghapus data sesi di database agar token tidak lagi valid.

---

## Panduan Instalasi dan Setup

### 1. Persiapan Lingkungan (Environment)
Pastikan Anda telah menginstal [Bun](https://bun.sh/) dan menjalankan database [PostgreSQL].

### 2. Instal Dependensi
```bash
bun install
```

### 3. Konfigurasi Environment Variables
Salin file `.env.example` ke `.env` dan sesuaikan kredensial database PostgreSQL Anda:
```bash
cp .env.example .env
```
Isi variabel `DATABASE_URL` dengan format koneksi PostgreSQL Anda (misal: `postgresql://user:password@localhost:5432/dbname`).

### 4. Setup Database
Jalankan perintah berikut untuk meng-generate file migrasi dan mendorong skema ke database:
```bash
bun run db:generate
bun run db:push
```

## Menjalankan Aplikasi

Untuk menjalankan server pengembangan (dengan fitur *hot-reload*):
```bash
bun run dev
```
Aplikasi akan berjalan (secara *default* di `http://localhost:3000`).

## Menjalankan Pengujian (Testing)

Proyek ini menggunakan `bun test` sebagai *test runner*. Anda bisa menjalankan semua *unit test* untuk skenario API menggunakan perintah berikut:

```bash
bun test
```
*Catatan:* Pengujian dirancang untuk menghapus dan melakukan reset data sebelum setiap skenario pengujian agar state pengujian senantiasa konsisten.
