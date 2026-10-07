# Panduan Sinkronisasi Data Master (Tim IT)
File ini merupakan panduan bagi Tim IT untuk melakukan sinkronisasi data dari format TSV ke dalam Firebase Realtime Database.

## Langkah-langkah Sinkronisasi:

**1. Unduh Data TSV Terbaru**
Buka panel Dashboard Admin / IT di web, lalu masuk ke menu **Sinkronisasi Data**. Klik tombol unduh untuk mendapatkan file `data-siswa.tsv` dan `data-guru.tsv` terbaru.

**2. Pindahkan ke Folder Data**
Pindahkan kedua file yang baru saja diunduh tersebut ke dalam folder:
`backend-tools/data/`
(Timpa file lama jika ada).

**3. Generate Database JSON**
Buka terminal (Command Prompt / VS Code Terminal), arahkan ke folder `backend-tools`, lalu jalankan perintah:
```bash
node generate-db.js
```
Perintah ini akan membaca file TSV dan merangkai data dalam bentuk file JSON raksasa yang berada di `data/musada-sd-default-rtdb-export.json`.

**4. Buat Akun Autentikasi**
Jika ada siswa atau guru/tenaga kependidikan *baru* yang mendaftar, jalankan perintah ini agar mereka mendapatkan akses Login (Email & Password tergenerate secara otomatis):
```bash
node import-auth-admin.js
```

**5. Selesai!**
Proses sinkronisasi telah rampung. Seluruh data pada aplikasi web kini sudah tersinkronisasi 100% dengan data yang baru.
