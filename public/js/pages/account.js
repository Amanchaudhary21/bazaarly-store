/* ==================================================================
   account.js - The account menu in the header (the round avatar) and
   the "Your profile" page with every detail of the signed-in account.
   (file 10 of 11; the load order is at the bottom of index.html)
   ================================================================== */

const fullName = u => [u.first, u.last].filter(Boolean).join(" ");
const avatar = u => u.picture ? `<img src="${esc(u.picture)}" alt="" referrerpolicy="no-referrer">` : esc(u.first[0].toUpperCase());
const longDate = iso => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

/* every way this account can sign in */
function signInWays(u) {
  const ways = [];
  if (u.hash) ways.push(["Email and password", u.email]);
  if (u.phone) ways.push(["Phone code", u.phone]);
  if (u.google) ways.push(["Google", u.email]);
  Object.entries(u.social || {}).forEach(([k, mail]) => { if (SOCIAL[k]) ways.push([SOCIAL[k].name, mail]); });
  return ways;
}

/* ---------- Header account menu ---------- */
function mountAccountMenu() {
  const login = USER.email || USER.phone;
  $("#cartCount").parentElement.insertAdjacentHTML("afterend", `<button class="icon-btn avatar" id="userBtn" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="userMenu" aria-label="Account: ${esc(fullName(USER))}" title="${esc(fullName(USER))} (${esc(login)})">${avatar(USER)}</button>`);
  document.body.insertAdjacentHTML("beforeend", `<div class="user-menu" id="userMenu" hidden>
    <div class="um-head"><span class="um-ava" aria-hidden="true">${avatar(USER)}</span><div><b>${esc(fullName(USER))}</b><span>${esc(login)}</span></div></div>
    <nav aria-label="Your account">
      <a href="#/account">Your profile</a>
      <a href="#/orders">Your orders</a>
      <a href="#/wishlist">Wish list</a>
      <a href="#/sell">Sell an item</a>
    </nav>
    <button type="button" class="um-out" data-act="signout">Sign out</button>
  </div>`);
  const btn = $("#userBtn"), menu = $("#userMenu");
  const close = (back) => { if (menu.hidden) return; menu.hidden = true; btn.setAttribute("aria-expanded", "false"); if (back) btn.focus(); };
  const open = () => {
    const r = btn.getBoundingClientRect();
    menu.style.top = r.bottom + 8 + "px";
    menu.style.right = Math.max(16, innerWidth - r.right) + "px";
    menu.hidden = false; btn.setAttribute("aria-expanded", "true");
    menu.querySelector("a").focus();
  };
  btn.addEventListener("click", () => (menu.hidden ? open() : close(true)));
  menu.addEventListener("click", e => { if (e.target.closest("a, button")) close(false); });
  document.addEventListener("click", e => { if (!e.target.closest("#userMenu, #userBtn")) close(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") close(true); });
  addEventListener("resize", () => close(false));
  addEventListener("scroll", () => close(false), { passive: true });
}
ACT.signout = () => { AUTH.end(); location.hash = "#/"; location.reload(); };

/* ---------- Your profile ---------- */
VIEWS.account = () => {
  const u = USER, ways = signInWays(u), logins = u.logins || [];
  const spent = round2(state.orders.reduce((s, o) => s + (o.total || 0), 0));
  const row = (label, value) => `<div class="pf-row"><dt>${label}</dt><dd>${value}</dd></div>`;
  const none = `<span class="muted">Not added</span>`;
  const stat = (n, label, href) => `<a class="pf-stat" href="${href}"><b>${n}</b><span>${label}</span></a>`;
  return {
    html: `<h1 class="sr" id="pfTitle" tabindex="-1">Your profile</h1>
    <section class="pf-hero">
      <span class="pf-ava" aria-hidden="true">${avatar(u)}</span>
      <div><h2>${esc(fullName(u))}</h2><p>${esc(u.email || u.phone)}</p>${u.created ? `<p class="pf-since">Member since ${esc(new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(new Date(u.created)))}</p>` : ""}</div>
      <button type="button" class="btn" data-act="signout">Sign out</button>
    </section>
    <div class="pf-stats">${stat(state.orders.length, state.orders.length === 1 ? "Order" : "Orders", "#/orders")}${stat(money(spent), "Spent", "#/orders")}${stat(state.wish.length, "In wish list", "#/wishlist")}${stat(totals().count, "In cart", "#/cart")}${stat(P.filter(isMine).length, "Items you sell", "#/sell")}</div>
    <div class="pf-grid">
      <section class="panel" aria-labelledby="h-pf-me"><h2 id="h-pf-me" style="${H2S}">Personal details</h2>
        <dl class="pf-list">
          ${row("First name", esc(u.first))}
          ${row("Last name", u.last ? esc(u.last) : none)}
          ${row("Email", u.email ? esc(u.email) : none)}
          ${row("Phone", u.phone ? esc(u.phone) : none)}
          ${row("Account created", u.created ? esc(longDate(u.created)) : `<span class="muted">Unknown</span>`)}
          ${row("Account ID", `<span class="mono">${esc(u.id)}</span>`)}
        </dl>
      </section>
      <section class="panel" aria-labelledby="h-pf-sign"><h2 id="h-pf-sign" style="${H2S}">Sign-in and security</h2>
        <dl class="pf-list">
          ${row("Sign-in methods", ways.length ? `<ul class="pf-ways">${ways.map(([how, id]) => `<li><b>${esc(how)}</b> <span class="muted">${esc(id)}</span></li>`).join("")}</ul>` : none)}
          ${row("Password", u.hash ? `Set${u.passSet ? ` <span class="muted">· changed ${esc(longDate(u.passSet))}</span>` : ""}` : `<span class="muted">No password (signs in without one)</span>`)}
          ${row("On this device", AUTH.remembered() ? "Stays signed in" : "Signed out when the browser closes")}
        </dl>
        <h3 class="pf-sub">Recent sign-ins</h3>
        ${logins.length ? `<ol class="pf-log">${logins.map((l, i) => `<li><span>${esc(longDate(l.at))}${i === 0 ? ` <span class="pf-now">This visit</span>` : ""}</span><span class="muted">${esc(l.via || "Unknown")}</span></li>`).join("")}</ol>` : `<p class="muted">Sign-ins from now on will show here.</p>`}
      </section>
    </div>
    <p class="muted pf-note">This demo keeps your account only in this browser. Never use a real password here.</p>`
  };
};
