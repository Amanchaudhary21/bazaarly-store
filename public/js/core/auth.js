/* ==================================================================
   auth.js - Sign in and create account: with email, phone number or
   Google. Shoppers must sign in before they can use the store. Each
   account gets its own cart, wish list and orders.
   DEMO ONLY: accounts are kept in this browser (key bz:users). This is
   not real security, so never use a real password here.
   (file 2 of 11; the load order is at the bottom of index.html)
   ================================================================== */

/* ---------- Google sign-in setup ----------
   Paste your own Google "OAuth client ID" between the quotes to turn on the
   "Sign in with Google" button. README.md explains how to get one (free).
   Google sign-in only works when the store is opened through start.bat
   (http://localhost:8080), not by double-clicking index.html. */
const GOOGLE_CLIENT_ID = "";

/* Country codes for phone sign-in: [country, dial code, name]. The shopper's
   own country is picked by default, or the United States if it is unknown. */
const PHONE_CODES = [
  ["AF", "+93", "Afghanistan"], ["AL", "+355", "Albania"], ["DZ", "+213", "Algeria"],
  ["AS", "+1", "American Samoa"], ["AD", "+376", "Andorra"], ["AO", "+244", "Angola"],
  ["AI", "+1", "Anguilla"], ["AG", "+1", "Antigua and Barbuda"], ["AR", "+54", "Argentina"],
  ["AM", "+374", "Armenia"], ["AW", "+297", "Aruba"], ["AU", "+61", "Australia"], ["AT", "+43", "Austria"],
  ["AZ", "+994", "Azerbaijan"], ["BS", "+1", "Bahamas"], ["BH", "+973", "Bahrain"],
  ["BD", "+880", "Bangladesh"], ["BB", "+1", "Barbados"], ["BY", "+375", "Belarus"],
  ["BE", "+32", "Belgium"], ["BZ", "+501", "Belize"], ["BJ", "+229", "Benin"], ["BM", "+1", "Bermuda"],
  ["BT", "+975", "Bhutan"], ["BO", "+591", "Bolivia"], ["BA", "+387", "Bosnia and Herzegovina"],
  ["BW", "+267", "Botswana"], ["BR", "+55", "Brazil"], ["VG", "+1", "British Virgin Islands"],
  ["BN", "+673", "Brunei"], ["BG", "+359", "Bulgaria"], ["BF", "+226", "Burkina Faso"],
  ["BI", "+257", "Burundi"], ["KH", "+855", "Cambodia"], ["CM", "+237", "Cameroon"], ["CA", "+1", "Canada"],
  ["CV", "+238", "Cape Verde"], ["KY", "+1", "Cayman Islands"], ["CF", "+236", "Central African Republic"],
  ["TD", "+235", "Chad"], ["CL", "+56", "Chile"], ["CN", "+86", "China"], ["CO", "+57", "Colombia"],
  ["KM", "+269", "Comoros"], ["CG", "+242", "Congo"], ["CD", "+243", "Congo (DRC)"],
  ["CK", "+682", "Cook Islands"], ["CR", "+506", "Costa Rica"], ["CI", "+225", "Côte d'Ivoire"],
  ["HR", "+385", "Croatia"], ["CU", "+53", "Cuba"], ["CW", "+599", "Curaçao"], ["CY", "+357", "Cyprus"],
  ["CZ", "+420", "Czechia"], ["DK", "+45", "Denmark"], ["DJ", "+253", "Djibouti"], ["DM", "+1", "Dominica"],
  ["DO", "+1", "Dominican Republic"], ["EC", "+593", "Ecuador"], ["EG", "+20", "Egypt"],
  ["SV", "+503", "El Salvador"], ["GQ", "+240", "Equatorial Guinea"], ["ER", "+291", "Eritrea"],
  ["EE", "+372", "Estonia"], ["SZ", "+268", "Eswatini"], ["ET", "+251", "Ethiopia"],
  ["FK", "+500", "Falkland Islands"], ["FO", "+298", "Faroe Islands"], ["FJ", "+679", "Fiji"],
  ["FI", "+358", "Finland"], ["FR", "+33", "France"], ["GF", "+594", "French Guiana"],
  ["PF", "+689", "French Polynesia"], ["GA", "+241", "Gabon"], ["GM", "+220", "Gambia"],
  ["GE", "+995", "Georgia"], ["DE", "+49", "Germany"], ["GH", "+233", "Ghana"], ["GI", "+350", "Gibraltar"],
  ["GR", "+30", "Greece"], ["GL", "+299", "Greenland"], ["GD", "+1", "Grenada"],
  ["GP", "+590", "Guadeloupe"], ["GU", "+1", "Guam"], ["GT", "+502", "Guatemala"], ["GG", "+44", "Guernsey"],
  ["GN", "+224", "Guinea"], ["GW", "+245", "Guinea-Bissau"], ["GY", "+592", "Guyana"],
  ["HT", "+509", "Haiti"], ["HN", "+504", "Honduras"], ["HK", "+852", "Hong Kong"], ["HU", "+36", "Hungary"],
  ["IS", "+354", "Iceland"], ["IN", "+91", "India"], ["ID", "+62", "Indonesia"], ["IR", "+98", "Iran"],
  ["IQ", "+964", "Iraq"], ["IE", "+353", "Ireland"], ["IM", "+44", "Isle of Man"], ["IL", "+972", "Israel"],
  ["IT", "+39", "Italy"], ["JM", "+1", "Jamaica"], ["JP", "+81", "Japan"], ["JE", "+44", "Jersey"],
  ["JO", "+962", "Jordan"], ["KZ", "+7", "Kazakhstan"], ["KE", "+254", "Kenya"], ["KI", "+686", "Kiribati"],
  ["XK", "+383", "Kosovo"], ["KW", "+965", "Kuwait"], ["KG", "+996", "Kyrgyzstan"], ["LA", "+856", "Laos"],
  ["LV", "+371", "Latvia"], ["LB", "+961", "Lebanon"], ["LS", "+266", "Lesotho"], ["LR", "+231", "Liberia"],
  ["LY", "+218", "Libya"], ["LI", "+423", "Liechtenstein"], ["LT", "+370", "Lithuania"],
  ["LU", "+352", "Luxembourg"], ["MO", "+853", "Macau"], ["MG", "+261", "Madagascar"],
  ["MW", "+265", "Malawi"], ["MY", "+60", "Malaysia"], ["MV", "+960", "Maldives"], ["ML", "+223", "Mali"],
  ["MT", "+356", "Malta"], ["MH", "+692", "Marshall Islands"], ["MQ", "+596", "Martinique"],
  ["MR", "+222", "Mauritania"], ["MU", "+230", "Mauritius"], ["YT", "+262", "Mayotte"],
  ["MX", "+52", "Mexico"], ["FM", "+691", "Micronesia"], ["MD", "+373", "Moldova"], ["MC", "+377", "Monaco"],
  ["MN", "+976", "Mongolia"], ["ME", "+382", "Montenegro"], ["MS", "+1", "Montserrat"],
  ["MA", "+212", "Morocco"], ["MZ", "+258", "Mozambique"], ["MM", "+95", "Myanmar"],
  ["NA", "+264", "Namibia"], ["NR", "+674", "Nauru"], ["NP", "+977", "Nepal"], ["NL", "+31", "Netherlands"],
  ["NC", "+687", "New Caledonia"], ["NZ", "+64", "New Zealand"], ["NI", "+505", "Nicaragua"],
  ["NE", "+227", "Niger"], ["NG", "+234", "Nigeria"], ["NU", "+683", "Niue"], ["KP", "+850", "North Korea"],
  ["MK", "+389", "North Macedonia"], ["MP", "+1", "Northern Mariana Islands"], ["NO", "+47", "Norway"],
  ["OM", "+968", "Oman"], ["PK", "+92", "Pakistan"], ["PW", "+680", "Palau"], ["PS", "+970", "Palestine"],
  ["PA", "+507", "Panama"], ["PG", "+675", "Papua New Guinea"], ["PY", "+595", "Paraguay"],
  ["PE", "+51", "Peru"], ["PH", "+63", "Philippines"], ["PL", "+48", "Poland"], ["PT", "+351", "Portugal"],
  ["PR", "+1", "Puerto Rico"], ["QA", "+974", "Qatar"], ["RE", "+262", "Réunion"], ["RO", "+40", "Romania"],
  ["RU", "+7", "Russia"], ["RW", "+250", "Rwanda"], ["BL", "+590", "Saint Barthélemy"],
  ["SH", "+290", "Saint Helena"], ["KN", "+1", "Saint Kitts and Nevis"], ["LC", "+1", "Saint Lucia"],
  ["MF", "+590", "Saint Martin"], ["PM", "+508", "Saint Pierre and Miquelon"],
  ["VC", "+1", "Saint Vincent and the Grenadines"], ["WS", "+685", "Samoa"], ["SM", "+378", "San Marino"],
  ["ST", "+239", "São Tomé and Príncipe"], ["SA", "+966", "Saudi Arabia"], ["SN", "+221", "Senegal"],
  ["RS", "+381", "Serbia"], ["SC", "+248", "Seychelles"], ["SL", "+232", "Sierra Leone"],
  ["SG", "+65", "Singapore"], ["SX", "+1", "Sint Maarten"], ["SK", "+421", "Slovakia"],
  ["SI", "+386", "Slovenia"], ["SB", "+677", "Solomon Islands"], ["SO", "+252", "Somalia"],
  ["ZA", "+27", "South Africa"], ["KR", "+82", "South Korea"], ["SS", "+211", "South Sudan"],
  ["ES", "+34", "Spain"], ["LK", "+94", "Sri Lanka"], ["SD", "+249", "Sudan"], ["SR", "+597", "Suriname"],
  ["SE", "+46", "Sweden"], ["CH", "+41", "Switzerland"], ["SY", "+963", "Syria"], ["TW", "+886", "Taiwan"],
  ["TJ", "+992", "Tajikistan"], ["TZ", "+255", "Tanzania"], ["TH", "+66", "Thailand"],
  ["TL", "+670", "Timor-Leste"], ["TG", "+228", "Togo"], ["TK", "+690", "Tokelau"], ["TO", "+676", "Tonga"],
  ["TT", "+1", "Trinidad and Tobago"], ["TN", "+216", "Tunisia"], ["TR", "+90", "Türkiye"],
  ["TM", "+993", "Turkmenistan"], ["TC", "+1", "Turks and Caicos Islands"], ["TV", "+688", "Tuvalu"],
  ["VI", "+1", "U.S. Virgin Islands"], ["UG", "+256", "Uganda"], ["UA", "+380", "Ukraine"],
  ["AE", "+971", "United Arab Emirates"], ["GB", "+44", "United Kingdom"], ["US", "+1", "United States"],
  ["UY", "+598", "Uruguay"], ["UZ", "+998", "Uzbekistan"], ["VU", "+678", "Vanuatu"],
  ["VA", "+39", "Vatican City"], ["VE", "+58", "Venezuela"], ["VN", "+84", "Vietnam"],
  ["WF", "+681", "Wallis and Futuna"], ["EH", "+212", "Western Sahara"], ["YE", "+967", "Yemen"],
  ["ZM", "+260", "Zambia"], ["ZW", "+263", "Zimbabwe"]
];

/* Social sign-in buttons. DEMO ONLY: real Facebook, TikTok, Instagram or X
   sign-in needs an app registered with each network and a server, so these
   open a practice "connect" step instead. */
const TIKTOK_NOTE = "M13.5 5v9.2a3 3 0 1 1-3-3M13.5 5c.4 2 1.8 3.3 3.8 3.5";
const SOCIAL = {
  facebook: { name: "Facebook", icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M13.4 20v-6.6h2.2l.4-2.6h-2.6V9.2c0-.8.3-1.3 1.4-1.3H16V5.6c-.3 0-1.1-.1-2.1-.1-2.2 0-3.6 1.3-3.6 3.7v1.6H8v2.6h2.3V20z"/></svg>` },
  tiktok: { name: "TikTok", icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke-width="2.2" stroke-linecap="round"><path d="${TIKTOK_NOTE}" stroke="#25f4ee" transform="translate(-.8 -.6)"/><path d="${TIKTOK_NOTE}" stroke="#fe2c55" transform="translate(.8 .6)"/><path d="${TIKTOK_NOTE}" stroke="#fff"/></g></svg>` },
  instagram: { name: "Instagram", icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="#fff" stroke-width="1.9"><rect x="5" y="5" width="14" height="14" rx="4.2"/><circle cx="12" cy="12" r="3.3"/></g><circle cx="16.2" cy="7.8" r="1.1" fill="#fff"/></svg>` },
  x: { name: "X", icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6h3.3l7.7 12h-3.3zM17.3 6L6.7 18" fill="none" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"/></svg>` }
};

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
  /* true when "Stay signed in" was ticked (the session is kept after the browser closes) */
  remembered() { try { return !!localStorage.getItem("bz:session"); } catch (e) { return false; } },
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

  let step = "email", tab = "email", found = null, email = "", phone = "", country = guessCountry(), cc = codeOf(country), sms = null, mail = null, net = null, pending = null;
  function guessCountry() {
    const region = ((navigator.language || "").split("-")[1] || "").toUpperCase();
    return PHONE_CODES.some(([c]) => c === region) ? region : "US";
  }
  function codeOf(c) { return PHONE_CODES.find(([iso]) => iso === c)[1]; }

  const field = (id, label, type, extra = "") => `<div class="g-field"><input id="${id}" type="${type}" placeholder=" " ${extra}><label for="${id}">${label}</label></div>`;
  const showPass = `<label class="g-check"><input type="checkbox" data-g="show"> Show password</label>`;
  const keep = `<label class="g-check"><input type="checkbox" id="g_keep" checked> Stay signed in on this device</label>`;
  const errBox = `<p class="g-err" id="g_err" role="alert"></p>`;
  const top = (title, sub) => `<h1 tabindex="-1">${title}</h1>${sub ? `<p class="g-sub">${sub}</p>` : ""}`;
  /* Google button + social buttons + "or" + Email / Phone tabs: shared by the first sign-in steps */
  const choices = () => `<div class="g-google" id="g_google"></div>
    <div class="g-social" role="group" aria-label="Continue with a social account">${Object.entries(SOCIAL).map(([k, s]) => `<button type="button" class="g-net g-net-${k}" data-g="social" data-n="${k}" aria-label="Continue with ${s.name}" title="Continue with ${s.name}">${s.icon}</button>`).join("")}</div>
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
      <div class="g-phone"><label class="sr" for="g_cc">Country code</label><select id="g_cc">${PHONE_CODES.map(([iso, c, n]) => `<option value="${iso}" ${iso === country ? "selected" : ""}>${c} ${e(n)}</option>`).join("")}</select>
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
      <div class="g-row"><button type="button" class="g-link" data-g="forgot">Forgot password?</button><button class="btn brand g-next">Next</button></div>`,
    reset: () => `${top("Reset your password", `We sent a code to <b>${e(found.email)}</b>`)}
      <div class="g-sms" role="note"><b>Demo email</b><span>Your Bazaarly reset code is <b class="mono">${mail.code}</b></span><small>This practice store can't send real email, so the code is shown here.</small></div>
      ${field("g_code", "6-digit code", "text", 'inputmode="numeric" autocomplete="one-time-code" maxlength="6"')}
      <div class="g-two">${field("g_pass", "New password", "password", 'autocomplete="new-password"')}${field("g_pass2", "Confirm", "password", 'autocomplete="new-password"')}</div>
      <p class="g-hint">Use 6 or more characters. Demo store: do not use a real password.</p>
      ${showPass}${keep}${errBox}
      <div class="g-row"><button type="button" class="g-link" data-g="forgot">Send a new code</button><button class="btn brand g-next">Reset password</button></div>
      <button type="button" class="g-link g-back" data-g="toPass">← Back to sign in</button>`,
    social: () => `${top(`Continue with ${SOCIAL[net].name}`, "to sign in to Bazaarly")}
      <div class="g-sms" role="note"><b>Demo connection</b><span>This practice store isn't linked to a real ${SOCIAL[net].name} app, so enter the details your ${SOCIAL[net].name} account would share.</span></div>
      <div class="g-two">${field("g_first", "First name", "text", 'autocomplete="given-name"')}${field("g_last", "Last name (optional)", "text", 'autocomplete="family-name"')}</div>
      ${field("g_email", `${SOCIAL[net].name} email`, "email", 'autocomplete="email"')}
      ${keep}${errBox}
      <div class="g-row"><button type="button" class="g-link" data-g="back">Cancel</button><button class="btn brand g-next">Continue</button></div>`,
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
  /* remember the last 5 sign-ins (when and how) for the profile page */
  const enter = (user, remember, via) => {
    user.logins = [{ at: new Date().toISOString(), via }, ...(user.logins || [])].slice(0, 5);
    AUTH.put(user); AUTH.start(user, remember); location.reload();
  };

  /* Google's own button. It needs your Client ID (top of this file) and a http:// address. */
  function mountGoogle(slot) {
    if (!GOOGLE_CLIENT_ID || location.protocol === "file:") {
      slot.innerHTML = `<p class="g-setup"><b>Sign in with Google is not set up yet.</b> ${!GOOGLE_CLIENT_ID ? "Add your Google Client ID at the top of js/core/auth.js." : ""}${location.protocol === "file:" ? " Open the store with start.bat or npm start instead of double-clicking index.html." : ""} See README.md.</p>`;
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
    enter(user, true, "Google");
  }

  /* a 6-digit code that works for 5 minutes and 3 tries (demo text or email) */
  const newCode = () => ({ code: String(Math.floor(100000 + Math.random() * 900000)), until: Date.now() + 5 * 60 * 1000, tries: 0 });
  function codeError(box, typed) {
    const code = typed.replace(/\D/g, "");
    if (Date.now() > box.until) return "That code has expired. Send a new code.";
    if (code === box.code) return "";
    box.tries++;
    if (box.tries >= 3) { box.until = 0; return "Too many wrong tries. Send a new code."; }
    return "Wrong code. Check it and try again.";
  }
  function sendCode() { sms = newCode(); render("code"); }
  const saltPass = async (user, pass) => { user.salt = Math.random().toString(36).slice(2) + Date.now().toString(36); user.hash = await hashPass(pass, user.salt); user.passSet = new Date().toISOString(); };
  const passError = (pass, again) => pass.length < 6 ? "Use 6 or more characters for your password." : pass !== again ? "Those passwords didn't match. Try again." : "";

  gate.addEventListener("click", ev => {
    const b = ev.target.closest("[data-g]");
    if (!b) return;
    const g = b.dataset.g;
    if (g === "create") render("create");
    if (g === "back") { found = null; tab = "email"; render("email"); }
    if (g === "tab") { tab = b.dataset.t; render(tab); }
    if (g === "resend") sendCode();
    if (g === "forgot") { mail = newCode(); render("reset"); }
    if (g === "toPass") render("pass");
    if (g === "social") { net = b.dataset.n; render("social"); }
  });
  gate.addEventListener("change", ev => {
    if (ev.target.dataset.g === "show") host.querySelectorAll("#g_pass, #g_pass2").forEach(i => { i.type = ev.target.checked ? "text" : "password"; });
    if (ev.target.id === "g_cc") { country = ev.target.value; cc = codeOf(country); }
  });
  gate.addEventListener("submit", async ev => {
    ev.preventDefault();
    if (step === "email") {
      email = cleanEmail(v("g_email"));
      if (!okEmail(email)) return err("Enter a valid email, like name@example.com.");
      found = AUTH.users().find(u => u.email === email);
      if (!found) return err("Couldn't find a Bazaarly account with that email. Check it, or create an account.");
      if (!found.hash) {
        const via = [found.google && "Google", ...Object.keys(found.social || {}).map(k => SOCIAL[k] && SOCIAL[k].name)].filter(Boolean);
        return err(`This account signs in with ${via.join(" or ") || "a phone number"}. Use that option above.`);
      }
      render("pass");
    } else if (step === "reset") {
      const pass = v("g_pass"), bad = codeError(mail, v("g_code")) || passError(pass, v("g_pass2"));
      if (bad) return err(bad);
      await saltPass(found, pass);
      if (!AUTH.put(found)) return err("Your browser is blocking storage, so your new password can't be saved here.");
      enter(found, kept(), "Email and password");
    } else if (step === "social") {
      const first = v("g_first").trim(), mailTo = cleanEmail(v("g_email")), users = AUTH.users();
      if (!first) return err("Enter your first name.");
      if (!okEmail(mailTo)) return err("Enter a valid email, like name@example.com.");
      let user = users.find(u => u.social && u.social[net] === mailTo);
      if (!user) {
        if (users.some(u => u.email === mailTo)) return err("That email already has a Bazaarly account. Sign in with it the usual way.");
        user = { id: newId(), first, last: v("g_last").trim(), email: mailTo, social: { [net]: mailTo }, created: new Date().toISOString() };
        if (!AUTH.put(user)) return err("Your browser is blocking storage, so an account can't be saved here.");
      }
      enter(user, kept(), SOCIAL[net].name);
    } else if (step === "pass") {
      const pass = v("g_pass");
      if (!pass) return err("Enter your password.");
      if (await hashPass(pass, found.salt) !== found.hash) return err("Wrong password. Try again.");
      enter(found, kept(), "Email and password");
    } else if (step === "phone") {
      phone = cleanPhone(v("g_phone"));
      if (phone.length < 6 || phone.length > 14) return err("Enter a valid phone number (6 to 14 digits).");
      sendCode();
    } else if (step === "code") {
      const bad = codeError(sms, v("g_code"));
      if (bad) return err(bad);
      const full = cc + phone;
      found = AUTH.users().find(u => u.phone === full);
      if (found) return enter(found, kept(), "Phone code");
      pending = { phone: full, remember: kept() };
      render("phoneName");
    } else if (step === "phoneName") {
      const first = v("g_first").trim();
      if (!first) return err("Enter your first name.");
      const user = { id: newId(), first, last: v("g_last").trim(), phone: pending.phone, created: new Date().toISOString() };
      if (!AUTH.put(user)) return err("Your browser is blocking storage, so an account can't be saved here.");
      enter(user, pending.remember, "Phone code");
    } else {
      const first = v("g_first").trim(), last = v("g_last").trim(), pass = v("g_pass");
      email = cleanEmail(v("g_email"));
      if (!first) return err("Enter your first name.");
      if (!okEmail(email)) return err("Enter a valid email, like name@example.com.");
      const bad = passError(pass, v("g_pass2"));
      if (bad) return err(bad);
      if (AUTH.users().some(u => u.email === email)) return err("That email already has an account. Sign in instead.");
      const user = { id: newId(), first, last, email, created: new Date().toISOString() };
      await saltPass(user, pass);
      if (!AUTH.put(user)) return err("Your browser is blocking storage, so an account can't be saved here.");
      enter(user, true, "Email and password");
    }
  });
  render("email");
}
if (!USER) showLogin();
