/* ==================================================================
   sell.js - The "Sell an item" page: add your own product with a photo.
   Your products are saved in this browser (key bz:mine) and show up
   in the shop like every other product.
   (file 10 of 12; the load order is at the bottom of index.html)
   ================================================================== */

/* ---------- Sell an item ---------- */
let sellPhoto = "";
const SELL_RULES = {
  title: v => v.length >= 3 || "Give your item a name (at least 3 letters).",
  price: v => Number(v) > 0 || "Enter a price above 0.",
  was: v => !v || Number(v) > Number($("#sl_price").value) || "The old price must be higher than the price, or leave it empty.",
  stock: v => (Number.isInteger(Number(v)) && Number(v) >= 0) || "Enter a whole number, like 10."
};

/* Make the photo small (max 600 px) so many items fit in the browser's storage */
function shrinkPhoto(file, done) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 600 / Math.max(img.width, img.height));
      const cv = document.createElement("canvas");
      cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
      const g = cv.getContext("2d");
      g.fillStyle = "#fff"; g.fillRect(0, 0, cv.width, cv.height);
      g.drawImage(img, 0, 0, cv.width, cv.height);
      done(cv.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => done("");
    img.src = reader.result;
  };
  reader.onerror = () => done("");
  reader.readAsDataURL(file);
}

/* Save your products. Returns false if the browser storage is full or blocked. */
function saveMine() {
  const mine = P.filter(p => p.mine);
  try { localStorage.setItem("bz:mine", JSON.stringify(mine)); return true; } catch (e) { return false; }
}
/* Only the store owner (OWNER_EMAILS in auth.js) can add or remove items.
   isMine = items the owner added; the owner can also delete any store product. */
const isMine = p => p.mine && IS_OWNER;
const saveRemoved = () => { try { localStorage.setItem("bz:removed", JSON.stringify(REMOVED)); } catch (e) { /* blocked */ } };
function unlist(id) {
  const i = P.findIndex(p => p.id === id);
  if (i >= 0) P.splice(i, 1);
  PM.delete(id);
  state.cart = state.cart.filter(l => l.id !== id); save("cart");
  state.wish = state.wish.filter(x => x !== id); save("wish");
  state.recent = state.recent.filter(x => x !== id); save("recent");
  updateCounts();
}

function sellField(id, label, attrs, hint) {
  return `<div class="field"><label for="sl_${id}">${label}</label><input id="sl_${id}" name="${id}" autocomplete="off" aria-describedby="slerr_${id}" ${attrs}>${hint ? `<span class="muted" style="font-size:.82rem">${hint}</span>` : ""}<div class="err" id="slerr_${id}"></div></div>`;
}

VIEWS.sell = (r = {}) => {
  if (!IS_OWNER) return { html: `<h1 class="sr" id="sellTitle" tabindex="-1">Sell an item</h1>${emptyState("Only the store owner can add items", "You can still shop everything in the store.", "#/", "Start shopping")}` };
  sellPhoto = "";
  const mine = P.filter(isMine);
  return {
    html: `<div class="sec-head" style="margin-top:0"><h1 id="sellTitle" tabindex="-1">Sell an item</h1></div>
    <form id="sellForm" class="sell-layout" novalidate>
      <section class="panel stack" aria-labelledby="h-photo"><h2 id="h-photo" style="${H2S}">1. Photo</h2>
        <label class="photo-drop" id="photoDrop" for="sl_photo">
          <img id="photoPrev" alt="" hidden>
          <span id="photoHint"><svg aria-hidden="true"><use href="#i-plus"/></svg><b>Choose a photo</b><span class="muted">JPG or PNG from your phone or computer</span></span>
        </label>
        <input id="sl_photo" type="file" accept="image/*" class="sr" data-chg="photo" aria-describedby="slerr_photo">
        <div class="err" id="slerr_photo" style="color:var(--bad)"></div>
      </section>
      <section class="panel stack" aria-labelledby="h-info"><h2 id="h-info" style="${H2S}">2. Details</h2>
        <div class="form-grid">
          <div class="wide">${sellField("title", "Item name", `type="text" maxlength="90" value="${esc(r.title || "")}"`)}</div>
          ${sellField("price", "Price ($)", 'type="number" min="0.01" step="0.01" inputmode="decimal"')}
          ${sellField("was", "Old price ($)", 'type="number" min="0" step="0.01" inputmode="decimal"', "Optional. Shows a sale badge.")}
          <div class="field"><label for="sl_cat">Department</label><select id="sl_cat" name="cat">${CATS.map(c => `<option value="${c.id}" ${c.id === r.cat ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select></div>
          ${sellField("stock", "How many in stock", 'type="number" min="0" step="1" value="10" inputmode="numeric"')}
          <div class="field wide"><label for="sl_about">About this item</label><textarea id="sl_about" name="about" maxlength="600" placeholder="One point per line"></textarea></div>
        </div>
        <button class="btn brand block" type="submit">Save item to the shop</button>
        <p class="muted" style="font-size:.82rem">Saved only in this browser. "Reset demo data" in the footer removes it.</p>
      </section>
    </form>
    <section class="sec" aria-labelledby="h-mine"><div class="sec-head"><h2 id="h-mine">Your items (${mine.length})</h2></div>
      ${mine.length ? `<div class="grid">${mine.map(card).join("")}</div>`
        : `<p class="muted">You have not added any items yet.</p>`}
    </section>
    ${removedPanel()}`
  };
};

CHG.photo = el => {
  const file = el.files && el.files[0], err = $("#slerr_photo");
  if (!file) return;
  if (!file.type.startsWith("image/")) { err.textContent = "That file is not a picture. Choose a JPG or PNG."; return; }
  err.textContent = "Loading photo...";
  shrinkPhoto(file, url => {
    sellPhoto = url;
    err.textContent = url ? "" : "Could not read that picture. Try another one.";
    const prev = $("#photoPrev");
    if (!prev) return;
    prev.src = url; prev.hidden = !url;
    $("#photoHint").hidden = !!url;
  });
};

FORM.sellForm = () => {
  if (!IS_OWNER) return;
  let first = null;
  const bad = (el, errEl, msg) => {
    const ok = !msg;
    const f = el.closest(".field"); if (f) f.classList.toggle("bad", !ok);
    el.setAttribute("aria-invalid", String(!ok));
    errEl.textContent = msg || "";
    if (!ok && !first) first = el;
  };
  bad($("#sl_photo"), $("#slerr_photo"), sellPhoto ? "" : "Add a photo of your item.");
  Object.keys(SELL_RULES).forEach(k => {
    const el = $("#sl_" + k), r = SELL_RULES[k](el.value.trim());
    bad(el, $("#slerr_" + k), r === true ? "" : r);
  });
  if (first) { first.focus(); toast("Please fix the highlighted fields."); return; }

  const val = k => $("#sl_" + k).value.trim();
  const id = Math.max(1000, ...P.map(p => p.id)) + 1;
  const about = val("about").split("\n").map(s => s.trim()).filter(Boolean);
  const p = mk(id, val("cat"), "box", val("title"), round2(Number(val("price"))), round2(Number(val("was")) || 0), 0, 0, Number(val("stock")),
    C(["Default", "#8A9BA8"]), about.length ? about : ["Added by you on this device"], [["Seller", USER.first]], "", 1);
  p.photo = sellPhoto; p.mine = true; p.owner = USER.id;
  P.push(p); PM.set(id, p);
  if (!saveMine()) {
    unlist(id);
    toast("Not saved: your browser storage is full or blocked. Try a smaller photo or remove some items.");
    return;
  }
  toast(`"${p.title}" is now in the shop`, { href: `#/p/${id}`, label: "View item" });
  rerender("#sellTitle");
};

ACT.unsell = el => {
  const id = Number(el.dataset.id), p = PM.get(id);
  if (!p || !IS_OWNER || !confirm(`Delete "${p.title}" from the shop?\n\nIt will also be removed from carts and wish lists.`)) return;
  unlist(id);
  if (p.mine) saveMine(); else { REMOVED.push(id); saveRemoved(); }
  if (route.name === "product") go(p.mine ? "/sell" : "/"); else rerender();
  toast(`"${p.title}" was deleted`);
};
ACT.restoreall = () => {
  if (!IS_OWNER || !confirm(`Bring back ${REMOVED.length} deleted store product${REMOVED.length === 1 ? "" : "s"}?`)) return;
  REMOVED = []; saveRemoved();
  location.reload();
};

/* ---------- Publish deletions for everyone ----------
   This site has no server, so the owner downloads removed.js and pushes it
   to GitHub (public/js/core/removed.js). Every visitor then loads it. */
const unpublished = () => !sameIds(REMOVED, PUBLISHED_REMOVED);
function removedPanel() {
  const n = REMOVED.length, pub = PUBLISHED_REMOVED.length, s = k => (k === 1 ? "" : "s");
  return `<section class="sec panel stack" aria-labelledby="h-removed">
    <div class="row" style="justify-content:space-between">
      <h2 id="h-removed" style="${H2S}">Deleted store products (${n})</h2>
      ${n ? `<button class="btn small" type="button" data-act="restoreall">Restore all</button>` : ""}
    </div>
    <p class="muted" style="font-size:.88rem">As the owner you can delete any product with its "Delete item" button. Deleting hides it in this browser straight away.</p>
    <p><b>For everyone:</b> ${pub} product${s(pub)} deleted.${unpublished() ? ` <span class="pub-flag">You have changes only this browser sees</span>` : ` <span class="muted">Up to date.</span>`}</p>
    ${unpublished() ? `<div class="row">
      <button class="btn brand" type="button" data-act="publish">Publish deletions for everyone</button>
      <button class="btn" type="button" data-act="unpublished">Undo unpublished changes</button>
    </div>
    <ol class="muted pub-steps">
      <li>Click <b>Publish deletions for everyone</b>. It downloads <span class="mono">removed.js</span>.</li>
      <li>Put it in the project at <span class="mono">public/js/core/removed.js</span> (replace the old one).</li>
      <li>Commit and push to GitHub. Every visitor sees the change once GitHub Pages updates (usually a few minutes).</li>
    </ol>` : ""}
  </section>`;
}
ACT.publish = () => {
  if (!IS_OWNER) return;
  const ids = [...REMOVED].sort((a, b) => a - b);
  const names = ids.map(id => `   ${id}: ${(BASE_TITLES[id] || "").replace(/\*\//g, "")}`).join("\n");
  const text = `/* ==================================================================
   removed.js - Store products the owner deleted for EVERY visitor.
   Made by "Publish deletions for everyone" on the Sell page (owner only).
   To update it: replace this file with the downloaded one, then push to GitHub.
   (file 1 of 12; the load order is at the bottom of index.html)
   ================================================================== */
${ids.length ? `/* Deleted on ${new Date().toISOString().slice(0, 10)}:\n${names}\n*/\n` : ""}const PUBLISHED_REMOVED = [${ids.join(", ")}];
`;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "text/javascript" }));
  a.download = "removed.js";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast("removed.js downloaded. Put it in public/js/core/ and push to GitHub.");
};
ACT.unpublished = () => {
  if (!IS_OWNER || !confirm("Undo the changes you have not published? This browser will show the published list again.")) return;
  try { localStorage.removeItem("bz:removed"); } catch (e) { /* blocked */ }
  location.reload();
};
