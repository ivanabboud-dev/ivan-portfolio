/* Dar Al Oud sample catalogue. Prices in SAR. Design concept, sample data. */
window.DAO = window.DAO || {};

(function () {
  const perfumeSizes = (p100, fixed) => fixed || [
    { ar: 'تولة', en: 'Tola', price: Math.round(p100 * 1.07 / 5) * 5 },
    { ar: '١٢ مل', en: '12 ml', price: Math.round(p100 * 0.43 / 5) * 5 },
    { ar: '٥٠ مل', en: '50 ml', price: Math.round(p100 * 0.71 / 5) * 5 },
    { ar: '١٠٠ مل', en: '100 ml', price: p100 }
  ];

  DAO.products = [
    { id: 'oud-royal', ar: 'عود رويال', en: 'Oud Royal', cat: 'perfume', fam: 'oud', price: 450, badge: 'best', img: 'oud-royal', gallery: ['oud-royal', 'oud-royal-3'],
      sizes: perfumeSizes(450, [{ ar: 'تولة', en: 'Tola', price: 480 }, { ar: '١٢ مل', en: '12 ml', price: 195 }, { ar: '٥٠ مل', en: '50 ml', price: 320 }, { ar: '١٠٠ مل', en: '100 ml', price: 450 }]),
      desc: ['عطر قاعدته عود كمبودي معتّق ثلاث سنوات، مع الزعفران والورد الطائفي. قوي في أول ساعة، ثم يهدأ ويصير أحلى.', 'Built on Cambodian oud aged three years, with saffron and Taif rose. Strong for the first hour, then softer and sweeter.'],
      notes: [['زعفران · هيل · برغموت', 'Saffron · Cardamom · Bergamot'], ['ورد طائفي · عود كمبودي', 'Taif rose · Cambodian oud'], ['عنبر · مسك · صندل', 'Amber · Musk · Sandalwood']] },
    { id: 'black-oud', ar: 'عود أسود', en: 'Black Oud', cat: 'perfume', fam: 'oud', price: 520, badge: 'best', img: 'black-oud',
      desc: ['عود هندي داكن مع جلد وفلفل أسود. عطر للمساء.', 'Dark Indian oud with leather and black pepper. An evening scent.'],
      notes: [['فلفل أسود · دخان', 'Black pepper · Smoke'], ['عود هندي · جلد', 'Indian oud · Leather'], ['نجيل الهند · عنبر', 'Vetiver · Amber']] },
    { id: 'white-musk', ar: 'مسك أبيض', en: 'White Musk', cat: 'perfume', fam: 'musk', price: 240, badge: 'best', img: 'white-musk',
      desc: ['مسك نظيف وناعم، يناسب العمل والنهار.', 'Clean, soft musk for work and daytime.'],
      notes: [['زهر البرتقال · برغموت', 'Orange blossom · Bergamot'], ['مسك أبيض · ياسمين', 'White musk · Jasmine'], ['خشب الكشمير · عنبر خفيف', 'Cashmere wood · Light amber']] },
    { id: 'amber-noir', ar: 'عنبر نوار', en: 'Amber Noir', cat: 'perfume', fam: 'amber', price: 390, badge: 'new', img: 'amber-noir',
      desc: ['عنبر دافئ مع لبان عُماني وفانيلا. يبقى على الشال أياماً.', 'Warm amber with Omani frankincense and vanilla. Stays on a shawl for days.'],
      notes: [['زعفران · قرفة', 'Saffron · Cinnamon'], ['عنبر · لبان', 'Amber · Frankincense'], ['فانيلا · عود', 'Vanilla · Oud']] },
    { id: 'rose-oud', ar: 'ورد العود', en: 'Rose Oud', cat: 'perfume', fam: 'rose', price: 360, img: 'rose-oud',
      desc: ['ورد الطائف فوق قاعدة من العود. عطر أعراس.', 'Taif rose over an oud base. A wedding scent.'],
      notes: [['ورد طائفي · فلفل وردي', 'Taif rose · Pink pepper'], ['عود · باتشولي', 'Oud · Patchouli'], ['مسك · عنبر', 'Musk · Amber']] },
    { id: 'santal-oud', ar: 'عود الصندل', en: 'Santal Oud', cat: 'perfume', fam: 'oud', price: 340, img: 'santal-oud',
      desc: ['صندل كريمي مع عود هادئ. مناسب للمكتب.', 'Creamy sandalwood with a quiet oud. Fine for the office.'],
      notes: [['هيل · جوزة الطيب', 'Cardamom · Nutmeg'], ['صندل ميسور · عود', 'Mysore sandalwood · Oud'], ['مسك · فانيلا', 'Musk · Vanilla']] },
    { id: 'blue-oud', ar: 'عود أزرق', en: 'Blue Oud', cat: 'perfume', fam: 'oud', price: 290, badge: 'new', img: 'blue-oud',
      desc: ['عود منعش بلمسة بحرية. للنهار والصيف.', 'A fresh oud with a sea breeze edge. For summer days.'],
      notes: [['برغموت · ملح البحر', 'Bergamot · Sea salt'], ['عود · خزامى', 'Oud · Lavender'], ['عنبر رمادي · مسك', 'Ambergris · Musk']] },
    { id: 'citrus-oud', ar: 'عود الحمضيات', en: 'Citrus Oud', cat: 'perfume', fam: 'oud', price: 270, img: 'citrus-oud',
      desc: ['حمضيات حادة فوق عود خفيف. ينعش في الحر.', 'Sharp citrus over a light oud. Good in the heat.'],
      notes: [['ليمون · ليمون عُماني', 'Lemon · Omani lime'], ['عود · زهر البرتقال', 'Oud · Orange blossom'], ['مسك · أخشاب', 'Musk · Woods']] },
    { id: 'maamoul', ar: 'بخور معمول الشيوخ', en: 'Sheikh’s Maamoul Bakhoor', cat: 'bakhoor', fam: 'oud', price: 145, slot: 'Maamoul bakhoor · 1:1',
      sizes: [{ ar: '٥٠ غ', en: '50 g', price: 145 }, { ar: '١٠٠ غ', en: '100 g', price: 260 }, { ar: '٢٥٠ غ', en: '250 g', price: 590 }],
      desc: ['معمول يدوي من العود والمسك والعنبر وماء الورد، نخلطه كل خميس. لتبخير المجلس والملابس.', 'Hand-mixed maamoul of oud, musk, amber and rose water, made every Thursday. For the majlis and your clothes.'],
      notes: [['ماء ورد', 'Rose water'], ['عود · مسك', 'Oud · Musk'], ['عنبر · سكر محروق', 'Amber · Burnt sugar']] },
    { id: 'cambodi', ar: 'كسر عود كمبودي', en: 'Cambodian Oud Chips', cat: 'bakhoor', fam: 'oud', price: 320, slot: 'Oud chips · 1:1',
      sizes: [{ ar: 'تولة (١٢ غ)', en: 'Tola (12 g)', price: 320 }, { ar: '٣ تولة', en: '3 tola', price: 900 }],
      desc: ['كسر عود كمبودي طبيعي للتبخير. قطعة صغيرة تكفي لغرفة.', 'Natural Cambodian oud chips for burning. One small piece is enough for a room.'],
      notes: [['خشب حلو', 'Sweet wood'], ['عود كمبودي', 'Cambodian oud'], ['راتنج · عسل', 'Resin · Honey']] },
    { id: 'taifi-rose', ar: 'مخمرية الورد الطائفي', en: 'Taifi Rose Mukhamariya', cat: 'mukh', fam: 'rose', price: 165, slot: 'Mukhamariya jar · 1:1',
      sizes: [{ ar: '٥٠ غ', en: '50 g', price: 165 }, { ar: '١٠٠ غ', en: '100 g', price: 300 }],
      desc: ['مخمرية كريمية بورد الطائف. تُوضع على الشعر والملابس قبل التبخير.', 'A creamy mukhamariya with Taif rose. Put it on hair and clothes before the bakhoor.'],
      notes: [['ورد طائفي', 'Taif rose'], ['مسك · زعفران', 'Musk · Saffron'], ['عود خفيف', 'Light oud']] },
    { id: 'amber-musk', ar: 'مسك العنبر المعتّق', en: 'Aged Amber Musk', cat: 'musk', fam: 'amber', price: 120, slot: 'Musk jar · 1:1',
      sizes: [{ ar: '٣ تولة', en: '3 tola', price: 120 }, { ar: '٦ تولة', en: '6 tola', price: 220 }],
      desc: ['مسك عنبر معتّق بقوام كريمي. نقطة خلف الأذن تكفي.', 'Aged amber musk with a creamy texture. One dab behind the ear is enough.'],
      notes: [['مسك', 'Musk'], ['عنبر', 'Amber'], ['خشب الصندل', 'Sandalwood']] }
  ];
  DAO.products.forEach(p => { if (!p.sizes) p.sizes = perfumeSizes(p.price); });
  DAO.byId = id => DAO.products.find(p => p.id === id);

  DAO.cats = { bakhoor: ['بخور', 'Bakhoor', 'mabkhara'], perfume: ['عطور', 'Perfumes', 'bottle'], mukh: ['مخمريات', 'Mukhamariya', 'jar'], musk: ['مسكيات', 'Musks', 'muskbox'] };
  DAO.catSingle = { bakhoor: ['بخور', 'Bakhoor'], perfume: ['عطور', 'Perfume'], mukh: ['مخمريات', 'Mukhamariya'], musk: ['مسكيات', 'Musk'] };
  DAO.fams = { oud: ['عود', 'Oud'], amber: ['عنبر', 'Amber'], musk: ['مسك', 'Musk'], rose: ['ورد', 'Rose'] };

  DAO.boxes = [
    { id: 'black', ar: 'الصندوق الأسود الكلاسيكي', en: 'Classic black box', sub: ['مخمل أسود وشريط ذهبي', 'Black velvet, gold ribbon'], price: 45 },
    { id: 'gold', ar: 'صندوق النقش الذهبي', en: 'Gold engraved box', sub: ['غطاء منقوش بزخارف إسلامية', 'Lid with carved Islamic pattern'], price: 75 },
    { id: 'wood', ar: 'صندوق خشب العود', en: 'Oud wood chest', sub: ['خشب طبيعي بقفل نحاسي', 'Natural wood, brass clasp'], price: 120 }
  ];
  DAO.themes = [
    { id: 'eid', ar: 'عيد', en: 'Eid', sub: ['ذهبي وعاجي', 'Gold & ivory'], sw: ['#C9A24A', '#F2E6C9'], icon: 'crescent' },
    { id: 'ramadan', ar: 'رمضان', en: 'Ramadan', sub: ['كحلي وذهبي', 'Navy & gold'], sw: ['#1A2440', '#C9A24A'], icon: 'lantern' },
    { id: 'wedding', ar: 'زفاف', en: 'Wedding', sub: ['أبيض وذهبي', 'White & gold'], sw: ['#FFFFFF', '#C9A24A'], icon: 'rings' }
  ];

  DAO.quiz = [
    { key: 'who', q: ['لمن هذا العطر؟', 'Who is it for?'], short: ['لمن؟', 'For whom?'], opts: [
      { id: 'me', icon: 'user', t: ['لي', 'For me'], s: ['أختار لنفسي', 'I am choosing for myself'] },
      { id: 'gift', icon: 'gift', t: ['هدية', 'A gift'], s: ['لشخص عزيز', 'For someone close'] }] },
    { key: 'mood', q: ['أي أجواء تحبها أكثر؟', 'Which mood do you love most?'], short: ['الأجواء', 'Mood'], opts: [
      { id: 'warm', icon: 'flame', t: ['دافئة وغنية', 'Warm & rich'], s: ['عنبر · عود · زعفران', 'Amber · oud · saffron'] },
      { id: 'clean', icon: 'drop', t: ['نظيفة وناعمة', 'Clean & soft'], s: ['مسك أبيض · قطن', 'White musk · cotton'] },
      { id: 'floral', icon: 'rosette', t: ['زهرية ومنعشة', 'Floral & fresh'], s: ['ورد طائفي · ياسمين', 'Taif rose · jasmine'] },
      { id: 'woody', icon: 'mabkhara', t: ['خشبية ودخانية', 'Woody & smoky'], s: ['عود · بخور · صندل', 'Oud · bakhoor · sandalwood'] }] },
    { key: 'when', q: ['متى تستخدمه غالباً؟', 'When will you wear it most?'], short: ['متى؟', 'When?'], opts: [
      { id: 'day', icon: 'clock', t: ['كل يوم', 'Every day'], s: ['للعمل والمشاوير', 'Work and errands'] },
      { id: 'evening', icon: 'star', t: ['المساء والمناسبات', 'Evenings & occasions'], s: ['أعراس وعزايم', 'Weddings and dinners'] },
      { id: 'majlis', icon: 'mabkhara', t: ['المجلس', 'The majlis'], s: ['استقبال الضيوف', 'Receiving guests'] }] },
    { key: 'power', q: ['كم تحب أن يفوح؟', 'How strong should it be?'], short: ['القوة', 'Strength'], opts: [
      { id: 'soft', icon: 'drop', t: ['هادئ', 'Soft'], s: ['قريب من البشرة', 'Close to the skin'] },
      { id: 'medium', icon: 'spray', t: ['متوسط', 'Medium'], s: ['يُشم عند الاقتراب', 'Noticed up close'] },
      { id: 'strong', icon: 'flame', t: ['فوّاح', 'Strong'], s: ['يملأ المكان', 'Fills the room'] }] }
  ];

  DAO.sets = {
    warm: { title: ['مجموعتك: عنبر للمساء', 'Your set: amber for evenings'], why: ['اخترت روائح دافئة وقوية، لذلك بدأنا بالعنبر.', 'You picked warm, strong scents, so we started with amber.'], items: [['amber-noir', 3], ['maamoul', 0], ['amber-musk', 0]], more: 'amber' },
    clean: { title: ['مجموعتك: مسك للنهار', 'Your set: musk for daytime'], why: ['اخترت روائح نظيفة وناعمة، لذلك بدأنا بالمسك الأبيض.', 'You picked clean, soft scents, so we started with white musk.'], items: [['white-musk', 3], ['santal-oud', 2], ['amber-musk', 0]], more: 'musk' },
    floral: { title: ['مجموعتك: ورد الطائف', 'Your set: Taif rose'], why: ['اخترت روائح زهرية، لذلك بدأنا بورد الطائف.', 'You picked floral scents, so we started with Taif rose.'], items: [['rose-oud', 3], ['taifi-rose', 0], ['white-musk', 2]], more: 'rose' },
    woody: { title: ['مجموعتك: عود ودخان', 'Your set: oud and smoke'], why: ['اخترت روائح خشبية ودخانية، لذلك بدأنا بالعود.', 'You picked woody, smoky scents, so we started with oud.'], items: [['black-oud', 3], ['cambodi', 0], ['santal-oud', 2]], more: 'oud' }
  };

  DAO.rate = { SAR: 1, AED: 0.98 };
  DAO.freeShip = 200;
})();
