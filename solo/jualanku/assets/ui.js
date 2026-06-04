export const formatIDR = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export const el = (html) => {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
};

export const escapeHTML = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export const icon = (name) => {
  const common = `width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"`;
  if (name === "search")
    return `<svg ${common}><path d="M21 21l-4.3-4.3m1.3-5.2a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
  if (name === "heart")
    return `<svg ${common}><path d="M12 21s-7-4.6-9.2-8.7C1 9 3 6 6.5 6c1.8 0 3.2.9 3.9 2c.7-1.1 2.1-2 3.9-2C18 6 20 9 21.2 12.3 19 16.4 12 21 12 21z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`;
  if (name === "cart")
    return `<svg ${common}><path d="M7 6h15l-2 9H8L7 6z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M7 6L6 3H2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M9 21a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z" stroke="currentColor" stroke-width="2"/></svg>`;
  if (name === "user")
    return `<svg ${common}><path d="M20 21a8 8 0 10-16 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 13a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" stroke-width="2"/></svg>`;
  if (name === "star")
    return `<svg ${common}><path d="M12 17.3l-5.1 2.8 1-5.7L3.7 9.9l5.8-.8L12 4l2.5 5.1 5.8.8-4.2 4.5 1 5.7L12 17.3z" fill="currentColor"/></svg>`;
  if (name === "check")
    return `<svg ${common}><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  return "";
};

export const toast = (() => {
  let host = null;
  const ensure = () => {
    if (host) return host;
    host = document.createElement("div");
    host.className = "toast-host";
    document.body.appendChild(host);
    return host;
  };
  return (message) => {
    const h = ensure();
    const node = el(`<div class="toast" role="status"><span>${escapeHTML(message)}</span><button class="btn btn-ghost" style="height:34px;padding:0 12px">OK</button></div>`);
    const close = () => {
      node.remove();
    };
    node.querySelector("button")?.addEventListener("click", close);
    h.appendChild(node);
    setTimeout(close, 2400);
  };
})();

export const mountAutoAnimate = (root = document) => {
  const nodes = Array.from(root.querySelectorAll("[data-animate]"));
  if (!nodes.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12 }
  );
  for (const n of nodes) io.observe(n);
};
