(function () {
  'use strict';
  const D = window.DAO;
  const $ = (s, r = document) => r.querySelector(s);
  const store = {
    get(k, d) { try { const v = localStorage.getItem('dao.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('dao.' + k, JSON.stringify(v)); } catch (e) {} }
  };

  const S = {
    lang: store.get('lang', 'ar'),
    cur: store.get('cur', 'SAR'),
    cart: store.get('cart', []),
    wish: store.get('wish', []),
    wrap: false,
    filters: { fam: [], cat: [], min: 50, max: 600, sort: 'best' },
    pdp: { id: null, size: 0, img: 0, qty: 1 },
    gift: store.get('gift', { theme: 'eid', box: 'gold', items: [{ id: 'oud-royal', size: 2 }, { id: 'white-musk', size: 3 }], to: '', from: '', msg: '' }),
    quiz: { step: 0, ans: {}, dir: 'next' }
  };

  { const qs = new URLSearchParams(location.search); if (qs.get('lang') === 'en' || qs.get('lang') === 'ar') S.lang = qs.get('lang'); if (qs.get('cur') === 'AED' || qs.get('cur') === 'SAR') S.cur = qs.get('cur'); if (qs.get('cart') === 'demo' && !S.cart.length) S.cart = [{ id: 'oud-royal', size: 3, qty: 1 }, { id: 'maamoul', size: 0, qty: 1 }, { id: 'white-musk', size: 3, qty: 1 }]; }

  /* ---------- words ---------- */
  const W = {
    announceM: ['توصيل مجاني فوق ٢٠٠ ر.س · الدفع عند الاستلام', 'Free delivery over SAR 200 · Cash on delivery'],
    announceD: ['توصيل مجاني للطلبات فوق ٢٠٠ ر.س داخل السعودية والإمارات · الدفع عند الاستلام · قسّمها على ٤ دفعات', 'Free delivery over SAR 200 across Saudi Arabia & the UAE · Cash on delivery · Split in 4 payments'],
    brand: ['دار العود', 'DAR AL OUD'], tagline: ['بخور و عطور', 'BAKHOOR & PERFUME'],
    home: ['الرئيسية', 'Home'], giftbox: ['صندوق الهدايا', 'Gift Box'], finder: ['اكتشف عطرك', 'Scent Finder'],
    menu: ['القائمة', 'Menu'], search: ['بحث', 'Search'], account: ['الحساب', 'Account'], bag: ['السلة', 'Bag'], close: ['إغلاق', 'Close'],
    otherLang: ['EN', 'ع'], otherLangName: ['English', 'العربية'],
    over: ['دار العود · الرياض', 'Dar Al Oud · Riyadh'],
    h1: ['فخامة الرائحة...', 'Rich scent'], h2: ['تبدأ من هنا', 'starts here.'],
    heroSub: ['دهن عود كمبودي معتّق ثلاث سنوات، ومعمول نخلطه كل خميس في محلنا بالرياض.', 'Cambodian oud oil aged three years, and maamoul we mix every Thursday in our Riyadh shop.'],
    shopNow: ['تسوّق الآن', 'Shop now'], findScent: ['اكتشف عطرك', 'Find your scent'],
    svcDelivery: ['توصيل ٢–٤ أيام', '2–4 day delivery'], svcCod: ['الدفع عند الاستلام', 'Cash on delivery'], svcBnpl: ['تابي وتمارا', 'Tabby & Tamara'],
    catTab: ['يتوفر لدينا', 'We carry'], catTitle: ['جميع أنواع البخور والعطور والمخمريات والمسكيات', 'Bakhoor, perfume, mukhamariya and musk'],
    best: ['الأكثر مبيعاً', 'Best sellers'], viewAll: ['عرض الكل', 'View all'],
    gOver: ['صندوق الهدايا', 'Gift box'], gT: ['جهّز هدية العيد من هنا', 'Put together an Eid gift'],
    gB: ['اختر الصندوق، ضع فيه ثلاث قطع، ونكتب بطاقتك بخط اليد. يصل مغلّفاً خلال يومين إلى أربعة.', 'Choose the box, fill it with three pieces, and we hand-write your card. It arrives wrapped in 2–4 days.'],
    gCta: ['ابدأ صندوقك', 'Start your box'],
    qT: ['ما عطرك؟', 'Which scent is yours?'], qB: ['أجب عن ٤ أسئلة ونقترح لك ٣ قطع تناسب بعضها.', 'Answer 4 questions and we suggest 3 pieces that go together.'], qCta: ['ابدأ الاختبار', 'Take the quiz'],
    trust: [
      ['medal', ['جودة أصلية', 'Genuine quality'], ['نشتري العود من كمبوديا والهند مباشرة.', 'We buy our oud directly from Cambodia and India.']],
      ['spray', ['روائح تدوم', 'Long-lasting'], ['دهن العود يبقى على الثوب يوماً كاملاً.', 'Our oud oil stays on a thobe for a full day.']],
      ['rosette', ['تشكيلة متنوعة', 'Wide range'], ['بخور للمجلس اليومي، ودهن عود للأعراس.', 'Bakhoor for the daily majlis, oud oil for weddings.']]
    ],
    eid: ['عيد', 'Eid'], ramadan: ['رمضان', 'Ramadan'], wedding: ['زفاف', 'Wedding'],
    best1: ['الأكثر مبيعاً', 'Best seller'], new1: ['جديد', 'New'], save: ['المفضلة', 'Save'], addToCart: ['أضف إلى السلة', 'Add to cart'], added: ['أُضيف', 'Added'],
    allProducts: ['جميع المنتجات', 'All products'], all: ['الكل', 'All'], family: ['العائلة العطرية', 'Scent family'], type: ['النوع', 'Type'], price: ['السعر', 'Price'],
    swipe: ['اسحب ←', 'Swipe →'], products: ['منتجات', 'products'], filters: ['تصفية', 'Filters'], clearAll: ['مسح الكل', 'Clear all'], apply: ['تطبيق', 'Apply'],
    sort: ['الترتيب', 'Sort'], sortBest: ['الأكثر مبيعاً', 'Best selling'], sortLow: ['السعر: من الأقل', 'Price: low to high'], sortHigh: ['السعر: من الأعلى', 'Price: high to low'], sortNew: ['الأحدث', 'Newest'],
    noResults: ['لا توجد منتجات بهذه الفلاتر.', 'No products match these filters.'],
    vat: ['شامل الضريبة', 'VAT included'], bnpl4: ['أو ٤ دفعات بقيمة {x} بدون فوائد', 'Or 4 interest-free payments of {x}'], tabby: ['تابي', 'Tabby'], tamara: ['تمارا', 'Tamara'],
    size: ['الحجم', 'Size'], tolaNote: ['التولة ≈ ١٢ مل من دهن العود المركّز', 'A tola is about 12 ml of concentrated oud oil'],
    orderWa: ['اطلب عبر واتساب', 'Order on WhatsApp'], splitNoInt: ['قسّطها بدون فوائد', 'Split, no interest'],
    notes: ['المكونات العطرية', 'Scent notes'], top: ['الافتتاحية', 'Top'], heart: ['القلب', 'Heart'], base: ['القاعدة', 'Base'],
    howto: ['طريقة استخدام البخور', 'How to use bakhoor'],
    steps: [['أشعل قطعة فحم في المبخرة حتى يبيضّ طرفها.', 'Light a charcoal disc in the mabkhara until its edge turns white.'], ['ضع قطعة صغيرة من البخور فوق الفحم. قطعة واحدة تكفي لغرفة.', 'Put one small piece of bakhoor on the coal. One piece is enough for a room.'], ['مرّر الدخان على الملابس والشعر، ثم ضع دهن العود على نقاط النبض.', 'Pass the smoke over clothes and hair, then dab oud oil on your pulse points.']],
    tip: ['نصيحة: التبخير قبل العطر يطيل ثباته.', 'Tip: smoke first, then perfume, for longer wear.'],
    pairs: ['يكتمل مع', 'Goes well with'],
    gOcc: ['هدايا المناسبات', 'Occasion gifts'], gTitle: ['صمّم صندوق هديتك', 'Build your gift box'], gSub: ['اختر الصندوق، أضف ٣ قطع، ثم اكتب بطاقتك. نغلّفه ونوصله.', 'Pick a box, add 3 pieces, write your card. We wrap and deliver it.'],
    stBox: ['الصندوق', 'Box'], stPieces: ['٣ قطع', '3 pieces'], stCard: ['البطاقة', 'Card'], occasion: ['اختر المناسبة', 'Choose the occasion'],
    pickBox: ['١. اختر الصندوق', '1. Pick a box'], done: ['تم', 'Done'], addPieces: ['٢. أضف ٣ قطع', '2. Add 3 pieces'], ofThree: ['{n} من ٣', '{n} of 3'],
    addPiece: ['أضف قطعة', 'Add a piece'], chooseFrom: ['اختر من المنتجات', 'Choose from'], cardStep: ['٣. بطاقة الإهداء', '3. Gift card'],
    to: ['إلى', 'To'], from: ['من', 'From'], yourMsg: ['رسالتك', 'Your message'], toPh: ['أمي الغالية', 'Mum'], fromPh: ['ريم', 'Reem'],
    msgPh: ['عيدكم مبارك يا أمي، وكل عام وأنتِ بخير.', 'Eid Mubarak, Mum. See you at lunch.'], handwritten: ['نكتبها بخط اليد على بطاقة ذهبية', 'Hand-written on a gold card'],
    yourBox: ['ملخص الصندوق', 'Your box'], handCard: ['بطاقة مكتوبة بخط اليد', 'Hand-written card'], free: ['مجاناً', 'Free'], total: ['المجموع', 'Total'],
    addBox: ['أضف الصندوق إلى السلة', 'Add box to cart'], addMore: ['أضف {n} لإكمال صندوقك', 'Add {n} more to complete your box'], boxReady: ['صندوقك جاهز', 'Your box is ready'],
    onePiece: ['قطعة واحدة', '1 piece'], twoPieces: ['قطعتين', '2 pieces'], giftBoxName: ['صندوق هدية', 'Gift box'], boxAdded: ['أُضيف الصندوق إلى السلة', 'Box added to your bag'],
    qOf: ['السؤال {n} من ٤', 'Question {n} of 4'], quizName: ['اختبار العطر', 'Scent finder'], findYours: ['اكتشف عطرك', 'Find your scent'],
    pickOne: ['اختر إجابة واحدة، ويمكنك الرجوع في أي وقت.', 'Pick one answer. You can go back any time.'], back: ['السابق', 'Back'], next: ['التالي', 'Next'], seeSet: ['اعرض النتيجة', 'See my set'],
    yourResult: ['نتيجتك', 'Your result'], basedOn: ['بناءً على إجاباتك', 'Based on your answers'], your3: ['قطعك الثلاث', 'Your 3 pieces'], setPrice: ['سعر المجموعة', 'Set price'],
    saveX: ['وفّر {x}', 'Save {x}'], addSet: ['أضف المجموعة إلى السلة', 'Add the set to cart'], retake: ['أعد الاختبار', 'Retake the quiz'], shopFam: ['تسوّق كل {f}', 'Shop all {f}'],
    alsoLike: ['قد يعجبك أيضاً', 'You may also like'], setAdded: ['أُضيفت المجموعة إلى السلة', 'Set added to your bag'],
    yourBag: ['سلة التسوق', 'Your bag'], showIn: ['عرض الأسعار بـ', 'Show prices in'], freeDone: ['التوصيل مجاني لهذا الطلب', 'Free delivery on this order'], freeLeft: ['باقي {x} للتوصيل المجاني', '{x} away from free delivery'],
    giftWrap: ['تغليف هدية', 'Gift wrap'], subtotal: ['المجموع الفرعي', 'Subtotal'], delivery: ['التوصيل', 'Delivery'], grand: ['الإجمالي', 'Total'],
    bnplCart: ['أو ٤ دفعات بقيمة {x} مع تابي أو تمارا', 'Or 4 payments of {x} with Tabby or Tamara'], checkout: ['إتمام الطلب', 'Checkout'],
    codNote: ['الدفع عند الاستلام متاح في السعودية والإمارات', 'Cash on delivery across Saudi Arabia & the UAE'], empty: ['سلتك فارغة.', 'Your bag is empty.'],
    demoCheckout: ['هذا متجر تجريبي، والدفع غير مفعّل.', 'This is a demo store, so checkout is turned off.'], demoAccount: ['الحساب غير متاح في النسخة التجريبية.', 'Accounts are not part of this demo.'],
    remove: ['حذف', 'Remove'], qtyL: ['الكمية', 'Quantity'],
    shop: ['تسوّق', 'Shop'], help: ['المساعدة', 'Help'], contact: ['تواصل معنا', 'Contact'],
    helpLinks: [['الشحن والتوصيل', 'Shipping & delivery'], ['الاستبدال والاسترجاع', 'Exchanges & returns'], ['تتبّع طلبك', 'Track your order'], ['الأسئلة الشائعة', 'FAQ']],
    hours: ['نرد خلال دقائق، يومياً من ١٠ صباحاً حتى ١٠ مساءً', 'We reply within minutes, daily 10am to 10pm'],
    chatWa: ['تواصل معنا عبر واتساب', 'Chat with us on WhatsApp'], chatWaD: ['تواصل عبر واتساب', 'Chat on WhatsApp'],
    blurb: ['محل بخور وعطور في الرياض منذ ٢٠٠٩. نوصل داخل السعودية والإمارات.', 'A bakhoor and perfume shop in Riyadh since 2009. We deliver across Saudi Arabia and the UAE.'],
    pays: [['مدى', 'mada'], ['Apple Pay', 'Apple Pay'], ['Visa', 'Visa'], ['Mastercard', 'Mastercard'], ['تابي', 'Tabby'], ['تمارا', 'Tamara'], ['الدفع عند الاستلام', 'Cash on delivery']],
    copy: ['© ٢٠٢٦ دار العود', '© 2026 Dar Al Oud'], demo: ['تصميم تجريبي، بيانات افتراضية · Design concept, sample data', 'Design concept, sample data'],
    imgSlot: ['IMAGE SLOT', 'IMAGE SLOT'], waHello: ['مرحباً، أرغب في طلب:', 'Hello, I would like to order:']
  };
  const AR = () => S.lang === 'ar';
  const t = (k, vars) => { let s = Array.isArray(k) ? k[AR() ? 0 : 1] : (W[k] ? W[k][AR() ? 0 : 1] : k); if (vars) for (const v in vars) s = s.replace('{' + v + '}', vars[v]); return s; };
  const L = pair => pair[AR() ? 0 : 1];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- numbers & money ---------- */
  const AD = '٠١٢٣٤٥٦٧٨٩';
  const num = n => { const r = Math.round(n * 100) / 100; let s = Number.isInteger(r) ? String(r) : r.toFixed(2); return AR() ? s.replace(/[0-9]/g, d => AD[d]).replace('.', '٫') : s; };
  const conv = sar => Math.round(sar * D.rate[S.cur] * 100) / 100;
  const money = sar => { const v = num(conv(sar)); return AR() ? `${v} ${S.cur === 'SAR' ? 'ر.س' : 'د.إ'}` : `${S.cur} ${v}`; };

  /* ---------- icons ---------- */
  const ic = (n, cls = '') => `<svg class="icon ${cls}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const pname = p => AR() ? p.ar : p.en;
  const pmeta = p => { const a = L(D.catSingle[p.cat]), b = L(D.fams[p.fam]); return a === b ? a : `${a} · ${b}`; };
  const pic = (name, alt, sizes = '(min-width:1024px) 282px, 50vw', eager) => `<img src="assets/img/${name}-400.webp" srcset="assets/img/${name}-400.webp 400w, assets/img/${name}-800.webp 800w" sizes="${sizes}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" width="400" height="400">`;
  const slot = label => `<div class="slot">${ic('image')}<b>IMAGE SLOT</b><small>${esc(label)}</small></div>`;
  const thumbOf = (p, cls = 'thumb') => `<span class="${cls}">${p.img ? pic(p.img, pname(p), '120px') : ic('image')}</span>`;

  /* ---------- cart ---------- */
  const isBundle = l => l.type === 'box' || l.type === 'set';
  const lineUnit = l => isBundle(l) ? l.price : D.byId(l.id).sizes[l.size].price;
  const cartCount = () => S.cart.reduce((a, l) => a + l.qty, 0);
  const subtotal = () => S.cart.reduce((a, l) => a + lineUnit(l) * l.qty, 0) + (S.wrap && S.cart.length ? 25 : 0);
  const shipping = () => subtotal() >= D.freeShip || !S.cart.length ? 0 : 25;
  function saveCart() { store.set('cart', S.cart); }
  function addToCart(id, size, qty = 1) {
    const p = D.byId(id); if (!p) return;
    if (size == null) size = defaultSize(p);
    const ex = S.cart.find(l => !isBundle(l) && l.id === id && l.size === size);
    if (ex) ex.qty += qty; else S.cart.push({ id, size, qty });
    saveCart(); bumpBag();
  }
  const defaultSize = p => p.cat === 'perfume' ? p.sizes.length - 1 : 0;
  function bumpBag() { document.querySelectorAll('.bag__n').forEach(b => { b.textContent = cartCount() ? num(cartCount()) : ''; b.classList.remove('tick'); void b.offsetWidth; b.classList.add('tick'); setTimeout(() => b.classList.remove('tick'), 160); }); }

  /* ---------- shared pieces ---------- */
  const wordmark = () => `<a class="wm" href="#/" aria-label="${t('brand')}">${ic('mabkhara')}<span class="wm__name">${t('brand')}</span></a>`;
  const langBtn = () => `<button class="langbtn" data-act="lang" aria-label="${t('otherLangName')}" lang="${AR() ? 'en' : 'ar'}">${t('otherLang')}</button>`;
  const bagBtn = () => `<button class="bag" data-act="cart" aria-label="${t('bag')}">${ic('bag')}<span class="bag__n">${cartCount() ? num(cartCount()) : ''}</span></button>`;
  const seg = () => `<div class="seg" role="group" aria-label="SAR / AED"><button data-act="cur" data-v="SAR" aria-pressed="${S.cur === 'SAR'}">SAR</button><button data-act="cur" data-v="AED" aria-pressed="${S.cur === 'AED'}">AED</button></div>`;
  const navItems = () => [['#/', t('home')], ['#/shop?cat=bakhoor', L(D.cats.bakhoor)], ['#/shop?cat=perfume', L(D.cats.perfume)], ['#/shop?cat=mukh', L(D.cats.mukh)], ['#/shop?cat=musk', L(D.cats.musk)], ['#/gift', t('giftbox')], ['#/quiz', t('finder')]];
  function header() {
    const route = location.hash || '#/';
    return `<div class="announce"><span class="m">${t('announceM')}</span><span class="d">${t('announceD')}</span></div>
    <div class="hdr__bar">
      <div class="hdr__start"><button data-act="menu" aria-label="${t('menu')}">${ic('menu')}</button><a href="#/shop" aria-label="${t('search')}">${ic('search')}</a></div>
      ${wordmark()}
      <nav class="hdr__nav" aria-label="main">${navItems().map(([h, l]) => `<a href="${h}" ${h === route || (h === '#/' && route === '#/') ? 'aria-current="page"' : ''}>${l}</a>`).join('')}</nav>
      <div class="hdr__tools"><a href="#/shop" aria-label="${t('search')}">${ic('search')}</a><button data-act="account" aria-label="${t('account')}">${ic('user')}</button>${seg()}${langBtn()}${bagBtn()}</div>
      <div class="hdr__end">${langBtn()}${bagBtn()}</div>
    </div>`;
  }
  function menu() {
    return `<div class="menu__top">${wordmark()}<button data-act="menu" aria-label="${t('close')}">${ic('close')}</button></div>
      ${navItems().map(([h, l]) => `<a href="${h}" data-act="menu-go">${l}</a>`).join('')}
      <div style="display:flex;gap:12px;align-items:center;margin-top:20px">${langBtn()}${seg()}</div>`;
  }
  function footer() {
    const shopLinks = ['bakhoor', 'perfume', 'mukh', 'musk'].map(c => `<a href="#/shop?cat=${c}">${L(D.cats[c])}</a>`).join('') + `<a href="#/gift">${t('giftbox')}</a>`;
    const wa = full => `<a class="btn btn--wa ${full ? 'btn--block' : ''}" href="https://wa.me/?text=${encodeURIComponent(t('brand'))}" target="_blank" rel="noopener">${ic('wa')}${t(full ? 'chatWa' : 'chatWaD')}</a>`;
    return `<div class="wrap">
      <div class="ftr__top">
        <div class="ftr__brand"><div class="wmfull"><span class="wmfull__emb">${ic('mabkhara')}</span><span class="wmfull__n">${t('brand')}</span><svg class="divider" viewBox="0 0 180 10" aria-hidden="true" style="width:150px"><use href="#o-divider"/></svg><span class="wmfull__t">${t('tagline')}</span></div><p class="t-small muted">${t('blurb')}</p></div>
        <div class="ftr__cols">
          <div class="ftr__col"><h3 class="t-h3 gold">${t('shop')}</h3>${shopLinks}</div>
          <div class="ftr__col"><h3 class="t-h3 gold">${t('help')}</h3>${W.helpLinks.map(h => `<a href="#/">${L(h)}</a>`).join('')}</div>
        </div>
        <div class="ftr__contact"><h3 class="t-h3 gold" style="margin-bottom:12px">${t('contact')}</h3><p class="t-small" style="margin-bottom:12px">${t('hours')}</p>${wa(false)}</div>
        <div class="ftr__wa-m">${wa(true)}</div>
      </div>
      <div class="pays">${W.pays.map(p => `<span>${L(p)}</span>`).join('')}</div>
      <div class="ftr__bottom"><span class="t-small muted">${t('copy')}</span><span class="demo-label">${t('demo')}</span></div>
    </div>`;
  }
  function card(p) {
    const badge = p.badge ? `<span class="badge ${p.badge === 'best' ? 'badge--gold' : 'badge--outline'}">${t(p.badge === 'best' ? 'best1' : 'new1')}</span>` : '';
    const liked = S.wish.includes(p.id);
    return `<article class="card">
      <div class="card__media"><a href="#/p/${p.id}" aria-label="${esc(pname(p))}">${p.img ? pic(p.img, pname(p)) : slot(p.slot || p.en)}</a>
        <div class="card__top">${badge}<button class="card__wish" data-act="wish" data-id="${p.id}" aria-pressed="${liked}" aria-label="${t('save')}">${ic('heart')}</button></div></div>
      <div class="card__info"><p class="card__meta">${pmeta(p)}</p><a class="card__name" href="#/p/${p.id}">${esc(pname(p))}</a>
        <div class="card__row"><span class="card__price t-price">${money(p.price)}</span><button class="card__add" data-act="add" data-id="${p.id}" aria-label="${t('addToCart')}: ${esc(pname(p))}">${ic('plus')}</button></div></div>
    </article>`;
  }
  const secHead = (title, link, big) => `<div class="sec-head"><h2 class="${big ? 't-h1' : 't-h2'} gold">${title}</h2>${link ? `<a class="btn btn--ghost" href="${link[1]}">${link[0]}${ic('chev', 'flip')}</a>` : ''}</div>`;
  const isDesk = () => matchMedia('(min-width:1024px)').matches;

  /* ---------- pages ---------- */
  function pageHome() {
    const cats = ['bakhoor', 'perfume', 'mukh', 'musk'].map(c => `<a class="cat" href="#/shop?cat=${c}"><span class="cat__ring">${ic(D.cats[c][2])}</span>${L(D.cats[c])}</a>`).join('');
    const bs = ['oud-royal', 'black-oud', 'white-musk', 'amber-noir'].map(D.byId);
    const d = isDesk();
    return `
    <section class="hero"><div class="wrap hero__grid">
      <div class="hero__visual" aria-hidden="true">
        <svg class="arch-line arch-line--out" viewBox="0 0 200 280" preserveAspectRatio="none"><use href="#o-arch"/></svg>
        <div class="arch-photo"><img src="assets/img/hero-360.webp" srcset="assets/img/hero-360.webp 360w, assets/img/hero-720.webp 720w" sizes="(min-width:1024px) 370px, 236px" alt="" fetchpriority="high" width="360" height="504"></div>
        <svg class="arch-line arch-line--in" viewBox="0 0 200 280" preserveAspectRatio="none"><use href="#o-arch"/></svg>
        <svg class="smoke" viewBox="0 0 120 260" preserveAspectRatio="none"><use href="#o-smoke"/></svg>
      </div>
      <div class="hero__text stack">
        <p class="t-over">${t('over')}</p>
        <h1 class="hero__head" style="--g:${d ? 18 : 14}px"><span class="reveal"><span class="${d ? 't-dxl' : 't-display'} gold">${t('h1')}</span></span><span class="reveal"><span class="${d ? 't-dxl' : 't-display'}">${t('h2')}</span></span></h1>
        <span class="accent-rule" style="--g:${d ? 26 : 20}px"></span>
        <p class="t-body muted" style="--g:${d ? 26 : 22}px;max-width:460px">${t('heroSub')}</p>
        <div class="hero__ctas" style="--g:${d ? 36 : 30}px"><a class="btn btn--primary" href="#/shop">${t('shopNow')}</a><a class="btn btn--secondary" href="#/quiz">${t('findScent')}</a></div>
        <div class="hero__svcs" style="--g:48px"><span class="svc">${ic('truck')}${t('svcDelivery')}</span><span class="svc">${ic('cash')}${t('svcCod')}</span><span class="svc">${ic('card')}${t('svcBnpl')}</span></div>
      </div>
    </div></section>
    <section class="wrap" style="padding-block:${d ? '24px' : '20px 4px'}"><div class="tabpanel"><span class="tabpanel__tab">${t('catTab')}</span><div class="tabpanel__box"><p class="${d ? 't-h2' : 't-h3'}">${t('catTitle')}</p><div class="cats">${cats}</div></div></div></section>
    <section class="wrap" style="padding-block:${d ? '104px 88px' : '64px 56px'}">${secHead(t('best'), [t('viewAll'), '#/shop'], d)}<div class="grid">${bs.map(card).join('')}</div></section>
    <section class="gift-band"><div class="wrap gift-band__in">
      <div class="gift-band__media">${slot('Gift box · open box with 3 pieces and a card')}</div>
      <div class="gift-band__text stack"><p class="t-over">${t('gOver')}</p><h2 class="${d ? 't-h1' : 't-h2'} gold" style="--g:${d ? 14 : 10}px">${t('gT')}</h2><p class="${d ? 't-body' : 't-small'}" style="--g:${d ? 18 : 14}px">${t('gB')}</p>
        <div style="--g:${d ? 28 : 22}px;display:flex;gap:8px">${['eid', 'ramadan', 'wedding'].map((o, i) => `<a class="chip ${i === 0 ? 'is-on' : ''}" href="#/gift" data-act="theme-go" data-v="${o}">${t(o)}</a>`).join('')}</div>
        <a class="btn btn--primary ${d ? '' : 'btn--block'}" href="#/gift" style="--g:${d ? 36 : 28}px">${t('gCta')}</a></div>
    </div></section>
    <section class="wrap" style="padding-block:${d ? '72px 0' : '56px 44px'}"><div class="quiz-strip"><span class="quiz-strip__n">${num(4)}</span><div class="stack" style="flex:1"><h2 class="${d ? 't-h1' : 't-h2'}">${t('qT')}</h2><p class="${d ? 't-body' : 't-small'} muted" style="--g:${d ? 8 : 6}px">${t('qB')}</p></div>${d ? `<a class="btn btn--secondary" href="#/quiz">${t('qCta')}</a>` : ''}</div>${d ? '' : `<a class="btn btn--secondary btn--block" href="#/quiz" style="margin-top:26px">${t('qCta')}</a>`}</section>
    <section class="wrap" style="padding-block:${d ? '56px 112px' : '4px 72px'}"><div class="trust">${W.trust.map(([i, a, b]) => `<div class="trust__item">${ic(i)}<div class="stack"><h3 class="${d ? 't-h3' : 't-bodyb'}">${L(a)}</h3><p class="t-small muted" style="--g:${d ? 6 : 3}px">${L(b)}</p></div></div>`).join('')}</div></section>`;
  }

  function parseQuery() { const q = (location.hash.split('?')[1] || ''); const o = {}; q.split('&').filter(Boolean).forEach(kv => { const [k, v] = kv.split('='); o[k] = decodeURIComponent(v || ''); }); return o; }
  function filtered() {
    const f = S.filters;
    let list = D.products.filter(p => (!f.fam.length || f.fam.includes(p.fam)) && (!f.cat.length || f.cat.includes(p.cat)) && p.price >= f.min && p.price <= f.max);
    if (f.sort === 'low') list = [...list].sort((a, b) => a.price - b.price);
    if (f.sort === 'high') list = [...list].sort((a, b) => b.price - a.price);
    if (f.sort === 'new') list = [...list].sort((a, b) => (b.badge === 'new') - (a.badge === 'new'));
    return list;
  }
  const countBy = (k, v) => D.products.filter(p => p[k] === v).length;
  function rangeUI(id) {
    const f = S.filters, lo = (f.min - 50) / 550 * 100, hi = (f.max - 50) / 550 * 100;
    return `<div class="range" id="${id}"><span class="range__track"></span><span class="range__fill" style="inset-inline-start:${lo}%;width:${hi - lo}%"></span>
      <input type="range" min="50" max="600" step="10" value="${f.min}" data-act="rmin" aria-label="min"><input type="range" min="50" max="600" step="10" value="${f.max}" data-act="rmax" aria-label="max"></div>`;
  }
  function pageShop() {
    const q = parseQuery(); const f = S.filters;
    if (q.cat !== undefined) f.cat = q.cat ? [q.cat] : [];
    if (q.fam !== undefined) f.fam = q.fam ? [q.fam] : [];
    const d = isDesk();
    const famChips = [['', t('all')], ...Object.entries(D.fams).map(([k, v]) => [k, L(v)])].map(([k, l]) => `<button class="chip" data-act="fchip" data-k="fam" data-v="${k}" aria-pressed="${k ? f.fam.length === 1 && f.fam[0] === k : !f.fam.length}">${l}</button>`).join('');
    const typeChips = [['', t('all')], ...Object.entries(D.catSingle).map(([k, v]) => [k, L(v)])].map(([k, l]) => `<button class="chip" data-act="fchip" data-k="cat" data-v="${k}" aria-pressed="${k ? f.cat.length === 1 && f.cat[0] === k : !f.cat.length}">${l}</button>`).join('');
    const checks = (k, map, key) => [['', t('all'), D.products.length], ...Object.entries(map).map(([v, l]) => [v, L(l), countBy(key, v)])].map(([v, l, n]) => `<label class="check"><input type="checkbox" data-act="fcheck" data-k="${k}" data-v="${v}" ${v ? (f[k].includes(v) ? 'checked' : '') : (!f[k].length ? 'checked' : '')}><span class="check__box">${ic('check')}</span><span class="check__t">${l}</span><span class="check__n">${num(n)}</span></label>`).join('');
    const title = `<div class="stack"><p class="crumbs"><a href="#/">${t('home')}</a>  /  ${t('allProducts')}</p><h1 class="t-h1 gold" style="--g:16px">${t('allProducts')}</h1></div>`;
    const sort = `<label class="sort"><span class="sr-only">${t('sort')}</span><select data-act="sort">${[['best', 'sortBest'], ['low', 'sortLow'], ['high', 'sortHigh'], ['new', 'sortNew']].map(([v, k]) => `<option value="${v}" ${f.sort === v ? 'selected' : ''}>${t('sort')}: ${t(k)}</option>`).join('')}</select>${ic('chevd')}</label>`;
    const priceLabel = `<span class="t-small gold" data-pl>${money(f.min)} – ${money(f.max)}</span>`;
    return `<section class="wrap" style="padding-block:${d ? '40px 24px' : '24px 16px'}">${d ? `<div style="display:flex;justify-content:space-between;align-items:flex-end">${title}<div style="display:flex;gap:16px;align-items:center"><span class="t-small muted" data-count></span>${sort}</div></div>` : title}</section>
    <section class="wrap" style="padding-bottom:${d ? 80 : 48}px"><div class="coll">
      <aside class="coll__side filters" style="padding:24px;gap:22px" aria-label="${t('filters')}">
        <div class="fgroup__label"><span style="display:flex;gap:8px;align-items:center" class="t-h3">${ic('filter', 'gold')}${t('filters')}</span><button class="t-label gold" data-act="fclear">${t('clearAll')}</button></div><hr class="hair">
        <div class="fgroup"><h3 class="t-h3 gold">${t('family')}</h3><div class="checks">${checks('fam', D.fams, 'fam')}</div></div><hr class="hair">
        <div class="fgroup"><h3 class="t-h3 gold">${t('type')}</h3><div class="checks">${checks('cat', D.catSingle, 'cat')}</div></div><hr class="hair">
        <div class="fgroup"><h3 class="t-h3 gold">${t('price')}</h3>${rangeUI('r-d')}<div class="fgroup__label t-small"><span data-pmin>${money(f.min)}</span><span data-pmax>${money(f.max)}</span></div></div>
        <button class="btn btn--primary btn--block" data-act="fapply">${t('apply')}</button>
      </aside>
      <div>
        <div class="coll__mfilters filters">
          <div class="fgroup"><span class="t-bodyb">${t('family')}</span><div class="hscroll">${famChips}</div></div><hr class="hair">
          <div class="fgroup"><div class="fgroup__label"><span class="t-bodyb">${t('type')}</span><span class="t-label muted">${t('swipe')}</span></div><div class="hscroll">${typeChips}</div></div><hr class="hair">
          <div class="fgroup" style="gap:12px"><div class="fgroup__label"><span class="t-bodyb">${t('price')}</span>${priceLabel}</div>${rangeUI('r-m')}</div>
        </div>
        ${d ? '' : `<div class="toolbar"><span class="t-small muted" data-count></span>${sort}</div>`}
        <div class="grid" data-grid></div>
      </div>
    </div></section>`;
  }
  function renderGrid() {
    const g = $('[data-grid]'); if (!g) return;
    const list = filtered();
    g.innerHTML = list.length ? list.map(card).join('') : `<p class="empty">${t('noResults')}</p>`;
    document.querySelectorAll('[data-count]').forEach(c => c.textContent = AR() ? `${num(list.length)} ${list.length > 10 || list.length < 3 ? 'منتج' : 'منتجات'}` : `${list.length} ${t('products')}`);
  }

  function pagePdp(id) {
    const p = D.byId(id) || D.products[0];
    if (S.pdp.id !== p.id) S.pdp = { id: p.id, size: defaultSize(p), img: 0, qty: 1 };
    const sz = p.sizes[S.pdp.size], d = isDesk();
    const gal = (p.gallery || (p.img ? [p.img] : []));
    const mainImg = gal[S.pdp.img];
    const thumbs = [0, 1, 2, 3].map(i => gal[i] ? `<button class="thumb" data-act="pimg" data-i="${i}" aria-pressed="${S.pdp.img === i}" aria-label="${i + 1}">${pic(gal[i], pname(p), '151px')}</button>` : `<span class="thumb">${ic('image')}</span>`).join('');
    const badge = p.badge ? `<span class="badge ${p.badge === 'best' ? 'badge--gold' : 'badge--outline'}">${t(p.badge === 'best' ? 'best1' : 'new1')}</span>` : '<span></span>';
    const liked = S.wish.includes(p.id);
    const pairs = D.products.filter(x => x.id !== p.id && (x.fam === p.fam || x.cat !== p.cat)).slice(0, d ? 4 : 2);
    const icons = ['spray', 'rosette', 'drop'];
    return `<section class="wrap" style="padding-top:${d ? '24px' : '0'}">${d ? `<p class="crumbs" style="margin-bottom:16px"><a href="#/">${t('home')}</a>  /  <a href="#/shop?cat=${p.cat}">${L(D.catSingle[p.cat])}</a>  /  ${esc(pname(p))}</p>` : ''}
    <div class="pdp">
      <div><div class="pdp__main">${mainImg ? `<img src="assets/img/${mainImg}-800.webp" alt="${esc(pname(p))}" width="800" height="800" fetchpriority="high">` : slot(p.slot || p.en)}</div><div class="thumbs">${thumbs}</div></div>
      <div class="pdp__info stack">
        <div class="pdp__top">${badge}<button class="save" data-act="wish" data-id="${p.id}" aria-pressed="${liked}">${ic('heart')}${t('save')}</button></div>
        <p class="t-over" style="--g:22px">${pmeta(p)}</p>
        <h1 class="t-h1 gold" style="--g:8px">${esc(pname(p))}</h1>
        <p class="t-body muted" style="--g:12px">${L(p.desc)}</p>
        <div class="price-row" style="--g:22px"><span class="t-h2 gold" data-price>${money(sz.price)}</span><span class="t-label muted">${t('vat')}</span></div>
        <div class="bnpl" style="--g:14px">${ic('card')}<p class="t-small" data-bnpl>${t('bnpl4', { x: money(sz.price / 4) })}</p><span class="pill">${t('tabby')}</span><span class="pill">${t('tamara')}</span></div>
        <hr class="hair" style="--g:26px">
        <div class="stack" style="--g:24px"><div class="fgroup__label"><span class="t-bodyb">${t('size')}</span><span class="t-small muted" data-sizelabel>${L([sz.ar, sz.en])}</span></div>
          <div class="sizes n${p.sizes.length}" style="--g:12px">${p.sizes.map((s, i) => `<button class="chip" data-act="psize" data-i="${i}" aria-pressed="${i === S.pdp.size}">${L([s.ar, s.en])}</button>`).join('')}</div>
          ${p.cat === 'perfume' ? `<p class="t-label muted" style="--g:10px">${t('tolaNote')}</p>` : ''}</div>
        <div class="buy" style="--g:26px"><div class="stepper"><button data-act="pqty" data-d="-1" aria-label="-">${ic('minus')}</button><output data-qty>${num(S.pdp.qty)}</output><button data-act="pqty" data-d="1" aria-label="+">${ic('plus')}</button></div>
          <button class="btn btn--primary" data-act="padd" data-label>${t('addToCart')} · ${money(sz.price * S.pdp.qty)}</button></div>
        <a class="btn btn--wa btn--block" style="--g:10px" target="_blank" rel="noopener" data-wa href="${waLink([`${pname(p)} · ${L([sz.ar, sz.en])} × ${num(S.pdp.qty)}`])}">${ic('wa')}${t('orderWa')}</a>
        <div class="strip" style="--g:28px"><span class="strip__i">${ic('cash')}${t('svcCod')}</span><span class="strip__i">${ic('card')}${t('splitNoInt')}</span><span class="strip__i">${ic('truck')}${t('svcDelivery')}</span></div>
      </div>
    </div>
    <div class="details">
      <div class="stack" style="padding-block:8px"><h2 class="t-h2 gold">${t('notes')}</h2>${[t('top'), t('heart'), t('base')].map((lab, i) => `<div class="note" style="--g:${i ? 4 : 16}px">${ic(icons[i])}<div class="stack"><p class="t-over">${lab}</p><p class="t-bodyb" style="--g:5px">${L(p.notes[i])}</p></div></div>`).join('')}</div>
      <div class="howto"><div class="howto__head">${ic('flame')}<h2 class="t-h2">${t('howto')}</h2></div>${W.steps.map((s, i) => `<div class="step"><span class="step__n">${num(i + 1)}</span><p class="t-small">${L(s)}</p></div>`).join('')}<p class="tip">${ic('clock')}${t('tip')}</p></div>
    </div></section>
    <section class="wrap" style="padding-block:${d ? '48px 80px' : '32px 48px'}">${secHead(t('pairs'), null, d)}<div class="grid">${pairs.map(card).join('')}</div></section>`;
  }

  function giftTotal() { const g = S.gift, box = D.boxes.find(b => b.id === g.box); return box.price + g.items.reduce((a, it) => a + D.byId(it.id).sizes[it.size].price, 0); }
  function pageGift() {
    const g = S.gift, d = isDesk(), n = g.items.length;
    const stepCls = i => i === 0 ? 'is-done' : i === 1 ? (n === 3 ? 'is-done' : 'is-now') : (n === 3 ? 'is-now' : '');
    const dot = (i, lab) => `<div class="steps__i ${stepCls(i)}"><span class="steps__dot">${stepCls(i) === 'is-done' ? ic('check') : num(i + 1)}</span>${lab}</div>`;
    const themes = D.themes.map(th => `<button class="theme" data-act="gtheme" data-v="${th.id}" aria-pressed="${g.theme === th.id}">${ic(th.icon)}<span class="theme__n">${L([th.ar, th.en])}</span><span class="sw">${th.sw.map(c => `<i style="background:${c}"></i>`).join('')}</span><span class="t-label muted">${L(th.sub)}</span></button>`).join('');
    const boxes = D.boxes.map(b => `<button class="boxopt" role="radio" data-act="gbox" data-v="${b.id}" aria-checked="${g.box === b.id}"><span class="thumb">${ic('image')}</span><span class="boxopt__t"><span class="t-bodyb" style="display:block">${L([b.ar, b.en])}</span><span class="t-label muted">${L(b.sub)}</span></span><span class="boxopt__side"><span class="radio"></span>+ ${money(b.price)}</span></button>`).join('');
    const picks = [0, 1, 2].map(i => { const it = g.items[i]; if (!it) return `<div class="pick pick--empty">${ic('plus')}${t('addPiece')}</div>`; const p = D.byId(it.id); return `<div class="pick"><button class="pick__x" data-act="gdel" data-i="${i}" aria-label="${t('remove')}">${ic('close')}</button>${thumbOf(p)}<span class="t-label">${esc(pname(p))}</span><span class="t-label gold">${L([p.sizes[it.size].ar, p.sizes[it.size].en])}</span></div>`; }).join('');
    const minis = D.products.map(p => { const inBox = g.items.some(it => it.id === p.id); return `<div class="mini">${thumbOf(p)}<span class="t-label">${esc(pname(p))}</span><span class="mini__row">${money(p.sizes[p.cat === 'perfume' ? 2 : 0].price)}<button class="mini__add" data-act="gadd" data-id="${p.id}" ${inBox || n >= 3 ? 'disabled' : ''} aria-label="${t('addPiece')}: ${esc(pname(p))}">${ic(inBox ? 'check' : 'plus')}</button></span></div>`; }).join('');
    const box = D.boxes.find(b => b.id === g.box), th = D.themes.find(x => x.id === g.theme);
    const summary = `<aside class="summary"><h2 class="t-h2 gold">${t('yourBox')}</h2><div class="fill-slot" style="aspect-ratio:360/170;border-radius:10px;overflow:hidden">${slot('Box preview · ' + box.en + ', ' + th.en + ' sleeve')}</div>
      <div class="sumrow"><span>${L([box.ar, box.en])} · ${L([th.ar, th.en])}</span><b>${money(box.price)}</b></div>
      ${g.items.map(it => { const p = D.byId(it.id), s = p.sizes[it.size]; return `<div class="sumrow"><span>${esc(pname(p))} · ${L([s.ar, s.en])}</span><b>${money(s.price)}</b></div>`; }).join('')}
      <div class="sumrow"><span>${t('handCard')}</span><b>${t('free')}</b></div><hr class="hair">
      <div class="sumrow sumrow--total"><span>${t('total')}</span><b>${money(giftTotal())}</b></div>
      <button class="btn btn--primary btn--block" data-act="gcart" ${n < 3 ? 'disabled' : ''}>${t('addBox')}</button>
      <p class="t-label muted" style="display:flex;gap:6px;align-items:center">${ic('gift')}${n < 3 ? t('addMore', { n: AR() ? (3 - n === 1 ? 'قطعة واحدة' : 'قطعتين') : (3 - n) + (3 - n === 1 ? ' piece' : ' pieces') }) : t('boxReady')}</p></aside>`;
    const builder = `<div class="gb">
      <div class="stack"><span class="t-bodyb">${t('occasion')}</span><div class="themes" style="--g:10px">${themes}</div></div><hr class="hair">
      <div class="stack"><div class="fgroup__label"><h3 class="t-h3 gold">${t('pickBox')}</h3><span class="t-label muted">${t('done')}</span></div><div role="radiogroup" style="display:flex;flex-direction:column;gap:10px;--g:10px">${boxes}</div></div><hr class="hair">
      <div class="stack"><div class="fgroup__label"><h3 class="t-h3 gold">${t('addPieces')}</h3><span class="badge badge--outline">${t('ofThree', { n: num(n) })}</span></div><div class="picks" style="--g:12px">${picks}</div><p class="t-small muted" style="--g:14px">${t('chooseFrom')}</p><div class="minis" style="--g:10px">${minis}</div></div><hr class="hair">
      <div class="stack"><h3 class="t-h3 gold">${t('cardStep')}</h3><div style="display:flex;gap:10px;--g:12px"><label class="field"><span>${t('to')}</span><input data-act="gfield" data-k="to" value="${esc(g.to)}" placeholder="${t('toPh')}" maxlength="40"></label><label class="field"><span>${t('from')}</span><input data-act="gfield" data-k="from" value="${esc(g.from)}" placeholder="${t('fromPh')}" maxlength="40"></label></div>
        <label class="field" style="--g:12px"><span>${t('yourMsg')}</span><textarea data-act="gfield" data-k="msg" maxlength="150" placeholder="${t('msgPh')}">${esc(g.msg)}</textarea></label>
        <div class="fgroup__label" style="--g:8px"><span class="t-label muted">${t('handwritten')}</span><span class="t-label muted" data-cc>${num(g.msg.length)} / ${num(150)}</span></div></div>
    </div>`;
    return `<section class="wrap" style="padding-block:${d ? '40px 16px' : '24px 0'}"><div class="stack" style="text-align:center;display:flex;flex-direction:column;align-items:center"><p class="t-over">${t('gOcc')}</p><h1 class="${d ? 't-display' : 't-h1'} gold" style="--g:12px">${t('gTitle')}</h1><p class="t-small muted" style="--g:14px">${t('gSub')}</p></div>
      <div class="steps" style="margin-top:24px">${dot(0, t('stBox'))}<span class="steps__link"></span>${dot(1, t('stPieces'))}<span class="steps__link"></span>${dot(2, t('stCard'))}</div></section>
    <section class="wrap" style="padding-block:${d ? '16px 80px' : '24px 48px'}"><div class="gb-layout">${builder}${d ? summary : `<div style="margin-top:24px">${summary}</div>`}</div></section>`;
  }

  function pageQuiz() {
    const Q = D.quiz, st = S.quiz.step, q = Q[st], d = isDesk(), sel = S.quiz.ans[q.key];
    const dots = Q.map((x, i) => `<span class="qdot ${i < st ? 'is-done' : i === st ? 'is-now' : ''}"><i>${i < st ? ic('check') : num(i + 1)}</i>${L(x.short)}</span>`).join('');
    const opts = q.opts.map(o => `<button class="opt" data-act="qopt" data-v="${o.id}" aria-pressed="${sel === o.id}"><span class="opt__mark">${ic('check')}</span><span class="opt__ring">${ic(o.icon)}</span><span class="opt__t">${L(o.t)}</span><span class="opt__s">${L(o.s)}</span></button>`).join('');
    return `<section class="wrap" style="padding-block:${d ? '56px 96px' : '24px 64px'}"><div class="quizcard">
      <div><div class="fgroup__label"><span class="t-label gold">${t('qOf', { n: num(st + 1) })}</span><span class="t-label muted">${t('quizName')}</span></div><div class="qbar" style="margin-top:12px"><i style="width:${(st + (sel ? 1 : 0.5)) / 4 * 100}%"></i></div><div class="qdots">${dots}</div></div>
      <div class="qstage"><div class="${S.quiz.dir === 'next' ? 'qin-next' : 'qin-prev'}">
        <div class="stack" style="text-align:center;display:flex;flex-direction:column;align-items:center;margin-top:${d ? 40 : 28}px"><p class="t-over">${t('findYours')}</p><h1 class="${d ? 't-display' : 't-h1'} gold" style="--g:12px">${L(q.q)}</h1><p class="t-small muted" style="--g:10px">${t('pickOne')}</p></div>
        <div class="opts n${q.opts.length}" style="margin-top:${d ? 40 : 28}px">${opts}</div>
      </div></div>
      <div class="qnav" style="margin-top:${d ? 40 : 28}px"><button class="btn btn--secondary" data-act="qback">${t('back')}</button><button class="btn btn--primary" data-act="qnext" ${sel ? '' : 'disabled'}>${st === 3 ? t('seeSet') : t('next')}</button></div>
    </div></section>`;
  }
  function currentSet() { const m = S.quiz.ans.mood || 'warm'; return D.sets[m]; }
  function setPrices(set) { const sum = set.items.reduce((a, [id, s]) => a + D.byId(id).sizes[s].price, 0); return { sum, price: Math.floor(sum * 0.9) }; }
  function pageResult() {
    const set = currentSet(), d = isDesk(), { sum, price } = setPrices(set);
    const answers = D.quiz.map(q => { const o = q.opts.find(x => x.id === S.quiz.ans[q.key]); return o ? `<span>${L(o.t)}</span>` : ''; }).join('');
    const items = set.items.map(([id, s], i) => { const p = D.byId(id), z = p.sizes[s]; return `${i ? '<hr class="hair">' : ''}<div class="setitem">${thumbOf(p)}<div class="setitem__t"><p class="t-label muted">${pmeta(p)}</p><a class="t-bodyb" href="#/p/${p.id}">${esc(pname(p))}</a><p class="t-label muted">${L([z.ar, z.en])}</p></div><span class="t-small">${money(z.price)}</span></div>`; }).join('');
    const famWord = L(D.fams[set.more]);
    const also = D.products.filter(p => !set.items.some(([id]) => id === p.id)).filter(p => p.fam === set.more || p.cat === 'bakhoor').slice(0, d ? 4 : 2);
    const head = `<div class="stack" style="text-align:center;display:flex;flex-direction:column;align-items:center"><p class="t-over">${t('yourResult')}</p><h1 class="${d ? 't-display' : 't-h1'} gold" style="--g:12px">${L(set.title)}</h1><p class="t-body muted" style="--g:16px">${L(set.why)}</p>${answers ? `<p class="t-label muted" style="--g:28px">${t('basedOn')}</p><div class="answers" style="--g:10px">${answers}</div>` : ''}</div>`;
    const panel = `<div class="tabpanel"><span class="tabpanel__tab">${t('your3')}</span><div class="tabpanel__box" style="padding:40px 20px 24px;gap:18px;text-align:start;align-items:stretch">
      <div style="display:flex;flex-direction:column;gap:14px">${items}</div><hr class="hair">
      <div class="fgroup__label"><div><p class="t-small muted">${t('setPrice')}</p><p style="display:flex;gap:8px;align-items:baseline"><span class="t-h2 gold">${money(price)}</span><span class="was">${money(sum)}</span></p></div><span class="badge badge--gold">${t('saveX', { x: money(sum - price) })}</span></div>
      <button class="btn btn--primary btn--block" data-act="setcart">${t('addSet')}</button>
      <div style="display:flex;gap:20px;justify-content:center;flex-wrap:wrap"><a class="btn btn--ghost" href="#/quiz" data-act="qreset">${t('retake')}${ic('chev', 'flip')}</a><a class="btn btn--ghost" href="#/shop?fam=${set.more}">${t('shopFam', { f: famWord })}${ic('chev', 'flip')}</a></div></div></div>`;
    return `<section class="wrap" style="padding-block:${d ? '64px 48px' : '32px'}"><div class="result">${head}<div style="margin-top:${d ? 0 : 28}px">${panel}</div></div></section>
    <section class="wrap" style="padding-block:${d ? '32px 80px' : '16px 48px'}">${secHead(t('alsoLike'), null, d)}<div class="grid">${also.map(card).join('')}</div></section>`;
  }

  /* ---------- cart drawer ---------- */
  function waLink(lines) { return 'https://wa.me/?text=' + encodeURIComponent([t('waHello'), ...lines].join('\n')); }
  function drawer() {
    const count = cartCount(), sub = subtotal(), ship = shipping(), left = Math.max(0, D.freeShip - sub);
    const lines = S.cart.map((l, i) => {
      if (isBundle(l)) { const th = l.type === 'box' ? D.themes.find(x => x.id === l.theme) : null; const first = D.byId(l.items[0].id); const title = l.type === 'box' ? `${t('giftBoxName')} · ${L([th.ar, th.en])}` : L(D.sets[l.mood].title); return `<div class="line-item">${l.type === 'set' && first.img ? thumbOf(first) : `<span class="thumb">${ic('gift')}</span>`}<div class="line-item__b"><div class="line-item__top"><p class="t-bodyb">${title}</p><button class="x" data-act="cdel" data-i="${i}" aria-label="${t('remove')}">${ic('close')}</button></div><p class="t-label muted">${l.items.map(it => pname(D.byId(it.id))).join(' · ')}</p><div class="line-item__row"><div class="stepper"><button data-act="cqty" data-i="${i}" data-d="-1" aria-label="-">${ic('minus')}</button><output>${num(l.qty)}</output><button data-act="cqty" data-i="${i}" data-d="1" aria-label="+">${ic('plus')}</button></div><span class="t-price gold">${money(l.price * l.qty)}</span></div></div></div>`; }
      const p = D.byId(l.id), s = p.sizes[l.size];
      return `<div class="line-item">${thumbOf(p)}<div class="line-item__b"><div class="line-item__top"><a class="t-bodyb" href="#/p/${p.id}" data-act="cart-close">${esc(pname(p))}</a><button class="x" data-act="cdel" data-i="${i}" aria-label="${t('remove')}">${ic('close')}</button></div><p class="t-label muted">${L([s.ar, s.en])}</p><div class="line-item__row"><div class="stepper" aria-label="${t('qtyL')}"><button data-act="cqty" data-i="${i}" data-d="-1" aria-label="-">${ic('minus')}</button><output>${num(l.qty)}</output><button data-act="cqty" data-i="${i}" data-d="1" aria-label="+">${ic('plus')}</button></div><span class="t-price gold">${money(s.price * l.qty)}</span></div></div></div>`;
    }).join('');
    const waLines = S.cart.map(l => isBundle(l) ? `${l.type === 'box' ? t('giftBoxName') : L(D.sets[l.mood].title)} × ${num(l.qty)}` : `${pname(D.byId(l.id))} · ${L([D.byId(l.id).sizes[l.size].ar, D.byId(l.id).sizes[l.size].en])} × ${num(l.qty)}`);
    return `<div class="drawer__scroll">
      <div class="drawer__head"><h2 class="t-h2 gold" id="cart-title">${t('yourBag')} <span class="t-small muted">(${num(count)})</span></h2><button data-act="cart-close" aria-label="${t('close')}">${ic('close')}</button></div>
      <div class="cur" style="margin-top:20px"><span class="t-small muted">${t('showIn')}</span>${seg()}</div>
      ${count ? `<div style="margin-top:18px"><p class="t-small gold" style="display:flex;gap:6px;align-items:center">${ic('truck')}${left ? t('freeLeft', { x: money(left) }) : t('freeDone')}</p><div class="ship__bar"><i style="width:${Math.min(100, sub / D.freeShip * 100)}%"></i></div></div>
      <div style="margin-top:14px">${lines}</div>
      <label class="wrapopt" style="margin-top:22px"><input type="checkbox" data-act="wrap" ${S.wrap ? 'checked' : ''}><span class="check__box">${ic('check')}</span>${ic('gift')}<span style="flex:1">${t('giftWrap')}</span><span class="gold">+ ${money(25)}</span></label>` : `<div class="cart-empty"><p class="t-body muted">${t('empty')}</p><a class="btn btn--primary" href="#/shop" data-act="cart-close" style="margin-top:16px">${t('shopNow')}</a></div>`}
    </div>
    ${count ? `<div class="drawer__foot">
      <div class="sumrow"><span>${t('subtotal')}</span><b>${money(sub)}</b></div>
      <div class="sumrow" style="margin-top:8px"><span>${t('delivery')}</span><b>${ship ? money(ship) : t('free')}</b></div><hr class="hair" style="margin-block:10px">
      <div class="sumrow sumrow--total"><span>${t('grand')}</span><b>${money(sub + ship)}</b></div>
      <p class="t-label muted" style="display:flex;gap:6px;align-items:center;margin-top:8px">${ic('card')}${t('bnplCart', { x: money((sub + ship) / 4) })}</p>
      <button class="btn btn--primary btn--block" data-act="checkout" style="margin-top:18px">${t('checkout')}</button>
      <a class="btn btn--wa btn--block" style="margin-top:10px" target="_blank" rel="noopener" href="${waLink(waLines)}">${ic('wa')}${t('orderWa')}</a>
      <p class="t-label muted" style="display:flex;gap:6px;justify-content:center;align-items:center;margin-top:10px">${ic('cash')}${t('codNote')}</p></div>` : ''}`;
  }
  function openCart() { $('#drawer').innerHTML = drawer(); document.body.classList.add('cart-open'); $('#drawer').setAttribute('aria-hidden', 'false'); setTimeout(() => { const b = $('#drawer [data-act="cart-close"]'); b && b.focus(); }, 60); }
  function closeCart() { document.body.classList.remove('cart-open'); $('#drawer').setAttribute('aria-hidden', 'true'); }
  function refreshCart() { if (document.body.classList.contains('cart-open')) $('#drawer').innerHTML = drawer(); document.querySelectorAll('.bag__n').forEach(b => b.textContent = cartCount() ? num(cartCount()) : ''); }

  let toastT;
  function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2200); }

  /* ---------- render ---------- */
  const titles = { home: ['دار العود · بخور وعطور', 'Dar Al Oud · Bakhoor & Perfume'] };
  function route() {
    const h = (location.hash || '#/').split('?')[0];
    if (h.startsWith('#/p/')) return ['pdp', h.slice(4)];
    if (h === '#/shop') return ['shop'];
    if (h === '#/gift') return ['gift'];
    if (h === '#/quiz') return ['quiz'];
    if (h === '#/quiz/result') return ['result'];
    return ['home'];
  }
  function render(keepScroll) {
    const html = document.documentElement;
    html.lang = S.lang; html.dir = AR() ? 'rtl' : 'ltr';
    $('#hdr').innerHTML = header();
    $('#menu').innerHTML = menu();
    $('#ftr').innerHTML = footer();
    const [r, arg] = route();
    const main = $('#main');
    main.innerHTML = r === 'pdp' ? pagePdp(arg) : r === 'shop' ? pageShop() : r === 'gift' ? pageGift() : r === 'quiz' ? pageQuiz() : r === 'result' ? pageResult() : pageHome();
    if (r === 'shop') renderGrid();
    const p = r === 'pdp' ? D.byId(arg) : null;
    document.title = p ? `${pname(p)} · ${t('brand') === 'DAR AL OUD' ? 'Dar Al Oud' : 'دار العود'}` : L(titles.home);
    if (!keepScroll) window.scrollTo(0, 0);
    if (document.body.classList.contains('cart-open')) $('#drawer').innerHTML = drawer();
  }

  /* ---------- events ---------- */
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]'); if (!el) return;
    const a = el.dataset.act;
    switch (a) {
      case 'lang': S.lang = AR() ? 'en' : 'ar'; store.set('lang', S.lang); render(true); break;
      case 'cur': S.cur = el.dataset.v; store.set('cur', S.cur); render(true); break;
      case 'menu': $('#menu').classList.toggle('is-open'); break;
      case 'menu-go': $('#menu').classList.remove('is-open'); break;
      case 'account': toast(t('demoAccount')); break;
      case 'cart': openCart(); break;
      case 'cart-close': closeCart(); break;
      case 'add': addToCart(el.dataset.id); openCart(); break;
      case 'wish': { const id = el.dataset.id, i = S.wish.indexOf(id); i < 0 ? S.wish.push(id) : S.wish.splice(i, 1); store.set('wish', S.wish); el.setAttribute('aria-pressed', i < 0); break; }
      case 'fchip': { const k = el.dataset.k, v = el.dataset.v; S.filters[k] = v ? [v] : []; el.parentNode.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', c.dataset.v === v)); history.replaceState(null, '', '#/shop'); syncChecks(); renderGrid(); break; }
      case 'fclear': S.filters = { fam: [], cat: [], min: 50, max: 600, sort: S.filters.sort }; history.replaceState(null, '', '#/shop'); render(true); break;
      case 'fapply': renderGrid(); document.querySelector('[data-grid]').scrollIntoView({ block: 'start' }); break;
      case 'pimg': S.pdp.img = +el.dataset.i; render(true); break;
      case 'psize': S.pdp.size = +el.dataset.i; S.pdp.qty = Math.max(1, S.pdp.qty); render(true); break;
      case 'pqty': S.pdp.qty = Math.min(9, Math.max(1, S.pdp.qty + +el.dataset.d)); render(true); break;
      case 'padd': { addToCart(S.pdp.id, S.pdp.size, S.pdp.qty); const lab = el.innerHTML; el.innerHTML = `${ic('check')}${t('added')}`; setTimeout(() => { el.innerHTML = lab; }, 1200); setTimeout(openCart, 150); break; }
      case 'gtheme': S.gift.theme = el.dataset.v; saveGift(); render(true); break;
      case 'theme-go': S.gift.theme = el.dataset.v; saveGift(); break;
      case 'gbox': S.gift.box = el.dataset.v; saveGift(); render(true); break;
      case 'gadd': { if (S.gift.items.length < 3) { const p = D.byId(el.dataset.id); S.gift.items.push({ id: p.id, size: p.cat === 'perfume' ? 2 : 0 }); saveGift(); render(true); } break; }
      case 'gdel': S.gift.items.splice(+el.dataset.i, 1); saveGift(); render(true); break;
      case 'gcart': { if (S.gift.items.length === 3) { S.cart.push({ type: 'box', uid: Date.now(), box: S.gift.box, theme: S.gift.theme, items: S.gift.items.slice(), msg: S.gift.msg, price: giftTotal(), qty: 1 }); saveCart(); bumpBag(); toast(t('boxAdded')); openCart(); } break; }
      case 'qopt': S.quiz.ans[D.quiz[S.quiz.step].key] = el.dataset.v; el.parentNode.querySelectorAll('.opt').forEach(o => o.setAttribute('aria-pressed', o === el)); $('[data-act="qnext"]').disabled = false; $('.qbar i').style.width = (S.quiz.step + 1) / 4 * 100 + '%'; break;
      case 'qnext': if (S.quiz.step < 3) { S.quiz.step++; S.quiz.dir = 'next'; render(true); } else { location.hash = '#/quiz/result'; } break;
      case 'qback': if (S.quiz.step > 0) { S.quiz.step--; S.quiz.dir = 'prev'; render(true); } else { location.hash = '#/'; } break;
      case 'qreset': S.quiz = { step: 0, ans: {}, dir: 'next' }; break;
      case 'setcart': { const m = S.quiz.ans.mood || 'warm', set = D.sets[m]; S.cart.push({ type: 'set', uid: Date.now(), mood: m, items: set.items.map(([id, size]) => ({ id, size })), price: setPrices(set).price, qty: 1 }); saveCart(); bumpBag(); toast(t('setAdded')); openCart(); break; }
      case 'cdel': S.cart.splice(+el.dataset.i, 1); saveCart(); refreshCart(); break;
      case 'cqty': { const l = S.cart[+el.dataset.i]; l.qty += +el.dataset.d; if (l.qty < 1) S.cart.splice(+el.dataset.i, 1); saveCart(); refreshCart(); break; }
      case 'checkout': toast(t('demoCheckout')); break;
    }
  });
  document.addEventListener('change', e => {
    const el = e.target, a = el.dataset.act;
    if (a === 'sort') { S.filters.sort = el.value; document.querySelectorAll('[data-act="sort"]').forEach(s => s.value = el.value); renderGrid(); }
    if (a === 'fcheck') { const k = el.dataset.k, v = el.dataset.v, f = S.filters; if (!v) f[k] = []; else { const i = f[k].indexOf(v); el.checked ? (i < 0 && f[k].push(v)) : (i >= 0 && f[k].splice(i, 1)); } history.replaceState(null, '', '#/shop'); syncChecks(); renderGrid(); }
    if (a === 'wrap') { S.wrap = el.checked; refreshCart(); }
  });
  document.addEventListener('input', e => {
    const el = e.target, a = el.dataset.act;
    if (a === 'rmin' || a === 'rmax') {
      const f = S.filters; let v = +el.value;
      if (a === 'rmin') f.min = Math.min(v, f.max - 20); else f.max = Math.max(v, f.min + 20);
      document.querySelectorAll('.range').forEach(r => { r.querySelector('[data-act=rmin]').value = f.min; r.querySelector('[data-act=rmax]').value = f.max; const lo = (f.min - 50) / 550 * 100, hi = (f.max - 50) / 550 * 100, fl = r.querySelector('.range__fill'); fl.style.insetInlineStart = lo + '%'; fl.style.width = (hi - lo) + '%'; });
      document.querySelectorAll('[data-pl]').forEach(x => x.textContent = `${money(f.min)} – ${money(f.max)}`);
      document.querySelectorAll('[data-pmin]').forEach(x => x.textContent = money(f.min)); document.querySelectorAll('[data-pmax]').forEach(x => x.textContent = money(f.max));
      renderGrid();
    }
    if (a === 'gfield') { S.gift[el.dataset.k] = el.value; saveGift(); if (el.dataset.k === 'msg') { const c = $('[data-cc]'); if (c) c.textContent = `${num(el.value.length)} / ${num(150)}`; } }
  });
  function syncChecks() {
    document.querySelectorAll('[data-act="fcheck"]').forEach(c => { const k = c.dataset.k, v = c.dataset.v; c.checked = v ? S.filters[k].includes(v) : !S.filters[k].length; });
    document.querySelectorAll('[data-act="fchip"]').forEach(c => { const k = c.dataset.k, v = c.dataset.v; c.setAttribute('aria-pressed', v ? S.filters[k].length === 1 && S.filters[k][0] === v : !S.filters[k].length); });
  }
  function saveGift() { store.set('gift', S.gift); }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeCart(); $('#menu').classList.remove('is-open'); } });
  $('#scrim').addEventListener('click', closeCart);
  window.addEventListener('hashchange', () => { $('#menu').classList.remove('is-open'); closeCart(); if (route()[0] === 'quiz' && !location.hash.includes('result') && S.quiz.step === 0) S.quiz.dir = 'next'; render(); });
  let lastDesk = isDesk();
  window.addEventListener('resize', () => { const d = isDesk(); if (d !== lastDesk) { lastDesk = d; render(true); } });
  render(true);
  if (new URLSearchParams(location.search).get('open') === 'cart') openCart();
})();
