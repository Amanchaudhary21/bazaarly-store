/* ==================================================================
   product.js - The single product page and customer reviews.
   (file 6 of 11; the load order is at the bottom of index.html)
   ================================================================== */

/* ---------- Product page ---------- */
const FORM = {};
let pdp = { id: 0, v: 0, q: 1 }, revStars = 0;
const deliveryRange = fast => (fast ? `${when(addDays(1))} to ${when(addDays(2))}` : `${when(addDays(3))} to ${when(addDays(5))}`);
const stockHtml = p => (p.stock < 1 ? `<p class="stock-out">Currently unavailable</p>` : p.stock <= 5 ? `<p class="stock-low">Only ${p.stock} left in stock. Order soon.</p>` : `<p class="stock-ok">In stock</p>`);
const notFound = () => ({ html: emptyState("We could not find that page", "The product may have moved, or the link is old.", "#/", "Back to the shop") });

function reviewItems(p) {
  const mine = arr(state.reviews[p.id]);
  return mine.length ? mine.map(r => `<article class="review"><div class="row">${stars(r.stars)}<span class="pill">Your review</span><span class="muted">${esc(when(new Date(r.date)))}</span></div><p style="margin-top:6px">${esc(r.text)}</p></article>`).join("")
    : `<p class="muted">You have not written a review for this product yet.</p>`;
}
function reviewsHtml(p) {
  return `<section class="sec" id="reviews" aria-labelledby="h-rev"><h2 id="h-rev" style="margin-bottom:12px">Ratings and reviews</h2>
    <div class="panel row" style="gap:12px 28px"><div><div class="price" style="font-size:2.4rem">${p.rating.toFixed(1)}</div>${stars(p.rating)}<div class="muted">${p.n.toLocaleString()} sample ratings</div></div>
      <p class="muted grow" style="min-width:220px">Ratings in this demo store are sample data. A review you write here stays in this browser and is marked as yours.</p></div>
    <div class="reviews" id="revList" style="margin-top:12px">${reviewItems(p)}</div>
    <form class="panel stack" id="revForm" novalidate style="margin-top:12px"><h3>Write a review</h3>
      <div class="starpick" role="group" aria-label="Your rating">${[1, 2, 3, 4, 5].map(n => `<button type="button" data-act="pick" data-n="${n}" aria-pressed="false" aria-label="${n} star${n > 1 ? "s" : ""}"><svg aria-hidden="true"><use href="#i-star"/></svg></button>`).join("")}</div>
      <div class="field"><label for="revText">Your review</label><textarea id="revText" maxlength="500" placeholder="What did you like or dislike?"></textarea><div class="err" id="revErr" role="alert"></div></div>
      <div><button class="btn brand" type="submit">Post review</button></div></form></section>`;
}
VIEWS.product = r => {
  const p = PM.get(r.id);
  if (!p) return notFound();
  if (pdp.id !== p.id) pdp = { id: p.id, v: 0, q: 1 };
  revStars = 0;
  addRecent(p.id);
  const out = p.stock < 1, wished = state.wish.includes(p.id), d = disc(p), col = p.colors[pdp.v];
  const related = P.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 6);
  const recent = state.recent.filter(id => id !== p.id).map(id => PM.get(id)).slice(0, 6);
  return {
    html: `<p class="crumbs"><a href="#/">Home</a> / <a href="#/c/${p.cat}">${esc(catName(p.cat))}</a></p>
    <div class="pdp">
      <div class="gallery"><div id="pdpArt">${art(p, pdp.v, true)}</div>
        ${p.colors.length > 1 ? `<div class="thumbs">${p.colors.map((c, i) => `<button type="button" data-act="variant" data-v="${i}" aria-pressed="${i === pdp.v}" aria-label="Show colour ${esc(c.name)}">${art(p, i)}</button>`).join("")}</div>` : ""}</div>
      <div class="pdp-info">
        <h1>${esc(p.title)}</h1>
        <div class="rate">${stars(p.rating)}<b>${p.rating.toFixed(1)}</b><a href="#reviews" data-act="jump">${p.n.toLocaleString()} sample ratings</a></div>
        <div class="pdp-price"><span class="price">${money(p.price)}</span>${p.was ? `<span class="was">List price ${money(p.was)}</span><span class="off">You save ${money(p.was - p.price)} (${d}%)</span>` : ""}</div>
        ${p.colors.length > 1 ? `<div><p><b>Colour:</b> <span id="colorName">${esc(col.name)}</span></p><div class="swatches" style="margin-top:8px">${p.colors.map((c, i) => `<button type="button" style="--c:${c.hex}" data-act="variant" data-v="${i}" aria-pressed="${i === pdp.v}" aria-label="${esc(c.name)}"></button>`).join("")}</div></div>` : ""}
        <div><h2 style="font-size:1.1rem;margin-bottom:8px">About this item</h2><ul class="bullets">${p.bullets.map(b => `<li>${esc(b)}</li>`).join("")}</ul></div>
        <table class="specs"><caption class="sr">Product details</caption><tbody>${p.specs.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}<tr><th scope="row">Department</th><td>${esc(catName(p.cat))}</td></tr></tbody></table>
      </div>
      <aside class="buybox" aria-label="Buy this item">
        <div class="price" style="font-size:1.7rem">${money(p.price)}</div>
        ${p.price >= FREE_SHIP_MIN ? `<p class="ship">Free delivery</p>` : `<p class="muted">Free delivery on orders over ${money(FREE_SHIP_MIN)}</p>`}
        <p>Arrives <b>${deliveryRange(false)}</b></p>
        ${stockHtml(p)}
        ${out ? "" : `<div class="row"><label for="qtyOut" class="muted">Quantity</label><div class="qty"><button type="button" data-act="qty" data-d="-1" aria-label="Decrease quantity" ${pdp.q <= 1 ? "disabled" : ""}>-</button><output id="qtyOut" aria-live="polite">${pdp.q}</output><button type="button" data-act="qty" data-d="1" aria-label="Increase quantity" ${pdp.q >= maxQty(p) ? "disabled" : ""}>+</button></div></div>`}
        <button class="btn brand block" type="button" data-act="addpdp" ${out ? "disabled" : ""}>${out ? "Currently unavailable" : "Add to cart"}</button>
        <button class="btn primary block" type="button" data-act="buynow" ${out ? "disabled" : ""}>Buy now</button>
        <button class="btn block" type="button" data-act="wish" data-id="${p.id}" aria-pressed="${wished}">${wished ? "Remove from wish list" : "Add to wish list"}</button>
        ${IS_OWNER ? `<button class="btn danger block" type="button" data-act="unsell" data-id="${p.id}">Delete this item</button>` : ""}
        <p class="muted" style="font-size:.82rem">Demo checkout: no payment is taken and nothing ships.</p>
      </aside>
    </div>
    ${related.length ? `<section class="sec" aria-labelledby="h-rel"><div class="sec-head"><h2 id="h-rel">More in ${esc(catName(p.cat))}</h2><a href="#/c/${p.cat}">See all</a></div><div class="rail">${related.map(card).join("")}</div></section>` : ""}
    ${reviewsHtml(p)}
    ${recent.length ? `<section class="sec" aria-labelledby="h-rec2"><div class="sec-head"><h2 id="h-rec2">Recently viewed</h2></div><div class="rail">${recent.map(card).join("")}</div></section>` : ""}`
  };
};
ACT.variant = el => {
  const p = PM.get(pdp.id), v = Number(el.dataset.v);
  pdp.v = v;
  $("#pdpArt").innerHTML = art(p, v, true);
  $$('[data-act="variant"]').forEach(b => b.setAttribute("aria-pressed", String(Number(b.dataset.v) === v)));
  $("#colorName").textContent = p.colors[v].name;
};
ACT.qty = el => {
  const p = PM.get(pdp.id);
  pdp.q = Math.max(1, Math.min(maxQty(p), pdp.q + Number(el.dataset.d)));
  $("#qtyOut").textContent = pdp.q;
  $$('[data-act="qty"]').forEach(b => { b.disabled = Number(b.dataset.d) < 0 ? pdp.q <= 1 : pdp.q >= maxQty(p); });
};
function addFromPdp() {
  const p = PM.get(pdp.id), line = state.cart.find(l => l.id === p.id && l.v === pdp.v), before = line ? line.q : 0;
  if (!cartAdd(p.id, pdp.v, pdp.q)) return false;
  const after = state.cart.find(l => l.id === p.id && l.v === pdp.v).q;
  if (after === before) toast(`You already have the most you can order (${maxQty(p)}).`, { href: "#/cart", label: "View cart" });
  else { flyToCart($(".gallery")); toast(`Added ${after - before} to your cart`, { href: "#/cart", label: "View cart" }); }
  return true;
}
ACT.addpdp = () => { addFromPdp(); };
ACT.buynow = () => { if (addFromPdp()) go("/checkout"); };
ACT.jump = (el, e) => { e.preventDefault(); const t = $("#reviews"); if (t) t.scrollIntoView({ behavior: "smooth" }); };
ACT.pick = el => {
  revStars = Number(el.dataset.n);
  $$(".starpick button").forEach(b => { const on = Number(b.dataset.n) <= revStars; b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(Number(b.dataset.n) === revStars)); });
};
FORM.revForm = () => {
  const text = $("#revText").value.trim(), err = $("#revErr");
  if (!revStars) { err.textContent = "Choose a star rating first."; return; }
  if (text.length < 3) { err.textContent = "Write a few words about the product."; $("#revText").focus(); return; }
  err.textContent = "";
  const list = arr(state.reviews[pdp.id]);
  list.unshift({ stars: revStars, text, date: new Date().toISOString() });
  state.reviews[pdp.id] = list.slice(0, 20);
  save("reviews");
  $("#revList").innerHTML = reviewItems(PM.get(pdp.id));
  $("#revText").value = ""; revStars = 0;
  $$(".starpick button").forEach(b => { b.classList.remove("on"); b.setAttribute("aria-pressed", "false"); });
  toast("Thanks. Your review is saved on this device.");
};
