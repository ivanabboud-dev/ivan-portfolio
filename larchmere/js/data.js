/* Sample catalogue for the Larchmere wholesale demo. Prices are per case, excluding VAT. */
window.LM = {
  rules: {
    minimumOrder: 250,
    freeDeliveryFrom: 400,
    deliveryFee: 14.5,
    vatRate: 0.2,
    tiers: [
      { from: 1, to: 4, off: 0, label: "1 to 4 cases" },
      { from: 5, to: 9, off: 0.06, label: "5 to 9 cases" },
      { from: 10, to: Infinity, off: 0.11, label: "10+ cases" }
    ]
  },

  categories: [
    { id: "all", label: "All" },
    { id: "coffee", label: "Coffee" },
    { id: "tea", label: "Tea" },
    { id: "cups", label: "Cups and lids" },
    { id: "syrups", label: "Syrups and milk" }
  ],

  products: [
    {
      sku: "LM-ESP-1K", name: "House Espresso, 1kg", category: "coffee",
      pack: "Case of 6 bags", unitLabel: "bag", units: 6, price: 86.40, minCases: 1,
      img: "img/p-house-espresso.webp", gallery: ["img/beans.webp", "img/case-stack.webp"],
      blurb: "Brazil and Colombia. Chocolate and hazelnut. Built for milk drinks.",
      details: ["Roasted every Tuesday and Thursday", "Best within 6 weeks of roasting", "Whole bean, valve bags"]
    },
    {
      sku: "LM-FIL-ETH", name: "Ethiopia Filter, 1kg", category: "coffee",
      pack: "Case of 6 bags", unitLabel: "bag", units: 6, price: 104.40, minCases: 1,
      img: "img/p-filter-ethiopia.webp", gallery: ["img/beans.webp", "img/case-stack.webp"],
      blurb: "Washed Yirgacheffe. Bergamot and peach. For batch brew and pour-over.",
      details: ["Light roast", "Rotates by harvest", "Whole bean, valve bags"]
    },
    {
      sku: "LM-DEC-1K", name: "Swiss Water Decaf, 1kg", category: "coffee",
      pack: "Case of 6 bags", unitLabel: "bag", units: 6, price: 93.60, minCases: 1,
      img: "img/p-decaf.webp", gallery: ["img/beans.webp", "img/case-stack.webp"],
      blurb: "Colombia. Caramel and cocoa. Decaffeinated with water only.",
      details: ["Medium roast", "99.9% caffeine free", "Whole bean, valve bags"]
    },
    {
      sku: "LM-TEA-EB", name: "English Breakfast, 250 bags", category: "tea",
      pack: "Case of 4 boxes", unitLabel: "box", units: 4, price: 59.00, minCases: 1,
      img: "img/p-english-breakfast.webp", gallery: ["img/case-stack.webp"],
      blurb: "Assam and Kenya. Strong enough to take milk in a takeaway cup.",
      details: ["Unbleached, plastic-free bags", "Individually tagged", "Brews in 3 to 4 minutes"]
    },
    {
      sku: "LM-TEA-SEN", name: "Sencha Green, 500g loose", category: "tea",
      pack: "Case of 4 bags", unitLabel: "bag", units: 4, price: 78.00, minCases: 1,
      img: "img/p-sencha.webp", gallery: ["img/case-stack.webp"],
      blurb: "Steamed Japanese green tea. Grassy and sweet. Brew at 75°C.",
      details: ["About 200 cups per bag", "Resealable foil bag", "Brews in 2 minutes"]
    },
    {
      sku: "LM-TEA-MAT", name: "Matcha for Lattes, 500g", category: "tea",
      pack: "Case of 4 bags", unitLabel: "bag", units: 4, price: 112.00, minCases: 1,
      img: "img/p-matcha.webp", gallery: ["img/case-stack.webp"],
      blurb: "Culinary grade. Holds its colour and flavour against milk.",
      details: ["About 250 lattes per bag", "Whisk or blend", "Store sealed and cool"]
    },
    {
      sku: "LM-TEA-HIB", name: "Hibiscus and Berry, 100 pyramids", category: "tea",
      pack: "Case of 4 boxes", unitLabel: "box", units: 4, price: 46.00, minCases: 1,
      img: "img/p-hibiscus.webp", gallery: ["img/case-stack.webp"],
      blurb: "Caffeine free. Tart and fruity, good hot or iced.",
      details: ["Biodegradable pyramids", "Brews in 5 minutes", "Iced: double the bags"]
    },
    {
      sku: "LM-CUP-08", name: "8oz Double-wall Cup, white", category: "cups",
      pack: "Case of 500 cups", unitLabel: "cup", units: 500, price: 65.90, minCases: 2,
      img: "img/p-cup-white.webp", gallery: ["img/case-stack.webp"],
      blurb: "For flat whites and cortados. No sleeve needed.",
      details: ["Fits the 80mm sip lid", "Plastic-free lining", "Minimum order 2 cases"]
    },
    {
      sku: "LM-CUP-08K", name: "8oz Double-wall Cup, kraft", category: "cups",
      pack: "Case of 500 cups", unitLabel: "cup", units: 500, price: 69.50, minCases: 2,
      img: "img/p-cup-kraft.webp", gallery: ["img/case-stack.webp"],
      blurb: "Plain kraft, ready for a stamp or sticker. Same size as the white cup.",
      details: ["Fits the 80mm sip lid", "Plastic-free lining", "Minimum order 2 cases"]
    },
    {
      sku: "LM-LID-80", name: "80mm Sip Lid, black", category: "cups",
      pack: "Case of 1,000 lids", unitLabel: "lid", units: 1000, price: 38.00, minCases: 1,
      img: "img/p-lid-80.webp", gallery: ["img/case-stack.webp"],
      blurb: "Fits both 8oz double-wall cups. Snaps on and stays on in a bag.",
      details: ["Recyclable CPLA", "Sip hole and vent", "Fits LM-CUP-08 and LM-CUP-08K"]
    },
    {
      sku: "LM-SYR-VAN", name: "Vanilla Syrup, 750ml", category: "syrups",
      pack: "Case of 6 bottles", unitLabel: "bottle", units: 6, price: 58.20, minCases: 1,
      img: "img/p-syrup-vanilla.webp", gallery: ["img/case-stack.webp"],
      blurb: "Madagascan vanilla. About 75 shots per bottle.",
      details: ["Glass bottle", "Pump sold separately", "Keeps 4 weeks once open"]
    },
    {
      sku: "LM-OAT-1L", name: "Barista Oat Drink, 1L", category: "syrups",
      pack: "Case of 12 cartons", unitLabel: "carton", units: 12, price: 27.60, minCases: 1,
      img: "img/p-oat-barista.webp", gallery: ["img/case-stack.webp"],
      blurb: "Steams to a fine foam and does not split in hot coffee.",
      details: ["Long life, no fridge until open", "Use within 5 days of opening", "Gluten-free oats"]
    }
  ],

  accounts: {
    pine: {
      id: "pine", name: "Pine Street Café", terms: true,
      note: "Approved account",
      lastOrder: { "LM-ESP-1K": 3, "LM-TEA-EB": 2, "LM-CUP-08": 2, "LM-SYR-VAN": 1 }
    },
    harbour: {
      id: "harbour", name: "Harbour Kiosk", terms: false,
      note: "New account",
      lastOrder: null
    }
  },

  setups: {
    "small-counter": {
      title: "The small counter",
      line: "What a 30-seat café goes through in a week.",
      img: "img/look-small-counter.webp",
      alt: "A small café counter with a grinder, jars of beans and two stools",
      items: { "LM-ESP-1K": 3, "LM-DEC-1K": 1, "LM-CUP-08": 2, "LM-LID-80": 1, "LM-OAT-1L": 4, "LM-SYR-VAN": 1 }
    },
    "tea-bar": {
      title: "Tea bar",
      line: "Three teas that cover most orders, hot and iced.",
      img: "img/look-tea.webp",
      alt: "Loose black tea leaves in a terracotta cup",
      items: { "LM-TEA-EB": 2, "LM-TEA-SEN": 1, "LM-TEA-HIB": 1, "LM-TEA-MAT": 1 }
    },
    "takeaway": {
      title: "Takeaway station",
      line: "White and kraft cups that share one lid, so there is one less thing to run out of.",
      img: "img/look-takeaway.webp",
      alt: "Plain white paper cups on a grey stone counter",
      items: { "LM-CUP-08": 2, "LM-CUP-08K": 2, "LM-LID-80": 2 }
    }
  }
};
