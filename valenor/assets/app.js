/* VALENOR demo storefront: layout, fit profile, wardrobe, The Four, bag, and page renderers. */
(function () {
  'use strict';

  var PORTFOLIO_URL = 'https://ivanabboud-dev.github.io/ivan-portfolio/';
  var UPWORK_URL = 'https://www.upwork.com/freelancers/~012909be92032bae15';
  var FREE_SHIP = 150;
  var CAPSULE_OFF = 0.15;
  var P = VLN.products;

  /* ---------- helpers ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var money = function (n) { return '$' + (Math.round(n * 100) / 100).toFixed(2); };
  var whole = function (n) { return '$' + Math.round(n); };
  var byId = function (id) { return P.find(function (p) { return p.id === id; }); };
  var cat = function (id) { return VLN.categories.find(function (c) { return c.id === id; }) || {}; };
  var fourById = function (id) { return VLN.four.find(function (f) { return f.id === id; }); };
  var params = new URLSearchParams(location.search);
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } }
  };

  /* ---------- product art (line drawings until real photos are added) ---------- */
  var SHAPES = {
    tee: { body: 'M140 95 L108 106 L64 150 L88 200 L118 184 L118 404 L282 404 L282 184 L312 200 L336 150 L292 106 L260 95 Q200 124 140 95 Z', lines: 'M140 95 Q200 124 260 95 M118 384 L282 384' },
    polo: { body: 'M140 95 L112 104 L60 150 L86 205 L118 184 L118 400 L282 400 L282 184 L314 205 L340 150 L288 104 L260 95 Q200 132 140 95 Z', lines: 'M140 95 L170 146 L200 118 L230 146 L260 95 M200 118 L200 176 M118 380 L282 380' },
    shirt: { body: 'M140 95 L112 104 L60 150 L86 205 L118 184 L118 404 L282 404 L282 184 L314 205 L340 150 L288 104 L260 95 Q200 126 140 95 Z', lines: 'M140 95 L176 160 L200 116 L224 160 L260 95 M200 116 L200 404 M150 200 L180 200 L180 228 L150 228 Z' },
    knit: { body: 'M142 92 L108 104 L78 180 L64 360 L98 364 L118 222 L118 400 L282 400 L282 222 L302 364 L336 360 L322 180 L292 104 L258 92 L240 70 L160 70 Z', lines: 'M160 70 L240 70 M200 70 L200 150 M118 382 L282 382 M66 344 L98 348 M334 344 L302 348 M150 110 L150 380 M175 110 L175 380 M225 110 L225 380 M250 110 L250 380' },
    jacket: { body: 'M142 88 L106 100 L74 180 L60 368 L96 372 L118 226 L118 410 L282 410 L282 226 L304 372 L340 368 L326 180 L294 100 L258 88 L246 64 L154 64 Z', lines: 'M154 64 L246 64 M200 64 L200 410 M142 88 L178 150 M258 88 L222 150 M132 290 L180 290 L180 336 L132 336 Z M220 290 L268 290 L268 336 L220 336 Z M118 390 L282 390' },
    coat: { body: 'M142 80 L106 94 L74 180 L60 380 L96 384 L118 226 L112 452 L288 452 L282 226 L304 384 L340 380 L326 180 L294 94 L258 80 L200 140 Z', lines: 'M142 80 L186 170 L200 140 L214 170 L258 80 M200 170 L200 452 M186 230 L186 234 M186 290 L186 294 M186 350 L186 354 M128 320 L170 320 M230 320 L272 320' },
    trouser: { body: 'M130 58 L270 58 L288 452 L222 452 L202 176 L198 176 L178 452 L112 452 Z', lines: 'M130 82 L270 82 M200 82 L200 176 M160 82 L166 250 M240 82 L234 250 M146 96 Q160 118 150 138 M254 96 Q240 118 250 138' }
  };
  function lum(hex) {
    var n = parseInt(hex.slice(1), 16);
    return (.2126 * (n >> 16) + .7152 * (n >> 8 & 255) + .0722 * (n & 255)) / 255;
  }
  function art(p, color) {
    var s = SHAPES[p.shape] || SHAPES.shirt, fill = VLN.colors[color] || '#777', light = lum(fill) > .55;
    return '<svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' + esc(p.name + ', ' + color) + '">' +
      '<ellipse cx="200" cy="470" rx="120" ry="9" fill="rgba(0,0,0,.5)"/>' +
      '<path d="' + s.body + '" fill="' + fill + '" stroke="rgba(214,197,168,.42)" stroke-width="1.2" stroke-linejoin="round"/>' +
      '<path d="' + s.lines + '" fill="none" stroke="' + (light ? 'rgba(11,11,10,.3)' : 'rgba(214,197,168,.3)') + '" stroke-width="1.1" stroke-linejoin="round" stroke-linecap="round"/>' +
      '</svg>';
  }
  function imgs(p, color) { return p.colorImages ? (p.colorImages[color] || []) : (p.images || []); }
  function media(p, color, i, eager) {
    var src = imgs(p, color)[i || 0];
    return src ? '<img src="' + esc(src) + '" alt="' + esc(p.name + ', ' + color) + '"' + (eager ? '' : ' loading="lazy"') + '>' : art(p, color);
  }

  /* ---------- fit profile ---------- */
  var FIT_Q = [
    { key: 'height', label: 'Height', opts: ['5′6″', '5′9″', '6′0″', '6′3″'] },
    { key: 'build', label: 'Build', opts: ['Slim', 'Regular', 'Broad', 'Athletic'] },
    { key: 'size', label: 'Usual size', opts: ['S', 'M', 'L', 'XL'] }
  ];
  var DEFAULT_FIT = { height: '5′9″', build: 'Regular', size: 'L' };
  var MATCH = {
    'true': { Slim: 90, Regular: 92, Broad: 89, Athletic: 88 },
    slim: { Slim: 95, Regular: 91, Broad: 85, Athletic: 86 },
    roomy: { Slim: 86, Regular: 88, Broad: 93, Athletic: 91 },
    boxy: { Slim: 81, Regular: 84, Broad: 90, Athletic: 88 }
  };
  var WAIST = { S: '30', M: '32', L: '33', XL: '34' };
  var fit = {
    get: function () {
      var f = store.get('vln_fit', null);
      var ok = f && FIT_Q.every(function (q) { return q.opts.indexOf(f[q.key]) > -1; });
      return ok ? f : Object.assign({}, DEFAULT_FIT);
    },
    set: function (f) { store.set('vln_fit', f); refreshFit(); },
    line: function (f) { f = f || fit.get(); return f.height + ' · ' + f.build + ' · ' + f.size; },
    rec: function (p, f) {
      f = f || fit.get();
      var bigBuild = f.build === 'Broad' || f.build === 'Athletic', tall = FIT_Q[0].opts.indexOf(f.height) >= 2;
      var list = sizesFor(p), i, note, why;
      if (p.cat === 'trousers') {
        i = VLN.waists.indexOf(WAIST[f.size]);
        if (bigBuild) i++;
        if (p.cut === 'roomy' && f.build === 'Slim') i--;
        note = p.cut === 'roomy' ? 'Roomy leg' : 'True to size';
        why = 'Waist ' + list[Math.max(0, Math.min(list.length - 1, i))] + ' for a usual ' + f.size + (bigBuild ? ', one up for a ' + f.build.toLowerCase() + ' build' : '') + '.';
        if (tall) { note += ' · long leg'; why += ' Long leg for ' + f.height + '.'; }
      } else {
        i = VLN.topSizes.indexOf(f.size);
        if (p.cut === 'slim' && bigBuild) { i++; note = 'Slim cut · sized up'; why = 'A slim cut on a ' + f.build.toLowerCase() + ' build, so one size up.'; }
        else if (p.cut === 'roomy' && !bigBuild) { i--; note = 'Roomy cut · size down'; why = 'Cut roomy, so one size down from your usual ' + f.size + '.'; }
        else if (p.cut === 'boxy') { note = 'Boxy'; why = 'Boxy by design. Your usual ' + f.size + ' gives the intended drape.'; }
        else { note = p.cut === 'slim' ? 'Slim cut' : 'Runs true'; why = 'Runs true to size, so your usual ' + f.size + '.'; }
      }
      i = Math.max(0, Math.min(list.length - 1, i));
      var match = Math.max(72, Math.min(98, MATCH[p.cut][f.build] + (p.adj || 0) - (p.cat === 'trousers' && f.height === FIT_Q[0].opts[0] ? 2 : 0)));
      return { size: list[i], length: p.cat === 'trousers' ? (tall ? 'Long' : 'Regular') : null, note: note, why: why, match: match,
        label: 'Your ' + list[i], fitnote: note.indexOf('·') > -1 ? note : note + ' · ' + match + '% fit match' };
    }
  };
  function sizesFor(p) { return p.cat === 'trousers' ? VLN.waists : VLN.topSizes; }
  var inStock = function (p, c, s) { return p.out.indexOf(c + ':' + s) === -1 && (p.gone || []).indexOf(s) === -1; };
  var anyColor = function (p, s) { return p.colors.some(function (c) { return inStock(p, c, s); }); };
  var fitsYou = function (p, f) { return anyColor(p, fit.rec(p, f).size); };
  var fitCount = function (f) { return P.filter(function (p) { return fitsYou(p, f); }).length; };

  function fitForm(el, opts) {
    var draft = fit.get();
    el.innerHTML = '<div class="fitrows">' + FIT_Q.map(function (q) {
      return '<div class="fitrow" role="group" aria-label="' + q.label + '"><span class="fitrow__label">' + q.label + '</span><div class="chips">' +
        q.opts.map(function (o) { return '<button type="button" class="chip" data-k="' + q.key + '" data-v="' + esc(o) + '" aria-pressed="' + (draft[q.key] === o) + '">' + esc(o) + '</button>'; }).join('') +
        '</div></div>';
    }).join('') + '</div>';
    function sync() { $$('.chip', el).forEach(function (c) { c.setAttribute('aria-pressed', draft[c.dataset.k] === c.dataset.v); }); }
    el.addEventListener('click', function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      draft[b.dataset.k] = b.dataset.v; sync();
      if (opts.live) fit.set(Object.assign({}, draft));
      if (opts.onChange) opts.onChange(draft);
    });
    if (opts.live) document.addEventListener('fitchange', function () { if (el.isConnected) { draft = fit.get(); sync(); } });
    return { get: function () { return draft; } };
  }

  /* ---------- bag ---------- */
  var cart = {
    items: store.get('vln_bag', []).filter(function (l) { return l && byId(l.id); }),
    save: function () { store.set('vln_bag', cart.items); renderBag(); document.dispatchEvent(new CustomEvent('bagchange')); },
    count: function () { return cart.items.reduce(function (a, l) { return a + l.qty; }, 0); },
    subtotal: function () { return cart.items.reduce(function (a, l) { return a + byId(l.id).price * l.qty; }, 0); },
    add: function (id, color, size, qty, extra) {
      extra = extra || {};
      var l = cart.items.find(function (l) { return l.id === id && l.color === color && l.size === size && (l.length || null) === (extra.length || null) && (l.bundle || null) === (extra.bundle || null); });
      if (l) l.qty = Math.min(9, l.qty + qty);
      else cart.items.push({ id: id, color: color, size: size, length: extra.length || null, qty: qty, bundle: extra.bundle || null });
      cart.save();
    },
    has: function (id, bundle) { return cart.items.some(function (l) { return l.id === id && (!bundle || l.bundle === bundle); }); },
    discounts: function () {
      var out = [], g = VLN.gapBundle;
      if (g.items.every(function (it) { return cart.has(it[0], 'gap'); })) out.push({ label: 'Fill-the-gap bundle', amount: g.save });
      VLN.four.forEach(function (f) {
        var lines = cart.items.filter(function (l) { return l.bundle === 'cap-' + f.id; });
        if (lines.length >= 3) out.push({ label: f.name.replace('The ', '') + ' capsule · 15%', amount: Math.round(lines.reduce(function (a, l) { return a + byId(l.id).price * l.qty; }, 0) * CAPSULE_OFF * 100) / 100 });
      });
      return out;
    }
  };
  /* Pick a colour/size that is actually in stock, starting from the fit recommendation. */
  function bestVariant(p, color) {
    var r = fit.rec(p), list = sizesFor(p), start = list.indexOf(r.size), c, d, sgn, s;
    var colors = color ? [color].concat(p.colors.filter(function (x) { return x !== color; })) : p.colors;
    for (c = 0; c < colors.length; c++) if (inStock(p, colors[c], r.size)) return { color: colors[c], size: r.size, length: r.length, exact: true };
    /* Nothing in the picked size: go up a size first (safer), unless we already sized up. */
    var order = /sized up/.test(r.note) ? [-1, 1] : [1, -1];
    for (d = 1; d < list.length; d++) {
      for (var o = 0; o < 2; o++) {
        sgn = order[o]; s = list[start + d * sgn]; if (!s) continue;
        for (c = 0; c < colors.length; c++) if (inStock(p, colors[c], s)) return { color: colors[c], size: s, length: r.length, exact: false };
      }
    }
    return null;
  }

  /* ---------- layout ---------- */
  function chrome(page) {
    var nav = '<a href="shop.html?sort=new">New</a>' +
      VLN.categories.map(function (c) { return '<a href="shop.html?c=' + c.id + '">' + c.short + '</a>'; }).join('') +
      '<a href="index.html#the-four">The Four</a>';
    var joined = store.get('vln_joined', false);
    var top = document.createElement('div');
    top.innerHTML =
      '<div class="demo-line"><span><span class="d-hide">Portfolio demo · sample products, checkout off</span><span class="d-show">Portfolio demo</span></span><a href="' + PORTFOLIO_URL + '">← Back to portfolio</a></div>' +
      '<div class="dropbar"><span class="pulse"></span><span class="d-hide">Atelier Drop 07 — Thursday 8PM</span><span class="d-show">Drop 07 · Thu 8PM</span>' +
      '<span class="dropbar__count d-hide">' + (412 + (joined ? 1 : 0)) + ' on the list</span><button type="button" data-join>' + (joined ? 'On the list ✓' : 'Join') + '</button></div>' +
      '<header class="hdr"><div class="hdr__bar">' +
      '<div class="hdr__left"><button type="button" class="burger" aria-label="Menu" aria-expanded="false" aria-controls="mnav">☰</button>' +
      '<a class="logo" href="index.html" aria-label="VALENOR home">VALENOR</a><nav class="nav" aria-label="Main">' + nav + '</nav></div>' +
      '<a class="logo logo--m" href="index.html" aria-label="VALENOR home">VALENOR</a>' +
      '<div class="tools"><button type="button" class="fitstate t-hide" data-fit><span class="pulse"></span>Fit profile on</button>' +
      '<button type="button" class="t-hide" data-search>Search</button><a class="t-hide" href="index.html#wardrobe">Wardrobe</a>' +
      '<button type="button" class="bag" data-bag>Bag<span class="d-hide"> (</span><span class="d-show"> </span><span class="bagn">0</span><span class="d-hide">)</span></button></div></div>' +
      '<nav class="mnav" id="mnav" aria-label="Mobile">' + nav +
      '<button type="button" class="m-small" data-join>' + (joined ? 'Drop 07 · on the list ✓' : 'Drop 07 · Thu 8PM · Join') + '</button>' +
      '<button type="button" class="m-small" data-fit><span class="pulse"></span>Fit profile on</button><button type="button" class="m-small" data-search>Search</button><a class="m-small" href="index.html#wardrobe">My wardrobe</a></nav></header>';
    var main = $('main');
    Array.prototype.slice.call(top.children).forEach(function (n) { document.body.insertBefore(n, main); });

    var tail = document.createElement('div');
    tail.innerHTML =
      '<footer class="foot"><div class="wrap"><div class="foot__grid">' +
      '<div><span class="logo">VALENOR</span><p>Defined by character. A fit-first menswear store: tell us your build once, and every piece is shown in your size.</p></div>' +
      '<div><h4>Shop</h4><ul><li><a href="shop.html?sort=new">New in</a></li>' + VLN.categories.map(function (c) { return '<li><a href="shop.html?c=' + c.id + '">' + c.name + '</a></li>'; }).join('') + '</ul></div>' +
      '<div><h4>The Four</h4><ul>' + VLN.four.map(function (f) { return '<li><a href="shop.html?four=' + f.id + '">' + f.name.replace('The ', '') + '</a></li>'; }).join('') + '</ul></div>' +
      '<div><h4>Help</h4><ul><li><button type="button" data-fit>Fit profile</button></li><li><button type="button" data-info="guarantee">Fit guarantee</button></li><li><button type="button" data-info="delivery">Delivery &amp; returns</button></li><li><a href="index.html#wardrobe">My wardrobe</a></li></ul></div>' +
      '</div><div class="foot__base"><span>© 2026 VALENOR · demo brand</span><span>Designed &amp; built by Ivan Abboud · <a href="' + UPWORK_URL + '" target="_blank" rel="noopener">Hire me on Upwork ↗</a></span></div></div></footer>' +
      '<div class="scrim" data-close></div>' +
      '<aside class="drawer" id="bag" role="dialog" aria-modal="true" aria-label="Your bag" tabindex="-1"></aside>' +
      '<div class="search" role="dialog" aria-modal="true" aria-label="Search"><div class="wrap"><div class="search__bar"><label for="q" class="sr-only">Search</label>' +
      '<input id="q" type="search" placeholder="Search the store" autocomplete="off"><button type="button" class="x" data-close aria-label="Close search">×</button></div><div class="search__results"></div></div></div>' +
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="modal__box"></div></div>' +
      '<div class="toast" role="status" aria-live="polite"></div>';
    Array.prototype.slice.call(tail.children).forEach(function (n) { document.body.appendChild(n); });

    var burger = $('.burger'), mnav = $('#mnav');
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') !== 'true';
      burger.setAttribute('aria-expanded', open); mnav.classList.toggle('is-open', open); burger.textContent = open ? '×' : '☰';
    });
    mnav.addEventListener('click', function (e) { if (e.target.closest('a')) closeAll(); });

    document.addEventListener('click', function (e) {
      var t = e.target;
      if (t.closest('[data-bag]')) { e.preventDefault(); openBag(); }
      else if (t.closest('[data-search]')) openSearch();
      else if (t.closest('[data-fit]')) openFit();
      else if (t.closest('[data-join]')) openJoin();
      else if (t.closest('[data-info]')) openInfo(t.closest('[data-info]').dataset.info);
      else if (t.closest('[data-close]') || t.classList.contains('modal')) closeAll();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });
    renderBag();
  }

  var lastFocus = null;
  function lock(on) { document.body.classList.toggle('is-locked', on); $('.scrim').classList.toggle('is-open', on); }
  function closeAll() {
    ['#bag', '.search', '.modal', '#mnav'].forEach(function (s) { var el = $(s); if (el) el.classList.remove('is-open'); });
    var b = $('.burger'); if (b) { b.setAttribute('aria-expanded', 'false'); b.textContent = '☰'; }
    lock(false);
    if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    lastFocus = null;
  }
  function openLayer(sel) { var keep = lastFocus || document.activeElement; closeAll(); lastFocus = keep; $(sel).classList.add('is-open'); lock(true); }
  function openBag() { $('.toast').classList.remove('is-on'); renderBag(); openLayer('#bag'); setTimeout(function () { $('#bag').focus(); }, 60); }
  function openSearch() { openLayer('.search'); var q = $('#q'); renderSearch(q.value); setTimeout(function () { q.focus(); }, 80); }
  function openModal(html) { $('.modal__box').innerHTML = '<button type="button" class="x" data-close aria-label="Close">×</button>' + html; openLayer('.modal'); }
  var toastT;
  function toast(msg) { var t = $('.toast'); t.textContent = msg; t.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('is-on'); }, 3400); }

  function openFit() {
    openModal('<span class="eyebrow">Fit profile</span><h2 id="mt">Three <em>questions.</em></h2><p>Answer once. Every piece in the store is then sized for you, with a fit-match score.</p>' +
      '<div class="fitgate"></div><div class="fitcount"><b></b><span>pieces fit you <em>/ ' + P.length + ' in store</em></span></div>' +
      '<button type="button" class="btn btn--block" data-savefit>Save my fit</button>');
    var box = $('.modal__box'), form = fitForm($('.fitgate', box), { onChange: count });
    function count(f) { $('.fitcount b', box).textContent = fitCount(f); }
    count(form.get());
    $('[data-savefit]', box).addEventListener('click', function () { fit.set(Object.assign({}, form.get())); closeAll(); toast('Fit saved: ' + fit.line() + '. Every size is now picked for you.'); });
  }
  function openJoin() {
    if (store.get('vln_joined', false)) { toast('You are already on the list for Drop 07.'); return; }
    openModal('<span class="eyebrow">Atelier Drop 07 · Thursday 8PM</span><h2 id="mt">Get the drop <em>first.</em></h2>' +
      '<p>Eight pieces, one evening. The list gets the link an hour early, already sized to your fit profile.</p>' +
      '<form class="field" novalidate><label for="je" class="sr-only">Email</label><input id="je" type="email" placeholder="Email address" autocomplete="email"><button type="submit">Join</button></form><p class="formmsg" aria-live="polite"></p>');
    $('.modal form').addEventListener('submit', function (e) {
      e.preventDefault();
      var v = $('#je').value.trim(), msg = $('.modal .formmsg');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { msg.textContent = 'Enter a valid email address.'; $('#je').focus(); return; }
      store.set('vln_joined', true);
      msg.textContent = 'You’re on the list. (Demo: nothing was sent.)';
      $('.dropbar__count').textContent = '413 on the list';
      $$('.dropbar [data-join]').forEach(function (b) { b.textContent = 'On the list ✓'; });
      $$('.mnav [data-join]').forEach(function (b) { b.textContent = 'Drop 07 · on the list ✓'; });
      setTimeout(closeAll, 1400);
    });
    setTimeout(function () { $('#je').focus(); }, 80);
  }
  function openInfo(kind) {
    if (kind === 'guarantee') openModal('<span class="eyebrow">Fit guarantee</span><h2 id="mt">Wrong fit? <em>We pay both ways.</em></h2>' +
      '<p>If a piece bought in the size we picked doesn’t fit, send it back within 30 days. We cover the return and the exchange delivery.</p>' +
      '<p>Your fit profile learns from it, so the next size we pick is closer.</p><button type="button" class="btn btn--block" data-close>Understood</button>');
    else openModal('<span class="eyebrow">Delivery &amp; returns</span><h2 id="mt">Delivery &amp; <em>returns.</em></h2>' +
      '<p>Free delivery on orders over ' + whole(FREE_SHIP) + '. Orders ship in 2–4 working days.</p><p>Free returns within 30 days, unworn with tags on.</p>' +
      '<p style="color:var(--m42);font-size:12px">This is a portfolio demo, so these are sample policies.</p><button type="button" class="btn btn--block" data-close>Close</button>');
  }

  function refreshFit() {
    $$('[data-card]').forEach(function (el) { el.outerHTML = card(byId(el.dataset.card)); });
    $$('.pcard.reveal').forEach(function (el) { el.classList.add('is-in'); });
    document.dispatchEvent(new CustomEvent('fitchange'));
  }

  /* ---------- product card ---------- */
  function priceHTML(p) { return p.compareAt ? '<s>' + money(p.compareAt) + '</s><span class="now">' + money(p.price) + '</span>' : money(p.price); }
  function card(p) {
    var r = fit.rec(p), ok = anyColor(p, r.size), c = p.colors[0];
    var tag = p.compareAt ? '<span class="tagbadge is-sale">Sale</span>' : (p.badge ? '<span class="tagbadge">' + p.badge + '</span>' : '');
    return '<article class="pcard reveal" data-card="' + p.id + '"><div class="media">' + media(p, c, 0) +
      (ok ? '<span class="fitbadge">✓ Fits you</span>' : '<span class="fitbadge is-out">Your size sold out</span>') + tag +
      (ok ? '<button type="button" class="quick" data-quick="' + p.id + '">Add ' + r.label + '</button>' : '') + '</div>' +
      '<div class="pcard__body"><a class="pcard__name" href="product.html?p=' + p.id + '">' + esc(p.name) + '</a>' +
      '<div class="pcard__row"><span class="price">' + priceHTML(p) + '</span><span class="yoursize">' + r.label + '</span></div>' +
      '<div class="meter"><i style="width:' + (ok ? r.match : 0) + '%"></i></div>' +
      '<div class="fitnote' + (ok ? '' : ' is-out') + '">' + (ok ? r.fitnote : 'Sold out in ' + r.size + ' · see sizes') + '</div>' +
      '<div class="instal">or 4 × ' + money(p.price / 4) + '</div></div></article>';
  }
  document.addEventListener('click', function (e) {
    var q = e.target.closest('[data-quick]'); if (!q) return;
    e.preventDefault();
    var p = byId(q.dataset.quick), v = bestVariant(p);
    if (v && v.exact) { cart.add(p.id, v.color, v.size, 1, { length: v.length }); openBag(); }
    else location.href = 'product.html?p=' + p.id;
  });

  /* ---------- bag drawer ---------- */
  function renderBag() {
    $$('.bagn').forEach(function (n) { n.textContent = cart.count(); });
    var d = $('#bag'); if (!d) return;
    var n = cart.count();
    var head = '<div class="drawer__head"><h2>Your bag' + (n ? ' (' + n + ')' : '') + '</h2><button type="button" class="x" data-close aria-label="Close bag">×</button></div>';
    if (!n) {
      d.innerHTML = head + '<div class="drawer__lines"><div class="drawer__empty"><p>Nothing here yet.</p><small>Everything in the store is already sized for you.</small>' +
        '<a class="btn" href="shop.html?fit=1">Show me what fits</a></div></div>';
      return;
    }
    var sub = cart.subtotal(), disc = cart.discounts(), off = disc.reduce(function (a, x) { return a + x.amount; }, 0), total = sub - off;
    var left = Math.max(0, FREE_SHIP - total);
    d.innerHTML = head +
      '<div class="shipbar">' + (left ? '<b>' + money(left) + '</b> away from free delivery' : '<b>Free delivery</b> unlocked') +
      '<div class="meter"><i style="width:' + Math.min(100, total / FREE_SHIP * 100) + '%"></i></div></div>' +
      '<div class="drawer__lines">' + cart.items.map(function (l, i) {
        var p = byId(l.id), r = fit.rec(p), on = r.size === l.size, href = 'product.html?p=' + p.id + '&amp;color=' + encodeURIComponent(l.color);
        return '<div class="line"><a class="line__media media" href="' + href + '" aria-label="' + esc(p.name) + '">' + media(p, l.color, 0) + '</a>' +
          '<div><a class="line__name" href="' + href + '">' + esc(p.name) + '</a>' +
          '<div class="line__var">' + l.color + ' · ' + l.size + (l.length ? ' · ' + l.length + ' leg' : '') + '</div>' +
          '<div class="line__fit' + (on ? '' : ' is-off') + '">' + (on ? '✓ Your fit' : 'Not the size we picked') + '</div>' +
          '<div class="qty"><button type="button" data-lq="' + i + '" data-d="-1" aria-label="Decrease">−</button><span>' + l.qty + '</span><button type="button" data-lq="' + i + '" data-d="1" aria-label="Increase">+</button></div></div>' +
          '<div class="line__right"><span>' + money(p.price * l.qty) + '</span><button type="button" class="line__rm" data-rm="' + i + '">Remove</button></div></div>';
      }).join('') + '</div>' +
      '<div class="drawer__foot"><div class="drow"><span>Subtotal</span><span>' + money(sub) + '</span></div>' +
      disc.map(function (x) { return '<div class="drow is-save"><span>' + esc(x.label) + '</span><span>−' + money(x.amount) + '</span></div>'; }).join('') +
      '<div class="drow"><span>Delivery</span><span>' + (left ? 'Calculated at checkout' : 'Free') + '</span></div>' +
      '<div class="drow is-total"><span>Total</span><span>' + money(total) + '</span></div>' +
      '<button type="button" class="btn btn--block" data-checkout>Checkout</button>' +
      '<p class="drawer__note">or 4 × ' + money(total / 4) + ', no interest · Fit guarantee: wrong fit, we pay both ways</p></div>';
  }
  document.addEventListener('click', function (e) {
    var q = e.target.closest('[data-lq]'), rm = e.target.closest('[data-rm]');
    if (q) { var l = cart.items[+q.dataset.lq]; l.qty = Math.max(0, Math.min(9, l.qty + +q.dataset.d)); if (!l.qty) cart.items.splice(+q.dataset.lq, 1); cart.save(); }
    if (rm) { cart.items.splice(+rm.dataset.rm, 1); cart.save(); }
    if (e.target.closest('[data-checkout]')) {
      openModal('<span class="eyebrow">Portfolio demo</span><h2 id="mt">Checkout is <em>switched off.</em></h2>' +
        '<p>This is a design and front-end demo, so no order is placed and nothing is charged.</p>' +
        '<p>On a live build this hands off to Shopify checkout with the payment methods each market needs:</p>' +
        '<div class="paylist"><span>Card</span><span>Apple Pay</span><span>PayPal</span><span>Pay in 4</span><span>Paystack</span><span>Mobile Money</span></div>' +
        '<a class="btn btn--block" href="' + UPWORK_URL + '" target="_blank" rel="noopener">Want a store like this?</a>');
    }
  });

  /* ---------- search ---------- */
  function renderSearch(q) {
    var box = $('.search__results'); q = (q || '').trim().toLowerCase();
    var list = q ? P.filter(function (p) { return (p.name + ' ' + cat(p.cat).name + ' ' + p.colors.join(' ') + ' ' + p.blurb + ' ' + p.four.map(function (f) { return fourById(f).name; }).join(' ')).toLowerCase().indexOf(q) > -1; })
      : P.filter(function (p) { return p.badge === 'Bestseller'; });
    box.innerHTML = '<p class="search__hint">' + (q ? list.length + ' result' + (list.length === 1 ? '' : 's') + ' for “' + esc(q) + '”' : 'Most worn right now') + '</p>' +
      (list.length ? '<div class="grid">' + list.slice(0, 8).map(card).join('') + '</div>' : '<p class="search__hint" style="margin-top:0">Try “polo”, “coat” or a colour like “charcoal”.</p>');
    $$('.reveal', box).forEach(function (el) { el.classList.add('is-in'); });
  }
  document.addEventListener('input', function (e) { if (e.target.id === 'q') renderSearch(e.target.value); });

  /* ---------- reveal ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -6% 0px' }) : null;
  function reveal(root) { $$('.reveal:not(.is-in)', root).forEach(function (el) { io ? io.observe(el) : el.classList.add('is-in'); }); }

  /* ---------- wardrobe (1b) ---------- */
  function wardrobeState() {
    return VLN.wardrobe.map(function (s) {
      var inBag = cart.items.filter(function (l) { return byId(l.id).slot === s.slot; }).length;
      return Object.assign({}, s, { gap: !s.owned && !inBag, filled: !s.owned && inBag > 0 });
    });
  }
  function renderWardrobe() {
    var root = $('#wardrobe'); if (!root) return;
    var st = wardrobeState(), core = st.filter(function (s) { return !s.mobileOnly; });
    var pct = Math.round(core.filter(function (s) { return !s.gap; }).length / core.length * 100);
    var mid = st.find(function (s) { return s.slot === 'mid'; }), outer = st.find(function (s) { return s.slot === 'outer'; });
    var k = mid.gap && outer.gap ? 0 : !mid.gap && outer.gap ? 1 : mid.gap ? 2 : 3;
    var titles = ['You own eleven tops<br>and <em>nothing to layer</em> them under.', 'Layered up. Now <em>the coat</em><br>it all goes under.',
      'The coat is sorted.<br>Now <em>the layer</em> beneath it.', 'Your wardrobe is <em>complete.</em>'];
    var titlesM = ['Eleven tops.<br><em>Nothing to layer.</em>', 'Layered.<br><em>Now the coat.</em>', 'Coat sorted.<br><em>Now the layer.</em>', 'Wardrobe<br><em>complete.</em>'];
    $('#wr-title', root).innerHTML = '<span class="d-hide">' + titles[k] + '</span><span class="d-show">' + titlesM[k] + '</span>';
    $('#wr-pct', root).innerHTML = pct + '<small>%</small>';
    $('#wr-meter', root).style.width = pct + '%';
    $('#wr-pct-label', root).innerHTML = '<span class="d-hide">Wardrobe complete</span><span class="d-show">' + pct + '% complete</span>';
    $('#slots', root).innerHTML = st.map(function (s) {
      var href = s.link || (s.cat ? 'shop.html?c=' + s.cat : ''), tag = href ? 'a' : 'div';
      var count = s.gap ? 'Gap' : s.filled ? 'In bag' : String(s.owned).padStart(2, '0');
      return '<' + tag + (href ? ' href="' + href + '"' : '') + ' class="slot' + (s.gap ? ' is-gap' : '') + (s.filled ? ' is-filled' : '') + (s.mobileOnly ? ' m-only' : '') + '">' +
        '<div class="slot__top"><span>' + s.label + '</span><span>' + count + '</span></div><div class="slot__icon"><i></i></div>' +
        '<div class="slot__title">' + (s.filled ? 'Filled' : s.title) + '</div><div class="m-count">' + count + '</div></' + tag + '>';
    }).join('');
    var g = VLN.gapBundle, items = g.items.map(function (it) { return { p: byId(it[0]), color: it[1] }; }), owned = byId(g.owned);
    var sum = items.reduce(function (a, x) { return a + x.p.price; }, 0), price = sum - g.save;
    var inBag = items.every(function (x) { return cart.has(x.p.id, 'gap'); });
    $('#bundle', root).innerHTML = items.map(function (x) {
      var href = 'product.html?p=' + x.p.id + '&amp;color=' + x.color;
      return '<div class="bundle__row"><a class="bundle__thumb media" href="' + href + '" aria-label="' + esc(x.p.name) + '">' + media(x.p, x.color, 0) + '</a>' +
        '<div class="bundle__name"><a href="' + href + '">' + esc(x.p.name) + ' — ' + x.color + '</a><small>' + (cart.has(x.p.id) ? 'In your bag' : 'Fills your gap') + '</small></div>' +
        '<div class="bundle__price">' + money(x.p.price) + '</div></div>';
    }).join('') + '<div class="bundle__row"><a class="bundle__thumb media" href="product.html?p=' + owned.id + '" aria-label="' + esc(owned.name) + '">' + media(owned, owned.colors[0], 0) + '</a>' +
      '<div class="bundle__name"><a href="product.html?p=' + owned.id + '">' + esc(owned.name) + '</a><small class="is-owned">Already yours</small></div><div class="bundle__price">owned</div></div>';
    var btn = $('#bundle-btn', root), btnM = $('#bundle-btn-m', root);
    btn.textContent = inBag ? 'In your bag — view bag' : 'Add the 2 missing — ' + money(price);
    btnM.textContent = inBag ? 'In your bag — view bag' : 'Add both — ' + money(price);
    btn.dataset.state = btnM.dataset.state = inBag ? 'in' : 'add';
    $('#bundle-save', root).textContent = $('#bundle-save-m', root).textContent = 'Bundle saves ' + money(g.save);
    $('#bundle-instal', root).textContent = 'or 4 × ' + money(price / 4) + ', no interest';
    var gapEl = $('#canvas-gap', root);
    gapEl.classList.toggle('is-filled', !mid.gap);
    gapEl.innerHTML = mid.gap ? 'Your<br>gap' : 'Gap<br>filled ✓';
  }
  function bindWardrobe() {
    var root = $('#wardrobe'); if (!root) return;
    function addGap() {
      if (this.dataset.state === 'in') { openBag(); return; }
      VLN.gapBundle.items.forEach(function (it) {
        var p = byId(it[0]), v = bestVariant(p, it[1]);
        if (v) cart.add(p.id, v.color, v.size, 1, { bundle: 'gap', length: v.length });
      });
      openBag();
    }
    $('#bundle-btn', root).addEventListener('click', addGap);
    $('#bundle-btn-m', root).addEventListener('click', addGap);
    document.addEventListener('bagchange', renderWardrobe);
    document.addEventListener('fitchange', renderWardrobe);
    renderWardrobe();
  }

  /* ---------- The Four (1c) ---------- */
  function capsuleOf(id) {
    var items = P.filter(function (p) { return p.four.indexOf(id) > -1; }), sum = items.reduce(function (a, p) { return a + p.price; }, 0);
    var price = Math.round(sum * (1 - CAPSULE_OFF));
    return { items: items, sum: sum, price: price, save: Math.round(sum) - price };
  }
  function addCapsule(id) {
    var cap = capsuleOf(id), skipped = [];
    cap.items.forEach(function (p) {
      var v = bestVariant(p);
      if (v && v.exact) cart.add(p.id, v.color, v.size, 1, { bundle: 'cap-' + id, length: v.length }); else skipped.push(p.name);
    });
    openBag();
    if (skipped.length) setTimeout(function () { toast(skipped.join(', ') + (skipped.length > 1 ? ' are' : ' is') + ' sold out in your size, so we left ' + (skipped.length > 1 ? 'them' : 'it') + ' out.'); }, 500);
  }
  function renderFour() {
    var root = $('#the-four'); if (!root) return;
    var sel = store.get('vln_four', 'quiet');
    if (!fourById(sel)) sel = 'quiet';
    $('#four-grid', root).innerHTML = VLN.four.map(function (f) {
      var on = f.id === sel;
      return '<button type="button" class="arch" data-arch="' + f.id + '" aria-pressed="' + on + '">' +
        (f.img ? '<span class="arch__img" style="background-image:url(' + f.img + ');background-position:' + f.pos + '"></span>' : '') +
        '<span class="arch__body"><span><span class="arch__num">' + f.num + '</span><span class="arch__name">' + f.name + '</span>' +
        '<span class="arch__desc">' + f.desc + '</span></span><span class="arch__cta">' + (on ? 'Selected ✦' : 'Choose') + '</span></span></button>';
    }).join('');
    var f = fourById(sel), cap = capsuleOf(sel);
    $('#cap-name', root).textContent = f.name;
    $('#cap-line', root).textContent = cap.items.length + ' pieces · ' + whole(cap.price) + ' · saves ' + whole(cap.save);
    $('#cap-instal', root).textContent = 'or 4 × ' + money(cap.price / 4);
    $('#cap-link', root).href = 'shop.html?four=' + sel;
  }
  function bindFour() {
    var root = $('#the-four'); if (!root) return;
    root.addEventListener('click', function (e) {
      var a = e.target.closest('[data-arch]'); if (!a) return;
      store.set('vln_four', a.dataset.arch); renderFour();
    });
    renderFour();
  }

  /* ---------- pages ---------- */
  var pages = {};

  pages.home = function () {
    fitForm($('#fitgate'), { live: true });
    function draw() {
      var n = fitCount();
      $$('[data-fitcount]').forEach(function (el) { el.textContent = n; });
      var hasPhoto = function (p) { return imgs(p, p.colors[0]).length ? 1 : 0; };
      var list = P.filter(function (p) { return fitsYou(p); }).sort(function (a, b) { return (hasPhoto(b) - hasPhoto(a)) || (fit.rec(b).match - fit.rec(a).match); }).slice(0, 4);
      $('#fits-grid').innerHTML = list.map(card).join('');
      reveal($('#fits-grid'));
    }
    $$('[data-total]').forEach(function (el) { el.textContent = P.length; });
    var devon = byId('devon-half-zip');
    $('.hero__tag').innerHTML = '<span>' + esc(devon.name) + '</span><i></i><span>' + money(devon.price) + '</span>';
    document.addEventListener('fitchange', draw);
    draw();
    bindWardrobe();
    bindFour();
    if (location.hash) setTimeout(function () { var t = $(location.hash); if (t) t.scrollIntoView(); }, 80);
  };

  pages.shop = function () {
    var c = params.get('c'), four = params.get('four'), fitOnly = params.get('fit') === '1', sort = params.get('sort') || 'featured';
    if (c && !VLN.categories.some(function (x) { return x.id === c; })) c = null;
    if (four && !fourById(four)) four = null;
    if (['featured', 'fit', 'new', 'low', 'high'].indexOf(sort) === -1) sort = 'featured';
    var head = $('#shop-head'), filters = $('#filters');
    function headHTML() {
      if (four) {
        var f = fourById(four), cap = capsuleOf(four);
        return '<span class="eyebrow">The Four · ' + f.num + '</span><h1 class="h-1">' + f.name.replace('The ', 'The <em>') + '</em></h1><p class="lede">' + f.desc + ' The capsule, already sized for you.</p>' +
          '<div class="capsule-strip"><div><b>' + cap.items.length + '-piece capsule · ' + whole(cap.price) + '</b><span>Saves ' + whole(cap.save) + ' · or 4 × ' + money(cap.price / 4) + '</span></div>' +
          '<button type="button" class="btn" data-addcap="' + four + '">Add the capsule — ' + whole(cap.price) + '</button></div>';
      }
      if (fitOnly) return '<span class="eyebrow">The fitting room</span><h1 class="h-1">Fits you, <em>in stock, today.</em></h1><p class="lede">Everything below is in stock in the size we picked for ' + fit.line() + '.</p>';
      if (c) { var nm = cat(c).name; return '<span class="eyebrow">Collection</span><h1 class="h-1">' + (nm.indexOf(' & ') > -1 ? nm.replace(' & ', ' &amp; <em>') + '</em>' : '<em>' + nm + '</em>') + '</h1><p class="lede">Every piece sized for ' + fit.line() + '.</p>'; }
      if (sort === 'new') return '<span class="eyebrow">Just in</span><h1 class="h-1">New <em>arrivals.</em></h1><p class="lede">The latest pieces, sized for ' + fit.line() + '.</p>';
      return '<span class="eyebrow">Collection</span><h1 class="h-1">Shop <em>everything.</em></h1><p class="lede">Every piece sized for ' + fit.line() + '.</p>';
    }
    filters.innerHTML = '<div class="filters__group"><span class="filters__label">Category</span><button type="button" class="chip" data-cat="">All</button>' +
      VLN.categories.map(function (x) { return '<button type="button" class="chip" data-cat="' + x.id + '">' + x.name + '</button>'; }).join('') + '</div>' +
      '<div class="filters__group"><button type="button" class="chip" data-fitonly>✓ Fits me only</button>' +
      '<label class="sr-only" for="four">The Four</label><select class="select" id="four"><option value="">The Four: all</option>' + VLN.four.map(function (f) { return '<option value="' + f.id + '">' + f.name + '</option>'; }).join('') + '</select>' +
      '<label class="sr-only" for="sort">Sort</label><select class="select" id="sort"><option value="featured">Featured</option><option value="fit">Best fit for me</option><option value="new">Newest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></div>';
    function draw() {
      head.innerHTML = headHTML();
      $$('[data-cat]', filters).forEach(function (b) { b.setAttribute('aria-pressed', (b.dataset.cat || null) === (c || null)); });
      $('[data-fitonly]', filters).setAttribute('aria-pressed', fitOnly);
      $('#four').value = four || ''; $('#sort').value = sort;
      var list = P.filter(function (p) { return (!c || p.cat === c) && (!four || p.four.indexOf(four) > -1) && (!fitOnly || fitsYou(p)); });
      var by = { low: function (a, b) { return a.price - b.price; }, high: function (a, b) { return b.price - a.price; },
        fit: function (a, b) { return (fitsYou(b) - fitsYou(a)) || fit.rec(b).match - fit.rec(a).match; },
        'new': function (a, b) { return (b.badge === 'New') - (a.badge === 'New'); } }[sort];
      if (by) list = list.slice().sort(by);
      var fitting = list.filter(function (p) { return fitsYou(p); }).length;
      $('#shop-count').innerHTML = '<b>' + list.length + '</b>piece' + (list.length === 1 ? '' : 's') + (fitOnly ? '' : ' · ' + fitting + ' fit you') + ' · sized for <button type="button" class="text-link" data-fit>' + fit.line() + '</button>';
      $('#shop-grid').innerHTML = list.length ? list.map(card).join('')
        : '<div class="empty"><b>Nothing here in your size right now.</b>Try another category, or <button type="button" class="text-link" data-clear>clear the filters</button>.</div>';
      reveal($('#shop-grid'));
      var u = new URL(location.href);
      [['c', c], ['four', four], ['fit', fitOnly ? '1' : null], ['sort', sort === 'featured' ? null : sort]].forEach(function (kv) { kv[1] ? u.searchParams.set(kv[0], kv[1]) : u.searchParams.delete(kv[0]); });
      history.replaceState(null, '', u);
      document.title = (four ? fourById(four).name : fitOnly ? 'Fits you' : c ? cat(c).name : sort === 'new' ? 'New arrivals' : 'Shop everything') + ' — VALENOR';
      $$('.nav a, .mnav a').forEach(function (a) {
        var h = new URL(a.href, location.href);
        var on = h.pathname.slice(-9) === 'shop.html' && !four && !fitOnly &&
          ((h.searchParams.get('c') && h.searchParams.get('c') === c) || (h.searchParams.get('sort') === 'new' && sort === 'new' && !c));
        if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
      });
    }
    filters.addEventListener('click', function (e) {
      var b = e.target.closest('[data-cat]');
      if (b) { c = b.dataset.cat || null; draw(); }
      if (e.target.closest('[data-fitonly]')) { fitOnly = !fitOnly; draw(); }
    });
    $('#four').addEventListener('change', function () { four = this.value || null; draw(); });
    $('#sort').addEventListener('change', function () { sort = this.value; draw(); });
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-clear]')) { c = null; four = null; fitOnly = false; sort = 'featured'; draw(); }
      var ac = e.target.closest('[data-addcap]'); if (ac) addCapsule(ac.dataset.addcap);
    });
    document.addEventListener('fitchange', draw);
    draw();
  };

  pages.product = function () {
    var p = byId(params.get('p'));
    if (!p) { location.replace('shop.html'); return; }
    document.title = p.name + ' — VALENOR';
    var list = sizesFor(p), root = $('#pdp');
    var state = { color: p.colors.indexOf(params.get('color')) > -1 ? params.get('color') : p.colors[0], size: null, length: null, qty: 1, img: 0 };
    function pick() {
      var r = fit.rec(p);
      state.length = r.length;
      state.size = inStock(p, state.color, r.size) ? r.size : (state.size && inStock(p, state.color, state.size) ? state.size : null);
    }
    pick();
    $('#crumbs').innerHTML = '<a href="index.html">Home</a> / <a href="shop.html?c=' + p.cat + '">' + cat(p.cat).name + '</a> / ' + esc(p.name);
    function sizeTable() {
      var r = fit.rec(p);
      if (p.cat === 'trousers') return '<table class="size-table"><tr><th>Waist</th><th>Waist (cm)</th><th>Inseam R / L</th></tr>' + list.map(function (s) { return '<tr' + (s === r.size ? ' class="is-you"' : '') + '><td>' + s + (s === r.size ? ' · you' : '') + '</td><td>' + Math.round(+s * 2.54) + '</td><td>81 / 86 cm</td></tr>'; }).join('') + '</table>';
      var chest = [96, 102, 108, 114, 120], len = [68, 70, 72, 74, 76];
      return '<table class="size-table"><tr><th>Size</th><th>Chest (cm)</th><th>Length (cm)</th></tr>' + list.map(function (s, i) { return '<tr' + (s === r.size ? ' class="is-you"' : '') + '><td>' + s + (s === r.size ? ' · you' : '') + '</td><td>' + chest[i] + '</td><td>' + len[i] + '</td></tr>'; }).join('') + '</table>';
    }
    var fours = p.four.map(function (id) { return fourById(id).name.replace('The ', ''); }).join(' · ');
    var unit = p.cat === 'trousers' ? 'waist' : 'size';
    root.innerHTML =
      '<div class="gallery"><div class="gallery__main media"></div><div class="gallery__thumbs"></div></div>' +
      '<div class="buy"><span class="eyebrow">' + cat(p.cat).name + ' · ' + fours + '</span><h1>' + esc(p.name) + '</h1>' +
      '<div class="buy__price">' + (p.compareAt ? '<b class="is-sale">' + money(p.price) + '</b><s>' + money(p.compareAt) + '</s><span class="save">Save ' + Math.round((1 - p.price / p.compareAt) * 100) + '%</span>' : '<b>' + money(p.price) + '</b>') + '</div>' +
      '<div class="buy__instal">or 4 × ' + money(p.price / 4) + ', no interest</div>' +
      '<p class="buy__blurb">' + esc(p.blurb) + '</p>' +
      '<div class="fitbox" id="fitbox"></div>' +
      '<div class="opt"><div class="opt__head"><span>Colour<b id="cname"></b></span></div><div class="swatches">' +
      p.colors.map(function (c) { return '<button type="button" class="swatch" data-color="' + c + '" aria-label="' + c + '"><span style="background:' + VLN.colors[c] + '"></span></button>'; }).join('') + '</div></div>' +
      '<div class="opt"><div class="opt__head"><span>' + (unit === 'waist' ? 'Waist' : 'Size') + '<b id="sname"></b></span><button type="button" class="fitbox__edit" data-fit>Edit fit</button></div><div class="chips" id="sizes">' +
      list.map(function (s) { return '<button type="button" class="chip" data-size="' + s + '">' + s + '</button>'; }).join('') + '</div></div>' +
      (p.cat === 'trousers' ? '<div class="opt"><div class="opt__head"><span>Leg<b id="lname"></b></span></div><div class="chips">' + VLN.lengths.map(function (l) { return '<button type="button" class="chip" data-len="' + l + '">' + l + '</button>'; }).join('') + '</div></div>' : '') +
      '<div class="buy__row"><div class="qty"><button type="button" data-pq="-1" aria-label="Decrease quantity">−</button><span id="pqty">1</span><button type="button" data-pq="1" aria-label="Increase quantity">+</button></div>' +
      '<button type="button" class="btn" id="add">Add to bag</button></div>' +
      '<p class="buy__stock" id="stock" aria-live="polite"></p><p class="guarantee">Free returns · <button type="button" class="text-link" data-info="guarantee" style="font-size:12px">Fit guarantee</button>: wrong fit, we pay both ways</p>' +
      '<div class="acc"><details open><summary>Details</summary><div class="acc__body"><ul>' + p.details.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ul></div></details>' +
      '<details><summary>Size &amp; fit</summary><div class="acc__body" id="sizetable"></div></details>' +
      '<details><summary>Delivery &amp; returns</summary><div class="acc__body">Free delivery over ' + whole(FREE_SHIP) + ', shipped in 2–4 working days. Free returns within 30 days. If the size we picked doesn’t fit, we cover both ways.</div></details></div></div>';

    var sticky = document.createElement('div');
    sticky.className = 'sticky-buy';
    sticky.innerHTML = '<div><b>' + esc(p.name) + '</b><span id="svar"></span></div><button type="button" class="btn" id="add2">Add · ' + money(p.price) + '</button>';
    document.body.appendChild(sticky);

    function draw() {
      var r = fit.rec(p), pics = imgs(p, state.color);
      if (state.img >= Math.max(1, pics.length)) state.img = 0;
      $('.gallery__main', root).innerHTML = media(p, state.color, state.img, true);
      $('.gallery__thumbs', root).innerHTML = pics.length > 1 ? pics.map(function (_, i) { return '<button type="button" class="media" data-img="' + i + '" aria-label="Image ' + (i + 1) + '" aria-current="' + (i === state.img) + '">' + media(p, state.color, i) + '</button>'; }).join('') : '';
      $('#cname').textContent = state.color;
      $$('.swatch', root).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.color === state.color); });
      $$('[data-size]', root).forEach(function (b) {
        var s = b.dataset.size, ok = inStock(p, state.color, s);
        b.disabled = !ok; b.setAttribute('aria-pressed', s === state.size); b.classList.toggle('is-rec', s === r.size);
        b.setAttribute('aria-label', s + (ok ? '' : ', sold out') + (s === r.size ? ', your fit' : ''));
      });
      $$('[data-len]', root).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.len === state.length); b.classList.toggle('is-rec', b.dataset.len === r.length); });
      if ($('#lname')) $('#lname').textContent = state.length || '';
      $('#sname').textContent = state.size || '';
      var okRec = inStock(p, state.color, r.size), alt = p.colors.filter(function (c) { return inStock(p, c, r.size); });
      $('#fitbox').innerHTML = '<div class="fitbox__top"><div class="fitbox__size"><b>' + r.label + '</b><span>' + (okRec ? r.match + '% fit match' : 'Sold out in ' + state.color) + '</span></div>' +
        '<button type="button" class="fitbox__edit" data-fit>' + fit.line() + '</button></div>' +
        '<div class="meter"><i style="width:' + (okRec ? r.match : 0) + '%"></i></div><div class="fitnote' + (okRec ? '' : ' is-out') + '">' + r.note + '</div>' +
        '<p class="fitbox__why">' + (okRec ? r.why : alt.length ? 'Your ' + unit + ' is still in stock in ' + alt.join(' and ') + '.' : 'Your ' + unit + ' is sold out in every colour. The size table below shows the closest fit.') + '</p>';
      $('#sizetable').innerHTML = sizeTable();
      $('#pqty').textContent = state.qty;
      $('#add').textContent = state.size ? 'Add to bag — ' + money(p.price * state.qty) : 'Select a ' + unit;
      $('#stock').textContent = state.size ? 'In stock · ' + state.color + ' · ' + state.size + (state.length ? ' · ' + state.length + ' leg' : '') + (state.size === r.size ? ' · fits you' : '') : '';
      $('#svar').textContent = state.size ? state.color + ' · ' + state.size : state.color + ' · pick a ' + unit;
      var u = new URL(location.href); u.searchParams.set('color', state.color); history.replaceState(null, '', u);
    }
    function doAdd() {
      if (!state.size) {
        var sz = $('#sizes'); sz.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (sz.animate) sz.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 320 });
        toast('Pick a ' + unit + ' first.'); return;
      }
      cart.add(p.id, state.color, state.size, state.qty, { length: state.length });
      openBag();
    }
    root.addEventListener('click', function (e) {
      var sw = e.target.closest('.swatch'), sz = e.target.closest('[data-size]'), ln = e.target.closest('[data-len]'), th = e.target.closest('[data-img]'), q = e.target.closest('[data-pq]');
      if (sw) { state.color = sw.dataset.color; state.img = 0; if (state.size && !inStock(p, state.color, state.size)) state.size = null; if (!state.size) pick(); draw(); }
      if (sz && !sz.disabled) { state.size = sz.dataset.size; draw(); }
      if (ln) { state.length = ln.dataset.len; draw(); }
      if (th) { state.img = +th.dataset.img; draw(); }
      if (q) { state.qty = Math.max(1, Math.min(9, state.qty + +q.dataset.pq)); draw(); }
    });
    $('#add').addEventListener('click', doAdd);
    $('#add2').addEventListener('click', doAdd);
    document.addEventListener('fitchange', function () { pick(); draw(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { sticky.classList.toggle('is-on', !es[0].isIntersecting && es[0].boundingClientRect.top < 0); }).observe($('#add'));
    draw();

    /* Completes the look: same archetype first, from other categories. */
    var others = P.filter(function (x) { return x !== p && x.cat !== p.cat; });
    var shares = function (x) { return x.four.some(function (f) { return p.four.indexOf(f) > -1; }) ? 1 : 0; };
    others.sort(function (a, b) { return (shares(b) - shares(a)) || (fit.rec(b).match - fit.rec(a).match); });
    $('#related').innerHTML = others.slice(0, 4).map(card).join('');
    reveal($('#related'));
  };

  /* ---------- boot ---------- */
  var page = document.body.dataset.page;
  chrome(page);
  if (pages[page]) pages[page]();
  reveal(document);
})();
