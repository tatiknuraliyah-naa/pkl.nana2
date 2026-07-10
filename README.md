# Serenyt Bakery — deployment data real-time

Versi awal proyek menyimpan seluruh data di `localStorage`. Itu hanya tersimpan pada satu browser dan **tidak dapat** disinkronkan antar perangkat. Berkas Firebase di root ini menyediakan fondasi backend produksi: Firestore untuk data bersama dan Cloud Function `checkout` untuk pengurangan stok serta pembuatan order/notifikasi secara atomik. Klien saat ini belum dapat dihubungkan sebelum proyek Firebase dan kredensial web tersedia.

## Sebelum go-live

1. Buat proyek Firebase, aktifkan **Authentication (Email/Password)**, Firestore, dan Functions.
2. Tambahkan kredensial web Firebase pada aplikasi klien (jangan pernah menyimpan password admin di JavaScript).
3. Buat akun admin melalui Firebase Auth lalu beri custom claim `admin: true` menggunakan Admin SDK.
4. Seed koleksi `products` dari katalog yang ada. Pastikan setiap produk memiliki `name`, `price`, dan `stock` (integer >= 0).
5. Jalankan `npm install` di `functions`, login Firebase CLI, lalu deploy dengan `firebase deploy`.
6. Ubah klien agar memanggil callable function `checkout`, dan mendengarkan `orders`, `products`, dan `notifications` dengan `onSnapshot`. Jangan mengaktifkan fallback localStorage pada produksi.

Aturan `firestore.rules` membatasi stok dan pesanan agar hanya dapat dimutasi admin atau fungsi tepercaya. `checkout` menjalankan transaksi Firestore: stok tidak akan minus, order ID selalu unik, dan retry transaksi tidak membuat order duplikat.
