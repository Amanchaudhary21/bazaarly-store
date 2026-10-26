# Bazaarly Market

A practice online store made with plain HTML, CSS and JavaScript (no frameworks).
Search, filters, cart, coupons, checkout, orders, a wish list, selling your own items
with a photo, and sign-in with email, phone number or Google.

> Demo only: no real payments, nothing is shipped, and accounts are saved only in your own browser.

## Live site

**https://amanchaudhary21.github.io/bazaarly-store/**

Every push to the `main` branch publishes the `public/` folder again
(see `.github/workflows/deploy.yml`). It takes about a minute.

## How to run it

**Easiest:** double-click `public/index.html`. It opens in your browser. No internet needed
(with internet you also get the nicer Google fonts).

**With the little web server** (needed for "Sign in with Google"):

```bash
npm start
```

or double-click `start.bat`. The store opens at <http://localhost:8080>. You need
[Node.js](https://nodejs.org) 18 or newer. Nothing to install with npm.

## Project structure

```
15bazaarly-store/
├── public/                  everything the browser loads
│   ├── index.html           the page: header, menu, footer; loads the CSS and JS
│   ├── css/
│   │   └── style.css        colors (light and dark), buttons, cards, cart, sign-in page
│   └── js/
│       ├── core/            shared pieces, loaded first
│       │   ├── data.js      products, categories, coupons, delivery prices
│       │   ├── auth.js      sign-in screen: email, phone code, Google
│       │   ├── art.js       draws the product pictures (or shows your photo)
│       │   └── core.js      helpers, saved cart and wish list, price maths, page switcher
│       ├── pages/           one file per page
│       │   ├── home.js      home page, product lists, search results, filters
│       │   ├── product.js   single product page and reviews
│       │   ├── cart.js      cart, coupon box, wish list
│       │   ├── checkout.js  checkout form, order confirmation, Orders page
│       │   └── sell.js      "Sell an item": add your own product with a photo
│       └── main.js          starts the store: menus, search box, theme button, clicks
├── .github/workflows/
│   └── deploy.yml           publishes public/ to GitHub Pages on every push
├── server.js                tiny web server for the public folder (http://localhost:8080)
├── start.bat                double-click to start the server and open the store
├── package.json             `npm start` runs server.js
└── README.md
```

The JS files must load in the order listed at the bottom of `public/index.html`.
Each file uses things made by the files above it.

## Easy things to try

Edit, save with Ctrl+S, then press F5 in the browser.

- `public/index.html`: find `<span>bazaarly</span>` and type your own shop name.
- `public/js/core/data.js`: find `const FREE_SHIP_MIN` and change `SHIP_STD = 4.99` to `SHIP_STD = 2.99`.
  Standard delivery now costs $2.99.
- `public/js/core/data.js`: change the words of any product title. It changes everywhere.
- `public/css/style.css`: the colors are the variables at the very top (`--brand`, `--accent` ...).
  The first block is the light theme; the dark theme blocks come right after it.

If something looks broken after an edit, undo with Ctrl+Z and save again.
A small typing mistake in a JS file can stop the whole page.

## Signing in

Everyone must sign in before they can shop:

- **Email and password**: click "Create account" the first time.
- **Phone number**: type your number, then the 6-digit code. This demo can't send real
  text messages, so the code is shown on the screen.
- **Google**: needs a one-time setup (below).

Each account has its own cart, wish list and orders. Click the round letter button in the
top-right corner of the store to sign out. "Reset demo data" in the footer clears only your data.

### Turning on "Sign in with Google" (one-time, free)

1. Start the store with `npm start` or `start.bat` (Google sign-in does not work from a double-clicked `index.html`).
2. Go to <https://console.cloud.google.com>, make a project, then open **APIs & Services → Credentials**.
3. Click **Create credentials → OAuth client ID**, type **Web application**.
   Under **Authorized JavaScript origins** add `http://localhost`, `http://localhost:8080`
   and, for the live site, `https://amanchaudhary21.github.io`.
4. Copy the Client ID (it ends with `.apps.googleusercontent.com`).
5. Open `public/js/core/auth.js`, find `const GOOGLE_CLIENT_ID = "";` and paste it between the quotes.
6. Save and reload. The Google button now shows on the sign-in page.

Accounts are saved per address, so accounts made on the double-clicked `index.html`
and on `http://localhost:8080` are separate.

## Selling and deleting your items

Click the **+** button in the header to sell an item: choose a photo, add a name and price, and save.
Your items have a red **Delete item** button on their card and a **Delete this item** button on
their product page. Only you see these buttons.
