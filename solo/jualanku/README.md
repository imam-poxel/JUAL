# jualanku

Website e-commerce statis (frontend demo) untuk penjualan pulsa, kartu paket, dan asesoris HP dengan UI modern, clean, dan minimalis.

## Cara menjalankan

Opsi 1 (paling mudah):
- Buka file [index.html](file:///c:/Users/LENOVO/Downloads/solo/jualanku/index.html) di browser.

Opsi 2 (disarankan agar modul ES berjalan stabil):
- Jalankan server statis di folder `jualanku`, lalu buka URL yang diberikan.
  - Jika kamu punya Python: `python -m http.server 5173`

## Fitur

- Home: banner promo, kategori, produk unggulan, best seller
- Produk: search + filter (kategori, model, harga) + sorting
- Detail produk: foto HD, pilihan model/warna, deskripsi, review & rating
- Cart & wishlist
- Login & register (demo, disimpan di localStorage)
- Checkout flow singkat + opsi pembayaran (Transfer Bank, E-Wallet OVO/GoPay/DANA, COD untuk asesoris)
- Mobile responsive + animasi ringan (fade-in)
