BAZAARLY MARKET - a practice online store (HTML + CSS + JavaScript)
====================================================================

HOW TO OPEN IT
  1. Open this folder (bazaarly-store).
  2. Double-click  index.html  - it opens in your browser.
  Internet is not needed. (With internet you also get the nicer Google fonts.)

HOW TO EDIT IT IN VS CODE
  1. Open VS Code.
  2. Click File, then Open Folder, then choose the folder  bazaarly-store.
  3. Click a file on the left side and change it. Save with Ctrl+S.
  4. Go to the browser tab and press F5 to see your change.

WHAT EACH FILE DOES
  index.html        The page itself: header, menu and footer. It loads the CSS and JS files.
  css/style.css     How everything looks: colors (light and dark), buttons, cards, cart.
  js/data.js        The products, categories, coupons and delivery prices.
  js/auth.js        Sign-in and create-account screen shown before the store opens.
  js/art.js         Draws the product pictures (small drawings made by code).
  js/core.js        Helpers, the saved cart and wish list, price maths, page switcher.
  js/home.js        Home page, product lists, search results and filters.
  js/product.js     The single product page and reviews.
  js/cart.js        Cart, coupon box and wish list.
  js/checkout.js    Checkout form, order confirmation and the Orders page.
  js/sell.js        The "Sell an item" page: add your own product with a photo.
  server.js / start.bat  Run the store at http://localhost:8080 (needed for Google sign-in).
  js/main.js        Starts the store: menus, search box, dark-mode button, clicks.

EASY THINGS TO TRY (edit, save with Ctrl+S, then press F5 in the browser)
  - index.html    : find  <span>bazaarly</span>  and type your own shop name.
                    It shows in the top-left corner of the page.
  - js/data.js    : near the top, find the line that starts with  const FREE_SHIP_MIN
                    Change  SHIP_STD = 4.99  to  SHIP_STD = 2.99
                    Standard delivery in the cart now costs $2.99.
  - js/data.js    : change the words of any product title. It changes everywhere.
  - css/style.css : the colors are the variables at the very top (--brand, --accent ...).
                    The first block is the light theme. The dark theme blocks come right after it.
                    Use the half-circle button in the page header to switch themes.

GOOD TO KNOW
  - This is a demo. No real payments, no real accounts, nothing is shipped.
  - Your cart, wish list and orders are saved only in your own browser.
    The "Reset demo data" button in the footer clears them.
  - If something looks broken after an edit, undo with Ctrl+Z and save again.
    A small typing mistake in a JS file can stop the whole page.

SIGNING IN
  Everyone must sign in before they can shop. There are three ways:
  - Email and password  : click "Create account" the first time.
  - Phone number        : type your number, then the 6-digit code.
                          This demo cannot send real text messages, so the code is shown on the screen.
  - Google              : needs a one-time setup (below).
  Click the round letter button in the top-right corner of the store to sign out.

TURNING ON "SIGN IN WITH GOOGLE" (one-time setup, free)
  1. Install Node.js from https://nodejs.org if you do not have it.
  2. Double-click  start.bat . The store opens at http://localhost:8080
     (Google sign-in does not work when you double-click index.html.)
  3. Go to https://console.cloud.google.com , make a project, then open
     "APIs & Services", then "Credentials".
  4. Click "Create credentials", then "OAuth client ID", type "Web application".
     Under "Authorized JavaScript origins" add BOTH:
        http://localhost
        http://localhost:8080
  5. Copy the Client ID (it ends with .apps.googleusercontent.com).
  6. Open js/auth.js, find  const GOOGLE_CLIENT_ID = "";  and paste it between the quotes.
  7. Save, and reload the page. The Google button now shows on the sign-in page.
  Note: accounts are saved per address, so accounts made on index.html and on
  http://localhost:8080 are separate.

DELETING ITEMS YOU ADDED
  Items you added on the "Sell an item" page have a red "Delete item" button on their card
  and a "Delete this item" button on their product page. Only you can see these buttons.
