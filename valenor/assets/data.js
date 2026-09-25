/* VALENOR demo catalog: sample products for the portfolio demo, not a real inventory.
   To add a photo: drop it in images/products/ and list it under that product's `images`
   (first image = card + main PDP image), or under `colorImages: { Colour: [...] }` when the
   photos only show one colour. Anything without a photo shows a tinted line drawing. */
window.VLN = window.VLN || {};

VLN.colors = {
  Onyx: '#1f1d1b', Oat: '#d6c8ae', Navy: '#26303f', Stone: '#b7ae9f', Olive: '#5c5b3f',
  Ecru: '#ebe3d2', Sand: '#c8ae88', Chocolate: '#4a3428', Charcoal: '#3b3a38', Sage: '#8e9a82',
  Camel: '#b0895a', Bone: '#f2ede4'
};

VLN.sizes = ['S', 'M', 'L', 'XL', '2XL'];

VLN.categories = [
  { id: 'shirts', name: 'Shirts & Polos', blurb: 'Knit polos, camp collars and overshirts.' },
  { id: 'knitwear', name: 'Knitwear', blurb: 'Half-zips and crews in ribbed, weighty knits.' },
  { id: 'trousers', name: 'Trousers', blurb: 'Pleated, drawstring and corduroy cuts.' },
  { id: 'outerwear', name: 'Outerwear', blurb: 'Quilted and chore layers for cold mornings.' }
];

/* fit: slim | regular | relaxed. It drives the size recommendation.
   soldOut: "Color:Size" pairs that are out of stock. */
VLN.products = [
  { id: 'harlow-half-zip', name: 'Harlow Half-Zip Knit', cat: 'knitwear', shape: 'knit', price: 64, fit: 'regular',
    colors: ['Onyx', 'Oat', 'Navy'], colorImages: { Onyx: ['images/fabric.jpg', 'images/hero.jpg'] }, badge: 'Bestseller',
    soldOut: ['Oat:S', 'Navy:2XL'],
    blurb: 'A ribbed half-zip with a stand collar that holds its shape. Wear it over a tee or under a coat.',
    details: ['Heavy rib knit, 70% cotton, 30% wool', 'Metal zip with a soft-touch pull', 'Dropped shoulder, ribbed cuffs and hem'] },
  { id: 'fallon-knit-polo', name: 'Fallon Knit Polo', cat: 'shirts', shape: 'polo', price: 42, fit: 'slim',
    colors: ['Onyx', 'Stone', 'Olive'], images: [], badge: 'Bestseller', soldOut: ['Onyx:XL', 'Stone:XL', 'Olive:XL', 'Olive:M'],
    blurb: 'A fine-gauge knit polo with an open, buttonless collar. Neat enough for dinner, easy enough for the weekend.',
    details: ['Fine-gauge knit, 100% cotton', 'Open johnny collar', 'Slim through the body'] },
  { id: 'meridian-knit-polo', name: 'Meridian Knit Polo', cat: 'shirts', shape: 'polo', price: 44, compareAt: 52, fit: 'regular',
    colors: ['Ecru', 'Navy', 'Chocolate'], images: [], soldOut: ['Ecru:M', 'Ecru:2XL', 'Navy:2XL', 'Chocolate:2XL'],
    blurb: 'Textured waffle knit with a three-button placket. Breathes in heat, layers in autumn.',
    details: ['Waffle knit, cotton blend', 'Three-button placket', 'Regular fit'] },
  { id: 'anchor-pique-polo', name: 'Anchor Piqué Polo', cat: 'shirts', shape: 'polo', price: 38, fit: 'regular',
    colors: ['Navy', 'Ecru', 'Sage'], images: [], soldOut: [],
    blurb: 'A classic piqué polo, cut a little shorter so it sits right untucked.',
    details: ['Cotton piqué', 'Ribbed collar and cuffs', 'Side vents at the hem'] },
  { id: 'sable-camp-shirt', name: 'Sable Linen Camp Shirt', cat: 'shirts', shape: 'shirt', price: 46, fit: 'relaxed',
    colors: ['Sand', 'Ecru', 'Onyx'], images: [], badge: 'New', soldOut: ['Sand:S'],
    blurb: 'Washed linen with a flat camp collar and a boxy, relaxed drape.',
    details: ['100% washed linen', 'Camp collar, coconut buttons', 'Relaxed, boxy fit'] },
  { id: 'brixton-overshirt', name: 'Brixton Overshirt', cat: 'shirts', shape: 'jacket', price: 58, fit: 'relaxed',
    colors: ['Olive', 'Charcoal', 'Camel'], images: [], soldOut: ['Camel:L', 'Camel:XL'],
    blurb: 'Brushed twill with two chest pockets. A shirt that works as a light jacket.',
    details: ['Brushed cotton twill', 'Two flap chest pockets', 'Relaxed fit, layers over knitwear'] },
  { id: 'ardent-merino-crew', name: 'Ardent Merino Crew', cat: 'knitwear', shape: 'knit', price: 56, fit: 'slim',
    colors: ['Charcoal', 'Oat', 'Olive'], images: [], soldOut: ['Charcoal:M'],
    blurb: 'Lightweight merino in a clean crew neck. Warm without the bulk.',
    details: ['Extra-fine merino wool', 'Fully fashioned shoulders', 'Slim fit'] },
  { id: 'calder-pleated-trouser', name: 'Calder Pleated Trouser', cat: 'trousers', shape: 'trouser', price: 62, fit: 'relaxed',
    colors: ['Onyx', 'Stone', 'Chocolate'], images: [], badge: 'Bestseller', soldOut: ['Onyx:M', 'Stone:M', 'Chocolate:M', 'Stone:2XL'],
    blurb: 'A double-pleated trouser with a wide, straight leg. It drapes, it doesn’t cling.',
    details: ['Wool-feel twill with stretch', 'Double forward pleats', 'Wide straight leg'] },
  { id: 'weston-cord-trouser', name: 'Weston Corduroy Trouser', cat: 'trousers', shape: 'trouser', price: 54, compareAt: 64, fit: 'regular',
    colors: ['Camel', 'Chocolate', 'Sage'], images: [], soldOut: ['Sage:S', 'Sage:M'],
    blurb: 'Mid-wale corduroy in a straight cut. Softens and fades well over time.',
    details: ['Mid-wale cotton corduroy', 'Straight leg', 'Button fly'] },
  { id: 'drift-linen-trouser', name: 'Drift Linen Drawstring Trouser', cat: 'trousers', shape: 'trouser', price: 48, fit: 'relaxed',
    colors: ['Ecru', 'Sand', 'Navy'], images: [], soldOut: [],
    blurb: 'Washed linen with a hidden drawstring. The trouser you live in all summer.',
    details: ['100% washed linen', 'Elastic back, internal drawstring', 'Relaxed tapered leg'] },
  { id: 'york-quilted-puffer', name: 'York Quilted Puffer', cat: 'outerwear', shape: 'jacket', price: 98, compareAt: 120, fit: 'regular',
    colors: ['Onyx', 'Navy', 'Olive'], images: [], badge: 'Bestseller', soldOut: ['Olive:S', 'Navy:L'],
    blurb: 'A light, channel-quilted puffer with a stand collar. Packs into its own pocket.',
    details: ['Recycled nylon shell', 'Synthetic down fill', 'Two-way zip, stand collar'] },
  { id: 'hale-chore-jacket', name: 'Hale Chore Jacket', cat: 'outerwear', shape: 'jacket', price: 84, fit: 'relaxed',
    colors: ['Charcoal', 'Camel', 'Navy'], images: [], badge: 'New', soldOut: ['Charcoal:L', 'Camel:L', 'Navy:L', 'Camel:2XL'],
    blurb: 'A heavy canvas chore coat with three patch pockets. Gets better every time you wear it.',
    details: ['Heavy cotton canvas', 'Three patch pockets', 'Corozo buttons'] }
];
