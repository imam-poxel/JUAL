const KEY = {
  cart: "jualanku_cart_v1",
  wishlist: "jualanku_wishlist_v1",
  users: "jualanku_users_v1",
  session: "jualanku_session_v1",
  orders: "jualanku_orders_v1",
  reviews: "jualanku_reviews_v1",
};

const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const writeJSON = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const cartStore = {
  get() {
    return readJSON(KEY.cart, []);
  },
  set(items) {
    writeJSON(KEY.cart, items);
  },
  clear() {
    writeJSON(KEY.cart, []);
  },
};

export const wishlistStore = {
  get() {
    return readJSON(KEY.wishlist, []);
  },
  set(ids) {
    writeJSON(KEY.wishlist, ids);
  },
};

export const userStore = {
  getUsers() {
    return readJSON(KEY.users, []);
  },
  setUsers(users) {
    writeJSON(KEY.users, users);
  },
  getSession() {
    return readJSON(KEY.session, null);
  },
  setSession(session) {
    writeJSON(KEY.session, session);
  },
  logout() {
    writeJSON(KEY.session, null);
  },
};

export const orderStore = {
  get() {
    return readJSON(KEY.orders, []);
  },
  set(orders) {
    writeJSON(KEY.orders, orders);
  },
};

export const reviewStore = {
  getAll() {
    return readJSON(KEY.reviews, {});
  },
  setAll(map) {
    writeJSON(KEY.reviews, map);
  },
  getByProduct(productId) {
    const map = readJSON(KEY.reviews, {});
    return map[productId] ?? [];
  },
  add(productId, review) {
    const map = readJSON(KEY.reviews, {});
    const list = Array.isArray(map[productId]) ? map[productId] : [];
    map[productId] = [review, ...list].slice(0, 50);
    writeJSON(KEY.reviews, map);
  },
};
