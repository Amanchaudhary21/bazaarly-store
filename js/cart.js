/* ==================================================================
   cart.js - Cart, coupon box and wish list.
   (file 7 of 10; the load order is at the bottom of index.html)
   ================================================================== */

/* ---------- Cart, order summary, wish list ---------- */
const focusFirst = (...sels) => { for (const s of sels) { const el = $(s); if (el && !el.disabled) { el.focus({ preventScroll: true }); return; } } };
const shipText = t => (t.ship === 0 ? "FREE" : money(t.ship));
const SANS = "font-family:var(--font-body)";

/* The receipt-style box used on the cart page and on the checkout page. */
function summaryInner(mode) {
  const t = totals(), cp = state.coupon && COUPONS[state.coupon];
  const free = t.sub >= FREE_SHIP_MIN || (cp && cp.kind === "ship");
  const pct = Math.min(100, Math.round(t.sub / FREE_SHIP_MIN * 100));
  const prog = state.ship !== "std" ? ""
    : free ? `<div class="stack" style="gap:6px"><span class="ship" style="${SANS}">Your order gets free delivery</span><div class="progress"><i style="width:100%"></i></div></div>`
    : `<div class="stack" style="gap:6px"><span style="${SANS};font-size:.88rem">Add <b>${money(t.toFree)}</b> more to get free delivery</span><div class="progress" role="progressbar" aria-label="Progress to free delivery" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><i style="width:${pct}%"></i></div></div>`;
  const coupon = state.coupon && cp
    ? `<div class="r"><span>Coupon <b>${esc(state.coupon)}</b></span>${mode === "cart" ? `<button class="link" type="button" id="couponRm" data-act="nocoupon">Remove</button>` : ""}</div><div class="muted" style="${SANS};font-size:.82rem">${esc(cp.label)}</div>`
    : mode === "cart" ? `<form class="coupon" id="couponForm" novalidate><label class="sr" for="couponIn">Coupon code</label><input id="couponIn" type="text" placeholder="Coupon code" autocomplete="off" aria-describedby="couponMsg"><button class="btn small" type="submit">Apply</button></form><div id="couponMsg" role="alert" style="${SANS};font-size:.85rem;color:var(--bad)"></div>` : "";
  const cta = mode === "cart"
    ? `<a class="btn primary block" href="#/checkout">Go to checkout</a>`
    : `<button class="btn primary block" type="submit" form="coForm">Place demo order</button>`;
  return `<h2>Order summary</h2>${prog}${coupon}
    <div class="r"><span>Items (${t.count})</span><span>${money(t.sub)}</span></div>
    ${t.off ? `<div class="r"><span>Discount</span><span>-${money(t.off)}</span></div>` : ""}
    <div class="r"><span>${state.ship === "exp" ? "Express delivery" : "Delivery"}</span><span>${shipText(t)}</span></div>
    <div class="r total"><span>Total</span><span>${money(t.total)}</span></div>
    ${cta}
    <p class="note" style="${SANS};font-size:.82rem">Demo store: no payment is taken and nothing ships.</p>`;
}

function cartLine(l) {
  const p = l.p, col = p.colors[l.v % p.colors.length], key = `data-id="${p.id}" data-v="${l.v}"`;
  return `<div class="line">
    <a class="line-art" href="#/p/${p.id}" tabindex="-1" aria-hidden="true">${art(p, l.v)}</a>
    <div class="line-info">
      <a href="#/p/${p.id}">${esc(p.title)}</a>
      ${p.colors.length > 1 ? `<span class="muted">Colour: ${esc(col.name)}</span>` : ""}
      ${p.stock <= 5 ? `<span class="stock-low">Only ${p.stock} left in stock</span>` : `<span class="stock-ok">In stock</span>`}
      <div class="row">
        <div class="qty"><button type="button" data-act="cqty" ${key} data-d="-1" aria-label="Decrease quantity of ${esc(p.title)}" ${l.q <= 1 ? "disabled" : ""}>-</button><output aria-label="Quantity">${l.q}</output><button type="button" data-act="cqty" ${key} data-d="1" aria-label="Increase quantity of ${esc(p.title)}" ${l.q >= maxQty(p) ? "disabled" : ""}>+</button></div>
        <button class="link" type="button" data-act="cremove" ${key}>Remove</button>
        <button class="link" type="button" data-act="csave" ${key}>Move to wish list</button>
      </div>
    </div>
    <div class="line-total">${money(p.price * l.q)}${l.q > 1 ? `<div class="muted" style="${SANS};font-weight:400;font-size:.8rem">${money(p.price)} each</div>` : ""}</div>
  </div>`;
}

VIEWS.cart = () => {
  const t = totals();
  if (!t.items.length) return { html: `<h1 class="sr" id="cartTitle" tabindex="-1">Your cart</h1>${emptyState("Your cart is empty", "Add something you like and it will wait for you here.", "#/", "Start shopping")}` };
  return {
    html: `<div class="sec-head" style="margin-top:0"><h1 id="cartTitle" tabindex="-1">Your cart <span class="muted" style="font-size:1rem;font-weight:600">(${t.count} item${t.count === 1 ? "" : "s"})</span></h1><a class="link" href="#/">Continue shopping</a></div>
    <div class="cart-layout">
      <section class="panel" aria-label="Items in your cart">${t.items.map(cartLine).join("")}</section>
      <aside class="receipt" id="sumBox" aria-label="Order summary">${summaryInner("cart")}</aside>
    </div>`
  };
};

ACT.cqty = el => {
  const id = Number(el.dataset.id), v = Number(el.dataset.v), d = Number(el.dataset.d);
  const line = state.cart.find(l => l.id === id && l.v === v);
  if (!line) return;
  cartSet(id, v, line.q + d);
  rerender();
  const base = `[data-act="cqty"][data-id="${id}"][data-v="${v}"]`;
  focusFirst(`${base}[data-d="${d}"]`, `${base}[data-d="${-d}"]`, "#cartTitle");
};
ACT.cremove = el => {
  cartSet(Number(el.dataset.id), Number(el.dataset.v), 0);
  rerender(); focusFirst("#cartTitle", "#main");
  toast("Removed from your cart");
};
ACT.csave = el => {
  const id = Number(el.dataset.id);
  cartSet(id, Number(el.dataset.v), 0);
  if (!state.wish.includes(id)) toggleWish(id);
  rerender(); focusFirst("#cartTitle", "#main");
  toast("Moved to your wish list", { href: "#/wishlist", label: "View" });
};
FORM.couponForm = () => {
  const input = $("#couponIn"), msg = $("#couponMsg"), code = input.value.trim().toUpperCase();
  if (!code) { msg.textContent = "Type a coupon code first."; input.focus(); return; }
  if (!COUPONS[code]) { msg.textContent = `"${code}" is not a valid code. Try WELCOME10 or FREESHIP.`; input.focus(); return; }
  state.coupon = code; save("coupon");
  $("#sumBox").innerHTML = summaryInner("cart");
  focusFirst("#couponRm");
  toast(`Coupon ${code} applied`);
};
ACT.nocoupon = () => {
  state.coupon = null; save("coupon");
  $("#sumBox").innerHTML = summaryInner("cart");
  focusFirst("#couponIn");
};

/* ---------- Wish list ---------- */
VIEWS.wishlist = () => {
  const items = state.wish.map(id => PM.get(id)).filter(Boolean);
  if (!items.length) return { html: `<h1 class="sr" id="wishTitle" tabindex="-1">Your wish list</h1>${emptyState("Your wish list is empty", "Tap the heart on any product to save it here for later.", "#/", "Browse products")}` };
  const inStock = items.filter(p => p.stock > 0).length;
  return {
    html: `<div class="sec-head" style="margin-top:0"><h1 id="wishTitle" tabindex="-1">Your wish list <span class="muted" style="font-size:1rem;font-weight:600">(${items.length})</span></h1>
      <div class="row">${inStock ? `<button class="btn brand small" type="button" data-act="wishall">Add all in-stock items to cart</button>` : ""}<button class="btn small" type="button" data-act="wishclear">Clear wish list</button></div></div>
      <div class="grid">${items.map(card).join("")}</div>`
  };
};
ACT.wishall = () => {
  let n = 0;
  state.wish.map(id => PM.get(id)).filter(p => p && p.stock > 0).forEach(p => { if (cartAdd(p.id, 0, 1)) n++; });
  toast(n ? `Added ${n} item${n === 1 ? "" : "s"} to your cart` : "Nothing in stock to add", n ? { href: "#/cart", label: "View cart" } : null);
};
ACT.wishclear = () => {
  state.wish = []; save("wish"); updateCounts();
  rerender(); focusFirst("#wishTitle", "#main");
  toast("Wish list cleared");
};
