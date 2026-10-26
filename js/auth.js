/* ==================================================================
   auth.js - Sign in and create account: with email, phone number or
   Google. Shoppers must sign in before they can use the store. Each
   account gets its own cart, wish list and orders.
   DEMO ONLY: accounts are kept in this browser (key bz:users). This is
   not real security, so never use a real password here.
   (file 2 of 10; the load order is at the bottom of index.html)
   ================================================================== */

/* ---------- Google sign-in setup ----------
   Paste your own Google "OAuth client ID" between the quotes to turn on the
   "Sign in with Google" button. README.txt explains how to get one (free).
   Google sign-in only works when the store is opened through start.bat
   (http://localhost:8080), not by double-clicking index.html. */
const GOOGLE_CLIENT_ID = "";

/* Country codes for phone sign-in. The first one is picked by default. */
const PHONE_CODES = [["+1", "US / Canada"], ["+880", "Bangladesh"], ["+91", "India"], ["+44", "United Kingdom"], ["+61", "Australia"], ["+81", "Japan"], ["+971", "UAE"], ["+92", "Pakistan"]];

/* ---------- Accounts and the signed-in shopper ---------- */
const AUTH = {
  users() { try { return JSON.parse(localStorage.getItem("bz:users")) || []; } catch (e) { return []; } },
  saveUsers(list) { try { localStorage.setItem("bz:users", JSON.stringify(list)); return true; } catch (e) { return false; } },
  /* add a new account, or save changes to one that exists */
  put(user) { const list = AUTH.users().filter(u => u.id !== user.id); return AUTH.saveUsers([...list, user]); },
  session() {
    for (const s of [sessionStorage, localStorage]) { try { const v = JSON.parse(s.getItem("bz:session")); if (v) return v; } catch (e) { /* blocked */ } }
    return null;
  },
  start(user, remember) {
    try { (remember ? localStorage : sessionStorage).setItem("bz:session", JSON.stringify({ id: user.id })); } catch (e) { /* blocked */ }
  },
  end() {
    [sessionStorage, localStorage].forEach(s => { try { s.removeItem("bz:session"); } catch (e) { /* blocked */ } });
    try { if (window.google && google.accounts) google.accounts.id.disableAutoSelect(); } catch (e) { /* not loaded */ }
  }
};
const USER = (() => { const s = AUTH.session(); return s ? AUTH.users().find(u => u.id === s.id) || null : null; })();
const newId = () => "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

/* The password is mixed with a random "salt" and hashed, so it is not stored as plain text */
async function hashPass(pass, salt) {
  const text = salt + ":" + pass;
  if (window.crypto && crypto.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
  }
  let h = 2166136261; // fallback when the browser has no crypto.subtle
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return "f" + (h >>> 0).toString(16);
}
const cleanEmail = s => s.trim().toLowerCase();
const okEmail = s => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
const cleanPhone = s => s.replace(/[^\d]/g, "").replace(/^0+/, "");

/* Google sends back a signed token. We read the name, email and photo from it.
   (A real store would also check the token on its own server.) */
function readGoogleToken(token) {
  const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  const json = decodeURIComponent([...atob(part)].map(c => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join(""));
  return JSON.parse(json);
}
let gsiLoad = null;
const loadGoogle = () => gsiLoad || (gsiLoad = new Promise((ok, fail) => {
  const s = document.createElement("script");
  s.src = "https://accounts.google.com/gsi/client"; s.async = true; s.onload = ok; s.onerror = fail;
  document.head.appendChild(s);
}));

/* ---------- The sign-in screen (shown instead of the store) ---------- */
function showLogin() {
  const e = s => String(s ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  const LOGO = `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M5 15L8 5h24l3 10z" fill="currentColor"/><path d="M12.5 5L11.5 15M20 5v10M27.5 5l1 10" stroke="var(--g-logo-gap)" stroke-width="3"/><path d="M5 15q3.75 5 7.5 0 3.75 5 7.5 0 3.75 5 7.5 0 3.75 5 7.5 0z" fill="var(--accent)"/><path d="M9 21v13h22V21" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><rect x="16" y="26" width="8" height="8" fill="currentColor"/></svg>`;
  const gate = document.createElement("div");
  gate.id = "gate";
  gate.innerHTML = `<div class="g-wrap">
    <aside class="g-hero" aria-hidden="true">
      <div class="g-logo">${LOGO}<span>bazaarly</span></div>
      <h2>Your whole market, one sign-in away.</h2>
      <ul><li>Your own cart, wish list and orders</li><li>Sell your items with just a photo</li><li>Free delivery on orders over $35</li></ul>
      <p class="g-small">Demo store. No real payments.</p>
    </aside>
    <main class="g-main" id="gMain"></main>
  </div>`;
  document.documentElement.classList.add("locked");
  document.body.prepend(gate);
  const host = gate.querySelector("#gMain");

  let step = "email", tab = "email", found = null, email = "", phone = "", cc = guessCode(), sms = null, pending = null;
  function guessCode() {
    const region = (navigator.language || "").split("-")[1] || "";
    return ({ BD: "+880", IN: "+91", GB: "+44", AU: "+61", JP: "+81", AE: "+971", PK: "+92" })[region.toUpperCase()] || PHONE_CODES[0][0];
  }

  const field = (id, label, type, extra = "") => `<div class="g-field"><input id="${id}" type="${type}" placeholder=" " ${extra}><label for="${id}">${label}</label></div>`;
  const showPass = `<label class="g-check"><input type="checkbox" data-g="show"> Show password</label>`;
  const keep = `<label class="g-check"><input type="checkbox" id="g_keep" checked> Stay signed in on this device</label>`;
  const errBox = `<p class="g-err" id="g_err" role="alert"></p>`;
  const top = (title, sub) => `<h1 tabindex="-1">${title}</h1>${sub ? `<p class="g-sub">${sub}</p>` : ""}`;
  /* Google button + "or" + Email / Phone tabs: shared by the first sign-in steps */
  const choices = () => `<div class="g-google" id="g_google"></div>
    <div class="g-or"><span>or</span></div>
    <div class="g-tabs" role="group" aria-label="Sign in with">
      <button type="button" data-g="tab" data-t="email" aria-pressed="${tab === "email"}">Email</button>
      <button type="button" data-g="tab" data-t="phone" aria-pressed="${tab === "phone"}">Phone number</button>
    </div>`;

  const steps = {
    email: () => `${top("Sign in", "to continue to Bazaarly")}${choices()}
      ${field("g_email", "Email", "email", `autocomplete="username" value="${e(email)}"`)}
      ${errBox}
      <div class="g-row"><button type="button" class="g-link" data-g="create">Create account</button><button class="btn brand g-next">Next</button></div>`,
    phone: () => `${top("Sign in", "to continue to Bazaarly")}${choices()}
      <div class="g-phone"><label class="sr" for="g_cc">Country code</label><select id="g_cc">${PHONE_CODES.map(([c, n]) => `<option value="${c}" ${c === cc ? "selected" : ""}>${c} ${e(n)}</option>`).join("")}</select>
      ${field("g_phone", "Phone number", "tel", `autocomplete="tel-national" inputmode="tel" value="${e(phone)}"`)}</div>
      <p class="g-hint">We'll send a 6-digit code to sign you in. New number? We'll make your account.</p>
      ${errBox}
      <div class="g-row"><span></span><button class="btn brand g-next">Send code</button></div>`,
    code: () => `${top("Enter the code", `Sent to <b>${e(cc + " " + phone)}</b>`)}
      <div class="g-sms" role="note"><b>Demo text message</b><span>Your Bazaarly code is <b class="mono">${sms.code}</b></span><small>This practice store can't send real texts, so the code is shown here.</small></div>
      ${field("g_code", "6-digit code", "text", 'inputmode="numeric" autocomplete="one-time-code" maxlength="6"')}
      ${keep}
      ${errBox}
      <div class="g-row"><button type="button" class="g-link" data-g="resend">Send a new code</button><button class="btn brand g-next">Verify</button></div>
      <button type="button" class="g-link g-back" data-g="tab" data-t="phone">← Use a different number</button>`,
    phoneName: () => `${top("Welcome to Bazaarly", "What should we call you?")}
      <div class="g-two">${field("g_first", "First name", "text", 'autocomplete="given-name"')}${field("g_last", "Last name (optional)", "text", 'autocomplete="family-name"')}</div>
      ${errBox}
      <div class="g-row"><span></span><button class="btn brand g-next">Finish</button></div>`,
    pass: () => `${top(`Hi ${e(found.first)}`)}
      <button type="button" class="g-chip" data-g="back"><span class="g-ava">${e(found.first[0].toUpperCase())}</span>${e(found.email)} <span aria-hidden="true">▾</span><span class="sr">Use another account</span></button>
      ${field("g_pass", "Enter your password", "password", 'autocomplete="current-password"')}
      ${showPass}${keep}${errBox}
      <div class="g-row"><button type="button" class="g-link" data-g="back">Use another account</button><button class="btn brand g-next">Next</button></div>`,
    create: () => `${top("Create a Bazaarly account", "Enter your name, email and a password")}
      <div class="g-two">${field("g_first", "First name", "text", 'autocomplete="given-name"')}${field("g_last", "Last name (optional)", "text", 'autocomplete="family-name"')}</div>
      ${field("g_email", "Email", "email", `autocomplete="username" value="${e(email)}"`)}
      <div class="g-two">${field("g_pass", "Password", "password", 'autocomplete="new-password"')}${field("g_pass2", "Confirm", "password", 'autocomplete="new-password"')}</div>
      <p class="g-hint">Use 6 or more characters. Demo store: do not use a real password.</p>
      ${showPass}${errBox}
      <div class="g-row"><button type="button" class="g-link" data-g="back">Sign in instead</button><button class="btn brand g-next">Create account</button></div>`
  };

  function render(s) {
    step = s;
    host.innerHTML = `<form class="g-card" novalidate aria-label="${s === "create" ? "Create account" : "Sign in"}"><div class="g-logo g-logo-card">${LOGO}<span>bazaarly</span></div>${steps[s]()}</form>
      <p class="g-foot">Accounts in this demo are saved only in this browser.</p>`;
    if (s === "email" || s === "phone") mountGoogle(host.querySelector("#g_google"));
    const first = host.querySelector("input:not([type=checkbox])");
    (first || host.querySelector("h1")).focus();
  }
  const err = msg => { host.querySelector("#g_err").textContent = msg; };
  const v = id => host.querySelector("#" + id).value;
  const kept = () => { const k = host.querySelector("#g_keep"); return !k || k.checked; };
  const enter = (user, remember) => { AUTH.start(user, remember); location.reload(); };

  /* Google's own button. It needs your Client ID (top of this file) and a http:// address. */
  function mountGoogle(slot) {
    if (!GOOGLE_CLIENT_ID || location.protocol === "file:") {
      slot.innerHTML = `<p class="g-setup"><b>Sign in with Google is not set up yet.</b> ${!GOOGLE_CLIENT_ID ? "Add your Google Client ID at the top of js/auth.js." : ""}${location.protocol === "file:" ? " Open the store with start.bat instead of double-clicking index.html." : ""} See README.txt.</p>`;
      return;
    }
    slot.innerHTML = `<p class="g-hint" style="text-align:center">Loading Google…</p>`;
    loadGoogle().then(() => {
      if (!mountGoogle.ready) { google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: r => onGoogle(r.credential) }); mountGoogle.ready = true; }
      slot.innerHTML = "";
      google.accounts.id.renderButton(slot, { theme: "outline", size: "large", shape: "pill", text: "continue_with", width: Math.max(220, Math.min(400, slot.clientWidth || 360)) });
    }).catch(() => { slot.innerHTML = `<p class="g-setup">Could not reach Google. Check your internet connection, then reload.</p>`; });
  }
  function onGoogle(token) {
    let g;
    try { g = readGoogleToken(token); } catch (x) { return err("Google sign-in did not work. Please try again."); }
    if (g.aud !== GOOGLE_CLIENT_ID || g.exp * 1000 < Date.now() || !g.email) return err("Google sign-in did not work. Please try again.");
    const mail = cleanEmail(g.email), users = AUTH.users();
    let user = users.find(u => u.google === g.sub) || users.find(u => u.email === mail);
    if (user) Object.assign(user, { google: g.sub, picture: g.picture || user.picture });
    else user = { id: newId(), first: g.given_name || g.name || mail.split("@")[0], last: g.family_name || "", email: mail, google: g.sub, picture: g.picture || "", created: new Date().toISOString() };
    if (!AUTH.put(user)) return err("Your browser is blocking storage, so you can't sign in here.");
    enter(user, true);
  }

  function sendCode() {
    sms = { code: String(Math.floor(100000 + Math.random() * 900000)), until: Date.now() + 5 * 60 * 1000, tries: 0 };
    render("code");
  }

  gate.addEventListener("click", ev => {
    const b = ev.target.closest("[data-g]");
    if (!b) return;
    const g = b.dataset.g;
    if (g === "create") render("create");
    if (g === "back") { found = null; tab = "email"; render("email"); }
    if (g === "tab") { tab = b.dataset.t; render(tab); }
    if (g === "resend") sendCode();
  });
  gate.addEventListener("change", ev => {
    if (ev.target.dataset.g === "show") host.querySelectorAll("#g_pass, #g_pass2").forEach(i => { i.type = ev.target.checked ? "text" : "password"; });
    if (ev.target.id === "g_cc") cc = ev.target.value;
  });
  gate.addEventListener("submit", async ev => {
    ev.preventDefault();
    if (step === "email") {
      email = cleanEmail(v("g_email"));
      if (!okEmail(email)) return err("Enter a valid email, like name@example.com.");
      found = AUTH.users().find(u => u.email === email);
      if (!found) return err("Couldn't find a Bazaarly account with that email. Check it, or create an account.");
      if (!found.hash) return err("This account signs in with Google. Use the Google button above.");
      render("pass");
    } else if (step === "pass") {
      const pass = v("g_pass");
      if (!pass) return err("Enter your password.");
      if (await hashPass(pass, found.salt) !== found.hash) return err("Wrong password. Try again.");
      enter(found, kept());
    } else if (step === "phone") {
      phone = cleanPhone(v("g_phone"));
      if (phone.length < 6 || phone.length > 14) return err("Enter a valid phone number (6 to 14 digits).");
      sendCode();
    } else if (step === "code") {
      const code = v("g_code").replace(/\D/g, "");
      if (Date.now() > sms.until) return err("That code has expired. Send a new code.");
      if (code !== sms.code) {
        sms.tries++;
        if (sms.tries >= 3) { sms.until = 0; return err("Too many wrong tries. Send a new code."); }
        return err("Wrong code. Check it and try again.");
      }
      const full = cc + phone;
      found = AUTH.users().find(u => u.phone === full);
      if (found) return enter(found, kept());
      pending = { phone: full, remember: kept() };
      render("phoneName");
    } else if (step === "phoneName") {
      const first = v("g_first").trim();
      if (!first) return err("Enter your first name.");
      const user = { id: newId(), first, last: v("g_last").trim(), phone: pending.phone, created: new Date().toISOString() };
      if (!AUTH.put(user)) return err("Your browser is blocking storage, so an account can't be saved here.");
      enter(user, pending.remember);
    } else {
      const first = v("g_first").trim(), last = v("g_last").trim(), pass = v("g_pass");
      email = cleanEmail(v("g_email"));
      if (!first) return err("Enter your first name.");
      if (!okEmail(email)) return err("Enter a valid email, like name@example.com.");
      if (pass.length < 6) return err("Use 6 or more characters for your password.");
      if (pass !== v("g_pass2")) return err("Those passwords didn't match. Try again.");
      if (AUTH.users().some(u => u.email === email)) return err("That email already has an account. Sign in instead.");
      const salt = Math.random().toString(36).slice(2) + Date.now().toString(36);
      const user = { id: newId(), first, last, email, salt, hash: await hashPass(pass, salt), created: new Date().toISOString() };
      if (!AUTH.put(user)) return err("Your browser is blocking storage, so an account can't be saved here.");
      enter(user, true);
    }
  });
  render("email");
}
if (!USER) showLogin();
