/* ==========================================================
   FLOW CREATIVE — shop layer (cart, product details, buy now)
   Loaded on every page after products.js. No dependencies.
   ========================================================== */
(function () {
  'use strict';

  var S = window.FC_SETTINGS || { currency: 'PKR' };
  var PRODUCTS = window.FC_PRODUCTS || [];
  var CART_KEY = 'fc_cart_v1';
  var BUY_KEY = 'fc_buynow_v1';
  var memory = {}; // fallback when localStorage is blocked (private mode)

  /* ---------- helpers ---------- */
  function byId(id) {
    for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i];
    return null;
  }
  function money(n) { return S.currency + ' ' + Number(n).toLocaleString('en-US'); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function read(key) {
    try {
      var v = JSON.parse(localStorage.getItem(key));
      return Array.isArray(v) ? v : [];
    } catch (e) { return memory[key] || []; }
  }
  function write(key, val) {
    memory[key] = val;
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* ignore */ }
  }
  function clamp(q) { q = parseInt(q, 10); return isNaN(q) ? 1 : Math.max(1, Math.min(10, q)); }

  /* ---------- cart ---------- */
  var cart = {
    items: function () {
      return read(CART_KEY).filter(function (l) {
        var p = byId(l.id); return p && p.buyable && l.qty > 0;
      });
    },
    save: function (items) {
      write(CART_KEY, items);
      document.dispatchEvent(new CustomEvent('fc:cart'));
    },
    add: function (id, qty) {
      var p = byId(id); if (!p || !p.buyable) return false;
      var items = cart.items(), found = false;
      items.forEach(function (l) { if (l.id === id) { l.qty = clamp(l.qty + qty); found = true; } });
      if (!found) items.push({ id: id, qty: clamp(qty) });
      cart.save(items); return true;
    },
    setQty: function (id, qty) {
      var items = cart.items();
      items.forEach(function (l) { if (l.id === id) l.qty = clamp(qty); });
      cart.save(items);
    },
    remove: function (id) {
      cart.save(cart.items().filter(function (l) { return l.id !== id; }));
    },
    clear: function () { cart.save([]); },
    count: function () { return cart.items().reduce(function (n, l) { return n + l.qty; }, 0); },
    total: function () {
      return cart.items().reduce(function (n, l) { return n + byId(l.id).price * l.qty; }, 0);
    }
  };

  var buyNow = {
    get: function () {
      return read(BUY_KEY).filter(function (l) { var p = byId(l.id); return p && p.buyable; });
    },
    set: function (id, qty) { write(BUY_KEY, [{ id: id, qty: clamp(qty) }]); },
    clear: function () { write(BUY_KEY, []); }
  };

  window.FC = { settings: S, products: PRODUCTS, byId: byId, money: money, esc: esc, cart: cart, buyNow: buyNow };

  /* ---------- layers (modal / drawer) ---------- */
  var openLayer = null, lastFocus = null;

  function lockScroll(on) { document.documentElement.classList.toggle('fc-lock', on); }

  function openEl(el) {
    if (openLayer) closeLayer(true);
    lastFocus = document.activeElement;
    el.classList.add('open');
    el.setAttribute('aria-hidden', 'false');
    overlay.classList.add('open');
    lockScroll(true);
    openLayer = el;
    var f = el.querySelector('[data-close]'); if (f) f.focus();
  }
  function closeLayer(silent) {
    if (!openLayer) return;
    openLayer.classList.remove('open');
    openLayer.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('open');
    lockScroll(false);
    openLayer = null;
    if (!silent && lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* ---------- build UI shell ---------- */
  var overlay = document.createElement('div');
  overlay.className = 'fc-overlay';
  overlay.addEventListener('click', function () { closeLayer(); });

  var drawer = document.createElement('aside');
  drawer.className = 'cd';
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-modal', 'true');
  drawer.setAttribute('aria-label', 'Shopping cart');
  drawer.setAttribute('aria-hidden', 'true');
  drawer.innerHTML =
    '<div class="cd-head"><h2>Your cart</h2><button class="x" data-close aria-label="Close cart">&times;</button></div>' +
    '<div class="cd-body"></div><div class="cd-foot"></div>';

  var sheet = document.createElement('div');
  sheet.className = 'pm';
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-modal', 'true');
  sheet.setAttribute('aria-label', 'Product details');
  sheet.setAttribute('aria-hidden', 'true');

  var toast = document.createElement('div');
  toast.className = 'fc-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');

  var cartBtn = document.createElement('button');
  cartBtn.className = 'cart-btn';
  cartBtn.setAttribute('aria-label', 'Open cart');
  cartBtn.innerHTML =
    '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M5 8h14l-1.2 11.2a1.5 1.5 0 0 1-1.5 1.3H7.7a1.5 1.5 0 0 1-1.5-1.3L5 8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>' +
    '<span class="cart-count" hidden>0</span>';

  function mount() {
    var nav = document.querySelector('.site-header .nav');
    if (nav) nav.appendChild(cartBtn);
    document.body.appendChild(overlay);
    document.body.appendChild(drawer);
    document.body.appendChild(sheet);
    document.body.appendChild(toast);
    fillPrices();
    renderBadge();
  }

  /* ---------- prices on cards ---------- */
  function fillPrices() {
    document.querySelectorAll('[data-price]').forEach(function (el) {
      var p = byId(el.getAttribute('data-price'));
      if (p) el.textContent = p.buyable ? money(p.price) : 'On request';
    });
  }

  /* ---------- cart badge ---------- */
  function renderBadge() {
    var n = cart.count(), b = cartBtn.querySelector('.cart-count');
    b.textContent = n; b.hidden = n === 0;
    cartBtn.setAttribute('aria-label', n ? 'Open cart, ' + n + (n === 1 ? ' item' : ' items') : 'Open cart');
  }

  /* ---------- cart drawer ---------- */
  function renderDrawer() {
    var items = cart.items();
    var body = drawer.querySelector('.cd-body'), foot = drawer.querySelector('.cd-foot');
    if (!items.length) {
      body.innerHTML = '<div class="cd-empty"><p>Your cart is empty.</p><a class="btn primary" href="knives.html">Browse kitchen knives</a>' +
        '<a class="btn" href="swords.html">Browse swords</a></div>';
      foot.innerHTML = '';
      return;
    }
    body.innerHTML = items.map(function (l) {
      var p = byId(l.id);
      return '<div class="cd-line" data-line="' + esc(p.id) + '">' +
        '<img src="' + esc(p.image) + '" alt="" loading="lazy">' +
        '<div class="cd-info"><strong>' + esc(p.name) + '</strong><span>' + esc(p.type) + '</span>' +
        '<div class="qty" role="group" aria-label="Quantity for ' + esc(p.name) + '">' +
        '<button type="button" data-dec aria-label="Decrease quantity">&minus;</button>' +
        '<output>' + l.qty + '</output>' +
        '<button type="button" data-inc aria-label="Increase quantity">+</button></div></div>' +
        '<div class="cd-side"><strong>' + money(p.price * l.qty) + '</strong>' +
        '<button type="button" class="link" data-remove>Remove</button></div></div>';
    }).join('');
    foot.innerHTML =
      '<div class="cd-total"><span>Subtotal</span><strong>' + money(cart.total()) + '</strong></div>' +
      '<p class="cd-note">Delivery is confirmed with you when we receive your order.</p>' +
      '<a class="btn primary block" href="checkout.html">Checkout</a>' +
      '<button type="button" class="btn block" data-close>Keep browsing</button>';
  }

  drawer.addEventListener('click', function (e) {
    if (e.target.closest('[data-close]')) { closeLayer(); return; }
    var line = e.target.closest('[data-line]'); if (!line) return;
    var id = line.getAttribute('data-line');
    var cur = 1;
    cart.items().forEach(function (l) { if (l.id === id) cur = l.qty; });
    if (e.target.closest('[data-inc]')) cart.setQty(id, cur + 1);
    else if (e.target.closest('[data-dec]')) { cur <= 1 ? cart.remove(id) : cart.setQty(id, cur - 1); }
    else if (e.target.closest('[data-remove]')) cart.remove(id);
  });

  function openCart() { renderDrawer(); openEl(drawer); }
  cartBtn.addEventListener('click', openCart);

  /* ---------- product details sheet ---------- */
  var current = null, qty = 1;

  function renderSheet() {
    var p = current;
    var buy = p.buyable
      ? '<div class="pm-buy"><div class="qty big" role="group" aria-label="Quantity">' +
        '<button type="button" data-dec aria-label="Decrease quantity">&minus;</button>' +
        '<output>' + qty + '</output>' +
        '<button type="button" data-inc aria-label="Increase quantity">+</button></div>' +
        '<div class="pm-total">' + money(p.price * qty) + '</div></div>' +
        '<div class="pm-actions"><button type="button" class="btn" data-sheet-add>Add to cart</button>' +
        '<button type="button" class="btn primary" data-sheet-buy>Buy now</button></div>' +
        '<p class="pm-fine">Buy now takes you straight to checkout with just this item.</p>'
      : '<div class="pm-actions"><a class="btn primary" href="contact.html">Ask about this piece</a></div>';
    sheet.innerHTML =
      '<div class="pm-panel">' +
      '<button class="x pm-x" data-close aria-label="Close details">&times;</button>' +
      '<div class="pm-img"><img src="' + esc(p.image) + '" alt="' + esc(p.name) + '"></div>' +
      '<div class="pm-body">' +
      '<div class="pm-type">' + esc(p.type) + '</div>' +
      '<h2 class="pm-title">' + esc(p.name) + '</h2>' +
      '<div class="pm-price">' + (p.buyable ? money(p.price) : 'Not for sale') + '</div>' +
      '<p>' + esc(p.details) + '</p>' +
      '<dl class="pm-specs"><div><dt>Steel</dt><dd>' + esc(p.steel) + '</dd></div>' +
      '<div><dt>Handle</dt><dd>' + esc(p.handle) + '</dd></div></dl>' +
      (p.care ? '<details class="pm-care"><summary>Care</summary><p>' + esc(p.care) + '</p></details>' : '') +
      '<div class="pm-cta">' + buy + '</div></div></div>';
  }

  function openProduct(id) {
    var p = byId(id); if (!p) return;
    current = p; qty = 1;
    renderSheet();
    sheet.scrollTop = 0;
    var panel = sheet.querySelector('.pm-panel'); if (panel) panel.scrollTop = 0;
    openEl(sheet);
  }

  sheet.addEventListener('click', function (e) {
    if (e.target === sheet || e.target.closest('[data-close]')) { closeLayer(); return; }
    if (!current) return;
    if (e.target.closest('[data-inc]')) { qty = clamp(qty + 1); renderSheet(); keep('[data-inc]'); }
    else if (e.target.closest('[data-dec]')) { qty = clamp(qty - 1); renderSheet(); keep('[data-dec]'); }
    else if (e.target.closest('[data-sheet-add]')) {
      cart.add(current.id, qty);
      var name = current.name;
      closeLayer();
      say(name + ' added to your cart', true);
    } else if (e.target.closest('[data-sheet-buy]')) {
      buyNow.set(current.id, qty);
      window.location.href = 'checkout.html?buy=1';
    }
  });
  function keep(sel) { var b = sheet.querySelector(sel); if (b) b.focus(); }

  /* ---------- toast ---------- */
  var toastTimer;
  function say(text, withCart) {
    toast.innerHTML = '<span>' + esc(text) + '</span>' + (withCart ? '<button type="button" data-open-cart>View cart</button>' : '');
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 3200);
  }
  toast.addEventListener('click', function (e) {
    if (e.target.closest('[data-open-cart]')) { toast.classList.remove('show'); openCart(); }
  });

  /* ---------- page-wide clicks: cards, quick add ---------- */
  document.addEventListener('click', function (e) {
    var add = e.target.closest('[data-add]');
    if (add) {
      var id = add.getAttribute('data-add');
      if (cart.add(id, 1)) say(byId(id).name + ' added to your cart', true);
      return;
    }
    var card = e.target.closest('[data-product]');
    if (card && !openLayer) {
      var isView = e.target.closest('[data-view]');
      if (isView || !e.target.closest('a, button, input, select, textarea')) {
        openProduct(card.getAttribute('data-product'));
      }
    }
  });

  /* ---------- keyboard: Esc + focus trap ---------- */
  document.addEventListener('keydown', function (e) {
    if (!openLayer) return;
    if (e.key === 'Escape') { closeLayer(); return; }
    if (e.key !== 'Tab') return;
    var f = openLayer.querySelectorAll('a[href], button:not([disabled]), summary, input, select, textarea');
    f = Array.prototype.filter.call(f, function (n) { return n.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ---------- mobile nav: close on link tap / outside tap ---------- */
  document.addEventListener('click', function (e) {
    var nav = document.querySelector('.nav-links');
    if (!nav || !nav.classList.contains('open')) return;
    if (e.target.closest('.nav-links a') || !e.target.closest('.nav-links, .menu')) nav.classList.remove('open');
  });

  /* ---------- keep everything in sync ---------- */
  document.addEventListener('fc:cart', function () {
    renderBadge();
    if (openLayer === drawer) renderDrawer();
  });
  window.addEventListener('storage', function (e) {
    if (e.key === CART_KEY) document.dispatchEvent(new CustomEvent('fc:cart'));
  });
  window.addEventListener('pageshow', function (e) { if (e.persisted) renderBadge(); });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
