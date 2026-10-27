/* ==================================================================
   checkout.js - Checkout form, order confirmation and the Orders page.
   (file 9 of 12; the load order is at the bottom of index.html)
   ================================================================== */

/* ---------- Checkout, confirmation, orders ---------- */
const CO = { name: "", email: "", street: "", city: "", region: "", zip: "", country: "United States" };
const COUNTRIES = ["United States", "Canada", "United Kingdom", "Australia", "Japan", "India", "Bangladesh"];
const RULES = {
  name: v => v.length >= 2 || "Enter your full name.",
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || "Enter an email like name@example.com.",
  street: v => v.length >= 4 || "Enter a street address.",
  city: v => v.length >= 2 || "Enter a city.",
  region: v => v.length >= 2 || "Enter a state or region.",
  zip: v => /^[A-Za-z0-9][A-Za-z0-9 -]{2,9}$/.test(v) || "Enter a postal code (3 to 10 letters or numbers).",
  country: v => !!v || "Choose a country."
};
const dateFmt = d => new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" }).format(new Date(d));
const H2S = "font-size:1.15rem";

function field(id, label, wide, attrs = 'type="text"') {
  return `<div class="field${wide ? " wide" : ""}"><label for="co_${id}">${label}</label><input id="co_${id}" name="${id}" value="${esc(CO[id])}" autocomplete="off" aria-describedby="err_${id}" ${attrs}><div class="err" id="err_${id}"></div></div>`;
}
function countryField() {
  return `<div class="field"><label for="co_country">Country</label><select id="co_country" name="country" aria-describedby="err_country">${COUNTRIES.map(c => `<option${c === CO.country ? " selected" : ""}>${c}</option>`).join("")}</select><div class="err" id="err_country"></div></div>`;
}
function speedOpts() {
  const t = totals(), cp = state.coupon && COUPONS[state.coupon];
  const stdFree = t.sub >= FREE_SHIP_MIN || (cp && cp.kind === "ship");
  return [["std", "Standard delivery", deliveryRange(false), stdFree ? "FREE" : money(SHIP_STD)], ["exp", "Express delivery", deliveryRange(true), money(SHIP_EXP)]]
    .map(([k, name, eta, price]) => `<label class="opt"><input type="radio" id="speed-${k}" name="speed" value="${k}" data-chg="ship" ${state.ship === k ? "checked" : ""}><span class="grow"><b>${name}</b><br><span class="muted">Arrives ${eta}</span></span><b class="mono">${price}</b></label>`).join("");
}
function miniLine(l) {
  const p = l.p, col = p.colors[l.v % p.colors.length];
  return `<div class="line">${art(p, l.v)}<div class="line-info"><a href="#/p/${p.id}">${esc(p.title)}</a><span class="muted">${p.colors.length > 1 ? esc(col.name) + " · " : ""}Qty ${l.q}</span></div><div class="line-total">${money(p.price * l.q)}</div></div>`;
}

VIEWS.checkout = () => {
  const t = totals();
  if (!t.items.length) return { html: `<h1 class="sr" id="coTitle" tabindex="-1">Checkout</h1>${emptyState("Nothing to check out", "Your cart is empty. Add a few things first.", "#/", "Start shopping")}` };
  return {
    html: `<div class="sec-head" style="margin-top:0"><h1 id="coTitle" tabindex="-1">Checkout</h1><a class="link" href="#/cart">Back to cart</a></div>
    <div class="cart-layout">
      <form id="coForm" novalidate>
        <section class="panel stack" aria-labelledby="h-addr"><h2 id="h-addr" style="${H2S}">1. Delivery address</h2>
          <p class="note">Demo only. Please use made-up details. Nothing is sent anywhere.</p>
          <div class="form-grid">${field("name", "Full name", true)}${field("email", "Email", true, 'type="email" inputmode="email"')}${field("street", "Street address", true)}${field("city", "City")}${field("region", "State or region")}${field("zip", "Postal code")}${countryField()}</div></section>
        <section class="panel" role="radiogroup" aria-labelledby="h-speed"><h2 id="h-speed" style="${H2S};margin-bottom:10px">2. Delivery speed</h2><div id="speedBox">${speedOpts()}</div></section>
        <section class="panel stack" aria-labelledby="h-pay"><h2 id="h-pay" style="${H2S}">3. Payment</h2>
          <p class="note"><b>Demo mode.</b> This practice store has no payment step and asks for no card details. Placing the order only saves a sample order in this browser.</p></section>
        <section class="panel" aria-labelledby="h-items"><h2 id="h-items" style="${H2S}">4. Review items</h2>${t.items.map(miniLine).join("")}</section>
      </form>
      <aside class="receipt" id="sumBox" aria-label="Order summary">${summaryInner("checkout")}</aside>
    </div>`
  };
};
CHG.ship = el => {
  state.ship = el.value === "exp" ? "exp" : "std"; save("ship");
  $("#sumBox").innerHTML = summaryInner("checkout");
};
FORM.coForm = () => {
  let first = null;
  Object.keys(RULES).forEach(k => {
    const el = $("#co_" + k), v = el.value.trim(), r = RULES[k](v), ok = r === true;
    CO[k] = v;
    el.closest(".field").classList.toggle("bad", !ok);
    el.setAttribute("aria-invalid", String(!ok));
    $("#err_" + k).textContent = ok ? "" : r;
    if (!ok && !first) first = el;
  });
  if (first) { first.focus(); toast("Please fix the highlighted fields."); return; }
  const t = totals();
  if (!t.items.length) { go("/cart"); return; }
  let id;
  do { id = "BZ-" + (Math.floor(Math.random() * 900000) + 100000); } while (state.orders.some(o => o.id === id));
  state.orders.unshift({
    id, date: new Date().toISOString(),
    items: t.items.map(l => ({ id: l.id, v: l.v, q: l.q, price: l.p.price })),
    sub: t.sub, off: t.off, ship: t.ship, total: t.total, coupon: state.coupon || "",
    speed: state.ship, eta: deliveryRange(state.ship === "exp"),
    to: { name: CO.name, place: `${CO.city}, ${CO.country}` }
  });
  state.orders = state.orders.slice(0, 30);
  state.cart = []; state.coupon = null;
  ["orders", "cart", "coupon"].forEach(save);
  updateCounts();
  Object.assign(CO, { name: "", email: "", street: "", city: "", region: "", zip: "" });
  go("/done/" + id);
};

VIEWS.done = r => {
  const o = state.orders.find(x => x.id === r.id);
  if (!o) return notFound();
  const first = (o.to.name || "").split(" ")[0];
  return {
    html: `<div class="done">
      <div class="tick"><svg aria-hidden="true" style="fill:none"><use href="#i-check"/></svg></div>
      <h1 id="doneTitle" tabindex="-1">Thank you${first ? ", " + esc(first) : ""}! Your demo order is placed.</h1>
      <p>Order number <b class="mono">${esc(o.id)}</b></p>
      <p>Pretend delivery: <b>${esc(o.eta)}</b> to ${esc(o.to.place)}</p>
      <p class="note" style="max-width:520px">This is a practice order. No payment was taken, nothing will ship and no email was sent.</p>
      <div class="row" style="justify-content:center"><a class="btn primary" href="#/orders">View your orders</a><a class="btn" href="#/">Keep shopping</a></div>
    </div>
    <section class="panel" style="max-width:680px;margin:8px auto 0" aria-label="Order details">
      ${o.items.map(it => orderLine(it, false)).join("")}
      <div class="receipt" style="position:relative;top:0;border:0;padding:12px 0 0">
        <div class="r"><span>Items</span><span>${money(o.sub)}</span></div>
        ${o.off ? `<div class="r"><span>Discount (${esc(o.coupon)})</span><span>-${money(o.off)}</span></div>` : ""}
        <div class="r"><span>Delivery</span><span>${o.ship ? money(o.ship) : "FREE"}</span></div>
        <div class="r total"><span>Total</span><span>${money(o.total)}</span></div>
      </div>
    </section>`
  };
};

function orderLine(it, again) {
  const p = PM.get(it.id);
  if (!p) return "";
  const col = p.colors[it.v % p.colors.length];
  return `<div class="line">${art(p, it.v)}<div class="line-info"><a href="#/p/${p.id}">${esc(p.title)}</a><span class="muted">${p.colors.length > 1 ? esc(col.name) + " · " : ""}Qty ${it.q}</span>${again ? `<div><button class="btn small" type="button" data-act="again" data-id="${p.id}" data-v="${it.v}" ${p.stock < 1 ? "disabled" : ""}>${p.stock < 1 ? "Unavailable" : "Buy it again"}</button></div>` : ""}</div><div class="line-total">${money(it.price * it.q)}</div></div>`;
}
VIEWS.orders = () => {
  if (!state.orders.length) return { html: `<h1 class="sr" id="ordTitle" tabindex="-1">Your orders</h1>${emptyState("No orders yet", "Orders you place in this demo show up here.", "#/", "Start shopping")}` };
  return {
    html: `<div class="sec-head" style="margin-top:0"><h1 id="ordTitle" tabindex="-1">Your orders</h1><button class="btn small" type="button" data-act="clearorders">Clear demo orders</button></div>
    <div class="stack" style="gap:16px">${state.orders.map(o => `<article class="order" aria-label="Order ${esc(o.id)}">
      <div class="order-head"><div><span class="muted">Order placed</span><b>${esc(dateFmt(o.date))}</b></div><div><span class="muted">Total</span><b>${money(o.total)}</b></div><div><span class="muted">Ship to</span><b>${esc(o.to.name)}</b></div><div><span class="muted">Order number</span><b class="mono">${esc(o.id)}</b></div></div>
      <div class="order-body"><p class="muted" style="padding-top:6px">Pretend delivery: ${esc(o.eta)}</p>${o.items.map(it => orderLine(it, true)).join("")}</div></article>`).join("")}</div>`
  };
};
ACT.again = el => {
  const id = Number(el.dataset.id), p = PM.get(id);
  if (cartAdd(id, Number(el.dataset.v), 1)) { flyToCart(el); toast(`Added to your cart`, { href: "#/cart", label: "View cart" }); }
  else toast(`${p ? p.title : "That item"} is unavailable`);
};
ACT.clearorders = () => {
  state.orders = []; save("orders");
  rerender(); focusFirst("#ordTitle", "#main");
  toast("Demo orders cleared");
};
