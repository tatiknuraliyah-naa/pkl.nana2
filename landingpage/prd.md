# PRD Aplikasi Toko Roti

## 1. Ringkasan Produk

### Nama Produk
Toko Rotii

### Deskripsi Singkat
Toko Rotii adalah aplikasi mobile untuk membantu pelanggan melihat katalog roti, memesan produk, memilih metode pengambilan atau pengantaran, dan melakukan pembayaran dengan mudah. Aplikasi ini juga membantu pemilik toko mengelola produk, pesanan, stok, promo, dan laporan penjualan harian.

### Tujuan Produk
- Mempermudah pelanggan membeli roti tanpa harus datang langsung ke toko.
- Meningkatkan jumlah pesanan dan jangkauan pelanggan toko roti.
- Membantu toko mengelola pesanan secara lebih rapi dan cepat.
- Mengurangi kesalahan pencatatan pesanan, stok, dan pembayaran.

## 2. Latar Belakang

Banyak toko roti masih menerima pesanan melalui chat manual atau pembelian langsung di toko. Cara ini sering menyebabkan pesanan tercecer, stok tidak akurat, dan pelanggan sulit mengetahui produk yang tersedia. Dengan aplikasi Toko Rotii, pelanggan dapat memesan lebih praktis, sementara admin toko dapat mengelola operasional penjualan dari satu sistem.

## 3. Target Pengguna

### Pelanggan
Pengguna umum yang ingin membeli roti, kue, pastry, atau paket hampers secara praktis.

Kebutuhan utama:
- Melihat produk yang tersedia.
- Mengetahui harga, foto, deskripsi, dan stok.
- Memesan roti untuk diambil sendiri atau dikirim.
- Mendapatkan promo dan informasi produk baru.

### Admin Toko
Pemilik atau staf toko yang mengelola produk, pesanan, stok, dan promosi.

Kebutuhan utama:
- Menambah dan mengubah data produk.
- Mengelola pesanan masuk.
- Memperbarui status pesanan.
- Melihat laporan penjualan.

## 4. Masalah Yang Ingin Diselesaikan

- Pelanggan sulit mengetahui stok roti terbaru.
- Pesanan melalui chat rawan tertukar atau terlewat.
- Admin membutuhkan waktu lama untuk mencatat pesanan manual.
- Pelanggan tidak memiliki riwayat pesanan.
- Promo dan produk baru sulit disampaikan secara konsisten.
- Toko sulit melihat performa produk terlaris secara cepat.

## 5. Sasaran Produk

### Sasaran Bisnis
- Meningkatkan transaksi harian toko roti.
- Meningkatkan loyalitas pelanggan melalui riwayat pesanan dan promo.
- Membantu toko mengambil keputusan berdasarkan data penjualan.

### Sasaran Pengguna
- Pelanggan dapat memesan roti dalam waktu kurang dari 3 menit.
- Pelanggan dapat melihat status pesanan secara real-time.
- Admin dapat memproses pesanan dengan alur yang jelas dan cepat.

## 6. Ruang Lingkup

### Termasuk Dalam MVP
- Registrasi dan login pelanggan.
- Katalog produk roti.
- Detail produk.
- Keranjang belanja.
- Checkout pesanan.
- Pilihan ambil di toko atau pengantaran.
- Metode pembayaran sederhana.
- Riwayat pesanan pelanggan.
- Panel admin untuk produk dan pesanan.
- Status pesanan.

### Tidak Termasuk Dalam MVP
- Program membership tingkat lanjut.
- Integrasi penuh dengan jasa ekspedisi eksternal.
- Sistem kasir lengkap.
- Multi-cabang toko.
- Fitur langganan roti otomatis.
- Rekomendasi produk berbasis AI.

## 7. Fitur Utama

### 7.1 Autentikasi Pengguna
Pengguna dapat membuat akun, login, dan logout.

Kebutuhan:
- Registrasi menggunakan nama, nomor telepon, email, dan password.
- Login menggunakan email atau nomor telepon.
- Validasi input wajib.
- Pengguna dapat melihat dan mengubah profil dasar.

### 7.2 Katalog Produk
Pelanggan dapat melihat daftar produk roti yang dijual.

Kebutuhan:
- Menampilkan foto produk, nama, harga, kategori, dan status stok.
- Mendukung kategori seperti roti manis, roti tawar, pastry, kue, minuman, dan paket hampers.
- Mendukung pencarian produk.
- Mendukung filter berdasarkan kategori dan ketersediaan.

### 7.3 Detail Produk
Pelanggan dapat melihat informasi lengkap sebelum membeli.

Kebutuhan:
- Menampilkan foto, nama, harga, deskripsi, komposisi singkat, stok, dan estimasi waktu siap.
- Menampilkan varian produk jika tersedia, seperti ukuran atau rasa.
- Tombol tambah ke keranjang.

### 7.4 Keranjang Belanja
Pelanggan dapat mengatur produk sebelum checkout.

Kebutuhan:
- Menambah, mengurangi, dan menghapus item.
- Menampilkan subtotal per item.
- Menampilkan total harga.
- Memberi peringatan jika stok tidak mencukupi.

### 7.5 Checkout
Pelanggan dapat menyelesaikan pesanan.

Kebutuhan:
- Memilih metode penerimaan: ambil di toko atau pengantaran.
- Mengisi alamat jika memilih pengantaran.
- Memilih jadwal pesanan jika toko mendukung pre-order.
- Menambahkan catatan pesanan.
- Melihat ringkasan pesanan sebelum konfirmasi.

### 7.6 Pembayaran
Pelanggan dapat memilih metode pembayaran.

Kebutuhan MVP:
- Bayar di toko.
- Transfer bank manual.
- E-wallet manual dengan unggah bukti pembayaran.

Pengembangan berikutnya:
- Payment gateway otomatis.
- Virtual account.
- QRIS otomatis.

### 7.7 Status dan Riwayat Pesanan
Pelanggan dapat memantau proses pesanan.

Status pesanan:
- Menunggu konfirmasi.
- Diproses.
- Siap diambil.
- Dalam pengantaran.
- Selesai.
- Dibatalkan.

Kebutuhan:
- Menampilkan daftar riwayat pesanan.
- Menampilkan detail setiap pesanan.
- Menampilkan status terbaru.

### 7.8 Notifikasi
Aplikasi memberi informasi penting kepada pelanggan.

Kebutuhan:
- Notifikasi saat pesanan dikonfirmasi.
- Notifikasi saat pesanan siap diambil atau dikirim.
- Notifikasi promo dan produk baru.

### 7.9 Panel Admin Produk
Admin dapat mengelola produk toko.

Kebutuhan:
- Menambah produk baru.
- Mengubah nama, harga, foto, deskripsi, kategori, dan stok.
- Mengaktifkan atau menonaktifkan produk.
- Menandai produk sebagai produk unggulan.

### 7.10 Panel Admin Pesanan
Admin dapat mengelola pesanan masuk.

Kebutuhan:
- Melihat daftar pesanan berdasarkan status.
- Melihat detail pelanggan dan item pesanan.
- Mengubah status pesanan.
- Membatalkan pesanan dengan alasan.
- Melihat bukti pembayaran jika pembayaran manual.

### 7.11 Promo
Admin dapat membuat promo sederhana.

Kebutuhan MVP:
- Diskon nominal.
- Diskon persentase.
- Kode voucher.
- Periode promo.

## 8. Alur Pengguna

### Alur Pelanggan Memesan Produk
1. Pelanggan membuka aplikasi.
2. Pelanggan login atau melanjutkan sebagai pengguna baru.
3. Pelanggan melihat katalog produk.
4. Pelanggan membuka detail produk.
5. Pelanggan menambahkan produk ke keranjang.
6. Pelanggan membuka keranjang.
7. Pelanggan memilih metode penerimaan.
8. Pelanggan memilih metode pembayaran.
9. Pelanggan mengonfirmasi pesanan.
10. Pelanggan menerima status pesanan.

### Alur Admin Memproses Pesanan
1. Admin login ke panel admin.
2. Admin melihat pesanan baru.
3. Admin mengecek detail pesanan dan pembayaran.
4. Admin mengubah status menjadi diproses.
5. Admin menyiapkan pesanan.
6. Admin mengubah status menjadi siap diambil atau dalam pengantaran.
7. Admin menyelesaikan pesanan setelah diterima pelanggan.

## 9. Kebutuhan Fungsional

| Kode | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-001 | Pengguna dapat registrasi dan login | Tinggi |
| FR-002 | Pengguna dapat melihat katalog produk | Tinggi |
| FR-003 | Pengguna dapat mencari dan memfilter produk | Tinggi |
| FR-004 | Pengguna dapat melihat detail produk | Tinggi |
| FR-005 | Pengguna dapat menambahkan produk ke keranjang | Tinggi |
| FR-006 | Pengguna dapat checkout pesanan | Tinggi |
| FR-007 | Pengguna dapat memilih ambil di toko atau pengantaran | Tinggi |
| FR-008 | Pengguna dapat memilih metode pembayaran | Tinggi |
| FR-009 | Pengguna dapat melihat riwayat dan status pesanan | Tinggi |
| FR-010 | Admin dapat mengelola produk | Tinggi |
| FR-011 | Admin dapat mengelola stok produk | Tinggi |
| FR-012 | Admin dapat mengelola status pesanan | Tinggi |
| FR-013 | Admin dapat membuat promo sederhana | Sedang |
| FR-014 | Sistem dapat mengirim notifikasi status pesanan | Sedang |
| FR-015 | Admin dapat melihat laporan penjualan dasar | Sedang |

## 10. Kebutuhan Nonfungsional

| Kode | Kebutuhan | Target |
| --- | --- | --- |
| NFR-001 | Performa | Halaman katalog terbuka kurang dari 3 detik pada koneksi normal |
| NFR-002 | Keamanan | Password disimpan dalam bentuk terenkripsi atau hash |
| NFR-003 | Ketersediaan | Sistem tersedia minimal 99% selama jam operasional toko |
| NFR-004 | Kemudahan Penggunaan | Pengguna baru dapat menyelesaikan checkout tanpa panduan khusus |
| NFR-005 | Responsif | Tampilan nyaman digunakan pada berbagai ukuran layar mobile |
| NFR-006 | Skalabilitas | Struktur sistem dapat dikembangkan untuk multi-cabang di masa depan |
| NFR-007 | Audit Data | Perubahan status pesanan tersimpan dengan waktu perubahan |

## 11. Data Utama

### Data Pengguna
- ID pengguna
- Nama
- Email
- Nomor telepon
- Password
- Alamat
- Role: pelanggan atau admin

### Data Produk
- ID produk
- Nama produk
- Kategori
- Deskripsi
- Harga
- Foto
- Stok
- Status aktif
- Varian produk

### Data Pesanan
- ID pesanan
- ID pelanggan
- Daftar produk
- Jumlah produk
- Total harga
- Metode penerimaan
- Alamat pengiriman
- Metode pembayaran
- Status pembayaran
- Status pesanan
- Catatan pesanan
- Waktu pemesanan

### Data Promo
- ID promo
- Nama promo
- Kode voucher
- Jenis diskon
- Nilai diskon
- Tanggal mulai
- Tanggal selesai
- Status aktif

## 12. Hak Akses

| Role | Hak Akses |
| --- | --- |
| Pelanggan | Melihat produk, membuat pesanan, membayar, melihat status dan riwayat pesanan |
| Admin | Mengelola produk, stok, pesanan, promo, dan laporan |

## 13. Prioritas MVP

### Must Have
- Login dan registrasi.
- Katalog produk.
- Detail produk.
- Keranjang.
- Checkout.
- Status pesanan.
- Admin produk.
- Admin pesanan.

### Should Have
- Pencarian produk.
- Filter kategori.
- Promo sederhana.
- Riwayat pesanan.
- Notifikasi status pesanan.

### Could Have
- Produk favorit.
- Rating produk.
- Rekomendasi produk.
- Laporan produk terlaris.

### Won't Have Untuk Versi Awal
- Multi-cabang.
- Payment gateway otomatis.
- Integrasi kurir otomatis.
- Membership kompleks.

## 14. Metrik Keberhasilan

- Jumlah pengguna terdaftar.
- Jumlah pesanan harian.
- Persentase checkout berhasil.
- Waktu rata-rata pelanggan menyelesaikan pesanan.
- Jumlah pesanan yang dibatalkan.
- Produk paling sering dibeli.
- Jumlah pelanggan yang melakukan repeat order.

## 15. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Stok di aplikasi tidak sesuai dengan stok toko | Pesanan pelanggan tidak dapat dipenuhi | Admin harus memperbarui stok secara berkala dan stok berkurang otomatis setelah pesanan dikonfirmasi |
| Pesanan menumpuk saat jam ramai | Proses pesanan lambat | Tambahkan filter status dan estimasi waktu proses |
| Bukti pembayaran manual sulit diverifikasi | Admin membutuhkan waktu lebih lama | Tampilkan bukti pembayaran jelas di detail pesanan |
| Pelanggan salah mengisi alamat | Pengiriman terlambat | Validasi alamat dan nomor telepon sebelum checkout |

## 16. Asumsi

- Aplikasi utama digunakan di perangkat mobile.
- Toko hanya memiliki satu cabang pada versi awal.
- Admin toko memiliki akses internet saat mengelola pesanan.
- Pembayaran otomatis belum menjadi kebutuhan utama MVP.
- Pengiriman dapat dilakukan oleh kurir internal toko atau proses manual.

## 17. Rencana Pengembangan

### Fase 1: MVP
- Autentikasi.
- Katalog produk.
- Keranjang dan checkout.
- Riwayat dan status pesanan.
- Admin produk dan pesanan.

### Fase 2: Peningkatan Operasional
- Promo.
- Notifikasi.
- Laporan penjualan.
- Produk favorit.
- Rating produk.

### Fase 3: Skalabilitas
- Payment gateway.
- Multi-cabang.
- Integrasi kurir.
- Membership.
- Rekomendasi produk.

## 18. Kriteria Penerimaan MVP

- Pelanggan dapat membuat akun dan login.
- Pelanggan dapat melihat daftar produk yang tersedia.
- Pelanggan dapat menambahkan produk ke keranjang.
- Pelanggan dapat membuat pesanan sampai status menunggu konfirmasi.
- Admin dapat melihat pesanan masuk.
- Admin dapat mengubah status pesanan.
- Admin dapat menambah, mengubah, dan menonaktifkan produk.
- Pelanggan dapat melihat riwayat dan status pesanan.

## 19. Catatan Desain Awal

- Tampilan aplikasi harus sederhana, hangat, dan mudah dipahami.
- Foto produk menjadi elemen penting dalam katalog.
- Tombol beli atau tambah ke keranjang harus mudah ditemukan.
- Admin panel harus fokus pada kecepatan memproses pesanan.
- Warna visual dapat menggunakan kombinasi hangat seperti cokelat roti, krem, putih, dan aksen merah atau hijau untuk status.
