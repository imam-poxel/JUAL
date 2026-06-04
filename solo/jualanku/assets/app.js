import { BRAND, CATEGORIES, PAYMENT_METHODS, PRODUCTS, PROMOS } from "./data.js";
import { cartStore, orderStore, reviewStore, userStore, wishlistStore } from "./storage.js";
import { el, escapeHTML, formatIDR, icon, mountAutoAnimate, toast } from "./ui.js";

const byId = (id) => PRODUCTS.find((p) => p.id === id) ?? null;
const byCategory = (id) => CATEGORIES.find((c) => c.id === id) ?? null;

const nowISO = () => new Date().toISOString();
const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

const getSessionUser = () => {
  const session = userStore.getSession();
  if (!session?.userId) return null;
  const user = userStore.getUsers().find((u) => u.id === session.userId);
  return user ?? null;
};

const cartCount = () => cartStore.get().reduce((acc, it) => acc + (it.qty ?? 0), 0);
const wishlistCount = () => wishlistStore.get().length;

const cartKey = (item) => `${item.productId}::${item.model ?? ""}::${item.color ?? ""}`;

const setCartItem = (nextItem) => {
  const items = cartStore.get();
  const key = cartKey(nextItem);
  const idx = items.findIndex((it) => cartKey(it) === key);
  const qty = Math.max(1, Number(nextItem.qty ?? 1));
  if (idx >= 0) {
    items[idx] = { ...items[idx], ...nextItem, qty };
  } else {
    items.unshift({ ...nextItem, qty });
  }
  cartStore.set(items);
};

const removeCartItem = (key) => {
  const items = cartStore.get().filter((it) => cartKey(it) !== key);
  cartStore.set(items);
};

const toggleWishlist = (productId) => {
  const ids = wishlistStore.get();
  const next = ids.includes(productId) ? ids.filter((x) => x !== productId) : [productId, ...ids];
  wishlistStore.set(next.slice(0, 200));
};

const getRoute = () => {
  const raw = (location.hash || "#/").slice(1);
  const [pathRaw, qsRaw] = raw.split("?");
  const path = pathRaw?.startsWith("/") ? pathRaw : `/${pathRaw || ""}`;
  const qs = new URLSearchParams(qsRaw || "");
  const seg = path.split("/").filter(Boolean);
  return { path, seg, qs };
};

const setQuery = (nextQs) => {
  const { path } = getRoute();
  const qs = new URLSearchParams(nextQs);
  const str = qs.toString();
  location.hash = str ? `#${path}?${str}` : `#${path}`;
};

const navTo = (hash) => {
  location.hash = hash;
};

const layout = (currentPath, contentHTML) => {
  const user = getSessionUser();
  const app = document.getElementById("app");
  const header = `
    <header class="header">
      <div class="container header-inner">
        <a class="brand" href="#/">
          <span class="brand-badge" aria-hidden="true"></span>
          <span>${escapeHTML(BRAND.name)}</span>
        </a>
        <nav class="nav" aria-label="Navigasi utama">
          ${navLink("Home", "#/", currentPath === "/")}
          ${navLink("Produk", "#/products", currentPath.startsWith("/products") || currentPath.startsWith("/product"))}
          ${navLink("About", "#/about", currentPath === "/about")}
          ${navLink("FAQ", "#/faq", currentPath === "/faq")}
          ${navLink("Contact", "#/contact", currentPath === "/contact")}
        </nav>
        <div class="header-actions">
          <button class="icon-btn" data-nav="#/products" aria-label="Cari produk">
            ${icon("search")}
          </button>
          <button class="icon-btn" data-nav="#/wishlist" aria-label="Wishlist">
            ${icon("heart")}
            ${wishlistCount() ? `<span class="badge">${wishlistCount()}</span>` : ""}
          </button>
          <button class="icon-btn" data-nav="#/cart" aria-label="Keranjang">
            ${icon("cart")}
            ${cartCount() ? `<span class="badge">${cartCount()}</span>` : ""}
          </button>
          <button class="icon-btn" data-nav="#/account" aria-label="${user ? "Akun" : "Login"}">
            ${icon("user")}
          </button>
        </div>
      </div>
    </header>
  `;
  const footer = `
    <footer class="footer">
      <div class="container footer-grid">
        <div class="stack">
          <div class="brand" style="gap:10px">
            <span class="brand-badge" aria-hidden="true"></span>
            <span style="font-weight:800">${escapeHTML(BRAND.name)}</span>
          </div>
          <div class="muted tiny">Tampilan modern, clean, dan minimalis. Fokus ke produk, checkout cepat, dan pengalaman belanja yang aman.</div>
        </div>
        <div class="stack">
          <div class="label">Navigasi</div>
          <a href="#/products">Produk</a>
          <a href="#/wishlist">Wishlist</a>
          <a href="#/cart">Cart</a>
          <a href="#/checkout">Checkout</a>
        </div>
        <div class="stack">
          <div class="label">Bantuan</div>
          <a href="#/faq">FAQ</a>
          <a href="#/contact">Contact</a>
          <a href="#/about">About</a>
        </div>
      </div>
      <div class="container" style="margin-top:18px">
        <div class="muted tiny">© ${new Date().getFullYear()} ${escapeHTML(BRAND.name)}.</div>
      </div>
    </footer>
  `;
  app.innerHTML = `${header}<main id="main" class="main">${contentHTML}</main>${footer}`;
};

const navLink = (label, href, active) =>
  `<a href="${href}" ${active ? 'aria-current="page"' : ""}>${escapeHTML(label)}</a>`;

const viewHome = () => {
  const promo = PROMOS[0];
  const featured = PRODUCTS.filter((p) => p.featured).slice(0, 4);
  const best = PRODUCTS.filter((p) => p.bestSeller).slice(0, 4);
  return `
    <section class="hero">
      <div class="container">
        <div class="hero-grid" data-animate>
          <div class="hero-card">
            <div>
              <div class="hero-kicker"><span class="dot" aria-hidden="true"></span><span>Promo Hari Ini</span></div>
              <h1 class="hero-title">${escapeHTML(promo.title)}</h1>
              <p class="hero-subtitle">${escapeHTML(promo.subtitle)}</p>
              <div class="hero-actions">
                <a class="btn btn-primary" href="${promo.cta.href}">${escapeHTML(promo.cta.label)}</a>
                <a class="btn btn-ghost" href="${promo.secondary.href}">${escapeHTML(promo.secondary.label)}</a>
              </div>
              <div class="row" style="margin-top:14px">
                <span class="chip">${icon("check")} Checkout cepat</span>
                <span class="chip">${icon("check")} Pembayaran lengkap</span>
                <span class="chip">${icon("check")} Mobile-first</span>
              </div>
            </div>
            <div class="hero-media">
              <img alt="Banner promo jualanku" src="${promo.image}" loading="lazy" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-title">
          <h2 class="h2">Kategori Produk</h2>
          <a class="subtle-link" href="#/products">Lihat semua</a>
        </div>
        <div class="grid grid-3">
          ${CATEGORIES.map(
            (c) => `
              <a class="category-card" href="#/products?category=${encodeURIComponent(c.id)}" data-animate>
                <div class="row" style="justify-content:space-between">
                  <h3 class="category-title">${escapeHTML(c.name)}</h3>
                  <span class="pill">Explore</span>
                </div>
                <p class="category-desc">${escapeHTML(c.desc)}</p>
                <div class="card" style="border-radius:16px;overflow:hidden;border:1px solid rgba(15, 23, 42, 0.1)">
                  <img src="${c.image}" alt="${escapeHTML(c.name)}" loading="lazy" style="width:100%;display:block;aspect-ratio:16/10;object-fit:cover" />
                </div>
              </a>
            `
          ).join("")}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-title">
          <h2 class="h2">Produk Unggulan</h2>
          <a class="subtle-link" href="#/products?sort=featured">Lihat</a>
        </div>
        <div class="grid grid-4">
          ${featured.map(productCard).join("")}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-title">
          <h2 class="h2">Best Seller</h2>
          <a class="subtle-link" href="#/products?sort=best">Lihat</a>
        </div>
        <div class="grid grid-4">
          ${best.map(productCard).join("")}
        </div>
      </div>
    </section>
  `;
};

const productCard = (p) => {
  const wished = wishlistStore.get().includes(p.id);
  return `
    <div class="product-card" data-animate>
      <a class="product-media" href="#/product/${encodeURIComponent(p.id)}" aria-label="${escapeHTML(p.name)}">
        <img src="${p.images[0]}" alt="${escapeHTML(p.name)}" loading="lazy" />
        <button class="icon-btn" data-action="wishlist" data-id="${escapeHTML(p.id)}" style="position:absolute;top:10px;right:10px;width:38px;height:38px;border-radius:14px" aria-label="Tambah ke wishlist">
          <span style="color:${wished ? BRAND.colors.orange : "var(--fg)"}">${icon("heart")}</span>
        </button>
      </a>
      <div class="product-body">
        <div class="row" style="justify-content:space-between;align-items:flex-start">
          <h3 class="product-title">${escapeHTML(p.name)}</h3>
          <span class="chip">${escapeHTML(p.tag)}</span>
        </div>
        <div class="product-meta">
          <span class="row" style="gap:6px">
            <span style="color:var(--orange)">${icon("star")}</span>
            <span>${p.rating.toFixed(1)} · ${p.reviewCount}</span>
          </span>
          <span class="price">${formatIDR(p.price)}</span>
        </div>
        <div class="row" style="justify-content:space-between">
          <button class="btn btn-ghost" data-action="quick-add" data-id="${escapeHTML(p.id)}" style="height:40px;padding:0 12px">Add to cart</button>
          <a class="pill" href="#/product/${encodeURIComponent(p.id)}">Detail</a>
        </div>
      </div>
    </div>
  `;
};

const viewProducts = (qs) => {
  const q = (qs.get("q") || "").trim();
  const category = (qs.get("category") || "").trim();
  const sort = (qs.get("sort") || "featured").trim();
  const model = (qs.get("model") || "").trim();
  const min = Number(qs.get("min") || "") || 0;
  const max = Number(qs.get("max") || "") || 0;

  const optionsModel = (() => {
    const list = PRODUCTS.filter((p) => (!category ? true : p.categoryId === category))
      .flatMap((p) => p.variants?.models ?? [])
      .filter(Boolean);
    return Array.from(new Set(list)).slice(0, 50);
  })();

  const filtered = PRODUCTS.filter((p) => {
    if (category && p.categoryId !== category) return false;
    if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (model && !(p.variants?.models ?? []).includes(model)) return false;
    if (min && p.price < min) return false;
    if (max && p.price > max) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "priceAsc") return a.price - b.price;
    if (sort === "priceDesc") return b.price - a.price;
    if (sort === "best") return Number(b.bestSeller) - Number(a.bestSeller);
    if (sort === "rating") return b.rating - a.rating;
    return Number(b.featured) - Number(a.featured);
  });

  return `
    <section class="section">
      <div class="container">
        <div class="section-title">
          <h2 class="h2">Produk</h2>
          <span class="muted tiny">${sorted.length} item</span>
        </div>

        <div class="toolbar">
          <input class="search" value="${escapeHTML(q)}" data-input="q" placeholder="Cari produk (pulsa, case, charger...)" />
          <select class="select" data-input="category" aria-label="Filter kategori">
            <option value="">Semua kategori</option>
            ${CATEGORIES.map((c) => `<option value="${escapeHTML(c.id)}" ${c.id === category ? "selected" : ""}>${escapeHTML(c.name)}</option>`).join("")}
          </select>
          <select class="select" data-input="model" aria-label="Filter model">
            <option value="">Semua model</option>
            ${optionsModel.map((m) => `<option value="${escapeHTML(m)}" ${m === model ? "selected" : ""}>${escapeHTML(m)}</option>`).join("")}
          </select>
          <select class="select" data-input="sort" aria-label="Urutkan">
            <option value="featured" ${sort === "featured" ? "selected" : ""}>Unggulan</option>
            <option value="best" ${sort === "best" ? "selected" : ""}>Best seller</option>
            <option value="rating" ${sort === "rating" ? "selected" : ""}>Rating</option>
            <option value="priceAsc" ${sort === "priceAsc" ? "selected" : ""}>Harga termurah</option>
            <option value="priceDesc" ${sort === "priceDesc" ? "selected" : ""}>Harga termahal</option>
          </select>
        </div>

        <div class="panel" style="margin-bottom:14px" data-animate>
          <div class="row" style="justify-content:space-between">
            <div class="stack" style="gap:6px">
              <div class="label">Filter harga</div>
              <div class="muted tiny">Kosongkan salah satu jika tidak diperlukan</div>
            </div>
            <div class="row" style="gap:10px">
              <input class="search" style="width:140px" inputmode="numeric" data-input="min" value="${min ? escapeHTML(min) : ""}" placeholder="Min" />
              <input class="search" style="width:140px" inputmode="numeric" data-input="max" value="${max ? escapeHTML(max) : ""}" placeholder="Max" />
              <button class="btn btn-ghost" data-action="reset-filters" style="height:44px">Reset</button>
            </div>
          </div>
        </div>

        <div class="grid grid-4">
          ${sorted.length ? sorted.map(productCard).join("") : `<div class="panel muted">Produk tidak ditemukan. Coba ubah kata kunci atau filter.</div>`}
        </div>
      </div>
    </section>
  `;
};

const viewProduct = (productId) => {
  const p = byId(productId);
  if (!p) return notFound("Produk tidak ditemukan.");
  const wished = wishlistStore.get().includes(p.id);
  const selected = getSelectedVariant(p.id, p.variants);
  const reviews = getMergedReviews(p.id, p.reviewCount);
  const ratingSummary = ratingFromReviews(p.rating, reviews);

  return `
    <section class="section">
      <div class="container">
        <div class="product-detail">
          <div class="gallery" data-animate>
            <img src="${p.images[selected.imageIdx ?? 0] ?? p.images[0]}" alt="${escapeHTML(p.name)}" loading="lazy" />
            <div class="row" style="padding:10px">
              ${p.images
                .map(
                  (src, i) => `
                    <button class="pill" data-action="img" data-id="${escapeHTML(p.id)}" data-idx="${i}" style="padding:8px 10px">
                      ${i === (selected.imageIdx ?? 0) ? "•" : ""} Foto ${i + 1}
                    </button>
                  `
                )
                .join("")}
            </div>
          </div>

          <div class="panel" data-animate>
            <div class="row" style="justify-content:space-between;align-items:flex-start">
              <div class="stack" style="gap:6px">
                <h1 class="hero-title" style="font-size:28px;margin:0">${escapeHTML(p.name)}</h1>
                <div class="row" style="gap:8px">
                  <span class="chip">${escapeHTML(p.tag)}</span>
                  <span class="chip"><span style="color:var(--orange)">${icon("star")}</span>${ratingSummary.avg.toFixed(1)} · ${ratingSummary.count} review</span>
                </div>
              </div>
              <div class="price" style="font-size:20px">${formatIDR(p.price)}</div>
            </div>

            <div class="divider"></div>

            <div class="fieldset">
              <div class="label">Model</div>
              <div class="segmented" data-variant="model" data-id="${escapeHTML(p.id)}">
                ${(p.variants?.models ?? []).map((m) => `<button type="button" aria-pressed="${m === selected.model}" data-value="${escapeHTML(m)}">${escapeHTML(m)}</button>`).join("")}
              </div>
            </div>

            <div class="fieldset">
              <div class="label">Warna</div>
              <div class="segmented" data-variant="color" data-id="${escapeHTML(p.id)}">
                ${(p.variants?.colors ?? []).map((c) => `<button type="button" aria-pressed="${c === selected.color}" data-value="${escapeHTML(c)}">${escapeHTML(c)}</button>`).join("")}
              </div>
            </div>

            <div class="row" style="margin-top:14px">
              <button class="btn btn-primary" data-action="add-to-cart" data-id="${escapeHTML(p.id)}">Add to cart</button>
              <button class="btn btn-ghost" data-action="wishlist" data-id="${escapeHTML(p.id)}" aria-label="Wishlist">
                <span style="color:${wished ? BRAND.colors.orange : "var(--fg)"}">${icon("heart")}</span>
                Wishlist
              </button>
              <a class="btn btn-ghost" href="#/products?category=${encodeURIComponent(p.categoryId)}">Kembali</a>
            </div>

            <div class="divider"></div>

            <div class="stack">
              <div>
                <div class="label">Deskripsi</div>
                <div class="muted">${escapeHTML(p.description)}</div>
              </div>
              <div>
                <div class="label">Highlight</div>
                <div class="row">
                  ${(p.specs ?? []).map((s) => `<span class="chip">${icon("check")}${escapeHTML(s)}</span>`).join("")}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="two-col" style="margin-top:16px">
          <div class="panel" data-animate>
            <div class="section-title" style="margin-bottom:10px">
              <h2 class="h2">Review</h2>
              <span class="muted tiny">Terbaru dulu</span>
            </div>
            <div class="stack">
              ${reviews.length ? reviews.map(reviewRow).join("") : `<div class="muted">Belum ada review. Jadilah yang pertama.</div>`}
            </div>
          </div>
          <div class="panel" data-animate>
            ${renderAddReview(p.id)}
          </div>
        </div>
      </div>
    </section>
  `;
};

const reviewRow = (r) => `
  <div class="card card-pad">
    <div class="row" style="justify-content:space-between">
      <div class="row" style="gap:8px">
        <strong>${escapeHTML(r.name)}</strong>
        <span class="muted tiny">${escapeHTML(new Date(r.at).toLocaleDateString("id-ID"))}</span>
      </div>
      <span class="row" style="gap:6px;color:var(--orange);font-weight:900">${icon("star")} ${Number(r.rating).toFixed(1)}</span>
    </div>
    <div class="muted" style="margin-top:8px">${escapeHTML(r.text)}</div>
    ${r.model || r.color ? `<div class="muted tiny" style="margin-top:10px">Varian: ${escapeHTML([r.model, r.color].filter(Boolean).join(" · "))}</div>` : ""}
  </div>
`;

const renderAddReview = (productId) => {
  const user = getSessionUser();
  if (!user) {
    return `
      <div class="stack">
        <h2 class="h2">Tulis Review</h2>
        <div class="muted">Login untuk memberi review dan rating.</div>
        <a class="btn btn-primary" href="#/account?next=${encodeURIComponent(`#/product/${productId}`)}">Login / Register</a>
      </div>
    `;
  }
  return `
    <form class="stack" data-form="review" data-id="${escapeHTML(productId)}">
      <h2 class="h2">Tulis Review</h2>
      <label class="stack" style="gap:6px">
        <span class="label">Rating</span>
        <select class="select" name="rating" required>
          ${[5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1]
            .map((v) => `<option value="${v}">${v.toFixed(1)}</option>`)
            .join("")}
        </select>
      </label>
      <label class="stack" style="gap:6px">
        <span class="label">Komentar</span>
        <textarea class="search" name="text" rows="4" placeholder="Ceritakan pengalaman kamu..." required style="padding:10px 12px;height:auto"></textarea>
      </label>
      <button class="btn btn-primary" type="submit">Kirim Review</button>
      <div class="muted tiny">Review disimpan di perangkat ini (demo).</div>
    </form>
  `;
};

const viewCart = () => {
  const items = cartStore.get();
  const enriched = items
    .map((it) => {
      const p = byId(it.productId);
      if (!p) return null;
      return { ...it, product: p, key: cartKey(it) };
    })
    .filter(Boolean);

  const subtotal = enriched.reduce((acc, it) => acc + it.product.price * it.qty, 0);

  return `
    <section class="section">
      <div class="container two-col">
        <div class="panel" data-animate>
          <div class="section-title">
            <h2 class="h2">Cart</h2>
            <span class="muted tiny">${enriched.length} item</span>
          </div>
          <div class="stack">
            ${
              enriched.length
                ? enriched
                    .map(
                      (it) => `
                        <div class="line-item">
                          <img src="${it.product.images[0]}" alt="${escapeHTML(it.product.name)}" loading="lazy" />
                          <div class="stack" style="gap:6px">
                            <div style="font-weight:800;letter-spacing:-0.02em">${escapeHTML(it.product.name)}</div>
                            <div class="muted tiny">${escapeHTML([it.model, it.color].filter(Boolean).join(" · ") || "-")}</div>
                            <div class="row" style="justify-content:space-between">
                              <div class="qty" data-qty="${escapeHTML(it.key)}">
                                <button type="button" data-action="qty-dec" data-key="${escapeHTML(it.key)}">−</button>
                                <input value="${it.qty}" inputmode="numeric" data-action="qty-input" data-key="${escapeHTML(it.key)}" aria-label="Qty" />
                                <button type="button" data-action="qty-inc" data-key="${escapeHTML(it.key)}">+</button>
                              </div>
                              <button class="pill" data-action="remove-cart" data-key="${escapeHTML(it.key)}">Remove</button>
                            </div>
                          </div>
                          <div class="price">${formatIDR(it.product.price * it.qty)}</div>
                        </div>
                      `
                    )
                    .join("")
                : `<div class="muted">Keranjang kamu masih kosong.</div>`
            }
          </div>
        </div>
        <div class="panel" data-animate>
          <div class="stack">
            <h2 class="h2">Ringkasan</h2>
            <div class="row" style="justify-content:space-between">
              <span class="muted">Subtotal</span>
              <strong>${formatIDR(subtotal)}</strong>
            </div>
            <div class="row" style="justify-content:space-between">
              <span class="muted">Biaya layanan</span>
              <strong>${formatIDR(subtotal ? 2000 : 0)}</strong>
            </div>
            <div class="divider"></div>
            <div class="row" style="justify-content:space-between">
              <span style="font-weight:900">Total</span>
              <span class="price" style="font-size:18px">${formatIDR(subtotal ? subtotal + 2000 : 0)}</span>
            </div>
            <button class="btn btn-primary" data-action="go-checkout" ${subtotal ? "" : "disabled"}>Checkout</button>
            <a class="btn btn-ghost" href="#/products">Tambah produk</a>
            <div class="muted tiny">Pembayaran: transfer bank, e-wallet (OVO/GoPay/DANA), COD.</div>
          </div>
        </div>
      </div>
    </section>
  `;
};

const viewWishlist = () => {
  const ids = wishlistStore.get();
  const list = ids.map(byId).filter(Boolean);
  return `
    <section class="section">
      <div class="container">
        <div class="section-title">
          <h2 class="h2">Wishlist</h2>
          <span class="muted tiny">${list.length} item</span>
        </div>
        <div class="grid grid-4">
          ${list.length ? list.map(productCard).join("") : `<div class="panel muted">Wishlist masih kosong.</div>`}
        </div>
      </div>
    </section>
  `;
};

const viewAccount = (qs) => {
  const user = getSessionUser();
  const next = qs.get("next") || "#/";
  if (user) {
    return `
      <section class="section">
        <div class="container two-col">
          <div class="panel" data-animate>
            <h2 class="h2">Akun</h2>
            <div class="divider"></div>
            <div class="stack">
              <div class="row" style="justify-content:space-between">
                <div class="stack" style="gap:4px">
                  <strong>${escapeHTML(user.name || user.email)}</strong>
                  <div class="muted tiny">${escapeHTML(user.email)}</div>
                </div>
                <span class="chip">Logged in</span>
              </div>
              <button class="btn btn-ghost" data-action="logout">Logout</button>
              <a class="btn btn-primary" href="#/checkout">Lanjut Checkout</a>
            </div>
          </div>
          <div class="panel" data-animate>
            <h2 class="h2">Riwayat Pesanan</h2>
            <div class="divider"></div>
            ${renderOrders(user.id)}
          </div>
        </div>
      </section>
    `;
  }
  return `
    <section class="section">
      <div class="container two-col">
        <div class="panel" data-animate>
          <h2 class="h2">Login</h2>
          <div class="divider"></div>
          <form class="stack" data-form="login" data-next="${escapeHTML(next)}">
            <input class="search" name="email" type="email" placeholder="Email" autocomplete="email" required />
            <input class="search" name="password" type="password" placeholder="Password" autocomplete="current-password" required />
            <button class="btn btn-primary" type="submit">Masuk</button>
            <div class="muted tiny">Demo: akun disimpan di perangkat ini (localStorage).</div>
          </form>
        </div>
        <div class="panel" data-animate>
          <h2 class="h2">Register</h2>
          <div class="divider"></div>
          <form class="stack" data-form="register" data-next="${escapeHTML(next)}">
            <input class="search" name="name" type="text" placeholder="Nama" autocomplete="name" required />
            <input class="search" name="email" type="email" placeholder="Email" autocomplete="email" required />
            <input class="search" name="password" type="password" placeholder="Password (min 6)" autocomplete="new-password" minlength="6" required />
            <button class="btn btn-primary" type="submit">Buat Akun</button>
            <div class="muted tiny">Akun ini khusus untuk demo.</div>
          </form>
        </div>
      </div>
    </section>
  `;
};

const renderOrders = (userId) => {
  const orders = orderStore.get().filter((o) => o.userId === userId).slice(0, 8);
  if (!orders.length) return `<div class="muted">Belum ada pesanan.</div>`;
  return `
    <div class="stack">
      ${orders
        .map(
          (o) => `
            <a class="card card-pad" href="#/order-success?id=${encodeURIComponent(o.id)}">
              <div class="row" style="justify-content:space-between">
                <strong>Order #${escapeHTML(o.id.split("-")[0].toUpperCase())}</strong>
                <span class="chip">${escapeHTML(o.payment?.label || "Pembayaran")}</span>
              </div>
              <div class="row" style="justify-content:space-between;margin-top:8px">
                <span class="muted tiny">${escapeHTML(new Date(o.createdAt).toLocaleString("id-ID"))}</span>
                <span class="price">${formatIDR(o.total)}</span>
              </div>
            </a>
          `
        )
        .join("")}
    </div>
  `;
};

const viewCheckout = () => {
  const items = cartStore.get();
  const user = getSessionUser();
  const enriched = items
    .map((it) => {
      const p = byId(it.productId);
      if (!p) return null;
      return { ...it, product: p, key: cartKey(it) };
    })
    .filter(Boolean);

  if (!enriched.length) {
    return `
      <section class="section">
        <div class="container">
          <div class="panel">
            <h2 class="h2">Checkout</h2>
            <div class="divider"></div>
            <div class="muted">Keranjang kosong. Tambahkan produk dulu.</div>
            <div class="row" style="margin-top:12px">
              <a class="btn btn-primary" href="#/products">Pilih produk</a>
              <a class="btn btn-ghost" href="#/">Home</a>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  const subtotal = enriched.reduce((acc, it) => acc + it.product.price * it.qty, 0);
  const service = 2000;
  const total = subtotal + service;

  return `
    <section class="section">
      <div class="container two-col">
        <div class="panel" data-animate>
          <h2 class="h2">Checkout</h2>
          <div class="muted tiny" style="margin-top:6px">Flow sederhana: data pembeli → pilih pembayaran → konfirmasi.</div>
          <div class="divider"></div>

          <form class="stack" data-form="checkout">
            <div class="stack" style="gap:8px">
              <div class="label">Data pembeli</div>
              <input class="search" name="name" placeholder="Nama penerima" value="${escapeHTML(user?.name || "")}" required />
              <input class="search" name="phone" placeholder="No. WhatsApp / HP" inputmode="tel" required />
              <input class="search" name="email" type="email" placeholder="Email" value="${escapeHTML(user?.email || "")}" required />
              <textarea class="search" name="address" rows="3" placeholder="Alamat (untuk aksesori / COD)" style="padding:10px 12px;height:auto"></textarea>
            </div>

            <div class="divider"></div>

            <div class="stack" style="gap:10px">
              <div class="label">Pembayaran</div>
              <div class="grid" style="grid-template-columns:1fr;gap:10px">
                ${PAYMENT_METHODS.map(
                  (m, idx) => `
                    <label class="card card-pad" style="display:grid;gap:10px;cursor:pointer">
                      <div class="row" style="justify-content:space-between">
                        <div class="stack" style="gap:2px">
                          <strong>${escapeHTML(m.name)}</strong>
                          <span class="muted tiny">${escapeHTML(m.desc)}</span>
                        </div>
                        <input type="radio" name="payment" value="${escapeHTML(m.id)}" ${idx === 0 ? "checked" : ""} />
                      </div>
                    </label>
                  `
                ).join("")}
              </div>

              <div class="panel" style="background:rgba(15,23,42,0.02);border-style:dashed" data-checkout="payment-detail"></div>
            </div>

            <button class="btn btn-primary" type="submit">Buat Pesanan</button>
            <div class="muted tiny">Ini demo UI: tidak melakukan integrasi pembayaran real.</div>
          </form>
        </div>

        <div class="panel" data-animate>
          <h2 class="h2">Ringkasan</h2>
          <div class="divider"></div>
          <div class="stack">
            ${enriched
              .slice(0, 6)
              .map(
                (it) => `
                  <div class="row" style="justify-content:space-between;gap:12px">
                    <div class="stack" style="gap:2px">
                      <strong style="letter-spacing:-0.02em">${escapeHTML(it.product.name)}</strong>
                      <span class="muted tiny">${escapeHTML([it.model, it.color].filter(Boolean).join(" · ") || "-")} · Qty ${it.qty}</span>
                    </div>
                    <span class="muted">${formatIDR(it.product.price * it.qty)}</span>
                  </div>
                `
              )
              .join("")}
            <div class="divider"></div>
            <div class="row" style="justify-content:space-between">
              <span class="muted">Subtotal</span>
              <strong>${formatIDR(subtotal)}</strong>
            </div>
            <div class="row" style="justify-content:space-between">
              <span class="muted">Biaya layanan</span>
              <strong>${formatIDR(service)}</strong>
            </div>
            <div class="divider"></div>
            <div class="row" style="justify-content:space-between">
              <span style="font-weight:900">Total</span>
              <span class="price" style="font-size:18px">${formatIDR(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
};

const paymentDetailHTML = (paymentId) => {
  if (paymentId === "bank") {
    return `
      <div class="stack">
        <div class="label">Pilih bank</div>
        <select class="select" name="bank" required>
          <option value="BCA">BCA</option>
          <option value="Mandiri">Mandiri</option>
          <option value="BRI">BRI</option>
          <option value="BNI">BNI</option>
        </select>
        <div class="muted tiny">Instruksi transfer akan muncul setelah pesanan dibuat.</div>
      </div>
    `;
  }
  if (paymentId === "ewallet") {
    return `
      <div class="stack">
        <div class="label">Pilih e-wallet</div>
        <select class="select" name="ewallet" required>
          <option value="OVO">OVO</option>
          <option value="GoPay">GoPay</option>
          <option value="DANA">DANA</option>
        </select>
        <div class="muted tiny">Demo: tampilkan instruksi pembayaran mirip marketplace.</div>
      </div>
    `;
  }
  if (paymentId === "cod") {
    return `
      <div class="stack">
        <div class="label">COD</div>
        <div class="muted tiny">COD hanya untuk kategori asesoris. Untuk pulsa & paket data, gunakan transfer / e-wallet.</div>
      </div>
    `;
  }
  return `<div class="muted tiny">Pilih metode pembayaran.</div>`;
};

const viewAbout = () => `
  <section class="section">
    <div class="container two-col">
      <div class="panel" data-animate>
        <h2 class="h2">About Us</h2>
        <div class="divider"></div>
        <div class="stack">
          <div class="muted">
            jualanku dibuat untuk belanja pulsa, kartu paket, dan asesoris HP dengan pengalaman yang fokus: cepat, rapi, dan jelas.
          </div>
          <div class="row">
            <span class="chip">${icon("check")} UI clean</span>
            <span class="chip">${icon("check")} Checkout singkat</span>
            <span class="chip">${icon("check")} Mobile optimized</span>
          </div>
        </div>
      </div>
      <div class="panel" data-animate>
        <h2 class="h2">Komitmen</h2>
        <div class="divider"></div>
        <div class="stack">
          <div class="muted">Keamanan dan kejelasan proses jadi prioritas. Demo ini meniru pola UI marketplace untuk memudahkan pengguna.</div>
          <a class="btn btn-primary" href="#/products">Mulai belanja</a>
        </div>
      </div>
    </div>
  </section>
`;

const viewContact = () => `
  <section class="section">
    <div class="container two-col">
      <div class="panel" data-animate>
        <h2 class="h2">Contact</h2>
        <div class="divider"></div>
        <form class="stack" data-form="contact">
          <input class="search" name="name" placeholder="Nama" required />
          <input class="search" name="email" type="email" placeholder="Email" required />
          <textarea class="search" name="message" rows="4" placeholder="Pesan" style="padding:10px 12px;height:auto" required></textarea>
          <button class="btn btn-primary" type="submit">Kirim</button>
          <div class="muted tiny">Form ini demo dan hanya menampilkan notifikasi.</div>
        </form>
      </div>
      <div class="panel" data-animate>
        <h2 class="h2">Info</h2>
        <div class="divider"></div>
        <div class="stack">
          <div class="muted">Jam operasional: 09.00–21.00</div>
          <div class="muted">Email: support@jualanku.demo</div>
          <div class="muted">WhatsApp: 08xx-xxxx-xxxx</div>
        </div>
      </div>
    </div>
  </section>
`;

const viewFAQ = () => `
  <section class="section">
    <div class="container">
      <div class="panel" data-animate>
        <h2 class="h2">FAQ</h2>
        <div class="divider"></div>
        <div class="stack">
          ${faqItem("Bagaimana cara beli pulsa/paket data?", "Pilih produk → pilih provider (model) → Add to cart → Checkout → pilih pembayaran.")}
          ${faqItem("Metode pembayaran apa saja?", "Transfer bank, e-wallet (OVO/GoPay/DANA), dan COD (khusus asesoris).")}
          ${faqItem("Apakah ini sudah terhubung ke pembayaran real?", "Belum. Ini demo UI/UX. Untuk produksi, perlu integrasi payment gateway.")}
          ${faqItem("Apakah data saya aman?", "Demo menyimpan data akun dan order di perangkat (localStorage). Untuk produksi, gunakan backend + enkripsi + audit keamanan.")}
        </div>
      </div>
    </div>
  </section>
`;

const faqItem = (q, a) => `
  <details class="card card-pad">
    <summary style="cursor:pointer;font-weight:900;letter-spacing:-0.02em">${escapeHTML(q)}</summary>
    <div class="muted" style="margin-top:10px">${escapeHTML(a)}</div>
  </details>
`;

const viewOrderSuccess = (qs) => {
  const id = qs.get("id") || "";
  const order = orderStore.get().find((o) => o.id === id) ?? null;
  if (!order) return notFound("Order tidak ditemukan.");
  return `
    <section class="section">
      <div class="container two-col">
        <div class="panel" data-animate>
          <div class="row" style="gap:10px;align-items:center">
            <span class="chip" style="background:rgba(114,209,255,0.18);border-color:rgba(114,209,255,0.45);color:var(--fg)">${icon("check")} Order dibuat</span>
            <span class="muted tiny">${escapeHTML(new Date(order.createdAt).toLocaleString("id-ID"))}</span>
          </div>
          <h2 class="hero-title" style="font-size:26px;margin:12px 0 0">Terima kasih!</h2>
          <div class="muted" style="margin-top:10px">Nomor pesanan: <strong>#${escapeHTML(order.id.split("-")[0].toUpperCase())}</strong></div>
          <div class="divider"></div>
          <div class="stack">
            <div class="label">Instruksi pembayaran</div>
            <div class="card card-pad">
              ${renderPaymentInstruction(order.payment)}
            </div>
            <a class="btn btn-primary" href="#/products">Belanja lagi</a>
            <a class="btn btn-ghost" href="#/account">Lihat akun</a>
          </div>
        </div>
        <div class="panel" data-animate>
          <h2 class="h2">Ringkasan</h2>
          <div class="divider"></div>
          <div class="stack">
            ${(order.items ?? [])
              .map((it) => {
                const p = byId(it.productId);
                if (!p) return "";
                return `
                  <div class="row" style="justify-content:space-between">
                    <div class="stack" style="gap:2px">
                      <strong>${escapeHTML(p.name)}</strong>
                      <span class="muted tiny">${escapeHTML([it.model, it.color].filter(Boolean).join(" · ") || "-")} · Qty ${it.qty}</span>
                    </div>
                    <span class="muted">${formatIDR(p.price * it.qty)}</span>
                  </div>
                `;
              })
              .join("")}
            <div class="divider"></div>
            <div class="row" style="justify-content:space-between">
              <span style="font-weight:900">Total</span>
              <span class="price" style="font-size:18px">${formatIDR(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
};

const renderPaymentInstruction = (payment) => {
  if (!payment) return `<div class="muted">Pilih metode pembayaran di checkout.</div>`;
  if (payment.id === "bank")
    return `
      <div class="stack" style="gap:8px">
        <strong>Transfer Bank ${escapeHTML(payment.bank)}</strong>
        <div class="muted tiny">Virtual Account (demo): <strong>1234-5678-9012</strong></div>
        <div class="muted tiny">Nama penerima: <strong>Jualanku Store</strong></div>
        <div class="muted tiny">Setelah transfer, pesanan akan diproses otomatis.</div>
      </div>
    `;
  if (payment.id === "ewallet")
    return `
      <div class="stack" style="gap:8px">
        <strong>E-Wallet ${escapeHTML(payment.ewallet)}</strong>
        <div class="muted tiny">Buka aplikasi ${escapeHTML(payment.ewallet)} → Scan kode (demo) → Konfirmasi pembayaran.</div>
        <div class="muted tiny">Status pesanan akan update otomatis.</div>
      </div>
    `;
  if (payment.id === "cod")
    return `
      <div class="stack" style="gap:8px">
        <strong>COD</strong>
        <div class="muted tiny">Siapkan uang pas saat kurir mengantar barang.</div>
      </div>
    `;
  return `<div class="muted">Metode tidak dikenali.</div>`;
};

const notFound = (message) => `
  <section class="section">
    <div class="container">
      <div class="panel">
        <h2 class="h2">Oops</h2>
        <div class="divider"></div>
        <div class="muted">${escapeHTML(message)}</div>
        <div class="row" style="margin-top:12px">
          <a class="btn btn-primary" href="#/">Home</a>
          <a class="btn btn-ghost" href="#/products">Produk</a>
        </div>
      </div>
    </div>
  </section>
`;

const selectedKey = (productId) => `jualanku_variant_${productId}`;
const getSelectedVariant = (productId, variants) => {
  const def = {
    model: (variants?.models ?? [])[0] ?? "",
    color: (variants?.colors ?? [])[0] ?? "",
    imageIdx: 0,
  };
  try {
    const raw = sessionStorage.getItem(selectedKey(productId));
    if (!raw) return def;
    const parsed = JSON.parse(raw);
    return { ...def, ...parsed };
  } catch {
    return def;
  }
};

const setSelectedVariant = (productId, next) => {
  const prev = getSelectedVariant(productId, byId(productId)?.variants);
  sessionStorage.setItem(selectedKey(productId), JSON.stringify({ ...prev, ...next }));
};

const getMergedReviews = (productId, seedCount = 0) => {
  const local = reviewStore.getByProduct(productId);
  const seeded = seedReviews(productId, seedCount);
  const merged = [...local, ...seeded].slice(0, 30);
  return merged;
};

const seedReviews = (productId, count) => {
  const base = [
    { name: "Rina", rating: 5, text: "Proses cepat, tampilannya rapi dan jelas.", at: "2026-05-20T09:22:00.000Z" },
    { name: "Dito", rating: 4.5, text: "Checkout simpel. Harga transparan.", at: "2026-05-28T11:10:00.000Z" },
    { name: "Anya", rating: 4.8, text: "Asesorisnya bagus, packing rapi.", at: "2026-06-01T07:35:00.000Z" },
  ];
  const n = Math.min(3, Math.max(0, Math.floor(count / 100)));
  return base.slice(0, n).map((r) => ({ ...r, productId }));
};

const ratingFromReviews = (fallbackAvg, reviews) => {
  if (!reviews.length) return { avg: fallbackAvg, count: 0 };
  const avg = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0) / reviews.length;
  return { avg, count: reviews.length };
};

const render = () => {
  const { path, seg, qs } = getRoute();
  let content = "";

  if (path === "/" || seg.length === 0) content = viewHome();
  else if (seg[0] === "products") content = viewProducts(qs);
  else if (seg[0] === "product" && seg[1]) content = viewProduct(decodeURIComponent(seg[1]));
  else if (seg[0] === "cart") content = viewCart();
  else if (seg[0] === "wishlist") content = viewWishlist();
  else if (seg[0] === "account") content = viewAccount(qs);
  else if (seg[0] === "checkout") content = viewCheckout();
  else if (seg[0] === "about") content = viewAbout();
  else if (seg[0] === "contact") content = viewContact();
  else if (seg[0] === "faq") content = viewFAQ();
  else if (seg[0] === "order-success") content = viewOrderSuccess(qs);
  else content = notFound("Halaman tidak ditemukan.");

  layout(path, content);
  bindGlobal();
  mountAutoAnimate(document);
  afterRender();
};

const bindGlobal = () => {
  const app = document.getElementById("app");
  app.querySelectorAll("[data-nav]").forEach((btn) => {
    btn.addEventListener("click", () => navTo(btn.getAttribute("data-nav")));
  });

  app.addEventListener("click", (e) => {
    const t = e.target instanceof Element ? e.target.closest("[data-action]") : null;
    if (!t) return;
    const action = t.getAttribute("data-action");
    if (action === "wishlist") {
      const id = t.getAttribute("data-id");
      if (!id) return;
      toggleWishlist(id);
      toast("Wishlist diperbarui.");
      render();
      return;
    }
    if (action === "quick-add") {
      const id = t.getAttribute("data-id");
      if (!id) return;
      const p = byId(id);
      if (!p) return;
      const selected = getSelectedVariant(id, p.variants);
      setCartItem({ productId: id, qty: 1, model: selected.model, color: selected.color });
      toast("Ditambahkan ke cart.");
      render();
      return;
    }
    if (action === "add-to-cart") {
      const id = t.getAttribute("data-id");
      if (!id) return;
      const p = byId(id);
      if (!p) return;
      const selected = getSelectedVariant(id, p.variants);
      setCartItem({ productId: id, qty: 1, model: selected.model, color: selected.color });
      toast("Ditambahkan ke cart.");
      render();
      return;
    }
    if (action === "go-checkout") {
      navTo("#/checkout");
      return;
    }
    if (action === "remove-cart") {
      const key = t.getAttribute("data-key");
      if (!key) return;
      removeCartItem(key);
      toast("Item dihapus.");
      render();
      return;
    }
    if (action === "qty-inc" || action === "qty-dec") {
      const key = t.getAttribute("data-key");
      if (!key) return;
      const items = cartStore.get();
      const idx = items.findIndex((it) => cartKey(it) === key);
      if (idx < 0) return;
      const delta = action === "qty-inc" ? 1 : -1;
      const nextQty = Math.max(1, Number(items[idx].qty ?? 1) + delta);
      items[idx] = { ...items[idx], qty: nextQty };
      cartStore.set(items);
      render();
      return;
    }
    if (action === "reset-filters") {
      setQuery({});
      return;
    }
    if (action === "logout") {
      userStore.logout();
      toast("Logout berhasil.");
      render();
      return;
    }
    if (action === "img") {
      const id = t.getAttribute("data-id");
      const idx = Number(t.getAttribute("data-idx") || 0);
      if (!id) return;
      setSelectedVariant(id, { imageIdx: idx });
      render();
      return;
    }
  });

  app.addEventListener("input", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    if (target.matches("[data-action='qty-input']")) {
      const key = target.getAttribute("data-key");
      if (!key) return;
      const items = cartStore.get();
      const idx = items.findIndex((it) => cartKey(it) === key);
      if (idx < 0) return;
      const nextQty = Math.max(1, Number(target.value || "1"));
      items[idx] = { ...items[idx], qty: nextQty };
      cartStore.set(items);
      render();
      return;
    }

    if (target.matches("[data-input]")) {
      const { qs } = getRoute();
      const next = new URLSearchParams(qs);
      const k = target.getAttribute("data-input");
      const v = target.value.trim();
      if (v) next.set(k, v);
      else next.delete(k);
      setQuery(Object.fromEntries(next.entries()));
    }
  });

  app.addEventListener("submit", (e) => {
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) return;
    const kind = form.getAttribute("data-form");
    if (!kind) return;
    e.preventDefault();

    if (kind === "login") {
      const fd = new FormData(form);
      const email = String(fd.get("email") || "").trim().toLowerCase();
      const password = String(fd.get("password") || "");
      const user = userStore.getUsers().find((u) => u.email.toLowerCase() === email && u.password === password);
      if (!user) {
        toast("Email atau password salah.");
        return;
      }
      userStore.setSession({ userId: user.id, at: nowISO() });
      toast("Login berhasil.");
      navTo(form.getAttribute("data-next") || "#/");
      return;
    }

    if (kind === "register") {
      const fd = new FormData(form);
      const name = String(fd.get("name") || "").trim();
      const email = String(fd.get("email") || "").trim().toLowerCase();
      const password = String(fd.get("password") || "");
      if (password.length < 6) {
        toast("Password minimal 6 karakter.");
        return;
      }
      const users = userStore.getUsers();
      if (users.some((u) => u.email.toLowerCase() === email)) {
        toast("Email sudah terdaftar.");
        return;
      }
      const user = { id: uid(), name, email, password, createdAt: nowISO() };
      userStore.setUsers([user, ...users]);
      userStore.setSession({ userId: user.id, at: nowISO() });
      toast("Akun dibuat. Kamu sudah login.");
      navTo(form.getAttribute("data-next") || "#/");
      return;
    }

    if (kind === "checkout") {
      const fd = new FormData(form);
      const name = String(fd.get("name") || "").trim();
      const phone = String(fd.get("phone") || "").trim();
      const email = String(fd.get("email") || "").trim().toLowerCase();
      const address = String(fd.get("address") || "").trim();
      const payment = String(fd.get("payment") || "bank");

      const items = cartStore.get();
      const enriched = items
        .map((it) => {
          const p = byId(it.productId);
          if (!p) return null;
          return { ...it, product: p };
        })
        .filter(Boolean);
      const hasPhysical = enriched.some((it) => it.product.categoryId === "asesoris");
      if (!hasPhysical && payment === "cod") {
        toast("COD hanya untuk asesoris. Silakan pilih metode lain.");
        return;
      }

      const subtotal = enriched.reduce((acc, it) => acc + it.product.price * it.qty, 0);
      const service = 2000;
      const total = subtotal + service;

      const paymentPayload =
        payment === "bank"
          ? { id: "bank", label: "Transfer Bank", bank: String(fd.get("bank") || "BCA") }
          : payment === "ewallet"
            ? { id: "ewallet", label: "E-Wallet", ewallet: String(fd.get("ewallet") || "OVO") }
            : { id: "cod", label: "COD" };

      const user = getSessionUser();
      const order = {
        id: uid(),
        createdAt: nowISO(),
        userId: user?.id ?? null,
        contact: { name, phone, email, address },
        items: items.map((it) => ({ productId: it.productId, qty: it.qty, model: it.model, color: it.color })),
        subtotal,
        service,
        total,
        payment: paymentPayload,
        status: "created",
      };
      orderStore.set([order, ...orderStore.get()]);
      cartStore.clear();
      toast("Pesanan dibuat.");
      navTo(`#/order-success?id=${encodeURIComponent(order.id)}`);
      return;
    }

    if (kind === "review") {
      const productId = form.getAttribute("data-id");
      if (!productId) return;
      const user = getSessionUser();
      if (!user) {
        toast("Login dulu untuk review.");
        return;
      }
      const fd = new FormData(form);
      const rating = Number(fd.get("rating") || 5);
      const text = String(fd.get("text") || "").trim();
      const p = byId(productId);
      const selected = p ? getSelectedVariant(p.id, p.variants) : { model: "", color: "" };
      if (!text) {
        toast("Tulis komentar dulu.");
        return;
      }
      reviewStore.add(productId, {
        id: uid(),
        name: user.name || user.email,
        rating,
        text,
        at: nowISO(),
        model: selected.model,
        color: selected.color,
      });
      toast("Review terkirim.");
      render();
      return;
    }

    if (kind === "contact") {
      toast("Pesan terkirim (demo).");
      form.reset();
      return;
    }
  });
};

const afterRender = () => {
  const { seg } = getRoute();
  if (seg[0] === "checkout") {
    const form = document.querySelector("form[data-form='checkout']");
    if (!(form instanceof HTMLFormElement)) return;
    const detail = form.querySelector("[data-checkout='payment-detail']");
    const update = () => {
      const payment = String(new FormData(form).get("payment") || "bank");
      detail.innerHTML = paymentDetailHTML(payment);
    };
    form.addEventListener("change", update);
    update();
  }

  if (seg[0] === "product" && seg[1]) {
    document.querySelectorAll("[data-variant]").forEach((wrap) => {
      wrap.addEventListener("click", (e) => {
        const btn = e.target instanceof Element ? e.target.closest("button[data-value]") : null;
        if (!btn) return;
        const variant = wrap.getAttribute("data-variant");
        const id = wrap.getAttribute("data-id");
        const value = btn.getAttribute("data-value");
        if (!variant || !id || !value) return;
        setSelectedVariant(id, { [variant]: value });
        render();
      });
    });
  }
};

window.addEventListener("hashchange", render);
window.addEventListener("storage", render);

if (!location.hash) location.hash = "#/";
render();
