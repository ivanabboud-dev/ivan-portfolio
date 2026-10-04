/* Larchmere wholesale demo: routing, pricing rules, quick order and cart. */
(function () {
  "use strict";

  const { rules, categories, products, accounts, setups } = window.LM;
  const bySku = Object.fromEntries(products.map((p) => [p.sku, p]));
  const app = document.getElementById("app");
  const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });
  const gbpFine = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 3, maximumFractionDigits: 3 });
  const dayFmt = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" });

  /* ---------- State (kept in this browser only) ---------- */
  const KEY = "larchmere-demo-v1";
  const state = loadState();
  let qoRows = [];
  let qoLoadedSetup = null;
  let pdpQty = 1;
  let catFilter = { cat: "all", q: "" };

  function loadState() {
    const blank = { account: null, cart: {}, orders: [], lastOrders: {}, applied: null };
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!raw || typeof raw !== "object") return blank;
      return {
        account: accounts[raw.account] ? raw.account : null,
        cart: cleanQtyMap(raw.cart),
        orders: Array.isArray(raw.orders) ? raw.orders.slice(-20) : [],
        lastOrders: raw.lastOrders && typeof raw.lastOrders === "object" ? raw.lastOrders : {},
        applied: typeof raw.applied === "string" ? raw.applied : null
      };
    } catch (e) {
      return blank;
    }
  }
  function saveState() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage blocked: demo keeps working in memory */ }
  }
  function cleanQtyMap(map) {
    const out = {};
    if (map && typeof map === "object") {
      for (const [sku, q] of Object.entries(map)) {
        const n = parseInt(q, 10);
        if (bySku[sku] && n > 0) out[sku] = Math.min(n, 999);
      }
    }
    return out;
  }

  /* ---------- Helpers ---------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const round2 = (n) => Math.round(n * 100) / 100;
  const money = (n) => gbp.format(n);
  const unitMoney = (n) => (n < 1 ? gbpFine.format(n) : gbp.format(n));
  const clampQty = (n, min) => Math.min(999, Math.max(min, Number.isFinite(n) ? n : min));
  const catLabel = (id) => (categories.find((c) => c.id === id) || {}).label || "";
  const account = () => accounts[state.account] || null;
  const casesWord = (n) => (n === 1 ? "case" : "cases");

  function tierFor(q) {
    return rules.tiers.find((t) => q >= t.from && q <= t.to) || rules.tiers[0];
  }
  function nextTier(q) {
    return rules.tiers.find((t) => t.from > q) || null;
  }
  function casePrice(p, q) {
    return round2(p.price * (1 - tierFor(Math.max(1, q)).off));
  }
  function pct(off) {
    return Math.round(off * 100) + "%";
  }

  function totals(map) {
    const lines = [];
    let cases = 0, list = 0, net = 0;
    for (const [sku, q] of Object.entries(map)) {
      const p = bySku[sku];
      if (!p || q < 1) continue;
      const unit = casePrice(p, q);
      const total = round2(unit * q);
      const listTotal = round2(p.price * q);
      lines.push({ p, q, unit, total, listTotal, tier: tierFor(q), short: q < p.minCases });
      cases += q;
      list += listTotal;
      net += total;
    }
    list = round2(list);
    net = round2(net);
    const savings = round2(list - net);
    const delivery = net === 0 || net >= rules.freeDeliveryFrom ? 0 : rules.deliveryFee;
    const vat = round2((net + delivery) * rules.vatRate);
    return {
      lines, cases, list, net, savings, delivery, vat,
      total: round2(net + delivery + vat),
      minMet: net >= rules.minimumOrder,
      toMin: round2(Math.max(0, rules.minimumOrder - net)),
      short: lines.filter((l) => l.short)
    };
  }

  function lastOrderFor(acc) {
    if (!acc) return null;
    const saved = state.lastOrders[acc.id];
    const map = cleanQtyMap(saved || acc.lastOrder);
    return Object.keys(map).length ? map : null;
  }

  function isoDate(d) {
    const pad = (n) => String(n).padStart(2, "0");
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }
  function nextWeekday(from) {
    const d = new Date(from);
    d.setDate(d.getDate() + 1);
    while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
    return d;
  }
  function parseIso(s) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }

  /* ---------- Shared bits ---------- */
  function stepper({ scope, sku, qty, min = 1, small = false, label }) {
    return `<div class="stepper${small ? " stepper-sm" : ""}" data-scope="${scope}" data-sku="${sku}">
      <button type="button" data-act="dec" aria-label="One case fewer"${qty <= min ? " disabled" : ""}><i class="ph-bold ph-minus" aria-hidden="true"></i></button>
      <input type="number" inputmode="numeric" min="${min}" max="999" step="1" value="${qty}" aria-label="${esc(label)}">
      <button type="button" data-act="inc" aria-label="One case more"${qty >= 999 ? " disabled" : ""}><i class="ph-bold ph-plus" aria-hidden="true"></i></button>
    </div>`;
  }

  function productCard(p) {
    const signed = !!account();
    const per = p.price / p.units;
    const price = signed
      ? `<span class="mono">${money(p.price)} / case</span><small class="mono">${unitMoney(per)} per ${p.unitLabel}</small>`
      : `<span class="price-locked"><i class="ph-bold ph-lock-simple" aria-hidden="true"></i>Trade price after sign-in</span>`;
    const action = signed
      ? `<button class="btn btn-ghost btn-sm" type="button" data-act="add" data-sku="${p.sku}" data-qty="${p.minCases}">${p.minCases > 1 ? "Add " + p.minCases + " cases" : "Add case"}</button>`
      : `<button class="btn btn-ghost btn-sm" type="button" data-act="signin">Sign in to order</button>`;
    return `<article class="product">
      <a class="product-photo" href="#/product/${p.sku}" tabindex="-1" aria-hidden="true"><img src="${p.img}" alt="" width="900" height="900" loading="lazy" decoding="async"></a>
      <p class="product-cat">${catLabel(p.category)}</p>
      <h3 class="product-name"><a href="#/product/${p.sku}">${esc(p.name)}</a></h3>
      <p class="product-pack">${p.pack}</p>
      <div class="product-price">${price}</div>
      <div class="product-actions">${action}</div>
    </article>`;
  }

  function signInGate(title, line) {
    return `<div class="empty">
      <h3>${title}</h3>
      <p>${line}</p>
      <div class="empty-actions">
        <button class="btn" type="button" data-act="signin">Sign in</button>
        <a class="text-link" href="#/apply">Apply for trade</a>
      </div>
    </div>`;
  }

  /* ---------- Views ---------- */
  function viewHome() {
    const signed = !!account();
    const ctas = signed
      ? `<a class="btn" href="#/quick-order">Start an order</a><a class="text-link" href="#/catalog">Browse the catalog</a>`
      : `<a class="btn" href="#/apply">Apply for trade</a><button class="text-link" type="button" data-act="signin">Sign in to see prices</button>`;
    const everyday = ["LM-ESP-1K", "LM-TEA-EB", "LM-CUP-08", "LM-OAT-1L"].map((s) => productCard(bySku[s])).join("");
    const t = rules.tiers;
    const sc = setups["small-counter"];

    return `
    <section class="hero wrap" aria-labelledby="hero-title">
      <div class="hero-copy">
        <h1 id="hero-title">Coffee, tea and cups for cafés, sold by the case.</h1>
        <p class="hero-sub">Trade prices, quantity breaks and 30-day terms for approved accounts.</p>
        <div class="hero-ctas">${ctas}</div>
      </div>
      <div class="hero-photo">
        <img src="img/hero-station.webp" alt="A coffee station on a tiled counter with a bean-to-cup machine, cups and syrup bottles" width="2000" height="1000" fetchpriority="high">
      </div>
    </section>

    <section class="pricing wrap" id="pricing" aria-labelledby="pricing-title">
      <h2 class="section-title" id="pricing-title">How trade pricing works</h2>
      <div class="bento">
        <div class="cell cell-ladder">
          <div class="ladder">
            <div class="ladder-row"><span>${t[0].label}</span><span class="ladder-off is-base">trade price</span></div>
            <div class="ladder-row"><span>${t[1].label}</span><span class="ladder-off">${pct(t[1].off)} off</span></div>
            <div class="ladder-row"><span>${t[2].label}</span><span class="ladder-off">${pct(t[2].off)} off</span></div>
          </div>
          <p class="ladder-note">Breaks count per product. Five cases of espresso get 6% off, even if everything else in the order is a single case.</p>
        </div>
        <div class="cell cell-min">
          <h3>${money(rules.minimumOrder).replace(".00", "")} minimum order</h3>
          <p>Mix any products to reach it. Delivery is free from ${money(rules.freeDeliveryFrom).replace(".00", "")}, otherwise ${money(rules.deliveryFee)}.</p>
        </div>
        <div class="cell cell-photo"><img src="img/case-stack.webp" alt="Stacked kraft cardboard cases" width="1000" height="1000" loading="lazy"></div>
        <div class="cell cell-terms">
          <h3>30-day terms</h3>
          <p>Approved accounts pay by invoice, 30 days after delivery.</p>
        </div>
      </div>
    </section>

    <section class="featured wrap" aria-labelledby="everyday-title">
      <div class="row-head">
        <h2 class="section-title" id="everyday-title">The everyday order</h2>
        <a class="text-link" href="#/catalog">All ${products.length} products</a>
      </div>
      <div class="grid">${everyday}</div>
    </section>

    <section class="teaser wrap" aria-labelledby="teaser-title">
      <div class="look-hero">
        <img src="${sc.img}" alt="${esc(sc.alt)}" width="1800" height="1000" loading="lazy">
        <div class="look-panel">
          <h2 id="teaser-title">${sc.title}</h2>
          <p>${sc.line}</p>
          <a class="text-link" href="#/lookbook">See all three setups</a>
        </div>
      </div>
    </section>

    ${viewApplySection()}`;
  }

  function viewApplySection() {
    const done = state.applied;
    const body = done
      ? `<div class="apply-done" role="status">
          <h3>Thanks, ${esc(done)}.</h3>
          <p>Your application is in. In a live store it goes to the team for approval, and approved accounts see trade prices at their next sign-in.</p>
          <p>This demo sends nothing. To look around, sign in with a demo account.</p>
          <div class="empty-actions" style="justify-content:flex-start">
            <button class="btn" type="button" data-act="signin">Sign in</button>
            <button class="text-link" type="button" data-act="apply-reset">Fill the form again</button>
          </div>
        </div>`
      : `<form class="apply-form" id="apply-form" novalidate>
          <div class="field"><label for="ap-biz">Business name</label><input class="input" id="ap-biz" name="biz" autocomplete="organization" placeholder="e.g. Pine Street Café Ltd" required></div>
          <div class="field"><label for="ap-name">Contact name</label><input class="input" id="ap-name" name="name" autocomplete="name" placeholder="e.g. Alex Brown" required></div>
          <div class="field full"><label for="ap-email">Work email</label><input class="input" id="ap-email" name="email" type="email" autocomplete="email" spellcheck="false" placeholder="orders@yourcafe.co.uk" required></div>
          <div class="field"><label for="ap-type">Business type</label>
            <select class="select" id="ap-type" name="type"><option>Café</option><option>Restaurant</option><option>Hotel</option><option>Office kitchen</option><option>Other</option></select></div>
          <div class="field"><label for="ap-spend">Expected monthly spend</label>
            <select class="select" id="ap-spend" name="spend"><option>Under £500</option><option selected>£500 to £1,500</option><option>£1,500 to £5,000</option><option>Over £5,000</option></select></div>
          <div class="field"><label for="ap-post">Delivery postcode</label><input class="input" id="ap-post" name="post" autocomplete="postal-code" placeholder="e.g. SW1A 1AA" required></div>
          <div class="field"><label for="ap-vat">VAT number (optional)</label><input class="input" id="ap-vat" name="vat" autocomplete="off" spellcheck="false" placeholder="e.g. 123 4567 89"></div>
          <div class="full"><button class="btn btn-block btn-lg" type="submit">Send application</button></div>
        </form>`;
    return `<section class="apply wrap" id="apply" aria-labelledby="apply-title">
      <div class="apply-grid">
        <div>
          <h2 class="apply-title" id="apply-title">Apply for a trade account</h2>
          <p class="page-lede">We check every application by hand and reply within one working day.</p>
          <ul class="perks">
            <li><i class="ph ph-tag" aria-hidden="true"></i>Trade prices on every product</li>
            <li><i class="ph ph-stack" aria-hidden="true"></i>Quantity breaks from 5 cases</li>
            <li><i class="ph ph-receipt" aria-hidden="true"></i>30-day terms after three paid orders</li>
          </ul>
        </div>
        <div class="apply-panel">${body}</div>
      </div>
    </section>`;
  }

  function viewCatalog(params) {
    const acc = account();
    const cat = categories.some((c) => c.id === params.get("cat")) ? params.get("cat") : "all";
    catFilter = { cat, q: params.get("q") || "" };
    return `<section class="page wrap">
      <div class="page-head">
        <div>
          <h1 class="page-title">Catalog</h1>
          ${acc ? "" : `<p class="page-lede">Browse everything. Trade prices and ordering open after sign-in.</p>`}
        </div>
        ${acc ? `<span class="tag">Trade account: ${esc(acc.name)}</span>` : ""}
      </div>
      <div class="filters">
        <div class="tabs" role="tablist" aria-label="Category">
          ${categories.map((c) => `<button class="tab" role="tab" type="button" aria-selected="${c.id === cat}" data-act="cat" data-cat="${c.id}">${c.label}</button>`).join("")}
        </div>
        <div class="search">
          <i class="ph-bold ph-magnifying-glass" aria-hidden="true"></i>
          <label class="visually-hidden" for="cat-search">Search by name or SKU</label>
          <input class="input" id="cat-search" type="search" placeholder="Search name or SKU…" spellcheck="false" value="${esc(catFilter.q)}" autocomplete="off">
        </div>
      </div>
      <div id="cat-results" aria-live="polite">${catalogResults()}</div>
    </section>`;
  }

  function catalogResults() {
    const { cat, q } = catFilter;
    const term = q.trim().toLowerCase();
    const list = products.filter((p) =>
      (cat === "all" || p.category === cat) &&
      (!term || p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term)));
    if (!list.length) {
      return `<div class="empty">
        <h3>Nothing matches “${esc(q.trim())}”</h3>
        <p>Try part of a name, or a SKU such as LM-ESP-1K.</p>
        <button class="text-link" type="button" data-act="clear-search">Clear the search</button>
      </div>`;
    }
    return `<div class="grid">${list.map(productCard).join("")}</div>`;
  }

  function refreshCatalog() {
    const box = document.getElementById("cat-results");
    if (box) box.innerHTML = catalogResults();
    document.querySelectorAll(".tab").forEach((t) => t.setAttribute("aria-selected", String(t.dataset.cat === catFilter.cat)));
    const qs = new URLSearchParams();
    if (catFilter.cat !== "all") qs.set("cat", catFilter.cat);
    if (catFilter.q.trim()) qs.set("q", catFilter.q.trim());
    const hash = "#/catalog" + (qs.toString() ? "?" + qs : "");
    if (location.hash !== hash) history.replaceState(null, "", hash);
  }

  function viewProduct(sku) {
    const p = bySku[sku];
    if (!p) return viewNotFound();
    const acc = account();
    const inCart = state.cart[sku] || 0;
    pdpQty = Math.max(p.minCases, inCart || p.minCases);
    const gallery = [p.img, ...p.gallery];
    const tierRows = rules.tiers.map((t, i) => {
      const price = round2(p.price * (1 - t.off));
      const right = acc
        ? `<span class="mono">${money(price)}</span><span class="per mono">${unitMoney(price / p.units)} / ${p.unitLabel}</span>`
        : `<span class="mono">${t.off ? pct(t.off) + " off" : "trade price"}</span><span class="per"></span>`;
      return `<div class="tier-row" data-tier="${i}"><span>${t.label}</span>${right}</div>`;
    }).join("");
    const related = products.filter((x) => x.sku !== sku && x.category === p.category)
      .concat(products.filter((x) => x.category !== p.category && ["LM-CUP-08", "LM-LID-80", "LM-OAT-1L", "LM-ESP-1K"].includes(x.sku)))
      .slice(0, 4);

    const buy = acc
      ? `<div class="buy">
          ${stepper({ scope: "pdp", sku, qty: pdpQty, min: p.minCases, label: "Cases of " + p.name })}
          <span class="buy-total" id="pdp-total">${money(casePrice(p, pdpQty) * pdpQty)}</span>
        </div>
        <button class="btn btn-block" type="button" data-act="pdp-add" data-sku="${sku}">${inCart ? "Update order" : "Add to order"}</button>
        <p class="nudge" id="pdp-nudge"></p>`
      : `<div class="buy"><button class="btn btn-block" type="button" data-act="signin">Sign in to see prices and order</button></div>`;

    return `<section class="page wrap">
      <div class="pdp">
        <div class="pdp-info">
          <nav class="crumb" aria-label="Breadcrumb"><a href="#/catalog">Catalog</a> / <a href="#/catalog?cat=${p.category}">${catLabel(p.category)}</a></nav>
          <h1>${esc(p.name)}</h1>
          <p class="pdp-blurb">${p.blurb}</p>
          <p class="pdp-sku" translate="no">${p.sku}</p>
          <div class="tiers" id="pdp-tiers">${tierRows}</div>
          <p class="pdp-pack">${p.pack}${p.minCases > 1 ? ". Minimum " + p.minCases + " cases" : ""}${inCart ? `. <span class="tag">${inCart} ${casesWord(inCart)} in your order</span>` : ""}</p>
          ${buy}
          <div class="pdp-details">${p.details.map((d) => `<span>${d}</span>`).join("")}</div>
        </div>
        <div class="pdp-gallery">
          <div class="pdp-main"><img id="pdp-main" src="${gallery[0]}" alt="${esc(p.name)}" width="900" height="900"></div>
          <div class="thumbs">${gallery.map((g, i) => `<button class="thumb" type="button" data-act="thumb" data-src="${g}" aria-pressed="${i === 0}" aria-label="Show photo ${i + 1}"><img src="${g}" alt="" width="88" height="88" loading="lazy"></button>`).join("")}</div>
        </div>
      </div>
      <div class="related">
        <div class="row-head"><h2 class="section-title">Often ordered with it</h2></div>
        <div class="grid">${related.map(productCard).join("")}</div>
      </div>
    </section>`;
  }

  function updatePdp(sku) {
    const p = bySku[sku];
    if (!p) return;
    const current = rules.tiers.indexOf(tierFor(pdpQty));
    document.querySelectorAll("#pdp-tiers .tier-row").forEach((row) => row.classList.toggle("is-current", +row.dataset.tier === current && !!account()));
    const total = document.getElementById("pdp-total");
    if (total) total.textContent = money(casePrice(p, pdpQty) * pdpQty);
    const st = document.querySelector('.stepper[data-scope="pdp"]');
    if (st) {
      st.querySelector("input").value = pdpQty;
      st.querySelector('[data-act="dec"]').disabled = pdpQty <= p.minCases;
      st.querySelector('[data-act="inc"]').disabled = pdpQty >= 999;
    }
    const nudge = document.getElementById("pdp-nudge");
    if (nudge) {
      const nt = nextTier(pdpQty);
      nudge.innerHTML = nt
        ? `Add ${nt.from - pdpQty} more ${casesWord(nt.from - pdpQty)} to reach the <strong>${pct(nt.off)} off</strong> tier.`
        : `You are on the best price tier.`;
    }
  }

  function viewQuickOrder(params) {
    const acc = account();
    const setupId = params.get("setup");
    if (setupId && setups[setupId] && qoLoadedSetup !== setupId) {
      mergeRows(setups[setupId].items);
      qoLoadedSetup = setupId;
    }
    const head = `<div class="page-head">
        <div>
          <h1 class="page-title">Quick order</h1>
          <p class="page-lede">Type a SKU or product name, set the cases, then add everything at once.</p>
        </div>
        ${acc ? `<div class="qo-tools">
          ${lastOrderFor(acc) ? `<button class="text-link" type="button" data-act="qo-reorder">Reorder last order</button>` : ""}
          <button class="text-link" type="button" data-act="paste-toggle" aria-expanded="false" aria-controls="paste-box">Paste a list</button>
          ${qoRows.length ? `<button class="text-link" type="button" data-act="qo-clear">Clear</button>` : ""}
        </div>` : ""}
      </div>`;
    if (!acc) {
      return `<section class="page wrap">${head}${signInGate("Sign in to use quick order", "Quick order uses your trade prices, so it opens after sign-in.")}</section>`;
    }
    return `<section class="page wrap">${head}
      <div class="paste-box" id="paste-box" hidden>
        <label for="paste-area" style="font-weight:500;font-size:14px">One line per product: SKU, then cases</label>
        <textarea class="textarea" id="paste-area" placeholder="LM-ESP-1K 3&#10;LM-CUP-08, 2&#10;LM-SYR-VAN x1" spellcheck="false"></textarea>
        <div class="paste-actions">
          <button class="btn btn-sm" type="button" data-act="paste-apply">Add to the table</button>
          <span class="paste-msg" id="paste-msg" role="status"></span>
        </div>
      </div>
      <div id="qo-body">${quickOrderBody()}</div>
    </section>`;
  }

  function quickOrderBody() {
    const map = {};
    qoRows.forEach((r) => { map[r.sku] = r.qty; });
    const t = totals(map);
    const rows = qoRows.map((r) => {
      const p = bySku[r.sku];
      const unit = casePrice(p, r.qty);
      return `<tr>
        <td class="cell-prod"><div class="qo-prod"><img src="${p.img}" alt="" width="48" height="48" loading="lazy">
          <div><a href="#/product/${p.sku}">${esc(p.name)}</a><small>${p.pack}</small>${r.qty < p.minCases ? `<span class="qo-min">Minimum ${p.minCases} cases</span>` : ""}</div></div></td>
        <td class="col-sku mono" translate="no">${p.sku}</td>
        <td class="col-price num mono">${money(unit)}</td>
        <td>${stepper({ scope: "qo", sku: p.sku, qty: r.qty, small: true, label: "Cases of " + p.name })}</td>
        <td class="num mono cell-total">${money(unit * r.qty)}</td>
        <td class="num"><button class="remove-x" type="button" data-act="qo-remove" data-sku="${p.sku}" aria-label="Remove ${esc(p.name)}"><i class="ph-bold ph-x" aria-hidden="true"></i></button></td>
      </tr>`;
    }).join("");
    const empty = qoRows.length ? "" : `<tr><td colspan="6" class="muted" style="padding:28px 12px">No products yet. Search below, paste a list, or reorder your last order.</td></tr>`;
    return `<table class="qo-table">
        <thead><tr><th>Product</th><th class="col-sku">SKU</th><th class="col-price num">Price per case</th><th>Cases</th><th class="num">Line total</th><th><span class="visually-hidden">Remove</span></th></tr></thead>
        <tbody>${rows}${empty}
          <tr class="qo-add-row"><td colspan="6">
            <div class="picker">
              <i class="ph-bold ph-magnifying-glass" aria-hidden="true"></i>
              <label class="visually-hidden" for="qo-picker">Add a product by SKU or name</label>
              <input class="input" id="qo-picker" type="text" placeholder="Add SKU or product name…" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="false" aria-controls="qo-suggest" aria-autocomplete="list">
              <ul class="suggest" id="qo-suggest" role="listbox" hidden></ul>
            </div>
          </td></tr>
        </tbody>
      </table>
      <div class="qo-foot">
        <div class="qo-sum"><span>${t.cases} ${casesWord(t.cases)}</span><span>Subtotal <span class="mono">${money(t.net)}</span></span></div>
        <button class="btn" type="button" data-act="qo-add-all"${qoRows.length ? "" : " disabled"}>Add all to order</button>
      </div>`;
  }

  function mergeRows(map) {
    for (const [sku, q] of Object.entries(cleanQtyMap(map))) {
      const row = qoRows.find((r) => r.sku === sku);
      if (row) row.qty = Math.min(999, row.qty + q);
      else qoRows.push({ sku, qty: q });
    }
  }

  function refreshQuickOrder(focusSel) {
    const body = document.getElementById("qo-body");
    if (!body) return;
    body.innerHTML = quickOrderBody();
    const clear = document.querySelector('[data-act="qo-clear"]');
    if (!qoRows.length && clear) clear.remove();
    if (qoRows.length && !clear) {
      const tools = document.querySelector(".qo-tools");
      if (tools) tools.insertAdjacentHTML("beforeend", `<button class="text-link" type="button" data-act="qo-clear">Clear</button>`);
    }
    if (focusSel) { const el = document.querySelector(focusSel); if (el && !el.disabled) el.focus(); }
  }

  function viewCart() {
    const acc = account();
    if (!acc) {
      return `<section class="page wrap"><div class="page-head"><h1 class="page-title">Your order</h1></div>
        ${signInGate("Sign in to see your order", "Orders are saved to your trade account.")}</section>`;
    }
    const t = totals(state.cart);
    if (!t.lines.length) {
      const last = lastOrderFor(acc);
      return `<section class="page wrap"><div class="page-head"><h1 class="page-title">Your order</h1></div>
        <div class="empty">
          <h3>Your order is empty</h3>
          <p>Add cases from the catalog, or build the whole order in one table.</p>
          <div class="empty-actions">
            <a class="btn" href="#/catalog">Browse the catalog</a>
            <a class="text-link" href="#/quick-order">Use quick order</a>
            ${last ? `<button class="text-link" type="button" data-act="cart-reorder">Reorder last order</button>` : ""}
          </div>
        </div></section>`;
    }
    const lines = t.lines.map((l) => {
      const nt = nextTier(l.q);
      const tierLine = l.short
        ? `<span class="chip chip-warn">Minimum ${l.p.minCases} cases for this product</span>`
        : l.tier.off
          ? `<span class="chip">${pct(l.tier.off)} tier applied</span>`
          : nt ? `<span class="chip">${nt.from - l.q} more for ${pct(nt.off)} off</span>` : "";
      return `<div class="line">
        <a class="line-photo" href="#/product/${l.p.sku}" tabindex="-1" aria-hidden="true"><img src="${l.p.img}" alt="" width="148" height="148" loading="lazy"></a>
        <div>
          <a class="line-name" href="#/product/${l.p.sku}">${esc(l.p.name)}</a>
          <div class="line-meta">${l.p.pack} · ${money(l.unit)} per case</div>
          ${tierLine}
        </div>
        <div class="qty-cell">${stepper({ scope: "cart", sku: l.p.sku, qty: l.q, label: "Cases of " + l.p.name })}<span class="qty-cap" aria-hidden="true">cases</span></div>
        <div class="line-total"><span class="mono">${money(l.total)}</span><button class="text-link" type="button" data-act="cart-remove" data-sku="${l.p.sku}">Remove</button></div>
      </div>`;
    }).join("");

    const minLine = t.minMet
      ? `<div class="minbar ok"><span class="minbar-ico" aria-hidden="true"><i class="ph-bold ph-check"></i></span><span>${money(rules.minimumOrder).replace(".00", "")} minimum order: met</span></div>`
      : `<div class="minbar short"><span class="minbar-ico" aria-hidden="true"><i class="ph-bold ph-exclamation-mark"></i></span><span>Add ${money(t.toMin)} more to reach the ${money(rules.minimumOrder).replace(".00", "")} minimum order.</span></div>`;
    const blocked = !t.minMet || t.short.length > 0;
    const tomorrow = nextWeekday(new Date());
    const min = new Date(); min.setDate(min.getDate() + 1);

    return `<section class="page page-tight wrap">
      <div class="cart">
        <div class="cart-main"><h1 class="page-title">Your order</h1><div class="lines">${lines}</div></div>
        <aside class="summary" aria-labelledby="sum-title">
          <h2 id="sum-title">Order summary</h2>
          ${minLine}
          <div class="sum-rows">
            <div class="sum-row"><span>Subtotal (${t.cases} ${casesWord(t.cases)})</span><span class="mono">${money(t.list)}</span></div>
            <div class="sum-row${t.savings ? " saving" : ""}"><span>Tier savings</span><span class="mono">${t.savings ? "-" + money(t.savings) : money(0)}</span></div>
            <div class="sum-row"><span>Delivery${t.delivery ? ` <span class="muted">(free from ${money(rules.freeDeliveryFrom).replace(".00", "")})</span>` : ""}</span><span class="mono">${t.delivery ? money(t.delivery) : "Free"}</span></div>
            <div class="sum-row"><span>VAT ${pct(rules.vatRate)}</span><span class="mono">${money(t.vat)}</span></div>
            <div class="sum-row total"><span>Total</span><span class="mono">${money(t.total)}</span></div>
          </div>
          <form id="checkout" novalidate>
            <div class="field-row">
              <div class="field"><label for="po">PO number (optional)</label><input class="input" id="po" name="po" maxlength="30" autocomplete="off" spellcheck="false" placeholder="e.g. PO-12345"></div>
              <div class="field"><label for="deliver">Delivery date</label><input class="input" id="deliver" name="deliver" type="date" min="${isoDate(min)}" value="${isoDate(tomorrow)}" aria-describedby="deliver-hint" required></div>
              <span class="hint hint-right" id="deliver-hint">Orders placed by 2pm leave the same day.</span>
            </div>
            <fieldset class="pay-options">
              <legend>Payment</legend>
              <label class="radio"><input type="radio" name="pay" value="card" ${acc.terms ? "" : "checked"}><span>Pay by card<small>Charged when the order ships.</small></span></label>
              <label class="radio${acc.terms ? "" : " is-off"}"><input type="radio" name="pay" value="invoice" ${acc.terms ? "checked" : "disabled"}><span>30-day invoice<small>${acc.terms ? "Due 30 days after delivery." : "Opens after three paid orders."}</small></span></label>
            </fieldset>
            <div class="form-errors" id="checkout-errors" role="alert" hidden></div>
            <button class="btn btn-block" type="submit"${blocked ? ' aria-disabled="true"' : ""}>Place order</button>
            <p class="fine">Demo store: no order is sent and no payment is taken.</p>
          </form>
        </aside>
      </div>
    </section>`;
  }

  function viewOrder(id) {
    const o = state.orders.find((x) => x.id === id);
    if (!o) return viewNotFound();
    return `<section class="page wrap"><div class="confirm">
      <h1 class="page-title">Order ${o.id} received</h1>
      <p class="page-lede">This is a demo, so nothing was sent and no payment was taken. In a live store the warehouse gets it now and you get an email confirmation.</p>
      <div class="confirm-box">
        <div class="sum-row"><span class="muted">Account</span><span>${esc(o.account)}</span></div>
        <div class="sum-row"><span class="muted">Delivery</span><span>${dayFmt.format(parseIso(o.deliver))}</span></div>
        ${o.po ? `<div class="sum-row"><span class="muted">PO number</span><span class="mono">${esc(o.po)}</span></div>` : ""}
        <div class="sum-row"><span class="muted">Payment</span><span>${o.pay === "invoice" ? "30-day invoice" : "Card"}</span></div>
        <div class="sum-row"><span class="muted">Cases</span><span class="mono">${o.cases}</span></div>
        <div class="sum-row total"><span>Total</span><span class="mono">${money(o.total)}</span></div>
      </div>
      <div class="empty-actions" style="justify-content:flex-start;margin-top:28px">
        <a class="btn" href="#/catalog">Back to the catalog</a>
      </div>
    </div></section>`;
  }

  function viewLookbook() {
    const main = setups["small-counter"];
    const count = (s) => Object.keys(s.items).length;
    const item = (id, cls) => {
      const s = setups[id];
      return `<div class="look-item ${cls}"><figure>
        <div class="ph"><img src="${s.img}" alt="${esc(s.alt)}" width="${cls === "tall" ? 900 : 1200}" height="${cls === "tall" ? 1100 : 900}" loading="lazy"></div>
        <figcaption class="look-cap"><h3>${s.title}</h3><a class="arrow-link" href="#/quick-order?setup=${id}">Shop this setup (${count(s)} products)<i class="ph-bold ph-arrow-right" aria-hidden="true"></i></a><p>${s.line}</p></figcaption>
      </figure></div>`;
    };
    return `<section class="page page-tight wrap">
      <div class="look-head">
        <h1 class="page-title">Lookbook</h1>
        <p class="page-lede">Three setups and the products in them. Load one into quick order, then change the cases to suit you.</p>
      </div>
      <div class="look-hero look-hero-wide">
        <img src="${main.img}" alt="${esc(main.alt)}" width="1800" height="1000">
        <div class="look-panel">
          <h2>${main.title}</h2>
          <p>${main.line}</p>
          <a class="arrow-link" href="#/quick-order?setup=small-counter">Shop this setup (${count(main)} products)<i class="ph-bold ph-arrow-right" aria-hidden="true"></i></a>
        </div>
      </div>
      <div class="look-pair">${item("tea-bar", "tall")}${item("takeaway", "wide")}</div>
    </section>`;
  }

  function viewHelp(topic) {
    const pages = {
      delivery: { title: "Delivery", body: `
        <p>Orders placed by 2pm, Monday to Friday, leave our warehouse the same day. Most UK addresses get them the next working day.</p>
        <p>Delivery is free on orders from ${money(rules.freeDeliveryFrom).replace(".00", "")} before VAT. Below that it costs ${money(rules.deliveryFee)}. The minimum order is ${money(rules.minimumOrder).replace(".00", "")}.</p>
        <h2>Large orders</h2>
        <p>Orders over 40 cases go on a pallet. Pick a delivery date at checkout and we will book a slot with you.</p>` },
      returns: { title: "Returns", body: `
        <p>Unopened cases can come back within 14 days. We collect them and credit your account once they arrive.</p>
        <h2>Damaged or missing items</h2>
        <p>Send a photo within 48 hours of delivery and we credit the line or send a replacement with your next order.</p>
        <p>Opened food and drink cannot be returned unless it is faulty.</p>` }
    };
    const pg = pages[topic];
    if (!pg) return viewNotFound();
    return `<section class="page wrap"><div class="prose">
      <h1 class="page-title">${pg.title}</h1>${pg.body}
      <p class="muted">Sample policy for this demo store.</p>
    </div></section>`;
  }

  function viewNotFound() {
    return `<section class="page wrap"><div class="empty">
      <h3>That page is not here</h3>
      <p>It may have moved, or the link has a typo.</p>
      <div class="empty-actions"><a class="btn" href="#/catalog">Go to the catalog</a></div>
    </div></section>`;
  }

  /* ---------- Header ---------- */
  function renderHeader(bump) {
    const acc = account();
    const count = Object.keys(state.cart).length;
    const actions = acc
      ? `<div class="account-menu">
          <button class="account-pill" type="button" aria-haspopup="true" aria-expanded="false" data-act="account-menu">${esc(acc.name)}<i class="ph-bold ph-caret-down" aria-hidden="true"></i></button>
          <div class="account-pop" hidden>
            <p class="muted">${acc.note}. ${acc.terms ? "30-day terms on." : "Card payments only for now."}</p>
            <button type="button" data-act="switch">Switch account</button>
            <button type="button" data-act="signout">Sign out</button>
          </div>
        </div>
        <a class="order-link" href="#/cart" aria-label="Your order, ${count} ${count === 1 ? "product" : "products"}">Order <span class="order-count">${count}</span></a>`
      : `<button class="text-link" type="button" data-act="signin">Sign in</button><a class="btn btn-sm" href="#/apply">Apply for trade</a>`;
    document.getElementById("header-actions").innerHTML = actions;
    document.getElementById("mobile-account").innerHTML = acc
      ? `<span class="tag">${esc(acc.name)}</span><a class="text-link" href="#/cart">Order (${count})</a><button class="text-link" type="button" data-act="switch">Switch account</button><button class="text-link" type="button" data-act="signout">Sign out</button>`
      : `<button class="btn btn-sm" type="button" data-act="signin">Sign in</button><a class="text-link" href="#/apply">Apply for trade</a>`;
    if (bump) {
      const c = document.querySelector(".order-count");
      if (c) { c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump"); }
    }
  }

  /* ---------- Router ---------- */
  function parseHash() {
    const raw = location.hash.replace(/^#/, "") || "/";
    const [path, query] = raw.split("?");
    return { parts: path.split("/").filter(Boolean), params: new URLSearchParams(query || "") };
  }

  function render(isNavigation) {
    const { parts, params } = parseHash();
    const [first, second] = parts;
    let html;
    let scrollTo = null;
    switch (first) {
      case undefined: html = viewHome(); break;
      case "pricing": html = viewHome(); scrollTo = "pricing"; break;
      case "apply": html = viewHome(); scrollTo = "apply"; break;
      case "catalog": html = viewCatalog(params); break;
      case "product": html = viewProduct(second); break;
      case "quick-order": html = viewQuickOrder(params); break;
      case "cart": html = viewCart(); break;
      case "order": html = viewOrder(second); break;
      case "lookbook": html = viewLookbook(); break;
      case "help": html = viewHelp(second); break;
      default: html = viewNotFound();
    }
    app.innerHTML = `<div class="${isNavigation ? "view-enter" : ""}">${html}</div>`;
    if (first === "product" && bySku[second]) updatePdp(second);

    const navKey = first === "product" ? "catalog" : first || "";
    document.querySelectorAll(".main-nav a").forEach((a) => {
      if (a.dataset.nav === navKey) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    renderHeader(false);
    closeMobileNav();

    if (isNavigation) {
      if (scrollTo) {
        const el = document.getElementById(scrollTo);
        if (el) el.scrollIntoView({ block: "start" });
      } else {
        window.scrollTo(0, 0);
      }
      app.focus({ preventScroll: true });
    }
    const titles = { catalog: "Catalog", "quick-order": "Quick order", cart: "Your order", lookbook: "Lookbook", pricing: "Trade pricing", apply: "Apply for trade" };
    const pName = first === "product" && bySku[second] ? bySku[second].name : titles[first];
    document.title = (pName ? pName + " | " : "") + "Larchmere | Café supply, sold by the case";
  }

  /* ---------- Actions ---------- */
  let toastTimer;
  let toastUndo = null;
  function toast(msg, href, linkText, undo) {
    const el = document.getElementById("toast");
    toastUndo = typeof undo === "function" ? undo : null;
    el.innerHTML = esc(msg) +
      (href ? `<a href="${href}">${esc(linkText)}</a>` : "") +
      (toastUndo ? `<button type="button" class="toast-undo" data-act="undo">Undo</button>` : "");
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.classList.remove("show"); toastUndo = null; }, toastUndo ? 6000 : 3200);
  }

  function flash(btn, text) {
    if (!btn) return;
    const original = btn.dataset.label || btn.textContent;
    btn.dataset.label = original;
    btn.textContent = text;
    btn.classList.add("is-done");
    setTimeout(() => {
      if (!btn.isConnected) return;
      btn.textContent = btn.dataset.label;
      btn.classList.remove("is-done");
    }, 1400);
  }

  function addToCart(sku, qty) {
    const p = bySku[sku];
    if (!p) return;
    state.cart[sku] = Math.min(999, (state.cart[sku] || 0) + qty);
    saveState();
    renderHeader(true);
    toast(`Added ${qty} ${casesWord(qty)} of ${p.name}.`, "#/cart", "View order");
  }

  const signin = document.getElementById("signin");
  function openSignin() {
    if (typeof signin.showModal === "function") signin.showModal();
    else signin.setAttribute("open", "");
  }
  signin.addEventListener("close", () => {
    const id = signin.returnValue;
    signin.returnValue = "";
    if (!accounts[id]) return;
    const changed = state.account !== id;
    state.account = id;
    saveState();
    render(false);
    if (changed) toast(`Signed in as ${accounts[id].name}.`);
  });

  function closeAccountPop() {
    const pop = document.querySelector(".account-pop");
    const btn = document.querySelector(".account-pill");
    if (pop) pop.hidden = true;
    if (btn) btn.setAttribute("aria-expanded", "false");
  }
  function closeMobileNav() {
    const nav = document.getElementById("mobile-nav");
    const btn = document.querySelector(".menu-toggle");
    nav.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML = '<i class="ph-bold ph-list" aria-hidden="true"></i>';
  }

  function setQty(scope, sku, n) {
    const p = bySku[sku];
    if (!p) return;
    if (scope === "pdp") {
      pdpQty = clampQty(n, p.minCases);
      updatePdp(sku);
    } else if (scope === "qo") {
      const row = qoRows.find((r) => r.sku === sku);
      if (row) row.qty = clampQty(n, 1);
    } else if (scope === "cart") {
      state.cart[sku] = clampQty(n, 1);
      saveState();
    }
  }

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-act]");
    if (!t) {
      if (!e.target.closest(".account-menu")) closeAccountPop();
      if (!e.target.closest(".picker")) closeSuggest();
      return;
    }
    const act = t.dataset.act;
    const sku = t.dataset.sku;
    switch (act) {
      case "signin": e.preventDefault(); openSignin(); break;
      case "switch": closeAccountPop(); openSignin(); break;
      case "signout":
        state.account = null; state.cart = {}; qoRows = []; qoLoadedSetup = null;
        saveState(); render(false); toast("Signed out. Your order was cleared.");
        break;
      case "account-menu": {
        const pop = t.parentElement.querySelector(".account-pop");
        pop.hidden = !pop.hidden;
        t.setAttribute("aria-expanded", String(!pop.hidden));
        break;
      }
      case "add": addToCart(sku, +t.dataset.qty || 1); flash(t, "Added"); break;
      case "cat": catFilter.cat = t.dataset.cat; refreshCatalog(); break;
      case "clear-search": {
        catFilter.q = ""; const s = document.getElementById("cat-search"); if (s) s.value = "";
        refreshCatalog(); break;
      }
      case "thumb": {
        document.getElementById("pdp-main").src = t.dataset.src;
        document.querySelectorAll(".thumb").forEach((b) => b.setAttribute("aria-pressed", String(b === t)));
        break;
      }
      case "pdp-add": {
        const had = !!state.cart[sku];
        state.cart[sku] = pdpQty;
        saveState(); renderHeader(true);
        toast(`${had ? "Updated" : "Added"}: ${pdpQty} ${casesWord(pdpQty)} of ${bySku[sku].name}.`, "#/cart", "View order");
        flash(t, had ? "Order updated" : "Added to order");
        t.dataset.label = "Update order";
        break;
      }
      case "dec":
      case "inc": {
        const st = t.closest(".stepper");
        const input = st.querySelector("input");
        const next = (parseInt(input.value, 10) || 0) + (act === "inc" ? 1 : -1);
        setQty(st.dataset.scope, st.dataset.sku, next);
        const sel = `.stepper[data-scope="${st.dataset.scope}"][data-sku="${st.dataset.sku}"] [data-act="${act}"]`;
        if (st.dataset.scope === "qo") refreshQuickOrder(sel);
        if (st.dataset.scope === "cart") { render(false); renderHeader(false); const el = document.querySelector(sel); if (el && !el.disabled) el.focus(); }
        break;
      }
      case "qo-remove": {
        const before = qoRows.map((r) => ({ ...r }));
        qoRows = qoRows.filter((r) => r.sku !== sku);
        refreshQuickOrder("#qo-picker");
        toast(`Removed ${bySku[sku] ? bySku[sku].name : "line"}.`, null, null, () => { qoRows = before; refreshQuickOrder(); });
        break;
      }
      case "qo-clear": {
        const before = qoRows.map((r) => ({ ...r }));
        qoRows = []; qoLoadedSetup = null; refreshQuickOrder("#qo-picker");
        toast("Table cleared.", null, null, () => { qoRows = before; refreshQuickOrder(); });
        break;
      }
      case "qo-reorder": {
        const last = lastOrderFor(account());
        if (last) { mergeRows(last); refreshQuickOrder(); toast("Last order loaded. Change the cases, then add it."); }
        break;
      }
      case "paste-toggle": {
        const box = document.getElementById("paste-box");
        box.hidden = !box.hidden;
        t.setAttribute("aria-expanded", String(!box.hidden));
        if (!box.hidden) document.getElementById("paste-area").focus();
        break;
      }
      case "paste-apply": applyPaste(); break;
      case "qo-add-all": {
        if (!qoRows.length) break;
        let cases = 0;
        qoRows.forEach((r) => { state.cart[r.sku] = Math.min(999, (state.cart[r.sku] || 0) + r.qty); cases += r.qty; });
        qoRows = []; qoLoadedSetup = null;
        saveState();
        location.hash = "#/cart";
        toast(`Added ${cases} ${casesWord(cases)} to your order.`);
        break;
      }
      case "cart-remove": {
        const name = bySku[sku] ? bySku[sku].name : "Item";
        const before = { ...state.cart };
        delete state.cart[sku]; saveState(); render(false);
        toast(`Removed ${name}.`, null, null, () => { state.cart = before; saveState(); render(false); });
        break;
      }
      case "undo": {
        const fn = toastUndo;
        toastUndo = null;
        document.getElementById("toast").classList.remove("show");
        if (fn) fn();
        break;
      }
      case "cart-reorder": {
        const last = lastOrderFor(account());
        if (last) { state.cart = { ...last }; saveState(); render(false); toast("Last order added. Check the cases before you place it."); }
        break;
      }
      case "apply-reset": state.applied = null; saveState(); render(false); document.getElementById("apply").scrollIntoView(); break;
    }
  });

  document.querySelector(".menu-toggle").addEventListener("click", (e) => {
    const nav = document.getElementById("mobile-nav");
    const open = nav.hidden;
    nav.hidden = !open;
    e.currentTarget.setAttribute("aria-expanded", String(open));
    e.currentTarget.innerHTML = open ? '<i class="ph-bold ph-x" aria-hidden="true"></i>' : '<i class="ph-bold ph-list" aria-hidden="true"></i>';
  });

  /* Stepper typing: apply on change (blur or Enter) */
  document.addEventListener("change", (e) => {
    const input = e.target.closest(".stepper input");
    if (!input) return;
    const st = input.closest(".stepper");
    setQty(st.dataset.scope, st.dataset.sku, parseInt(input.value, 10));
    if (st.dataset.scope === "qo") refreshQuickOrder();
    if (st.dataset.scope === "cart") render(false);
  });

  /* Catalog search and quick-order picker */
  let suggestIndex = -1;
  let suggestList = [];
  function closeSuggest() {
    const ul = document.getElementById("qo-suggest");
    const input = document.getElementById("qo-picker");
    if (ul) ul.hidden = true;
    if (input) { input.setAttribute("aria-expanded", "false"); input.removeAttribute("aria-activedescendant"); }
    suggestIndex = -1;
  }
  function drawSuggest(term) {
    const ul = document.getElementById("qo-suggest");
    const input = document.getElementById("qo-picker");
    const q = term.trim().toLowerCase();
    if (!q) { closeSuggest(); return; }
    suggestList = products.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)).slice(0, 6);
    suggestIndex = suggestList.length ? 0 : -1;
    ul.innerHTML = suggestList.length
      ? suggestList.map((p, i) => `<li id="sg-${i}" role="option" aria-selected="${i === 0}" data-sku="${p.sku}"><img src="${p.img}" alt="" width="36" height="36"><span>${esc(p.name)}</span><span class="mono">${p.sku}</span></li>`).join("")
      : `<li class="none" role="option" aria-disabled="true">No product matches “${esc(term.trim())}”</li>`;
    ul.hidden = false;
    input.setAttribute("aria-expanded", "true");
    if (suggestIndex >= 0) input.setAttribute("aria-activedescendant", "sg-0");
  }
  function pickSuggestion(sku) {
    const p = bySku[sku];
    if (!p) return;
    const row = qoRows.find((r) => r.sku === sku);
    if (row) { row.qty = Math.min(999, row.qty + p.minCases); toast(`${p.name}: now ${row.qty} cases.`); }
    else qoRows.push({ sku, qty: p.minCases });
    refreshQuickOrder("#qo-picker");
  }

  document.addEventListener("input", (e) => {
    if (e.target.id === "cat-search") { catFilter.q = e.target.value; refreshCatalog(); }
    if (e.target.id === "qo-picker") drawSuggest(e.target.value);
  });
  document.addEventListener("keydown", (e) => {
    if (e.target.id === "qo-picker") {
      const ul = document.getElementById("qo-suggest");
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        if (ul.hidden || !suggestList.length) return;
        e.preventDefault();
        suggestIndex = (suggestIndex + (e.key === "ArrowDown" ? 1 : -1) + suggestList.length) % suggestList.length;
        ul.querySelectorAll("li").forEach((li, i) => li.setAttribute("aria-selected", String(i === suggestIndex)));
        e.target.setAttribute("aria-activedescendant", "sg-" + suggestIndex);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (suggestIndex >= 0 && suggestList[suggestIndex]) pickSuggestion(suggestList[suggestIndex].sku);
      } else if (e.key === "Escape") {
        closeSuggest();
      }
    }
    if (e.key === "Escape") { closeAccountPop(); }
    if (e.key === "Enter" && e.target.closest(".stepper input")) e.target.blur();
  });
  document.addEventListener("mousedown", (e) => {
    const li = e.target.closest("#qo-suggest li[data-sku]");
    if (li) { e.preventDefault(); pickSuggestion(li.dataset.sku); }
  });

  function applyPaste() {
    const area = document.getElementById("paste-area");
    const msg = document.getElementById("paste-msg");
    const lines = area.value.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const found = {};
    const bad = [];
    const badLines = [];
    lines.forEach((line, i) => {
      const m = /^([a-z]{2}-[a-z0-9]+-[a-z0-9]+)[\s,;:x×*]*(\d+)?\s*(cases?)?$/i.exec(line);
      const p = m && bySku[m[1].toUpperCase()];
      if (!p) { bad.push(`line ${i + 1} (${line.slice(0, 24)})`); badLines.push(line); return; }
      const q = m[2] ? parseInt(m[2], 10) : p.minCases;
      if (q > 0) found[p.sku] = (found[p.sku] || 0) + q;
    });
    const n = Object.keys(found).length;
    if (!lines.length) {
      msg.className = "paste-msg bad"; msg.textContent = "Paste at least one line, such as LM-ESP-1K 3.";
      return;
    }
    mergeRows(found);
    refreshQuickOrder();
    if (bad.length) {
      msg.className = "paste-msg bad";
      msg.textContent = `${n ? `Added ${n} ${n === 1 ? "product" : "products"}. ` : ""}Not recognised: ${bad.join(", ")}.`;
      area.value = badLines.join("\n");
    } else {
      msg.className = "paste-msg good";
      msg.textContent = `Added ${n} ${n === 1 ? "product" : "products"} to the table.`;
      area.value = "";
    }
  }

  /* Forms */
  document.addEventListener("submit", (e) => {
    if (e.target.id === "apply-form") {
      e.preventDefault();
      const f = e.target;
      let firstBad = null;
      f.querySelectorAll(".err").forEach((n) => n.remove());
      f.querySelectorAll("[aria-invalid]").forEach((n) => n.removeAttribute("aria-invalid"));
      const check = (name, ok, text) => {
        const el = f.elements[name];
        if (ok(el.value.trim())) return;
        el.setAttribute("aria-invalid", "true");
        el.setAttribute("aria-describedby", "err-" + name);
        el.insertAdjacentHTML("afterend", `<span class="err" id="err-${name}">${text}</span>`);
        firstBad = firstBad || el;
      };
      check("biz", (v) => v.length > 1, "Add your business name.");
      check("name", (v) => v.length > 1, "Add a contact name.");
      check("email", (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), "Enter an email like orders@yourcafe.co.uk.");
      check("post", (v) => v.length >= 5, "Add the postcode we deliver to.");
      if (firstBad) { firstBad.focus(); return; }
      state.applied = f.elements.biz.value.trim().slice(0, 60);
      saveState();
      render(false);
      document.getElementById("apply").scrollIntoView({ block: "start" });
    }

    if (e.target.id === "checkout") {
      e.preventDefault();
      const acc = account();
      if (!acc) return;
      const f = e.target;
      const t = totals(state.cart);
      const errors = [];
      if (!t.minMet) errors.push(`Add ${money(t.toMin)} more to reach the ${money(rules.minimumOrder).replace(".00", "")} minimum order.`);
      t.short.forEach((l) => errors.push(`${l.p.name} needs at least ${l.p.minCases} cases.`));
      const d = parseIso(f.elements.deliver.value);
      const tomorrow = new Date(); tomorrow.setHours(0, 0, 0, 0); tomorrow.setDate(tomorrow.getDate() + 1);
      if (!d || d < tomorrow) errors.push("Pick a delivery date from tomorrow onwards.");
      else if (d.getDay() === 0 || d.getDay() === 6) errors.push("We deliver Monday to Friday. Pick a weekday.");
      const box = document.getElementById("checkout-errors");
      if (errors.length) {
        box.innerHTML = errors.map(esc).join("<br>");
        box.hidden = false;
        box.focus && box.setAttribute("tabindex", "-1");
        box.focus();
        return;
      }
      const pay = (f.querySelector('input[name="pay"]:checked') || {}).value || "card";
      const id = "LM-" + (10480 + state.orders.length + 1);
      state.orders.push({
        id, account: acc.name, deliver: f.elements.deliver.value,
        po: f.elements.po.value.trim().slice(0, 30), pay: acc.terms ? pay : "card",
        cases: t.cases, total: t.total, placed: Date.now()
      });
      state.lastOrders[acc.id] = { ...state.cart };
      state.cart = {};
      saveState();
      location.hash = "#/order/" + id;
    }
  });

  window.addEventListener("hashchange", () => render(true));
  render(false);
  if (location.hash.startsWith("#/pricing") || location.hash.startsWith("#/apply")) {
    const el = document.getElementById(location.hash.slice(2).split("?")[0]);
    if (el) el.scrollIntoView({ block: "start" });
  }
})();
