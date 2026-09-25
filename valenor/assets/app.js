/* VALENOR demo storefront: shared layout, fit profile, cart, and page renderers. */
(function () {
  'use strict';

  var PORTFOLIO_URL = 'https://ivanabboud-dev.github.io/ivan-portfolio/';
  var UPWORK_URL = 'https://www.upwork.com/freelancers/~012909be92032bae15';
  var FREE_SHIP = 100;
  var P = VLN.products, SIZES = VLN.sizes;

  /* ---------- helpers ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var money = function (n) { return '$' + (Math.round(n * 100) / 100).toFixed(n % 1 ? 2 : 0); };
  var byId = function (id) { return P.find(function (p) { return p.id === id; }); };
  var catName = function (id) { var c = VLN.categories.find(function (c) { return c.id === id; }); return c ? c.name : ''; };
  var params = new URLSearchParams(location.search);

  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } }
  };

  /* ---------- placeholder art (tinted by colour until real photos are added) ---------- */
  var SHAPES = {
    polo: { body: 'M140 95 L112 104 L60 150 L86 205 L118 184 L118 400 L282 400 L282 184 L314 205 L340 150 L288 104 L260 95 Q200 132 140 95 Z',
      lines: 'M140 95 L170 146 L200 118 L230 146 L260 95 M200 118 L200 176 M118 380 L282 380' },
    shirt: { body: 'M140 95 L112 104 L60 150 L86 205 L118 184 L118 404 L282 404 L282 184 L314 205 L340 150 L288 104 L260 95 Q200 126 140 95 Z',
      lines: 'M140 95 L176 160 L200 116 L224 160 L260 95 M200 116 L200 404 M150 200 L180 200 L180 228 L150 228 Z' },
    knit: { body: 'M142 92 L108 104 L78 180 L64 360 L98 364 L118 222 L118 400 L282 400 L282 222 L302 364 L336 360 L322 180 L292 104 L258 92 L240 70 L160 70 Z',
      lines: 'M160 70 L240 70 M200 70 L200 150 M118 382 L282 382 M66 344 L98 348 M334 344 L302 348 M150 110 L150 380 M175 110 L175 380 M225 110 L225 380 M250 110 L250 380' },
    jacket: { body: 'M142 88 L106 100 L74 180 L60 368 L96 372 L118 226 L118 410 L282 410 L282 226 L304 372 L340 368 L326 180 L294 100 L258 88 L246 64 L154 64 Z',
      lines: 'M154 64 L246 64 M200 64 L200 410 M142 88 L178 150 M258 88 L222 150 M132 290 L180 290 L180 336 L132 336 Z M220 290 L268 290 L268 336 L220 336 Z M118 390 L282 390' },
    trouser: { body: 'M130 70 L270 70 L286 432 L222 432 L202 176 L198 176 L178 432 L114 432 Z',
      lines: 'M130 94 L270 94 M200 94 L200 176 M160 94 L166 250 M240 94 L234 250 M146 108 Q160 130 150 150 M254 108 Q240 130 250 150' }
  };
  function lum(hex) {
    var n = parseInt(hex.slice(1), 16), r = (n >> 16) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
    return .2126 * r + .7152 * g + .0722 * b;
  }
  var artN = 0;
  function art(p, color) {
    var s = SHAPES[p.shape] || SHAPES.shirt, fill = VLN.colors[color] || '#999', light = lum(fill) > .55, id = 'vg' + (++artN);
    /* Dark studio backdrop, so drawings sit with the real (black-background) product photos. */
    return '<svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" role="img" aria-label="' + esc(p.name + ', ' + color) + '">' +
      '<defs><radialGradient id="' + id + '" cx="50%" cy="42%" r="62%"><stop offset="0" stop-color="#443e36"/><stop offset=".6" stop-color="#1e1c19"/><stop offset="1" stop-color="#0f0e0c"/></radialGradient></defs>' +
      '<rect width="400" height="500" fill="url(#' + id + ')"/>' +
      '<ellipse cx="200" cy="452" rx="130" ry="12" fill="rgba(0,0,0,.45)"/>' +
      '<path d="' + s.body + '" fill="' + fill + '" stroke="' + (light ? 'rgba(0,0,0,.25)' : 'rgba(231,219,199,.3)') + '" stroke-width="1.4" stroke-linejoin="round"/>' +
      '<path d="' + s.lines + '" fill="none" stroke="' + (light ? 'rgba(26,24,21,.25)' : 'rgba(231,219,199,.28)') + '" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"/>' +
      '</svg>';
  }
  function images(p, color) {
    if (p.colorImages) return p.colorImages[color] || [];
    return p.images || [];
  }
  function media(p, color, i, eager) {
    var list = images(p, color), src = list[i || 0];
    return src ? '<img src="' + esc(src) + '" alt="' + esc(p.name + ', ' + color) + '"' + (eager ? '' : ' loading="lazy"') + '>' : art(p, color);
  }

  /* ---------- fit profile ---------- */
  var fit = {
    get: function () { return store.get('vln_fit', null); },
    set: function (f) { store.set('vln_fit', f); refreshFitUI(); },
    rec: function (p, f) {
      f = f || fit.get(); if (!f) return null;
      var i = SIZES.indexOf(f.size), why = 'your usual ' + f.size;
      if (p.fit === 'slim' && (f.build === 'Broad' || f.build === 'Athletic')) { i++; why = 'a slim cut on a ' + f.build.toLowerCase() + ' build, so one size up'; }
      else if (p.fit === 'relaxed' && f.build === 'Slim') { i--; why = 'a relaxed cut on a slim build, so one size down'; }
      i = Math.max(0, Math.min(SIZES.length - 1, i));
      return { size: SIZES[i], why: why };
    }
  };
  var inStock = function (p, c, s) { return p.soldOut.indexOf(c + ':' + s) === -1; };
  var sizeAnyColor = function (p, s) { return p.colors.some(function (c) { return inStock(p, c, s); }); };
  function fitMatches(f) {
    return P.filter(function (p) { var r = fit.rec(p, f); return r && sizeAnyColor(p, r.size); }).length;
  }

  var FIT_Q = {
    height: ['5’6”', '5’9”', '6’0”', '6’3”'],
    build: ['Slim', 'Regular', 'Broad', 'Athletic'],
    size: SIZES
  };
  function fitForm(el, opts) {
    var cur = fit.get() || { height: FIT_Q.height[1], build: 'Regular', size: 'L' };
    var draft = Object.assign({}, cur);
    function row(key, label) {
      return '<div class="fitgate__row" role="group" aria-label="' + label + '"><span>' + label + '</span><div class="chips">' +
        FIT_Q[key].map(function (v) { return '<button type="button" class="chip" data-k="' + key + '" data-v="' + esc(v) + '" aria-pressed="' + (draft[key] === v) + '">' + esc(v) + '</button>'; }).join('') +
        '</div></div>';
    }
    el.innerHTML = row('height', 'Height') + row('build', 'Build') + row('size', 'Usual size') +
      '<div class="fitgate__actions"><button type="button" class="btn btn--solid" data-save>' + (opts.saveLabel || 'Show my fit') + '</button>' +
      (opts.secondary || '') + '</div><div class="fitgate__result" aria-live="polite"></div>';
    var result = $('.fitgate__result', el);
    function preview() {
      var n = fitMatches(draft);
      result.innerHTML = '<strong>' + n + ' of ' + P.length + '</strong> pieces are in stock in your size.';
    }
    el.addEventListener('click', function (e) {
      var b = e.target.closest('.chip');
      if (b) {
        draft[b.dataset.k] = b.dataset.v;
        $$('.chip[data-k="' + b.dataset.k + '"]', el).forEach(function (c) { c.setAttribute('aria-pressed', c === b); });
        preview();
      }
      if (e.target.closest('[data-save]')) { fit.set(Object.assign({}, draft)); preview(); if (opts.onSave) opts.onSave(draft); }
    });
    /* Keep this form in step when the profile is saved from somewhere else (header pop-up). */
    document.addEventListener('fitchange', function () {
      var f = fit.get(); if (!f || !el.isConnected) return;
      draft = Object.assign({}, f);
      $$('.chip', el).forEach(function (c) { c.setAttribute('aria-pressed', draft[c.dataset.k] === c.dataset.v); });
      preview();
    });
    preview();
  }

  /* ---------- cart ---------- */
  var cart = {
    items: store.get('vln_cart', []),
    save: function () { store.set('vln_cart', cart.items); renderCart(); },
    count: function () { return cart.items.reduce(function (a, l) { return a + l.qty; }, 0); },
    subtotal: function () { return cart.items.reduce(function (a, l) { var p = byId(l.id); return a + (p ? p.price * l.qty : 0); }, 0); },
    add: function (id, color, size, qty) {
      var l = cart.items.find(function (l) { return l.id === id && l.color === color && l.size === size; });
      if (l) l.qty = Math.min(9, l.qty + qty); else cart.items.push({ id: id, color: color, size: size, qty: qty });
      cart.save();
      var bc = $('.bag-count'); if (bc) { bc.classList.remove('bump'); void bc.offsetWidth; bc.classList.add('bump'); }
    }
  };
  cart.items = cart.items.filter(function (l) { return byId(l.id); });

  /* ---------- layout chrome ---------- */
  function chrome(page) {
    var nav = VLN.categories.map(function (c) {
      var cur = page === 'shop' && params.get('c') === c.id ? ' aria-current="page"' : '';
      return '<a href="shop.html?c=' + c.id + '"' + cur + '>' + c.name.replace(' & Polos', '') + '</a>';
    }).join('') + '<a href="shop.html"' + (page === 'shop' && !params.get('c') ? ' aria-current="page"' : '') + '>Shop all</a>';

    var top = document.createElement('div');
    top.innerHTML =
      '<div class="demo-ribbon">Portfolio demo by Ivan Abboud · sample products, checkout disabled' +
      '<a href="' + PORTFOLIO_URL + '">← Back to portfolio</a></div>' +
      '<div class="announce">Free shipping over ' + money(FREE_SHIP) + ' · Free 30-day returns</div>' +
      '<header class="header"><div class="wrap header__bar">' +
      '<div><button class="burger" aria-label="Menu" aria-expanded="false" aria-controls="mnav"><span></span><span></span><span></span></button><nav class="nav" aria-label="Main">' + nav + '</nav></div>' +
      '<a class="logo" href="index.html" aria-label="VALENOR home">VALENOR</a>' +
      '<div class="header__tools"><button class="fit-chip" data-open-fit><i></i><span>Fit profile</span></button>' +
      '<button class="t-search" data-open-search>Search</button>' +
      '<button data-open-cart aria-label="Open bag">Bag<span class="bag-count">0</span></button></div></div>' +
      '<nav class="mobile-nav" id="mnav" aria-label="Mobile">' + nav +
      '<button class="m-small" data-open-fit>Fit profile</button><button class="m-small" data-open-search>Search</button></nav></header>';
    document.body.prepend.apply(document.body, Array.prototype.slice.call(top.children));

    var tail = document.createElement('div');
    tail.innerHTML =
      '<footer class="footer"><div class="wrap"><div class="footer__grid">' +
      '<div><span class="logo">VALENOR</span><p style="max-width:34ch;margin:0">Menswear defined by character. A fit-first storefront concept.</p></div>' +
      '<div><h4>Shop</h4><ul>' + VLN.categories.map(function (c) { return '<li><a href="shop.html?c=' + c.id + '">' + c.name + '</a></li>'; }).join('') + '</ul></div>' +
      '<div><h4>Help</h4><ul><li><button data-demo>Shipping</button></li><li><button data-demo>Returns</button></li><li><button data-open-fit>Size &amp; fit</button></li><li><button data-demo>Contact</button></li></ul></div>' +
      '<div><h4>This build</h4><ul><li>Hand-coded HTML, CSS &amp; JS</li><li>Structured like a Shopify theme</li><li><a href="' + UPWORK_URL + '" target="_blank" rel="noopener">Hire me on Upwork ↗</a></li><li><a href="' + PORTFOLIO_URL + '">More work ↗</a></li></ul></div>' +
      '</div><div class="footer__base"><span>© 2026 VALENOR, demo brand</span><span>Designed &amp; built by Ivan Abboud</span></div></div></footer>' +
      '<div class="scrim" data-close></div>' +
      '<aside class="drawer" id="cart" role="dialog" aria-modal="true" aria-label="Shopping bag" tabindex="-1"></aside>' +
      '<div class="search" role="dialog" aria-modal="true" aria-label="Search"><div class="wrap"><div class="search__bar">' +
      '<label for="q" class="sr-only">Search products</label><input id="q" type="search" placeholder="Search polos, trousers, onyx…" autocomplete="off">' +
      '<button class="close" data-close aria-label="Close search">×</button></div><div class="search__results"></div></div></div>' +
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal__box dark"></div></div>' +
      '<div class="toast" role="status" aria-live="polite"></div>';
    Array.prototype.slice.call(tail.children).forEach(function (n) { document.body.appendChild(n); });

    var burger = $('.burger'), mnav = $('#mnav');
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') !== 'true';
      burger.setAttribute('aria-expanded', open); mnav.classList.toggle('is-open', open);
    });

    document.addEventListener('click', function (e) {
      var t = e.target;
      if (t.closest('[data-open-cart]')) { e.preventDefault(); openCart(); }
      else if (t.closest('[data-open-search]')) { e.preventDefault(); openSearch(); }
      else if (t.closest('[data-open-fit]')) { e.preventDefault(); openFit(); }
      else if (t.closest('[data-demo]')) { toast('Policy pages are part of a full build. This demo covers the shopping flow.'); }
      else if (t.closest('[data-close]') || t.classList.contains('modal')) closeAll();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });
    renderCart();
    refreshFitUI();
  }

  var lastFocus = null;
  function lock(on) { document.body.classList.toggle('is-locked', on); $('.scrim').classList.toggle('is-open', on); }
  function closeAll() {
    ['#cart', '.search', '.modal', '#mnav'].forEach(function (s) { var el = $(s); if (el) el.classList.remove('is-open'); });
    var bg = $('.burger'); if (bg) bg.setAttribute('aria-expanded', 'false');
    lock(false);
    if (lastFocus && lastFocus.focus) { lastFocus.focus(); lastFocus = null; }
  }
  function openCart() { closeAll(); var t = $('.toast'); if (t) t.classList.remove('is-on'); lastFocus = document.activeElement; renderCart(); $('#cart').classList.add('is-open'); lock(true); setTimeout(function () { $('#cart').focus(); }, 50); }
  function openSearch() {
    closeAll(); lastFocus = document.activeElement; $('.search').classList.add('is-open'); lock(true);
    var q = $('#q'); renderSearch(q.value); setTimeout(function () { q.focus(); }, 80);
  }
  function openModal(html) { closeAll(); lastFocus = document.activeElement; $('.modal__box').innerHTML = '<button class="close" data-close aria-label="Close">×</button>' + html; $('.modal').classList.add('is-open'); lock(true); }
  function openFit() {
    openModal('<div class="dark" style="text-align:left"><span class="eyebrow">Fit profile</span><h2 class="h2" id="modal-title">Three questions.</h2>' +
      '<p>We use them to pick your size on every product and flag what is in stock for you.</p><div class="fitgate" style="border:0;padding-top:4px;margin-top:10px"></div></div>');
    fitForm($('.modal .fitgate'), { saveLabel: 'Save profile', onSave: function () { setTimeout(function () { closeAll(); toast('Fit profile saved. Sizes are now picked for you.'); }, 350); } });
  }
  var toastT;
  function toast(msg) { var t = $('.toast'); t.textContent = msg; t.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('is-on'); }, 3200); }

  function refreshFitUI() {
    var f = fit.get();
    $$('.fit-chip').forEach(function (c) { c.classList.toggle('is-on', !!f); var s = $('span', c); if (s) s.textContent = f ? 'Your fit: ' + f.size : 'Fit profile'; });
    $$('[data-card]').forEach(function (el) { var p = byId(el.dataset.card); var qb = $('.card__quick', el); if (qb) qb.textContent = quickLabel(p); var seal = $('.fitseal', el); var html = sealHTML(p); if (seal) seal.outerHTML = html || ''; else if (html) $('.card__media', el).insertAdjacentHTML('beforeend', html); });
    document.dispatchEvent(new CustomEvent('fitchange'));
  }

  /* ---------- product card ---------- */
  function sealHTML(p) {
    var r = fit.rec(p); if (!r) return '';
    return sizeAnyColor(p, r.size)
      ? '<span class="fitseal">Your <b>' + r.size + '</b> · in stock</span>'
      : '<span class="fitseal is-out">Your ' + r.size + ' · sold out</span>';
  }
  function quickLabel(p) {
    var r = fit.rec(p);
    if (!r) return 'Choose size';
    return sizeAnyColor(p, r.size) ? 'Quick add · ' + r.size : 'View options';
  }
  function priceHTML(p) {
    return p.compareAt ? '<s>' + money(p.compareAt) + '</s><span class="is-sale">' + money(p.price) + '</span>' : money(p.price);
  }
  function card(p) {
    var c = p.colors[0], badge = p.compareAt ? '<span class="badge badge--sale">Sale</span>' : (p.badge ? '<span class="badge">' + p.badge + '</span>' : '');
    return '<article class="card reveal" data-card="' + p.id + '"><div class="card__media">' + badge + media(p, c, 0) + sealHTML(p) +
      '<button class="card__quick" data-quick="' + p.id + '">' + quickLabel(p) + '</button></div>' +
      '<div class="card__info"><a class="card__name card__link" href="product.html?p=' + p.id + '">' + esc(p.name) + '</a><span class="card__price">' + priceHTML(p) + '</span>' +
      '<div class="card__meta">' + p.colors.map(function (c) { return '<span class="dot" title="' + c + '" style="background:' + VLN.colors[c] + '"></span>'; }).join('') + '<small>' + catName(p.cat) + '</small></div></div></article>';
  }
  document.addEventListener('click', function (e) {
    var q = e.target.closest('[data-quick]'); if (!q) return;
    e.preventDefault();
    var p = byId(q.dataset.quick), r = fit.rec(p);
    var color = p.colors.find(function (c) { return r && inStock(p, c, r.size); });
    if (r && color) { cart.add(p.id, color, r.size, 1); openCart(); }
    else location.href = 'product.html?p=' + p.id;
  });

  /* ---------- cart drawer ---------- */
  function renderCart() {
    var bc = $('.bag-count'); if (bc) bc.textContent = cart.count();
    var d = $('#cart'); if (!d) return;
    var sub = cart.subtotal(), left = Math.max(0, FREE_SHIP - sub), pct = Math.min(100, sub / FREE_SHIP * 100);
    var head = '<div class="drawer__head"><h2>Your bag' + (cart.count() ? ' (' + cart.count() + ')' : '') + '</h2><button class="close" data-close aria-label="Close bag">×</button></div>';
    if (!cart.items.length) {
      d.innerHTML = head + '<div class="drawer__lines"><div class="drawer__empty"><p>Your bag is empty.</p><a class="btn btn--solid" href="shop.html">Shop the collection</a></div></div>';
      return;
    }
    d.innerHTML = head +
      '<div class="ship-bar">' + (left ? 'You are <b>' + money(left) + '</b> away from free shipping.' : '<b>Free shipping</b> unlocked.') +
      '<div class="ship-bar__track"><div class="ship-bar__fill" style="width:' + pct + '%"></div></div></div>' +
      '<div class="drawer__lines">' + cart.items.map(function (l, i) {
        var p = byId(l.id);
        return '<div class="line"><a class="line__media" href="product.html?p=' + p.id + '&color=' + l.color + '">' + media(p, l.color, 0) + '</a>' +
          '<div><a class="line__name" href="product.html?p=' + p.id + '">' + esc(p.name) + '</a><div class="line__var">' + l.color + ' / ' + l.size + '</div>' +
          '<div class="qty"><button data-q="' + i + '" data-d="-1" aria-label="Decrease">−</button><span>' + l.qty + '</span><button data-q="' + i + '" data-d="1" aria-label="Increase">+</button></div></div>' +
          '<div class="line__right"><span>' + money(p.price * l.qty) + '</span><button class="line__remove" data-rm="' + i + '">Remove</button></div></div>';
      }).join('') + '</div>' +
      '<div class="drawer__foot"><div class="drawer__row"><span>Subtotal</span><span>' + money(sub) + '</span></div>' +
      '<div class="drawer__row"><span>Shipping</span><span>' + (left ? 'Calculated at checkout' : 'Free') + '</span></div>' +
      '<div class="drawer__row total"><span>Total</span><span>' + money(sub) + '</span></div>' +
      '<button class="btn btn--solid" data-checkout>Checkout</button><p class="drawer__note">Taxes calculated at checkout.</p></div>';
  }
  document.addEventListener('click', function (e) {
    var q = e.target.closest('[data-q]'), rm = e.target.closest('[data-rm]');
    if (q) { var l = cart.items[+q.dataset.q]; l.qty = Math.max(0, Math.min(9, l.qty + +q.dataset.d)); if (!l.qty) cart.items.splice(+q.dataset.q, 1); cart.save(); }
    if (rm) { cart.items.splice(+rm.dataset.rm, 1); cart.save(); }
    if (e.target.closest('[data-checkout]')) {
      openModal('<span class="eyebrow">Portfolio demo</span><h2 class="h2" id="modal-title">Checkout is <em>switched off.</em></h2>' +
        '<p>This is a design and front-end demo, so no order is placed and nothing is charged.</p>' +
        '<p>On a live build this hands off to Shopify checkout with the payment methods the market needs.</p>' +
        '<div class="pay-methods"><span>Card</span><span>Apple Pay</span><span>PayPal</span><span>Paystack</span><span>Mobile Money</span></div>' +
        '<a class="btn btn--solid" href="' + UPWORK_URL + '" target="_blank" rel="noopener">Want a store like this?</a>');
    }
  });

  /* ---------- search ---------- */
  function renderSearch(q) {
    var box = $('.search__results'); q = (q || '').trim().toLowerCase();
    var list = q ? P.filter(function (p) { return (p.name + ' ' + catName(p.cat) + ' ' + p.colors.join(' ')).toLowerCase().indexOf(q) > -1; }) : P.filter(function (p) { return p.badge === 'Bestseller'; });
    box.innerHTML = '<p class="search__hint">' + (q ? list.length + ' result' + (list.length === 1 ? '' : 's') + ' for “' + esc(q) + '”' : 'Popular right now') + '</p>' +
      (list.length ? '<div class="grid" style="margin-top:18px">' + list.slice(0, 8).map(card).join('') + '</div>'
        : '<p class="search__hint" style="margin-top:10px">Try \u201cpolo\u201d, \u201clinen\u201d or a colour like \u201conyx\u201d.</p>');
    $$('.reveal', box).forEach(function (el) { el.classList.add('is-in'); });
  }
  document.addEventListener('input', function (e) { if (e.target.id === 'q') renderSearch(e.target.value); });

  /* ---------- reveal on scroll ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  function reveal(root) { $$('.reveal:not(.is-in)', root).forEach(function (el) { io ? io.observe(el) : el.classList.add('is-in'); }); }

  /* ---------- pages ---------- */
  var pages = {};

  pages.home = function () {
    fitForm($('#fitgate'), {
      secondary: '<a class="btn btn--ghost" href="shop.html">Browse everything</a>',
      onSave: function () { toast('Fit profile saved. Every product now shows your size.'); }
    });
    var shirts = P.filter(function (p) { return p.cat === 'shirts'; }).slice(0, 4);
    $('#edit-grid').innerHTML = shirts.map(card).join('');
    var best = P.filter(function (p) { return p.badge === 'Bestseller'; });
    best = best.concat(P.filter(function (p) { return best.indexOf(p) === -1; })).slice(0, 8);
    $('#best-grid').innerHTML = best.map(card).join('');
    $('#cat-index').innerHTML = VLN.categories.map(function (c, i) {
      var n = P.filter(function (p) { return p.cat === c.id; }).length;
      return '<a class="cat-row reveal" href="shop.html?c=' + c.id + '"><span class="cat-row__n">0' + (i + 1) + '</span><span class="cat-row__name">' + c.name + '</span>' +
        '<span class="cat-row__blurb">' + c.blurb + ' ' + n + ' pieces</span><span class="cat-row__arrow">→</span></a>';
    }).join('');
    $('#news').addEventListener('submit', function (e) {
      e.preventDefault(); $('.newsletter__msg').textContent = 'Thanks. (Demo: nothing was sent.)'; e.target.reset();
    });
  };

  pages.shop = function () {
    var cat = params.get('c'), sort = params.get('sort') || 'featured', mine = params.get('mine') === '1';
    var c = VLN.categories.find(function (x) { return x.id === cat; });
    $('#shop-title').innerHTML = c ? esc(c.name) : 'Shop <em>all</em>';
    $('#shop-lede').textContent = c ? c.blurb : 'Every piece, cut to a fit you can predict.';
    document.title = (c ? c.name : 'Shop all') + ' — VALENOR';
    $('#tabs').innerHTML = '<a class="tab" href="shop.html" aria-current="' + !c + '">All</a>' + VLN.categories.map(function (x) {
      return '<a class="tab" href="shop.html?c=' + x.id + '" aria-current="' + (cat === x.id) + '">' + x.name + '</a>';
    }).join('');
    var sel = $('#sort'), tog = $('#mine');
    sel.value = sort;
    function draw() {
      var f = fit.get();
      tog.disabled = !f; if (!f) tog.checked = false;
      $('#mine-label').textContent = f ? 'Only my size in stock (' + f.size + ')' : 'Only my size (set a fit profile)';
      var list = P.filter(function (p) { return !c || p.cat === c.id; });
      if (tog.checked && f) list = list.filter(function (p) { return sizeAnyColor(p, fit.rec(p).size); });
      if (sel.value === 'low') list.sort(function (a, b) { return a.price - b.price; });
      if (sel.value === 'high') list.sort(function (a, b) { return b.price - a.price; });
      if (sel.value === 'new') list.sort(function (a, b) { return (b.badge === 'New') - (a.badge === 'New'); });
      $('#count').textContent = list.length + ' piece' + (list.length === 1 ? '' : 's');
      $('#shop-grid').innerHTML = list.length ? list.map(card).join('') : '<p class="empty">Nothing here in your size right now. Try another category.</p>';
      reveal($('#shop-grid'));
      var u = new URL(location.href);
      sel.value === 'featured' ? u.searchParams.delete('sort') : u.searchParams.set('sort', sel.value);
      tog.checked ? u.searchParams.set('mine', '1') : u.searchParams.delete('mine');
      history.replaceState(null, '', u);
    }
    tog.checked = mine;
    $('#fit-open').addEventListener('click', openFit);
    sel.addEventListener('change', draw); tog.addEventListener('change', draw);
    document.addEventListener('fitchange', draw);
    draw();
  };

  pages.product = function () {
    var p = byId(params.get('p'));
    if (!p) { location.replace('shop.html'); return; }
    document.title = p.name + ' — VALENOR';
    var state = { color: p.colors.indexOf(params.get('color')) > -1 ? params.get('color') : p.colors[0], size: null, qty: 1, img: 0 };
    function pickRec() {
      var r = fit.rec(p);
      state.size = r && inStock(p, state.color, r.size) ? r.size : (state.size && inStock(p, state.color, state.size) ? state.size : null);
    }
    pickRec();
    var root = $('#pdp');
    $('#crumbs').innerHTML = '<a href="index.html">Home</a> / <a href="shop.html?c=' + p.cat + '">' + catName(p.cat) + '</a> / ' + esc(p.name);

    function sizeTable() {
      var chest = [96, 102, 108, 114, 120], len = [68, 70, 72, 74, 76];
      if (p.cat === 'trousers') return '<table class="size-table"><tr><th>Size</th><th>Waist (cm)</th><th>Inseam (cm)</th></tr>' + SIZES.map(function (s, i) { return '<tr><td>' + s + '</td><td>' + (76 + i * 6) + '–' + (81 + i * 6) + '</td><td>' + (79 + Math.min(i, 3)) + '</td></tr>'; }).join('') + '</table>';
      return '<table class="size-table"><tr><th>Size</th><th>Chest (cm)</th><th>Length (cm)</th></tr>' + SIZES.map(function (s, i) { return '<tr><td>' + s + '</td><td>' + chest[i] + '</td><td>' + len[i] + '</td></tr>'; }).join('') + '</table>';
    }

    root.innerHTML =
      '<div class="gallery"><div class="gallery__main"></div><div class="gallery__thumbs"></div></div>' +
      '<div class="buy"><span class="eyebrow">' + catName(p.cat) + ' · ' + p.fit + ' fit</span><h1>' + esc(p.name) + '</h1>' +
      '<div class="buy__price">' + (p.compareAt ? '<span style="color:var(--sale)">' + money(p.price) + '</span><s>' + money(p.compareAt) + '</s><span class="save">Save ' + Math.round((1 - p.price / p.compareAt) * 100) + '%</span>' : '<span>' + money(p.price) + '</span>') + '</div>' +
      '<p class="buy__blurb">' + esc(p.blurb) + '</p>' +
      '<div class="opt"><div class="opt__head"><span>Colour<b id="color-name"></b></span></div><div class="swatches">' +
      p.colors.map(function (c) { return '<button class="swatch" data-color="' + c + '" aria-label="' + c + '"><span style="background:' + VLN.colors[c] + '"></span></button>'; }).join('') + '</div></div>' +
      '<div class="opt"><div class="opt__head"><span>Size<b id="size-name"></b></span><button type="button" data-open-fit>' + (fit.get() ? 'Edit fit profile' : 'Find my size') + '</button></div>' +
      '<div class="sizes">' + SIZES.map(function (s) { return '<button class="size" data-size="' + s + '">' + s + '</button>'; }).join('') + '</div>' +
      '<div class="fitnote" id="fitnote"></div></div>' +
      '<div class="buy__actions"><div class="qty"><button data-pq="-1" aria-label="Decrease quantity">−</button><span id="pqty">1</span><button data-pq="1" aria-label="Increase quantity">+</button></div>' +
      '<button class="btn btn--solid" id="add">Add to bag</button></div>' +
      '<div class="buy__stock" id="stock" aria-live="polite"></div>' +
      '<div class="buy__trust"><span>Free shipping over ' + money(FREE_SHIP) + '</span><span>Free 30-day returns</span><span>Ships in 2–4 days</span><span>Pay by card or mobile money</span></div>' +
      '<div class="acc"><details open><summary>Details</summary><div class="acc__body"><ul>' + p.details.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ul></div></details>' +
      '<details><summary>Size guide</summary><div class="acc__body">' + sizeTable() + '</div></details>' +
      '<details><summary>Shipping &amp; returns</summary><div class="acc__body">Orders ship in 2–4 working days. Free shipping over ' + money(FREE_SHIP) + '. Returns are free within 30 days: unworn, tags on.</div></details></div>' +
      '</div>';

    var sticky = document.createElement('div');
    sticky.className = 'sticky-buy';
    sticky.innerHTML = '<div><b>' + esc(p.name) + '</b><span id="sticky-var"></span></div><button class="btn btn--solid" id="add2">Add · ' + money(p.price) + '</button>';
    document.body.appendChild(sticky);

    function draw() {
      var list = images(p, state.color), main = $('.gallery__main', root), thumbs = $('.gallery__thumbs', root);
      if (state.img >= Math.max(1, list.length)) state.img = 0;
      main.innerHTML = media(p, state.color, state.img, true);
      thumbs.innerHTML = list.length > 1 ? list.map(function (_, i) { return '<button data-img="' + i + '" aria-label="Image ' + (i + 1) + '" aria-current="' + (i === state.img) + '">' + media(p, state.color, i) + '</button>'; }).join('') : '';
      $('#color-name').textContent = state.color;
      $$('.swatch', root).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.color === state.color); });
      var r = fit.rec(p);
      $$('.size', root).forEach(function (b) {
        var s = b.dataset.size, ok = inStock(p, state.color, s);
        b.disabled = !ok; b.setAttribute('aria-pressed', s === state.size);
        b.classList.toggle('is-rec', !!r && r.size === s);
        b.setAttribute('aria-label', s + (ok ? '' : ', sold out') + (r && r.size === s ? ', recommended for you' : ''));
      });
      $('#size-name').textContent = state.size || '';
      var note = $('#fitnote');
      if (!r) note.innerHTML = 'Not sure? <button type="button" data-open-fit>Answer three questions</button> and we’ll pick your size.';
      else if (inStock(p, state.color, r.size)) note.innerHTML = 'We’d pick <b>' + r.size + '</b> for you: ' + r.why + '.';
      else {
        var alt = p.colors.filter(function (c) { return inStock(p, c, r.size); });
        note.innerHTML = alt.length
          ? 'Your size (' + r.size + ') is sold out in ' + state.color + '. Still available in ' + alt.join(' and ') + '.'
          : 'Your size (' + r.size + ') is sold out in every colour right now. The size guide below can help you pick the next best fit.';
      }
      $('#pqty').textContent = state.qty;
      var add = $('#add');
      add.textContent = state.size ? 'Add to bag · ' + money(p.price * state.qty) : 'Select a size';
      $('#stock').textContent = state.size ? 'In stock · ' + state.color + ' / ' + state.size : '';
      $('#sticky-var').textContent = state.size ? state.color + ' / ' + state.size : state.color + ' · select a size';
      var u = new URL(location.href); u.searchParams.set('color', state.color); history.replaceState(null, '', u);
    }
    function doAdd() {
      if (!state.size) {
        var sz = $('.sizes', root); sz.scrollIntoView({ behavior: 'smooth', block: 'center' });
        sz.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 320 });
        toast('Pick a size first.'); return;
      }
      cart.add(p.id, state.color, state.size, state.qty); openCart();
    }
    root.addEventListener('click', function (e) {
      var sw = e.target.closest('.swatch'), sz = e.target.closest('.size'), th = e.target.closest('[data-img]'), q = e.target.closest('[data-pq]');
      if (sw) { state.color = sw.dataset.color; state.img = 0; if (state.size && !inStock(p, state.color, state.size)) state.size = null; if (!state.size) pickRec(); draw(); }
      if (sz && !sz.disabled) { state.size = sz.dataset.size; draw(); }
      if (th) { state.img = +th.dataset.img; draw(); }
      if (q) { state.qty = Math.max(1, Math.min(9, state.qty + +q.dataset.pq)); draw(); }
    });
    $('#add').addEventListener('click', doAdd);
    $('#add2').addEventListener('click', doAdd);
    document.addEventListener('fitchange', function () { pickRec(); draw(); var b = $('.opt__head [data-open-fit]', root); if (b) b.textContent = 'Edit fit profile'; });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { sticky.classList.toggle('is-on', !es[0].isIntersecting && es[0].boundingClientRect.top < 0); }).observe($('#add'));
    }
    draw();

    var others = P.filter(function (x) { return x.cat !== p.cat; }), start = P.indexOf(p), rel = [];
    for (var i = 0; rel.length < 4 && i < others.length * 2; i++) {
      var pick = others[(start + i * 3) % others.length];
      if (rel.indexOf(pick) === -1) rel.push(pick);
    }
    others.forEach(function (x) { if (rel.length < 4 && rel.indexOf(x) === -1) rel.push(x); });
    $('#related').innerHTML = rel.map(card).join('');
  };

  /* ---------- boot ---------- */
  var page = document.body.dataset.page;
  chrome(page);
  if (pages[page]) pages[page]();
  reveal(document);
})();
