/* Asrar Parfums, site 2: language + RTL, signature tiles, carousel, quick view, bag. */
(function () {
  "use strict";

  var KEYS = { lang: "asrar2-lang", cart: "asrar2-cart" };
  var I18N = window.ASRAR_I18N;
  var PRODUCTS = window.ASRAR_PRODUCTS;
  var SIGNATURE = window.ASRAR_SIGNATURE;
  var DISCOVERY = window.ASRAR_DISCOVERY;
  var FREE_AT = window.ASRAR_FREE_SHIPPING;
  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }
  };

  var state = {
    lang: root.getAttribute("lang") === "ar" ? "ar" : "en",
    cart: [],
    pdp: { id: null, size: 0 }
  };

  try {
    var saved = JSON.parse(store.get(KEYS.cart) || "[]");
    if (Array.isArray(saved)) {
      state.cart = saved.filter(function (l) {
        var item = l && findItem(l.id);
        return item && item.sizes[l.size] && l.qty > 0;
      });
    }
  } catch (e) { state.cart = []; }

  /* ---------- helpers ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function t(key) { return (I18N[state.lang] && I18N[state.lang][key]) || I18N.en[key] || key; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function findItem(id) {
    if (id === DISCOVERY.id) return DISCOVERY;
    for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i];
    return null;
  }
  /* LRM keeps "$148" in reading order inside right-to-left text. */
  function money(n) { return "‎$" + new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n); }
  function sizeLabel(item, size) { return item.id === DISCOVERY.id ? t("disc.size") : size.ml + " " + t("ml"); }

  /* Product photo on a light tile, with a tinted silhouette until the photo loads. */
  function shot(file, tint, eager) {
    return '<span class="shot" style="--tint:' + tint + '"><span class="shot__ph" aria-hidden="true"></span>' +
      '<img src="assets/' + file + '.jpg" width="900" height="1125" alt="" ' + (eager ? "" : 'loading="lazy" ') + 'decoding="async" ' +
      "onload=\"this.parentNode.classList.add('has-img')\" onerror=\"this.remove()\"></span>";
  }

  /* ---------- i18n + direction ---------- */
  function applyI18n() {
    $$("[data-i18n]").forEach(function (el) { el.textContent = t(el.getAttribute("data-i18n")); });
    $$("[data-i18n-aria]").forEach(function (el) { el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria"))); });
    $$("[data-i18n-ph]").forEach(function (el) { el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph"))); });
    $$("[data-i18n-alt]").forEach(function (el) { el.setAttribute("alt", t(el.getAttribute("data-i18n-alt"))); });
    document.title = t("meta.title");
    var meta = $('meta[name="description"]');
    if (meta) meta.setAttribute("content", t("meta.desc"));
    var mb = $("#menuBtn");
    mb.setAttribute("aria-label", t(mb.getAttribute("aria-expanded") === "true" ? "nav.menuClose" : "nav.menuOpen"));
    $("#notesPrice").textContent = money(findItem("citrus").sizes[0].price);
  }

  function setLang(lang) {
    state.lang = lang === "ar" ? "ar" : "en";
    root.setAttribute("lang", state.lang);
    root.setAttribute("dir", state.lang === "ar" ? "rtl" : "ltr");
    store.set(KEYS.lang, state.lang);
    applyI18n();
    renderSignature();
    renderTrack();
    renderCart();
    if ($("#pdp").open && state.pdp.id) renderPdp();
    setFormMsg("", "");
  }

  /* ---------- reveal on scroll ---------- */
  var io = null;
  if ("IntersectionObserver" in window && !reduceMotion) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  }
  function observeAll(ctx) {
    $$(".reveal:not(.is-in)", ctx).forEach(function (el) { if (io) io.observe(el); else el.classList.add("is-in"); });
  }

  /* ---------- signature tiles ---------- */
  function renderSignature() {
    $("#sigGrid").innerHTML = SIGNATURE.map(function (id, i) {
      var p = findItem(id);
      var name = esc(p.name[state.lang]);
      return '<li class="tile reveal" style="--d:' + i * 80 + 'ms">' +
        '<button class="tile__media" type="button" data-open="' + p.id + '" aria-label="' + esc(t("col.view")) + ": " + name + '">' +
        shot(p.id, p.tint, true) + "</button>" +
        '<span class="tile__name">' + name + "</span></li>";
    }).join("");
    observeAll($("#sigGrid"));
  }

  /* ---------- collection carousel ---------- */
  function priceMarkup(size) {
    return "<strong>" + esc(money(size.price)) + "</strong>" +
      (size.compare ? '<s><span class="sr">' + esc(t("price.was")) + " </span>" + esc(money(size.compare)) + "</s>" : "");
  }

  function renderTrack() {
    $("#track").innerHTML = PRODUCTS.map(function (p) {
      var name = esc(p.name[state.lang]);
      var s = p.sizes[0];
      var flags = "";
      if (p.badge) flags += '<span class="flag flag--dark">' + esc(t("badge." + p.badge)) + "</span>";
      if (s.compare) flags += '<span class="flag">' + esc(t("badge.sale")) + "</span>";
      return '<li class="card">' +
        '<button class="card__media" type="button" data-open="' + p.id + '" aria-label="' + esc(t("col.view")) + ": " + name + '">' +
        (flags ? '<span class="card__badges">' + flags + "</span>" : "") + shot(p.id, p.tint, false) + "</button>" +
        "<div><h3 class=\"card__name\">" + name + '</h3><p class="card__tag">' + esc(p.tag[state.lang]) + "</p></div>" +
        '<div class="card__buy"><p class="price">' + priceMarkup(s) + "</p>" +
        '<button class="cart-btn" type="button" data-add="' + p.id + '" aria-label="' + esc(t("col.add")) + ": " + name + '">' +
        '<i class="ph ph-handbag" aria-hidden="true"></i></button></div></li>';
    }).join("");
    updateTrack();
  }

  var track = $("#track");
  var fill = $("#trackFill");
  var ticking = false;

  function updateTrack() {
    var max = track.scrollWidth - track.clientWidth;
    var ratio = track.scrollWidth ? track.clientWidth / track.scrollWidth : 1;
    var pos = max > 0 ? Math.min(1, Math.abs(track.scrollLeft) / max) : 0;
    fill.style.width = (ratio * 100) + "%";
    /* Move the thumb along the free part of the bar, mirrored in RTL. */
    var shift = ratio > 0 ? pos * ((1 - ratio) / ratio) * 100 : 0;
    fill.style.transform = "translateX(" + (state.lang === "ar" ? -shift : shift) + "%)";
    $("#prevBtn").disabled = pos <= 0.01;
    $("#nextBtn").disabled = pos >= 0.99 || max <= 0;
    ticking = false;
  }

  track.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(updateTrack); }
  }, { passive: true });
  window.addEventListener("resize", function () { requestAnimationFrame(updateTrack); });

  function pageTrack(step) {
    var card = $(".card", track);
    var amount = card ? (card.getBoundingClientRect().width + 16) * step : track.clientWidth * step;
    track.scrollBy({ left: (state.lang === "ar" ? -amount : amount), behavior: reduceMotion ? "auto" : "smooth" });
  }
  $("#prevBtn").addEventListener("click", function () { pageTrack(-2); });
  $("#nextBtn").addEventListener("click", function () { pageTrack(2); });

  /* ---------- dialogs ---------- */
  function openDialog(d) {
    if (typeof d.showModal !== "function") return;
    d.showModal();
    document.body.classList.add("is-locked");
    requestAnimationFrame(function () { requestAnimationFrame(function () { d.classList.add("is-open"); }); });
  }
  function closeDialog(d) {
    if (!d.open) return;
    d.classList.remove("is-open");
    var done = function () { if (d.open) d.close(); document.body.classList.remove("is-locked"); };
    if (reduceMotion) done(); else setTimeout(done, 450);
  }
  ["#pdp", "#cart"].forEach(function (sel) {
    var d = $(sel);
    d.addEventListener("click", function (e) { if (e.target === d) closeDialog(d); });
    d.addEventListener("cancel", function (e) { e.preventDefault(); closeDialog(d); });
  });

  /* ---------- quick view ---------- */
  function noteRow(label, list) {
    return "<div><dt>" + esc(label) + "</dt><dd>" + esc(list.join(state.lang === "ar" ? "، " : ", ")) + "</dd></div>";
  }

  function renderPdp() {
    var p = findItem(state.pdp.id);
    var size = p.sizes[state.pdp.size];
    var L = state.lang;
    $("#pdpBody").innerHTML =
      '<div class="pdp__media">' + shot(p.id, p.tint, true) + "</div>" +
      '<div class="pdp__info">' +
      '<button class="icon-btn pdp__close" type="button" data-close="pdp" aria-label="' + esc(t("pdp.close")) + '"><i class="ph ph-x" aria-hidden="true"></i></button>' +
      '<div><p class="pdp__fam">' + esc(t("fam." + p.fam)) + '</p><h2 class="pdp__name" id="pdpName">' + esc(p.name[L]) + "</h2></div>" +
      '<p class="pdp__desc">' + esc(p.desc[L]) + "</p>" +
      '<dl class="pdp__notes">' + noteRow(t("pdp.top"), p.notes.top[L]) + noteRow(t("pdp.heart"), p.notes.heart[L]) + noteRow(t("pdp.base"), p.notes.base[L]) + "</dl>" +
      '<fieldset class="sizes"><legend>' + esc(t("pdp.size")) + "</legend>" +
      p.sizes.map(function (s, i) {
        return '<label class="size"><input type="radio" name="size" value="' + i + '"' + (i === state.pdp.size ? " checked" : "") + ">" +
          "<span>" + esc(sizeLabel(p, s)) + "</span></label>";
      }).join("") + "</fieldset>" +
      '<div class="pdp__buy"><p class="pdp__price">' + priceMarkup(size) + "</p>" +
      '<button class="btn btn--dark" type="button" data-pdp-add><span>' + esc(t("pdp.add")) + "</span>" +
      '<span class="btn__dot btn__dot--light"><i class="ph ph-plus" aria-hidden="true"></i></span></button></div></div>';
  }

  function openProduct(id) {
    state.pdp = { id: id, size: 0 };
    renderPdp();
    openDialog($("#pdp"));
  }

  /* ---------- bag ---------- */
  function persistCart() { store.set(KEYS.cart, JSON.stringify(state.cart)); }
  function cartCount() { return state.cart.reduce(function (n, l) { return n + l.qty; }, 0); }
  function cartTotal() {
    return state.cart.reduce(function (sum, l) { return sum + findItem(l.id).sizes[l.size].price * l.qty; }, 0);
  }

  function addToCart(id, sizeIdx) {
    var found = state.cart.filter(function (l) { return l.id === id && l.size === sizeIdx; })[0];
    if (found) found.qty += 1; else state.cart.push({ id: id, size: sizeIdx, qty: 1 });
    persistCart();
    renderCart();
    toast(t("cart.added"));
  }

  function changeQty(id, sizeIdx, delta) {
    state.cart.forEach(function (l) { if (l.id === id && l.size === sizeIdx) l.qty += delta; });
    state.cart = state.cart.filter(function (l) { return l.qty > 0; });
    persistCart();
    renderCart();
  }

  function removeLine(id, sizeIdx) {
    state.cart = state.cart.filter(function (l) { return !(l.id === id && l.size === sizeIdx); });
    persistCart();
    renderCart();
  }

  function renderCart() {
    var count = cartCount();
    var badge = $("#cartCount");
    badge.hidden = count === 0;
    badge.textContent = count;

    var body = $("#cartBody");
    var foot = $("#cartFoot");

    if (!state.cart.length) {
      body.innerHTML = '<div class="empty"><p>' + esc(t("cart.empty")) + "</p>" +
        '<button class="btn btn--dark" type="button" data-browse><span>' + esc(t("cart.browse")) + "</span>" +
        '<span class="btn__dot btn__dot--light"><i class="ph ph-arrow-right flip" aria-hidden="true"></i></span></button></div>';
      foot.innerHTML = "";
      foot.hidden = true;
      return;
    }

    body.innerHTML = state.cart.map(function (l) {
      var item = findItem(l.id);
      var size = item.sizes[l.size];
      return '<div class="line"><div class="line__thumb">' + shot(item.thumb || item.id, item.tint, false) + "</div>" +
        '<div><p class="line__name">' + esc(item.name[state.lang]) + '</p><p class="line__size">' + esc(sizeLabel(item, size)) + "</p>" +
        '<div class="qty"><button type="button" data-qty="-1" data-id="' + l.id + '" data-size="' + l.size + '" aria-label="' + esc(t("cart.dec")) + '"><i class="ph ph-minus" aria-hidden="true"></i></button>' +
        "<span>" + l.qty + '</span><button type="button" data-qty="1" data-id="' + l.id + '" data-size="' + l.size + '" aria-label="' + esc(t("cart.inc")) + '"><i class="ph ph-plus" aria-hidden="true"></i></button></div>' +
        '<button class="line__remove" type="button" data-remove data-id="' + l.id + '" data-size="' + l.size + '">' + esc(t("cart.remove")) + "</button></div>" +
        '<p class="line__price">' + esc(money(size.price * l.qty)) + "</p></div>";
    }).join("");

    var total = cartTotal();
    var shipMsg = total >= FREE_AT ? t("cart.freeOk") : money(FREE_AT - total) + " " + t("cart.more");
    foot.hidden = false;
    foot.innerHTML =
      '<div class="sum"><span>' + esc(t("cart.subtotal")) + "</span><strong>" + esc(money(total)) + "</strong></div>" +
      '<p class="ship">' + esc(shipMsg) + "</p>" +
      '<button class="btn btn--dark btn--block" type="button" data-checkout><span>' + esc(t("cart.checkout")) + "</span>" +
      '<span class="btn__dot btn__dot--light"><i class="ph ph-arrow-right flip" aria-hidden="true"></i></span></button>';
  }

  /* ---------- toast ---------- */
  var toastTimer = null;
  function toast(msg) {
    var el = $("#toast");
    el.textContent = msg;
    el.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("is-on"); }, 2800);
  }

  /* ---------- menu ---------- */
  function setMenu(open) {
    var btn = $("#menuBtn");
    var menu = $("#menu");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", t(open ? "nav.menuClose" : "nav.menuOpen"));
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", open ? "false" : "true");
    document.body.classList.toggle("is-locked", open);
    document.body.classList.toggle("menu-open", open);
    if (open) window.scrollTo({ top: 0, behavior: "auto" });
  }

  /* ---------- newsletter ---------- */
  function setFormMsg(text, kind) {
    var msg = $("#emailMsg");
    msg.textContent = text;
    msg.className = "form-msg" + (kind ? " is-" + kind : "");
    $(".field").classList.toggle("is-invalid", kind === "error");
  }

  $("#newsForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var input = $("#email");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim())) {
      setFormMsg(t("news.err"), "error");
      input.setAttribute("aria-invalid", "true");
      input.focus();
      return;
    }
    input.removeAttribute("aria-invalid");
    setFormMsg(t("news.ok"), "ok");
    input.value = "";
  });

  /* ---------- delegated events ---------- */
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-open],[data-add],[data-close],[data-pdp-add],[data-qty],[data-remove],[data-checkout],[data-browse],a[href^='#']");
    if (!el) return;

    if (el.hasAttribute("data-open")) { openProduct(el.getAttribute("data-open")); return; }
    if (el.hasAttribute("data-add")) { addToCart(el.getAttribute("data-add"), 0); return; }
    if (el.hasAttribute("data-close")) { closeDialog($("#" + el.getAttribute("data-close"))); return; }
    if (el.hasAttribute("data-pdp-add")) { addToCart(state.pdp.id, state.pdp.size); closeDialog($("#pdp")); return; }
    if (el.hasAttribute("data-qty")) {
      changeQty(el.getAttribute("data-id"), parseInt(el.getAttribute("data-size"), 10), parseInt(el.getAttribute("data-qty"), 10));
      return;
    }
    if (el.hasAttribute("data-remove")) { removeLine(el.getAttribute("data-id"), parseInt(el.getAttribute("data-size"), 10)); return; }
    if (el.hasAttribute("data-checkout")) { toast(t("cart.demo")); return; }
    if (el.hasAttribute("data-browse")) {
      closeDialog($("#cart"));
      setTimeout(function () { $("#collection").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); }, 480);
      return;
    }
    if (el.tagName === "A" && $("#menu").classList.contains("is-open")) {
      setMenu(false);
      var target = $(el.getAttribute("href"));
      if (target) { e.preventDefault(); setTimeout(function () { target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); }, 50); }
    }
  });

  document.addEventListener("change", function (e) {
    if (e.target && e.target.name === "size") {
      state.pdp.size = parseInt(e.target.value, 10);
      renderPdp();
      var checked = $('#pdpBody input[name="size"]:checked');
      if (checked) checked.focus();
    }
  });

  $("#langBtn").addEventListener("click", function () { setLang(state.lang === "ar" ? "en" : "ar"); });
  $("#cartBtn").addEventListener("click", function () { openDialog($("#cart")); });
  $("#cartClose").addEventListener("click", function () { closeDialog($("#cart")); });
  $("#menuBtn").addEventListener("click", function () { setMenu($("#menuBtn").getAttribute("aria-expanded") !== "true"); });
  $("#giftBtn").addEventListener("click", function () { addToCart(DISCOVERY.id, 0); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && $("#menu").classList.contains("is-open")) setMenu(false);
  });

  /* ---------- init ---------- */
  applyI18n();
  renderSignature();
  renderTrack();
  renderCart();
  observeAll(document);
})();
