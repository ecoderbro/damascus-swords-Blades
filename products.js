/* ==========================================================
   FLOW CREATIVE — product catalogue & store settings
   Edit prices, descriptions and the WhatsApp number HERE only.
   Prices below are PLACEHOLDERS — replace them with your real ones.
   ========================================================== */

window.FC_SETTINGS = {
  currency: 'PKR',
  whatsapp: '923006169492',            // international format, no + or spaces
  email: 'devflowcreative@gmail.com',  // fallback for email orders
  storeName: 'FLOW CREATIVE'
};

/* buyable:false  ->  shows "Ask About This Piece" instead of cart buttons */
window.FC_PRODUCTS = [
  {
    id: 'aster-chef-01',
    name: 'Aster Chef 01',
    type: 'Chef Knife',
    price: 18500,
    image: 'https://images.pexels.com/photos/16457092/pexels-photo-16457092.jpeg?cs=srgb&dl=pexels-sternsteiger-stahlwaren-526336403-16457092.jpg&fm=jpg',
    steel: 'Layered Damascus / high-carbon core',
    handle: 'Walnut',
    short: 'Balanced culinary profile with a flowing Damascus surface.',
    details: 'An everyday chef knife built around balance. The layered Damascus surface gives each blade its own flowing pattern, so no two are identical. The walnut handle shows natural grain and is finished by hand.',
    care: 'Hand-wash and dry straight away. Never put it in a dishwasher. A light wipe of food-safe oil keeps high-carbon steel in good condition.',
    buyable: true
  },
  {
    id: 'noir-santoku-02',
    name: 'Noir Santoku 02',
    type: 'Santoku Knife',
    price: 16500,
    image: 'https://images.pexels.com/photos/16457332/pexels-photo-16457332.jpeg?cs=srgb&dl=pexels-sternsteiger-stahlwaren-526336403-16457332.jpg&fm=jpg',
    steel: 'Pattern-welded Damascus',
    handle: 'Dark hardwood',
    short: 'Compact silhouette with a bold, organic blade pattern.',
    details: 'A compact santoku with a bold, organic pattern across the blade. The dark hardwood handle contrasts with the lighter steel layers.',
    care: 'Hand-wash and dry straight away. Store in a sheath or on a magnetic strip, away from other metal.',
    buyable: true
  },
  {
    id: 'ember-utility-03',
    name: 'Ember Utility 03',
    type: 'Utility Knife',
    price: 9500,
    image: 'https://images.pexels.com/photos/11973857/pexels-photo-11973857.jpeg?cs=srgb&dl=pexels-adaptphotos-11973857.jpg&fm=jpg',
    steel: 'Damascus steel',
    handle: 'Walnut + brass',
    short: 'A refined utility form with leather-accented presentation.',
    details: 'A smaller, refined utility knife for everyday prep. Brass fittings add a warm accent to the walnut handle.',
    care: 'Hand-wash and dry straight away. Brass will darken naturally over time; polish it if you prefer it bright.',
    buyable: true
  },
  {
    id: 'obsidian-detail-04',
    name: 'Obsidian Detail 04',
    type: 'Specialty Knife',
    price: 12500,
    image: 'https://images.pexels.com/photos/20392665/pexels-photo-20392665.jpeg?cs=srgb&dl=pexels-yevhen-khokhlov-1040795937-20392665.jpg&fm=jpg',
    steel: 'Damascus blade',
    handle: 'Composite handle',
    short: 'Studio-style presentation focused on pattern and contrast.',
    details: 'A specialty knife that puts pattern and contrast first. The composite handle gives a consistent texture and is easy to live with.',
    care: 'Hand-wash and dry straight away. Avoid soaking, and keep away from acidic foods left on the blade.',
    buyable: true
  },
  {
    id: 'the-aurelius',
    name: 'The Aurelius',
    type: 'Historical-Inspired Piece',
    price: 65000,
    image: 'https://images.pexels.com/photos/37403766/pexels-photo-37403766.jpeg?cs=srgb&dl=pexels-troopper84-37403766.jpg&fm=jpg',
    steel: 'Patterned steel',
    handle: 'Textured wrap + bronze tone',
    short: 'Ornamental sword study with engraved surfaces and warm metal fittings.',
    details: 'A decorative, historical-inspired sword with engraved surfaces and warm bronze-toned fittings. Sold as a display and collector piece.',
    care: 'Handle with clean, dry hands. Wipe with a soft cloth and a thin coat of oil, and store or display away from damp.',
    buyable: true
  },
  {
    id: 'the-old-guard',
    name: 'The Old Guard',
    type: 'Collector Piece',
    price: 48000,
    image: 'https://images.pexels.com/photos/9598149/pexels-photo-9598149.jpeg?cs=srgb&dl=pexels-introspectivedsgn-9598149.jpg&fm=jpg',
    steel: 'Decorative steel',
    handle: 'Wrapped grip',
    short: 'A display-focused object photographed as a museum-style artifact.',
    details: 'A collector piece styled like a museum artifact, with a wrapped grip and decorative steel. Made to be displayed.',
    care: 'Wipe with a soft cloth and a thin coat of oil. Display away from damp and direct sun.',
    buyable: true
  },
  {
    id: 'the-relic',
    name: 'The Relic',
    type: 'Display Piece',
    price: 38000,
    image: 'https://images.pexels.com/photos/8461243/pexels-photo-8461243.jpeg?cs=srgb&dl=pexels-hebert-santos-1264721-8461243.jpg&fm=jpg',
    steel: 'Steel / aged finish',
    handle: 'Wood + leather',
    short: 'Weathered visual language inspired by antique blades and heirloom objects.',
    details: 'A display piece with a deliberately weathered, antique look. Wood and leather give the handle an heirloom feel.',
    care: 'Wipe with a soft cloth only. Keep the leather dry and out of direct sun.',
    buyable: true
  },
  {
    id: 'forge-study',
    name: 'Forge Study',
    type: 'Craft Process',
    price: 0,
    image: 'https://images.pexels.com/photos/9593585/pexels-photo-9593585.jpeg?cs=srgb&dl=pexels-marko-garic-37075526-9593585.jpg&fm=jpg',
    steel: 'Forged steel context',
    handle: 'Workshop materials',
    short: 'A blacksmith workshop image used to frame the human labor behind blade craft.',
    details: 'This is a workshop study that shows the human work behind blade making. It is not a piece for sale, but you can ask about commissions.',
    care: '',
    buyable: false
  }
];
