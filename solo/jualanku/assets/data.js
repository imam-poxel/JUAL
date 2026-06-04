const img = (prompt, imageSize = "landscape_4_3") =>
  `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt
  )}&image_size=${imageSize}`;

export const BRAND = {
  name: "jualanku",
  colors: {
    orange: "#ff6a00",
    blue: "#72d1ff",
  },
};

export const CATEGORIES = [
  {
    id: "kartu-paket",
    name: "Kartu Paket",
    desc: "Paket data & kartu perdana siap pakai.",
    image: img(
      "minimalist studio product photo of a SIM card starter pack on white background, soft shadows, clean modern ecommerce, high detail",
      "landscape_4_3"
    ),
  },
  {
    id: "pulsa",
    name: "Pulsa",
    desc: "Top up cepat, aman, dan transparan.",
    image: img(
      "minimalist studio product photo of a smartphone top up voucher card and phone on white background, modern clean lighting, high detail",
      "landscape_4_3"
    ),
  },
  {
    id: "asesoris",
    name: "Asesoris HP",
    desc: "Aksesoris premium untuk daily use.",
    image: img(
      "minimalist studio product photo of smartphone accessories set (charger, cable, phone case) on white background, soft shadows, premium clean look, high detail",
      "landscape_4_3"
    ),
  },
];

export const PRODUCTS = [
  {
    id: "pulsa-10k",
    name: "Pulsa Rp10.000",
    categoryId: "pulsa",
    tag: "Instant",
    price: 12000,
    rating: 4.8,
    reviewCount: 214,
    bestSeller: true,
    featured: true,
    images: [
      img(
        "premium minimal ecommerce product photo of a smartphone showing top up confirmation screen, white background, clean lighting, high detail",
        "landscape_4_3"
      ),
      img(
        "close up minimalist product photo of a smartphone screen UI with top up receipt, white background, high detail, clean",
        "landscape_4_3"
      ),
    ],
    variants: {
      models: ["Telkomsel", "XL", "Indosat", "Tri"],
      colors: ["Default"],
    },
    description:
      "Top up pulsa cepat untuk kebutuhan harian. Proses otomatis, aman, dan langsung masuk setelah pembayaran terkonfirmasi.",
    specs: ["Proses otomatis", "Notifikasi status pesanan", "Cocok untuk semua provider pilihan"],
  },
  {
    id: "pulsa-25k",
    name: "Pulsa Rp25.000",
    categoryId: "pulsa",
    tag: "Best value",
    price: 27000,
    rating: 4.9,
    reviewCount: 331,
    bestSeller: true,
    featured: true,
    images: [
      img(
        "minimalist studio product photo of a smartphone and a clean voucher card labeled 25k, white background, modern premium, high detail",
        "landscape_4_3"
      ),
      img(
        "premium minimal ecommerce photo of top up voucher card and smartphone on white, soft shadows, high detail",
        "landscape_4_3"
      ),
    ],
    variants: {
      models: ["Telkomsel", "XL", "Indosat", "Tri", "Smartfren"],
      colors: ["Default"],
    },
    description:
      "Pulsa favorit untuk penggunaan rutin. Checkout cepat dengan opsi pembayaran populer seperti e-wallet dan transfer bank.",
    specs: ["Checkout cepat", "Pilihan pembayaran lengkap", "Riwayat order tersimpan"],
  },
  {
    id: "pulsa-50k",
    name: "Pulsa Rp50.000",
    categoryId: "pulsa",
    tag: "Popular",
    price: 52000,
    rating: 4.7,
    reviewCount: 156,
    bestSeller: false,
    featured: true,
    images: [
      img(
        "clean minimalist product photo of smartphone with top up interface and a simple 50k card, white background, high detail",
        "landscape_4_3"
      ),
      img(
        "minimalist ecommerce product photo of smartphone top up receipt screen, white background, premium lighting, high detail",
        "landscape_4_3"
      ),
    ],
    variants: {
      models: ["Telkomsel", "XL", "Indosat", "Tri", "Smartfren"],
      colors: ["Default"],
    },
    description:
      "Pulsa nominal besar untuk kebutuhan komunikasi seharian. Cocok untuk kamu yang ingin jarang top up.",
    specs: ["Nominal besar", "Proses cepat", "Dukungan COD untuk aksesori tertentu"],
  },
  {
    id: "paket-data-10gb",
    name: "Paket Data 10GB",
    categoryId: "kartu-paket",
    tag: "Hemat",
    price: 39000,
    rating: 4.6,
    reviewCount: 98,
    bestSeller: false,
    featured: true,
    images: [
      img(
        "minimalist studio product photo of a SIM card and a small card labeled 10GB data, white background, clean premium lighting, high detail",
        "landscape_4_3"
      ),
      img(
        "close up clean product photo of SIM card starter pack, white background, high detail",
        "landscape_4_3"
      ),
    ],
    variants: {
      models: ["Telkomsel", "XL", "Indosat", "Tri"],
      colors: ["Default"],
    },
    description:
      "Paket data untuk streaming, kerja, dan belajar. Pilih provider, checkout, lalu ikuti instruksi aktivasi di halaman pesanan.",
    specs: ["10GB", "Masa aktif bervariasi", "Panduan aktivasi tersedia"],
  },
  {
    id: "case-iphone15",
    name: "Case Silicone iPhone 15",
    categoryId: "asesoris",
    tag: "Premium",
    price: 99000,
    rating: 4.8,
    reviewCount: 72,
    bestSeller: true,
    featured: true,
    images: [
      img(
        "high detail minimalist studio product photo of a silicone phone case for iPhone 15, white background, soft shadows, premium clean ecommerce",
        "landscape_4_3"
      ),
      img(
        "close up premium product photo of silicone phone case texture, white background, soft shadows, high detail",
        "landscape_4_3"
      ),
    ],
    variants: {
      models: ["iPhone 15", "iPhone 15 Pro", "iPhone 15 Pro Max"],
      colors: ["Black", "Stone", "Sky Blue", "Orange"],
    },
    description:
      "Case silicone dengan grip nyaman dan desain minimalis. Melindungi harian tanpa mengganggu look perangkat.",
    specs: ["Soft-touch finish", "Raised edge protection", "Pas presisi tombol & port"],
  },
  {
    id: "charger-20w",
    name: "Charger Fast 20W USB-C",
    categoryId: "asesoris",
    tag: "Fast charge",
    price: 129000,
    rating: 4.7,
    reviewCount: 144,
    bestSeller: true,
    featured: false,
    images: [
      img(
        "minimalist studio product photo of a compact 20W USB-C wall charger, white background, premium lighting, high detail",
        "landscape_4_3"
      ),
      img(
        "clean product photo of USB-C wall charger plugged into a white socket, minimalist, high detail",
        "landscape_4_3"
      ),
    ],
    variants: {
      models: ["Universal"],
      colors: ["White", "Black"],
    },
    description:
      "Charger 20W ringkas untuk kebutuhan fast charge. Cocok untuk smartphone modern dan perangkat USB-C.",
    specs: ["20W output", "Proteksi panas & arus", "Desain compact"],
  },
  {
    id: "cable-usbc",
    name: "Kabel USB-C 1m (Braided)",
    categoryId: "asesoris",
    tag: "Durable",
    price: 69000,
    rating: 4.6,
    reviewCount: 88,
    bestSeller: false,
    featured: false,
    images: [
      img(
        "minimalist studio product photo of a braided USB-C cable coiled neatly on white background, premium clean ecommerce, high detail",
        "landscape_4_3"
      ),
      img(
        "close up product photo of braided cable texture and USB-C connector, white background, high detail",
        "landscape_4_3"
      ),
    ],
    variants: {
      models: ["USB-C to USB-C", "USB-C to Lightning"],
      colors: ["Black", "Stone", "Sky Blue"],
    },
    description:
      "Kabel braided yang tahan tekuk untuk pemakaian harian. Rapi, kuat, dan terlihat premium.",
    specs: ["Panjang 1m", "Braided nylon", "Konektor kuat"],
  },
];

export const PROMOS = [
  {
    title: "Pulsa & paket data, beres dalam hitungan menit",
    subtitle: "Checkout cepat. Status pesanan jelas. Pengalaman belanja yang fokus ke produk.",
    cta: { label: "Belanja Sekarang", href: "#/products?category=pulsa" },
    secondary: { label: "Lihat Best Seller", href: "#/products?sort=best" },
    image: img(
      "modern minimalist hero banner photo of smartphone on white background with subtle orange and light blue gradient shapes, premium ecommerce, high detail",
      "landscape_16_9"
    ),
  },
  {
    title: "Asesoris HP minimalis, tampil rapi setiap hari",
    subtitle: "Case, charger, dan kabel pilihan dengan desain clean dan kualitas solid.",
    cta: { label: "Cari Asesoris", href: "#/products?category=asesoris" },
    secondary: { label: "Wishlist Dulu", href: "#/wishlist" },
    image: img(
      "modern minimalist hero banner photo of premium smartphone accessories on white background, orange and light blue accents, clean lighting, high detail",
      "landscape_16_9"
    ),
  },
];

export const PAYMENT_METHODS = [
  {
    id: "bank",
    name: "Transfer Bank",
    desc: "BCA / Mandiri / BRI / BNI",
  },
  {
    id: "ewallet",
    name: "E-Wallet",
    desc: "OVO / GoPay / DANA",
  },
  {
    id: "cod",
    name: "COD",
    desc: "Bayar saat barang diterima",
  },
];
