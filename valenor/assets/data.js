/* VALENOR demo catalog: sample products for the portfolio demo, not a real inventory.
   To add a photo: drop it in images/products/ and list it under that product's `images`
   (first image = card + main product image), or under `colorImages: { Colour: [...] }` when
   the photos only show one colour. Anything without a photo shows a line drawing. */
window.VLN = window.VLN || {};

VLN.colors = {
  Black: '#141312', Charcoal: '#34322f', Stone: '#a39a8b', Oat: '#cdbfa6', Ecru: '#e6dccb',
  Navy: '#222a38', Olive: '#565637', Chocolate: '#48342a', Camel: '#a9844f', Sage: '#8a9580', Sand: '#bfa47d'
};

/* Top sizes and trouser waists. Usual size S/M/L/XL maps onto both. */
VLN.topSizes = ['S', 'M', 'L', 'XL', 'XXL'];
VLN.waists = ['30', '31', '32', '33', '34', '36'];
VLN.lengths = ['Regular', 'Long'];

VLN.categories = [
  { id: 'shirts', name: 'Shirts & Tees', short: 'Shirts' },
  { id: 'knitwear', name: 'Knitwear', short: 'Knitwear' },
  { id: 'trousers', name: 'Trousers', short: 'Trousers' },
  { id: 'outerwear', name: 'Outerwear', short: 'Outerwear' }
];

/* cut: true | slim | roomy | boxy. Drives the size we pick and the fit-match score.
   slot: tops | mid | outer | trousers (the wardrobe slot a piece fills).
   four: which of The Four archetypes it belongs to.
   out: "Colour:Size" pairs that are sold out; gone: sizes sold out in every colour. */
VLN.products = [
  { id: 'devon-half-zip', name: 'Devon Half-Zip', cat: 'knitwear', slot: 'mid', shape: 'knit', price: 49.99, cut: 'true', adj: 0,
    colors: ['Black', 'Oat', 'Navy'], colorImages: { Black: ['images/flat.jpg', 'images/hero.jpg', 'images/texture.jpg'] },
    four: ['quiet', 'modernist'], badge: 'Bestseller', out: ['Oat:S', 'Navy:M'], gone: ['XXL'],
    blurb: 'A heavy rib half-zip with a stand collar that holds its shape. Over a tee now, under a coat later.',
    details: ['Heavy rib knit, 70% cotton, 30% wool', 'Metal zip, soft-touch pull', 'Dropped shoulder, ribbed cuffs and hem'] },
  { id: 'ridge-overshirt', name: 'Ridge Overshirt', cat: 'shirts', slot: 'mid', shape: 'jacket', price: 44.99, cut: 'roomy', adj: -1,
    colors: ['Charcoal', 'Olive', 'Camel'], four: ['modernist', 'traditionalist'], out: ['Camel:L'], gone: ['XXL'],
    blurb: 'Brushed twill with two flap pockets. A shirt that does the work of a light jacket.',
    details: ['Brushed cotton twill', 'Two flap chest pockets', 'Roomy cut, layers over knitwear'] },
  { id: 'corbin-pleated-trouser', name: 'Corbin Pleated Trouser', cat: 'trousers', slot: 'trousers', shape: 'trouser', price: 39.99, cut: 'true', adj: 3,
    colors: ['Black', 'Stone', 'Chocolate'], four: ['quiet', 'traditionalist'], badge: 'Bestseller', out: ['Stone:34'], gone: ['32', '36'],
    blurb: 'A double-pleated trouser with a straight, easy leg. It drapes rather than clings.',
    details: ['Wool-feel twill with a little stretch', 'Double forward pleats', 'Regular and long leg'] },
  { id: 'alder-heavy-tee', name: 'Alder Heavy Tee', cat: 'shirts', slot: 'tops', shape: 'tee', price: 29.99, cut: 'boxy', adj: 0,
    colors: ['Black', 'Ecru', 'Olive'], four: ['weekender', 'modernist'], out: ['Ecru:M'], gone: ['S', 'XL'],
    blurb: 'A 280 gsm cotton tee with a dense, boxy drape and a neckline that stays flat.',
    details: ['280 gsm organic cotton', 'Boxy, slightly cropped body', 'Taped shoulder seams'] },
  { id: 'fallon-knit-polo', name: 'Fallon Knit Polo', cat: 'shirts', slot: 'tops', shape: 'polo', price: 34.99, cut: 'slim', adj: 1,
    colors: ['Black', 'Stone', 'Olive'], four: ['quiet'], badge: 'Bestseller', out: ['Olive:M'], gone: ['S', 'XL'],
    blurb: 'A fine-gauge knit polo with an open collar. Neat enough for dinner, easy enough for the weekend.',
    details: ['Fine-gauge knit, 100% cotton', 'Open johnny collar', 'Slim through the body'] },
  { id: 'meridian-waffle-polo', name: 'Meridian Waffle Polo', cat: 'shirts', slot: 'tops', shape: 'polo', price: 36.99, cut: 'true', adj: 1,
    colors: ['Ecru', 'Navy', 'Chocolate'], four: ['quiet', 'traditionalist'], out: ['Ecru:L'], gone: ['M'],
    blurb: 'Textured waffle knit with a three-button placket. Breathes in heat, layers in autumn.',
    details: ['Waffle knit, cotton blend', 'Three-button placket', 'True to size'] },
  { id: 'sable-camp-shirt', name: 'Sable Linen Camp Shirt', cat: 'shirts', slot: 'tops', shape: 'shirt', price: 39.99, cut: 'roomy', adj: 0,
    colors: ['Sand', 'Ecru', 'Black'], four: ['weekender'], badge: 'New', out: ['Sand:S'], gone: ['L'],
    blurb: 'Washed linen with a flat camp collar and a relaxed, boxy drape.',
    details: ['100% washed linen', 'Camp collar, horn-effect buttons', 'Roomy cut'] },
  { id: 'ardent-merino-crew', name: 'Ardent Merino Crew', cat: 'knitwear', slot: 'mid', shape: 'knit', price: 54.99, cut: 'slim', adj: 2,
    colors: ['Charcoal', 'Oat', 'Navy'], four: ['quiet'], out: ['Oat:L'], gone: ['M', 'XXL'],
    blurb: 'Lightweight merino in a clean crew neck. Warm without the bulk.',
    details: ['Extra-fine merino wool', 'Fully fashioned shoulders', 'Slim cut'] },
  { id: 'hollis-cardigan', name: 'Hollis Shawl Cardigan', cat: 'knitwear', slot: 'mid', shape: 'knit', price: 59.99, cut: 'roomy', adj: -2,
    colors: ['Oat', 'Chocolate', 'Charcoal'], four: ['weekender', 'traditionalist'], badge: 'New', out: ['Chocolate:M'], gone: ['L'],
    blurb: 'A chunky shawl-collar cardigan with horn buttons. The layer you reach for every evening.',
    details: ['Chunky lambswool blend', 'Shawl collar, horn buttons', 'Roomy cut'] },
  { id: 'weston-cord-trouser', name: 'Weston Cord Trouser', cat: 'trousers', slot: 'trousers', shape: 'trouser', price: 44.99, cut: 'true', adj: 0,
    colors: ['Camel', 'Chocolate', 'Sage'], four: ['weekender', 'traditionalist'], out: ['Sage:30', 'Sage:31'], gone: ['33'],
    blurb: 'Mid-wale corduroy in a straight cut. Softens and fades well over time.',
    details: ['Mid-wale cotton corduroy', 'Straight leg', 'Button fly'] },
  { id: 'drift-linen-trouser', name: 'Drift Linen Trouser', cat: 'trousers', slot: 'trousers', shape: 'trouser', price: 36.99, cut: 'roomy', adj: -1,
    colors: ['Ecru', 'Sand', 'Navy'], four: ['weekender'], out: ['Navy:32'], gone: ['30', '34'],
    blurb: 'Washed linen with a hidden drawstring. The trouser you live in all summer.',
    details: ['100% washed linen', 'Elastic back, internal drawstring', 'Relaxed, tapered leg'] },
  { id: 'calder-wide-trouser', name: 'Calder Wide Trouser', cat: 'trousers', slot: 'trousers', shape: 'trouser', price: 42.99, cut: 'roomy', adj: 1,
    colors: ['Black', 'Charcoal', 'Stone'], four: ['modernist'], out: ['Stone:32'], gone: ['33'],
    blurb: 'A wide, fluid trouser with a high rise. Volume that still looks deliberate.',
    details: ['Fluid wool-blend twill', 'High rise, single pleat', 'Wide leg'] },
  { id: 'harrow-wool-coat', name: 'Harrow Wool Coat', cat: 'outerwear', slot: 'outer', shape: 'coat', price: 129.99, cut: 'true', adj: 2,
    colors: ['Charcoal', 'Camel', 'Navy'], four: ['quiet', 'traditionalist'], badge: 'Bestseller', out: ['Camel:M'], gone: ['S', 'XL'],
    blurb: 'A double-faced wool overcoat cut just past the hip. Cloth that outlives the season.',
    details: ['Double-faced wool blend', 'Notch lapel, hidden placket', 'True to size, room for a knit'] },
  { id: 'york-quilted-jacket', name: 'York Quilted Jacket', cat: 'outerwear', slot: 'outer', shape: 'jacket', price: 89.99, cut: 'true', adj: -1,
    colors: ['Black', 'Navy', 'Olive'], four: ['modernist'], out: ['Olive:S', 'Navy:L'], gone: ['M'],
    blurb: 'A light, channel-quilted jacket with a stand collar. Packs down into its own pocket.',
    details: ['Recycled nylon shell', 'Synthetic down fill', 'Two-way zip, stand collar'] },
  { id: 'hale-chore-jacket', name: 'Hale Chore Jacket', cat: 'outerwear', slot: 'outer', shape: 'jacket', price: 74.99, cut: 'roomy', adj: 0,
    colors: ['Charcoal', 'Camel', 'Navy'], four: ['weekender'], badge: 'New', out: ['Camel:L'], gone: ['M'],
    blurb: 'A heavy canvas chore coat with three patch pockets. Gets better every time you wear it.',
    details: ['Heavy cotton canvas', 'Three patch pockets', 'Roomy cut'] }
];

/* The Four archetypes (from the "Defined by character" design). */
VLN.four = [
  { id: 'quiet', num: 'I', name: 'The Quiet Professional', desc: 'Nothing loud. Everything considered.', img: 'images/hero.jpg', pos: '50% 15%' },
  { id: 'weekender', num: 'II', name: 'The Weekender', desc: 'Softer shapes, harder wear.' },
  { id: 'modernist', num: 'III', name: 'The Modernist', desc: 'Volume, drape, black on black.', img: 'images/texture.jpg', pos: '50% 50%' },
  { id: 'traditionalist', num: 'IV', name: 'The Traditionalist', desc: 'Cloth that outlives the season.' }
];

/* A sample wardrobe for the "wardrobe reading" section. Pieces in the bag fill the gaps. */
VLN.wardrobe = [
  { slot: 'tops', label: 'Tops', owned: 11, title: 'Well covered', cat: 'shirts' },
  { slot: 'trousers', label: 'Trousers', owned: 5, title: 'Enough', cat: 'trousers' },
  { slot: 'mid', label: 'Mid-layer', owned: 0, title: 'Overshirt', link: 'product.html?p=ridge-overshirt' },
  { slot: 'outer', label: 'Outerwear', owned: 0, title: 'Wool coat', link: 'product.html?p=harrow-wool-coat' },
  { slot: 'shoes', label: 'Shoes', owned: 3, title: 'Enough' },
  { slot: 'knits', label: 'Knits', owned: 2, title: 'Enough', cat: 'knitwear', mobileOnly: true }
];

/* "Fill the gap" bundle: two pieces, fixed saving. */
VLN.gapBundle = { items: [['ridge-overshirt', 'Charcoal'], ['devon-half-zip', 'Black']], owned: 'corbin-pleated-trouser', save: 10 };
