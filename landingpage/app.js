const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const statusFlow = [
  "Pending",
  "Processing",
  "Ready for Pickup",
  "Delivered",
  "Completed",
  "Cancelled",
];

const allowedStatusTransitions = {
  Pending: ["Processing", "Cancelled"],
  Processing: ["Ready for Pickup", "Delivered", "Cancelled"],
  "Ready for Pickup": ["Completed", "Cancelled"],
  Delivered: ["Completed", "Cancelled"],
  Completed: [],
  Cancelled: [],
};
let checkoutInProgress = false;

function safeParse(value, fallback = null) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function makeId(prefix) {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function playAdminNotificationSound() {
  if (!appSettings.notifications || currentSession?.role !== "admin") return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(660, context.currentTime + 0.18);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.28);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.3);
    oscillator.addEventListener("ended", () => context.close());
  } catch {
    // Browsers may block sound until the admin has interacted with the page.
  }
}

const categorySearchTags = {
  Bread: "bread roti roti manis roti tawar bun loaf garlic",
  Pastry: "pastry croissant danish cinnamon roll",
  Donuts: "donuts donut donat",
  "Cakes & Desserts": "cakes desserts cake kue dessert cheesecake tart brownies panna cotta",
  Cookies: "cookies cookie kue kering biskuit",
  Coffee: "coffee kopi espresso americano cappuccino latte mocha",
  "Non-Coffee": "non coffee non-coffee tanpa kopi minuman teh tea matcha milk chocolate",
  Refreshments: "refreshments minuman segar soda sparkling yakult",
  "Baker's Box": "baker box baker's box paket hampers custom family signature",
};

const products = [
  {
    id: "strawberry-cloud-milk",
    name: "Strawberry Cloud Milk",
    category: "Non-Coffee",
    price: 18000,
    stock: 18,
    description: "Susu strawberry creamy yang lembut.",
    image: "https://i.pinimg.com/736x/90/3e/a6/903ea69c75d9c2874fb5f1386586f2db.jpg",
  },
  {
    id: "butter-croissant",
    name: "Butter Croissant",
    category: "Pastry",
    price: 22000,
    stock: 12,
    description: "Croissant renyah dengan aroma butter.",
    image: "https://i.pinimg.com/1200x/56/22/39/562239e127eaa2f88054c6b2d39ee0df.jpg",
  },
  {
    id: "chocolate-donut",
    name: "Chocolate Donut",
    category: "Donuts",
    price: 12000,
    stock: 12,
    description: "Donat lembut dengan topping cokelat.",
    image: "https://i.pinimg.com/736x/44/4a/2f/444a2fe12637fb7ddf94a9d168bb5f60.jpg",
  },
  {
    id: "golden-milk-bread",
    name: "Golden Milk Bread",
    category: "Bread",
    price: 15000,
    stock: 18,
    description: "Roti susu lembut favorit pelanggan.",
    image: "https://i.pinimg.com/1200x/2a/be/5e/2abe5edfccd90d63f6e55d9ea7f0e11f.jpg",
  },
  {
    id: "tiramisu",
    name: "Tiramisu",
    category: "Cakes & Desserts",
    price: 34000,
    stock: 12,
    description: "Dessert creamy dengan rasa kopi.",
    image: "https://i.pinimg.com/736x/3c/c9/66/3cc9664134ea11ae6d470d4fad8a182c.jpg",
  },
  {
    id: "americano",
    name: "Americano",
    category: "Coffee",
    price: 18000,
    stock: 12,
    description: "Kopi hitam ringan dan menyegarkan.",
    image: "https://i.pinimg.com/736x/42/dc/61/42dc61aa66899a5ef2cf4cf145ef9f40.jpg",
  },
  {
    id: "classic-bakers-box",
    name: "Classic Baker's Box",
    category: "Baker's Box",
    price: 68000,
    stock: 12,
    description: "Paket roti untuk sarapan hangat.",
    image: "https://i.pinimg.com/1200x/2d/77/79/2d777957670fd2830148f096f4847b68.jpg",
  },
  {
    id: "matcha-donut",
    name: "Matcha Donut",
    category: "Donuts",
    price: 12000,
    stock: 12,
    description: "Donat manis dengan topping matcha.",
    image: "https://i.pinimg.com/736x/2e/6e/93/2e6e9333319ae5dbb7de1bdceaac64f7.jpg",
  },
  {
    id: "cream-cheese-garlic-bread",
    name: "Cream Cheese Garlic Bread",
    category: "Bread",
    price: 15000,
    stock: 12,
    description: "Roti gurih dengan cream cheese.",
    image: "https://i.pinimg.com/1200x/f0/b7/40/f0b740a774b8e2b1c1b8d0f27dd589cc.jpg",
  },
  {
    id: "caramel-latte",
    name: "Caramel Latte",
    category: "Coffee",
    price: 18000,
    stock: 12,
    description: "Latte creamy dengan caramel manis.",
    image: "https://i.pinimg.com/1200x/94/38/65/943865d41a8675c959ddf82aef1667ec.jpg",
  },
  {
    id: "berry-danish",
    name: "Berry Danish",
    category: "Pastry",
    price: 22000,
    stock: 12,
    description: "Pastry renyah dengan rasa berry.",
    image: "https://i.pinimg.com/1200x/ae/84/75/ae84753a015ae60903134af0ee7941aa.jpg",
  },
  {
    id: "red-velvet-cake",
    name: "Red Velvet Cake",
    category: "Cakes & Desserts",
    price: 34000,
    stock: 12,
    description: "Cake lembut dengan cream manis.",
    image: "https://i.pinimg.com/736x/d4/6a/6e/d46a6e81f744cdb54202e2cc3465c9c3.jpg",
  },
  {
    id: "vanilla-latte",
    name: "Vanilla Latte",
    category: "Coffee",
    price: 18000,
    stock: 12,
    description: "Latte creamy dengan aroma vanilla.",
    image: "https://i.pinimg.com/736x/1b/c6/07/1bc607f2466a5c9f062b0d5b8a436fb8.jpg",
  },
  {
    id: "chocolate-cake",
    name: "Chocolate Cake",
    category: "Cakes & Desserts",
    price: 34000,
    stock: 12,
    description: "Cake cokelat lembut dan manis.",
    image: "https://i.pinimg.com/1200x/fa/ba/df/fabadf995bd65e8010b385456e9cd859.jpg",
  },
  {
    id: "honey-glazed-donut",
    name: "Honey Glazed Donut",
    category: "Donuts",
    price: 12000,
    stock: 18,
    description: "Donat lembut dengan glaze madu.",
    image: "https://i.pinimg.com/1200x/c8/c6/17/c8c617f5e26bb6a77a6e323c6c7d9bb0.jpg",
  },
  {
    id: "tuna-mayo-bread",
    name: "Tuna Mayo Bread",
    category: "Bread",
    price: 15000,
    stock: 12,
    description: "Roti gurih isi tuna mayo.",
    image: "https://i.pinimg.com/736x/c4/b1/4e/c4b14e0be58dfa19e18f91358b5d7c51.jpg",
  },
  {
    id: "peach-tea",
    name: "Peach Tea",
    category: "Non-Coffee",
    price: 18000,
    stock: 12,
    description: "Teh peach segar dan fruity.",
    image: "https://i.pinimg.com/736x/18/ec/8d/18ec8db92a6dc4f5c801541e959f3d0d.jpg",
  },
  {
    id: "almond-croissant",
    name: "Almond Croissant",
    category: "Pastry",
    price: 22000,
    stock: 12,
    description: "Croissant butter dengan almond.",
    image: "https://i.pinimg.com/736x/86/a1/d6/86a1d68e21ed48b69e856c0985f76345.jpg",
  },
  {
    id: "matcha-cookies",
    name: "Matcha Cookies",
    category: "Cookies",
    price: 18000,
    stock: 12,
    description: "Cookies renyah rasa matcha.",
    image: "https://i.pinimg.com/1200x/ff/5b/40/ff5b407faff74f628c146d87ceacd45d.jpg",
  },
  {
    id: "honey-matcha-latte",
    name: "Honey Matcha Latte",
    category: "Non-Coffee",
    price: 18000,
    stock: 18,
    description: "Matcha creamy dengan madu.",
    image: "https://i.pinimg.com/736x/77/4e/cc/774ecc5585ef60d252fe095f930b0958.jpg",
  },
  {
    id: "pain-au-chocolat",
    name: "Pain au Chocolat",
    category: "Pastry",
    price: 22000,
    stock: 12,
    description: "Pastry klasik isi cokelat.",
    image: "https://i.pinimg.com/1200x/28/e8/4f/28e84f749ceb5e75b761e8d39ecd2798.jpg",
  },
  {
    id: "sea-salt-cookies",
    name: "Sea Salt Cookies",
    category: "Cookies",
    price: 18000,
    stock: 18,
    description: "Cookies manis dengan sentuhan asin.",
    image: "https://i.pinimg.com/1200x/12/f5/ef/12f5ef86bdcaa38671c1b94f0f4ef415.jpg",
  },
  {
    id: "serenyt-latte",
    name: "Serenyt Latte",
    category: "Coffee",
    price: 18000,
    stock: 18,
    description: "Signature latte khas Serenyt.",
    image: "https://i.pinimg.com/1200x/43/fb/37/43fb376f34e68e7c2aec44e0e10c5d69.jpg",
  },
  {
    id: "strawberry-shortcake",
    name: "Strawberry Shortcake",
    category: "Cakes & Desserts",
    price: 34000,
    stock: 12,
    description: "Cake strawberry lembut dan segar.",
    image: "https://i.pinimg.com/736x/27/9a/d4/279ad41838d430abb111693286aa07ec.jpg",
  },
  {
    id: "butter-cookies",
    name: "Butter Cookies",
    category: "Cookies",
    price: 18000,
    stock: 12,
    description: "Cookies butter dengan rasa klasik.",
    image: "https://i.pinimg.com/736x/42/f0/f1/42f0f12a9ed16180f2dfc6d981ad5ae3.jpg",
  },
  {
    id: "blue-ocean",
    name: "Blue Ocean",
    category: "Refreshments",
    price: 17000,
    stock: 12,
    description: "Minuman segar dengan rasa tropis.",
    image: "https://i.pinimg.com/736x/d5/8a/d8/d58ad887c192387f57ae5959719abc5e.jpg",
  },
  {
    id: "butter-cloud-bread",
    name: "Butter Cloud Bread",
    category: "Bread",
    price: 15000,
    stock: 18,
    description: "Roti lembut dengan rasa butter.",
    image: "https://i.pinimg.com/1200x/cb/da/95/cbda95c8e29e98e3ff81ef3fd6f9e6f0.jpg",
  },
  {
    id: "cinnamon-roll",
    name: "Cinnamon Roll",
    category: "Pastry",
    price: 22000,
    stock: 12,
    description: "Roll manis dengan aroma kayu manis.",
    image: "https://i.pinimg.com/1200x/a0/ac/97/a0ac97b501f07ace8db6366ebfb9be83.jpg",
  },
  {
    id: "thai-tea",
    name: "Thai Tea",
    category: "Non-Coffee",
    price: 18000,
    stock: 12,
    description: "Teh susu creamy khas Thailand.",
    image: "https://i.pinimg.com/1200x/6a/b7/cb/6ab7cb015130463f12f817a6a90b741a.jpg",
  },
  {
    id: "chocolate-chip-cookies",
    name: "Chocolate Chip Cookies",
    category: "Cookies",
    price: 18000,
    stock: 12,
    description: "Cookies renyah dengan cokelat.",
    image: "https://i.pinimg.com/736x/f8/b3/25/f8b325430ba7a80258119770bc81fbe8.jpg",
  },
  {
    id: "family-bakers-box",
    name: "Family Baker's Box",
    category: "Baker's Box",
    price: 128000,
    stock: 12,
    description: "Paket besar untuk berbagi bersama.",
    image: "https://i.pinimg.com/1200x/6c/6f/c2/6c6fc252fe7984c3cc74e797886e4850.jpg",
  },
  {
    id: "lemon-sparkling",
    name: "Lemon Sparkling",
    category: "Refreshments",
    price: 17000,
    stock: 12,
    description: "Minuman lemon soda yang segar.",
    image: "https://i.pinimg.com/736x/92/e3/c9/92e3c98ad5daf2200b9ab4a377ae90b7.jpg",
  },
  {
    id: "japanese-cheesecake",
    name: "Japanese Cheesecake",
    category: "Cakes & Desserts",
    price: 34000,
    stock: 12,
    description: "Cheesecake ringan dan lembut.",
    image: "https://i.pinimg.com/1200x/64/b0/79/64b07982eddcebdcfd7c044691c7f700.jpg",
  },
  {
    id: "garlic-bread",
    name: "Garlic Bread",
    category: "Bread",
    price: 15000,
    stock: 12,
    description: "Roti gurih dengan aroma garlic.",
    image: "https://i.pinimg.com/1200x/ed/9e/b3/ed9eb36cdddf281e44c8441c18d5d07b.jpg",
  },
  {
    id: "caramel-cloud-latte",
    name: "Caramel Cloud Latte",
    category: "Coffee",
    price: 18000,
    stock: 12,
    description: "Latte creamy dengan caramel lembut.",
    image: "https://i.pinimg.com/1200x/9b/40/9a/9b409a56b7445fca2cef2c8fd8d7db2e.jpg",
  },
  {
    id: "custom-bakers-box",
    name: "Custom Baker's Box",
    category: "Baker's Box",
    price: 72000,
    stock: 12,
    description: "Paket sesuai pilihan favoritmu.",
    image: "https://i.pinimg.com/736x/ad/c2/ed/adc2edd4df873d006cf187b37a2cc103.jpg",
  },
  {
    id: "double-chocolate-cookies",
    name: "Double Chocolate Cookies",
    category: "Cookies",
    price: 18000,
    stock: 12,
    description: "Cookies cokelat dengan rasa bold.",
    image: "https://i.pinimg.com/1200x/ac/56/b3/ac56b344e6fc67be118efc4f039e385b.jpg",
  },
  {
    id: "vanilla-milk",
    name: "Vanilla Milk",
    category: "Non-Coffee",
    price: 18000,
    stock: 12,
    description: "Susu vanilla creamy dan lembut.",
    image: "https://i.pinimg.com/736x/5d/8b/67/5d8b6707b55198d8dd37fbfe033009ef.jpg",
  },
  {
    id: "chicken-floss-bread",
    name: "Chicken Floss Bread",
    category: "Bread",
    price: 15000,
    stock: 12,
    description: "Roti lembut dengan topping abon.",
    image: "https://i.pinimg.com/1200x/10/c9/ac/10c9acd3011be7e0759441f7698ce8f8.jpg",
  },
  {
    id: "mocha",
    name: "Mocha",
    category: "Coffee",
    price: 18000,
    stock: 12,
    description: "Kopi creamy dengan rasa cokelat.",
    image: "https://i.pinimg.com/1200x/dd/c8/fc/ddc8fc1293df9f8830d042a113cd2645.jpg",
  },
  {
    id: "burnt-cheesecake",
    name: "Burnt Cheesecake",
    category: "Cakes & Desserts",
    price: 34000,
    stock: 12,
    description: "Cheesecake lembut dengan rasa rich.",
    image: "https://i.pinimg.com/736x/93/f7/6e/93f76e8fbb5932aae2622b035c1ae0d7.jpg",
  },
  {
    id: "strawberry-donut",
    name: "Strawberry Donut",
    category: "Donuts",
    price: 12000,
    stock: 12,
    description: "Donat manis dengan strawberry.",
    image: "https://i.pinimg.com/736x/e8/5c/f6/e85cf60ce9f801c9fae30ab7be308284.jpg",
  },
  {
    id: "honey-butter-cookies",
    name: "Honey Butter Cookies",
    category: "Cookies",
    price: 18000,
    stock: 12,
    description: "Cookies butter dengan madu.",
    image: "https://i.pinimg.com/1200x/4d/5a/42/4d5a4201e295c5e1f692b3812c4bee00.jpg",
  },
  {
    id: "mango-yakult",
    name: "Mango Yakult",
    category: "Refreshments",
    price: 17000,
    stock: 12,
    description: "Minuman mangga segar dan fruity.",
    image: "https://i.pinimg.com/736x/3d/67/90/3d67903e3a5f0989f1567e5481f53391.jpg",
  },
  {
    id: "signature-bakers-box",
    name: "Signature Baker's Box",
    category: "Baker's Box",
    price: 92000,
    stock: 10,
    description: "Paket signature pilihan Serenyt.",
    image: "https://i.pinimg.com/1200x/59/37/8b/59378ba401f766afc9e95624adf9de4a.jpg",
  },
  {
    id: "chocolate",
    name: "Chocolate",
    category: "Non-Coffee",
    price: 18000,
    stock: 12,
    description: "Minuman cokelat creamy.",
    image: "https://i.pinimg.com/736x/03/89/6b/03896bfdd6aae501967a378097dcc135.jpg",
  },
  {
    id: "maple-cinnamon-roll",
    name: "Maple Cinnamon Roll",
    category: "Bread",
    price: 15000,
    stock: 18,
    description: "Roti manis dengan maple.",
    image: "https://i.pinimg.com/1200x/e9/ef/91/e9ef91dd697a367a63ff0deeee574ee6.jpg",
  },
  {
    id: "cookies-and-cream-donut",
    name: "Cookies & Cream Donut",
    category: "Donuts",
    price: 12000,
    stock: 12,
    description: "Donat lembut topping cookies.",
    image: "https://i.pinimg.com/736x/69/c4/2c/69c42c64b571eac4a7af1f4f3a73c852.jpg",
  },
  {
    id: "lemon-tea",
    name: "Lemon Tea",
    category: "Non-Coffee",
    price: 18000,
    stock: 12,
    description: "Teh lemon segar dan ringan.",
    image: "https://i.pinimg.com/736x/64/bb/bc/64bbbc45a302b646abee022c00ca0c41.jpg",
  },
  {
    id: "almond-cookies",
    name: "Almond Cookies",
    category: "Cookies",
    price: 18000,
    stock: 12,
    description: "Cookies renyah dengan almond.",
    image: "https://i.pinimg.com/1200x/94/6b/75/946b75d5e54e65875b818838617895aa.jpg",
  },
  {
    id: "milk-bread",
    name: "Milk Bread",
    category: "Bread",
    price: 15000,
    stock: 12,
    description: "Roti susu lembut favorit harian.",
    image: "https://i.pinimg.com/1200x/e7/3e/38/e73e381e48e5035109089ab7627c6fb6.jpg",
  },
  {
    id: "butter-bun",
    name: "Butter Bun",
    category: "Bread",
    price: 15000,
    stock: 12,
    description: "Roti lembut dengan rasa butter.",
    image: "https://i.pinimg.com/1200x/97/6f/ae/976fae856fd4d2a868e9b25bc3fdd01d.jpg",
  },
  {
    id: "cheese-bun",
    name: "Cheese Bun",
    category: "Bread",
    price: 15000,
    stock: 12,
    description: "Roti gurih dengan keju creamy.",
    image: "https://i.pinimg.com/1200x/e4/32/d5/e432d5295f865372866cde9f66746859.jpg",
  },
  {
    id: "chocolate-bun",
    name: "Chocolate Bun",
    category: "Bread",
    price: 15000,
    stock: 12,
    description: "Roti manis dengan isian cokelat.",
    image: "https://i.pinimg.com/736x/60/76/b5/6076b5267eb725c827d919c3dfa56519.jpg",
  },
  {
    id: "sausage-bun",
    name: "Sausage Bun",
    category: "Bread",
    price: 15000,
    stock: 12,
    description: "Roti gurih dengan sosis.",
    image: "https://i.pinimg.com/1200x/30/3b/4e/303b4e7c301c0c9ccdb2f2d7be4fb8e0.jpg",
  },
  {
    id: "glazed-donut",
    name: "Glazed Donut",
    category: "Donuts",
    price: 12000,
    stock: 12,
    description: "Donat lembut dengan glaze manis.",
    image: "https://i.pinimg.com/736x/68/16/a1/6816a126c898b8b157fac887b8520af6.jpg",
  },
  {
    id: "biscoff-donut",
    name: "Biscoff Donut",
    category: "Donuts",
    price: 12000,
    stock: 12,
    description: "Donat dengan topping biscoff.",
    image: "https://i.pinimg.com/736x/c3/3b/c0/c33bc025f8c4af53233447eea9c6fde3.jpg",
  },
  {
    id: "latte",
    name: "Latte",
    category: "Coffee",
    price: 18000,
    stock: 12,
    description: "Kopi susu creamy klasik.",
    image: "https://i.pinimg.com/736x/16/a9/3d/16a93d9777c89238a65861cf3ad797dd.jpg",
  },
  {
    id: "espresso",
    name: "Espresso",
    category: "Coffee",
    price: 18000,
    stock: 12,
    description: "Kopi pekat dengan aroma kuat.",
    image: "https://i.pinimg.com/1200x/9f/d4/41/9fd441d4bafd82c93f0c241860c9f86b.jpg",
  },
  {
    id: "matcha-latte",
    name: "Matcha Latte",
    category: "Non-Coffee",
    price: 18000,
    stock: 12,
    description: "Matcha creamy dengan rasa lembut.",
    image: "https://i.pinimg.com/1200x/45/9a/fb/459afbc3f9000c8001ab06e67549b924.jpg",
  },
  {
    id: "lychee-tea",
    name: "Lychee Tea",
    category: "Non-Coffee",
    price: 18000,
    stock: 12,
    description: "Teh lychee segar dan fruity.",
    image: "https://i.pinimg.com/736x/29/0c/64/290c64b4365714357b63e5319226def7.jpg",
  },
  {
    id: "berry-breeze-soda",
    name: "Berry Breeze Soda",
    category: "Refreshments",
    price: 17000,
    stock: 12,
    description: "Soda berry yang menyegarkan.",
    image: "https://i.pinimg.com/1200x/8f/99/17/8f9917e1123fc258eb128ee62fdf1de6.jpg",
  },
];

let selectedCategory = "Semua";
let searchTerm = "";
let sortMode = "featured";
let cart = [];
let buyers = [];
let currentSession = null;
let wishlist = [];
let customProducts = [];
let notifications = [];
let adminOrderFilter = "Semua";
let adminOrderSearch = "";
let adminOrderDate = "";
let adminPaymentFilter = "Semua";
let adminOrderSort = "newest";
let adminProductSearch = "";
let adminProductCategoryFilter = "Semua";
let adminProductSort = "name";
let adminProductPage = 1;
const adminProductPageSize = 9;
let appSettings = {
  darkMode: false,
  notifications: true,
  language: "id",
};
let orders = [
  {
    id: "TR-260703-001",
    customer: "nana",
    phone: "081288889999",
    fulfillment: "Ambil di toko",
    payment: "Bayar di toko",
    note: "Ambil pukul 16.00",
    status: "Processing",
    total: 56000,
    items: [
      { name: "Butter Croissant", quantity: 2, price: 18000 },
      { name: "Kopi Susu Rotii", quantity: 1, price: 16000 },
    ],
  },
];

const storageKeys = {
  orders: "serenytOrders",
  productStocks: "serenytProductStocks",
  adminLoggedIn: "serenytAdminLoggedIn",
  buyers: "serenytBuyers",
  currentSession: "serenytCurrentSession",
  sessionMode: "serenytSessionMode",
  storeHours: "serenytStoreHours",
  wishlist: "serenytWishlist",
  settings: "serenytSettings",
  customProducts: "serenytCustomProducts",
  users: "serenytUsers",
  notifications: "serenytNotifications",
};

let storeHours = {
  open: "07:00",
  close: "21:00",
};

const demoBuyer = {
  id: "buyer-demo",
  name: "Nana",
  email: "nana@serenyt.test",
  phone: "081288889999",
  address: "Jl. Bakery Manis No. 7",
  password: "nana123",
  photo: "logo.png",
  photoHistory: [],
};

const authScreen = document.querySelector("#authScreen");
const appShell = document.querySelector("#appShell");
const authTabs = document.querySelectorAll("[data-auth-tab]");
const authPanels = document.querySelectorAll("[data-auth-panel]");
const adminTabs = document.querySelectorAll(".admin-tab[data-admin-page]");
const adminPages = document.querySelectorAll(".admin-page");
const buyerLoginForm = document.querySelector("#buyerLoginForm");
const buyerRegisterForm = document.querySelector("#buyerRegisterForm");
const mainAdminLoginForm = document.querySelector("#mainAdminLoginForm");
const demoBuyerLogin = document.querySelector("#demoBuyerLogin");
const logoutSession = document.querySelector("#logoutSession");
const roleLabel = document.querySelector("#roleLabel");
const topEyebrow = document.querySelector("#topEyebrow");
const pageTitle = document.querySelector("#pageTitle");
const pageSubtitle = document.querySelector("#pageSubtitle");
const productGrid = document.querySelector("#productGrid");
const productSummary = document.querySelector("#productSummary");
const categoryTabs = document.querySelector("#categoryTabs");
const cartCount = document.querySelector("#cartCount");
const cartItems = document.querySelector("#cartItems");
const cartTotal = document.querySelector("#cartTotal");
const cartDialog = document.querySelector("#cartDialog");
const ordersList = document.querySelector("#ordersList");
const adminOrders = document.querySelector("#adminOrders");
const adminProducts = document.querySelector("#adminProducts");
const adminStats = document.querySelector("#adminStats");
const toast = document.querySelector("#toast");
const loginView = document.querySelector("#loginView");
const adminPanel = document.querySelector("#adminPanel");
const adminLoginForm = document.querySelector("#adminLoginForm");
const logoutAdmin = document.querySelector("#logoutAdmin");
const profileForm = document.querySelector("#profileForm");
const checkoutName = document.querySelector("#checkoutName");
const checkoutPhone = document.querySelector("#checkoutPhone");
const storeOpenLabel = document.querySelector("#storeOpenLabel");
const storeHoursLabel = document.querySelector("#storeHoursLabel");
const storeHoursForm = document.querySelector("#storeHoursForm");
const storeOpenTime = document.querySelector("#storeOpenTime");
const storeCloseTime = document.querySelector("#storeCloseTime");
const profileShortcut = document.querySelector("#profileShortcut");
const sidebarProfilePhoto = document.querySelector("#sidebarProfilePhoto");
const sidebarProfileName = document.querySelector("#sidebarProfileName");
const profilePhotoPreview = document.querySelector("#profilePhotoPreview");
const profilePhotoInput = document.querySelector("#profilePhotoInput");
const photoHistory = document.querySelector("#photoHistory");
const wishlistGrid = document.querySelector("#wishlistGrid");
const sortProducts = document.querySelector("#sortProducts");
const checkoutSummary = document.querySelector("#checkoutSummary");
const wishlistCount = document.querySelector("#wishlistCount");
const customerNotificationCount = document.querySelector("#customerNotificationCount");
const customerHeaderNotificationCount = document.querySelector("#customerHeaderNotificationCount");
const adminNotificationCount = document.querySelector("#adminNotificationCount");
const customerNotifications = document.querySelector("#customerNotifications");
const adminNotifications = document.querySelector("#adminNotifications");
const customerHeaderName = document.querySelector("#customerHeaderName");
const customerHeaderPhoto = document.querySelector("#customerHeaderPhoto");
const forgotPasswordDialog = document.querySelector("#forgotPasswordDialog");
const productDetailDialog = document.querySelector("#productDetailDialog");
const productDetailContent = document.querySelector("#productDetailContent");
const logoutDialog = document.querySelector("#logoutDialog");
const deleteProductDialog = document.querySelector("#deleteProductDialog");
const deleteProductName = document.querySelector("#deleteProductName");
const adminCustomers = document.querySelector("#adminCustomers");
const adminReports = document.querySelector("#adminReports");
const adminCategories = document.querySelector("#adminCategories");
const adminInventory = document.querySelector("#adminInventory");
const adminPromotions = document.querySelector("#adminPromotions");
const adminReviews = document.querySelector("#adminReviews");
const recentActivity = document.querySelector("#recentActivity");
const addProductForm = document.querySelector("#addProductForm");
const newProductCategory = document.querySelector("#newProductCategory");
const darkModeToggle = document.querySelector("#darkModeToggle");
const notificationToggle = document.querySelector("#notificationToggle");
const languageSelect = document.querySelector("#languageSelect");
const scrollTopButton = document.querySelector("#scrollTop");
const loadingScreen = document.querySelector("#loadingScreen");
const adminGreeting = document.querySelector("#adminGreeting");
const bestSellerList = document.querySelector("#bestSellerList");
const latestOrders = document.querySelector("#latestOrders");
const lowStockList = document.querySelector("#lowStockList");
const productPageInfo = document.querySelector("#productPageInfo");
const adminProductCategoryFilterElement = document.querySelector("#adminProductCategoryFilter");
const confirmActionDialog = document.querySelector("#confirmActionDialog");
const confirmActionTitle = document.querySelector("#confirmActionTitle");
const confirmActionMessage = document.querySelector("#confirmActionMessage");

const adminAccount = {
  id: "admin-default",
  name: "Serenyt Admin",
  email: "admin@serenytbakery.com",
  password: "Admin123",
  role: "Administrator",
};

let pendingDeleteProductId = null;
let pendingAction = null;

function loadSavedData(persistMigration = true) {
  const savedOrders = safeParse(localStorage.getItem(storageKeys.orders), null);
  const savedStocks = safeParse(localStorage.getItem(storageKeys.productStocks), null);
  const savedBuyers = safeParse(localStorage.getItem(storageKeys.buyers), null);
  const savedSession =
    safeParse(localStorage.getItem(storageKeys.currentSession), null) ||
    safeParse(sessionStorage.getItem(storageKeys.currentSession), null);
  const savedStoreHours = safeParse(localStorage.getItem(storageKeys.storeHours), null);
  const savedWishlist = safeParse(localStorage.getItem(storageKeys.wishlist), null);
  const savedSettings = safeParse(localStorage.getItem(storageKeys.settings), null);
  const savedCustomProducts = safeParse(localStorage.getItem(storageKeys.customProducts), null);
  const savedNotifications = safeParse(localStorage.getItem(storageKeys.notifications), null);

  if (Array.isArray(savedOrders)) {
    const seen = new Set();
    orders = savedOrders.filter((order) => order && typeof order.id === "string" && !seen.has(order.id) && (seen.add(order.id), true));
  }

  if (Array.isArray(savedCustomProducts)) {
    customProducts = savedCustomProducts;
    customProducts.forEach((product) => {
      if (!products.some((item) => item.id === product.id)) products.unshift(product);
    });
  }

  buyers = Array.isArray(savedBuyers) ? savedBuyers : [];
  if (!buyers.some((buyer) => buyer.email === demoBuyer.email)) {
    buyers.unshift({ ...demoBuyer });
  }
  localStorage.setItem(storageKeys.users, JSON.stringify([
    ...buyers.map((buyer) => ({ ...buyer, role: "Customer" })),
    { ...adminAccount },
  ]));
  buyers = buyers.map((buyer) => ({
    ...buyer,
    photo: buyer.photo || "logo.png",
    photoHistory: Array.isArray(buyer.photoHistory) ? buyer.photoHistory : [],
  }));
  if (persistMigration) saveBuyers();

  if (savedSession && typeof savedSession === "object") {
    currentSession = savedSession;
  } else if (localStorage.getItem(storageKeys.adminLoggedIn) === "true") {
    currentSession = { role: "admin", name: "Admin" };
  }

  if (savedStocks && typeof savedStocks === "object") {
    products.forEach((product) => {
      if (Number.isFinite(savedStocks[product.id])) {
        product.stock = savedStocks[product.id];
      }
    });
  }

  if (savedStoreHours?.open && savedStoreHours?.close) {
    storeHours = savedStoreHours;
  }

  wishlist = Array.isArray(savedWishlist) ? savedWishlist : [];
  notifications = Array.isArray(savedNotifications) ? savedNotifications : [];
  if (persistMigration) ensureDefaultNotifications();
  if (savedSettings && typeof savedSettings === "object") {
    appSettings = { ...appSettings, ...savedSettings };
  }
  applySettings();
}

function saveBuyers() {
  localStorage.setItem(storageKeys.buyers, JSON.stringify(buyers));
  localStorage.setItem(storageKeys.users, JSON.stringify([
    ...buyers.map((buyer) => ({ ...buyer, role: "Customer" })),
    { ...adminAccount },
  ]));
}

function saveSession(mode = localStorage.getItem(storageKeys.sessionMode) || "local") {
  localStorage.removeItem(storageKeys.currentSession);
  sessionStorage.removeItem(storageKeys.currentSession);
  if (currentSession) {
    const storage = mode === "session" ? sessionStorage : localStorage;
    storage.setItem(storageKeys.currentSession, JSON.stringify(currentSession));
    localStorage.setItem(storageKeys.sessionMode, mode);
    return;
  }
  localStorage.removeItem(storageKeys.currentSession);
  sessionStorage.removeItem(storageKeys.currentSession);
  localStorage.removeItem(storageKeys.sessionMode);
}

function saveOrders() {
  localStorage.setItem(storageKeys.orders, JSON.stringify(orders));
}

function saveStocks() {
  const stocks = products.reduce((result, product) => {
    result[product.id] = product.stock;
    return result;
  }, {});
  localStorage.setItem(storageKeys.productStocks, JSON.stringify(stocks));
}

function saveCustomProducts() {
  localStorage.setItem(storageKeys.customProducts, JSON.stringify(customProducts));
}

function saveStoreHours() {
  localStorage.setItem(storageKeys.storeHours, JSON.stringify(storeHours));
}

function saveWishlist() {
  localStorage.setItem(storageKeys.wishlist, JSON.stringify(wishlist));
}

function saveSettings() {
  localStorage.setItem(storageKeys.settings, JSON.stringify(appSettings));
}

function saveNotifications() {
  localStorage.setItem(storageKeys.notifications, JSON.stringify(notifications));
}

function applySettings() {
  document.body.classList.toggle("dark-mode", Boolean(appSettings.darkMode));
  if (darkModeToggle) darkModeToggle.checked = Boolean(appSettings.darkMode);
  if (notificationToggle) notificationToggle.checked = Boolean(appSettings.notifications);
  if (languageSelect) languageSelect.value = appSettings.language || "id";
}

function formatPrice(value) {
  return currency.format(value).replace(/\s/g, "");
}

function formatClock(value) {
  return value.replace(":", ".");
}

function currentBuyer() {
  if (currentSession?.role !== "buyer") return null;
  return buyers.find((buyer) => buyer.id === currentSession.id) || null;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password) {
  return /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && password.length >= 8;
}

function setText(selector, message = "") {
  const element = document.querySelector(selector);
  if (element) element.textContent = message;
}

function showLoginError(selector, message) {
  setText(selector, message);
  showToast(message);
}

function notificationTime() {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  }).format(new Date());
}

function addNotification(target, payload) {
  const eventKey = payload.eventKey || null;
  if (eventKey && notifications.some((item) => item.eventKey === eventKey)) return;
  const notification = {
    id: makeId("notif"),
    target,
    buyerId: payload.buyerId || null,
    icon: payload.icon || "🔔",
    title: payload.title,
    description: payload.description,
    time: notificationTime(),
    read: false,
    eventKey,
  };
  notifications.unshift(notification);
  notifications = notifications.slice(0, 80);
  saveNotifications();
  renderNotifications();
  if (target === "admin") playAdminNotificationSound();
}

function ensureDefaultNotifications() {
  if (notifications.length) return;
  notifications = [
    {
      id: "notif-promo-default",
      target: "buyer",
      buyerId: null,
      icon: "🎁",
      title: "Promo baru tersedia",
      description: "Gunakan voucher SERENYT10 untuk diskon 10%.",
      time: notificationTime(),
      read: false,
    },
    {
      id: "notif-admin-stock-default",
      target: "admin",
      buyerId: null,
      icon: "⚠",
      title: "Produk hampir habis",
      description: "Pantau produk stok rendah di dashboard.",
      time: notificationTime(),
      read: false,
    },
  ];
  saveNotifications();
}

function visibleNotifications(target) {
  const buyer = currentBuyer();
  return notifications.filter((item) => {
    if (target === "admin") return item.target === "admin";
    return item.target === "buyer" && (!item.buyerId || item.buyerId === buyer?.id);
  });
}

function unreadNotificationCount(target) {
  return visibleNotifications(target).filter((item) => !item.read).length;
}

function renderNotificationList(container, target) {
  if (!container) return;
  const items = visibleNotifications(target);
  if (!items.length) {
    container.innerHTML = `<div class="empty-state">Belum ada notifikasi. Semua tenang dan rapi.</div>`;
    return;
  }
  container.innerHTML = items
    .map(
      (item) => `
        <article class="notification-item ${item.read ? "" : "unread"}" data-notification-id="${item.id}">
          <button class="notification-select" data-toggle-notification="${item.id}" type="button" aria-label="Pilih notifikasi">${item.read ? "○" : "●"}</button>
          <span class="notification-icon">${item.icon}</span>
          <div>
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <small>${item.time} • ${item.read ? "Read" : "Unread"}</small>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderNotifications() {
  const customerUnread = unreadNotificationCount("buyer");
  const adminUnread = unreadNotificationCount("admin");
  if (customerNotificationCount) customerNotificationCount.textContent = customerUnread;
  if (customerHeaderNotificationCount) customerHeaderNotificationCount.textContent = customerUnread;
  if (adminNotificationCount) adminNotificationCount.textContent = adminUnread;
  renderNotificationList(customerNotifications, "buyer");
  renderNotificationList(adminNotifications, "admin");
}

function handleNotificationAction(target, action) {
  const items = visibleNotifications(target);
  if (action === "clear-all") {
    notifications = notifications.filter((item) => !items.some((visible) => visible.id === item.id));
    showToast("Notifikasi berhasil dihapus.");
  } else {
    const unread = items.filter((item) => !item.read);
    const scope = action === "read-selected" ? unread.slice(0, 1) : unread;
    scope.forEach((item) => {
      item.read = true;
    });
    showToast("Notifikasi ditandai sudah dibaca.");
  }
  saveNotifications();
  renderNotifications();
}

const statusMessages = {
  Pending: ["📦", "Pesanan diterima", "Pesanan Anda telah kami terima."],
  Processing: ["👩‍🍳", "Pesanan sedang diproses", "Pesanan Anda sedang kami siapkan."],
  "Ready for Pickup": ["✅", "Pesanan siap diambil", "Pesanan Anda sudah siap diambil."],
  Delivered: ["🛵", "Pesanan sedang dikirim", "Pesanan Anda sedang dikirim."],
  Completed: ["✨", "Pesanan selesai", "Terima kasih telah berbelanja di Serenyt Bakery."],
  Cancelled: ["✕", "Pesanan dibatalkan", "Pesanan Anda dibatalkan."],
};

function checkoutCosts() {
  const subtotal = cartValue();
  const fulfillment = document.querySelector("#fulfillment")?.value || "Regular";
  const shipping = fulfillment === "Pickup" ? 0 : fulfillment === "Express" ? 18000 : 10000;
  const voucher = document.querySelector("#voucherCode")?.value.trim().toUpperCase();
  const discount = voucher === "SERENYT10" ? Math.round(subtotal * 0.1) : 0;
  const tax = Math.round((subtotal - discount) * 0.11);
  return {
    subtotal,
    shipping,
    discount,
    tax,
    total: Math.max(0, subtotal - discount + tax + shipping),
  };
}

function switchAuthTab(tabName) {
  authTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.authTab === tabName);
  });
  authPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.authPanel === tabName);
  });
}

function switchAdminPage(pageName) {
  adminTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.adminPage === pageName);
  });
  adminPages.forEach((page) => {
    page.classList.toggle("active", page.id === `admin${pageName[0].toUpperCase()}${pageName.slice(1)}Page`);
  });

  const titles = {
    stats: ["Dashboard Admin", "Statistika Penjualan", "Pantau pemasukan dan jam buka toko."],
    orders: ["Dashboard Admin", "Pesanan Masuk", "Kelola status pesanan pembeli."],
    products: ["Dashboard Admin", "Produk Toko", "Atur stok dan pantau menu."],
    customers: ["Dashboard Admin", "Customers", "Lihat pelanggan dan nilai pembelian."],
    categories: ["Dashboard Admin", "Categories", "Pantau kategori dan distribusi produk."],
    inventory: ["Dashboard Admin", "Inventory", "Kelola stok masuk, keluar, dan stok rendah."],
    promotions: ["Dashboard Admin", "Promotions", "Atur banner, diskon, dan masa promo."],
    reviews: ["Dashboard Admin", "Reviews", "Moderasi ulasan pelanggan."],
    reports: ["Dashboard Admin", "Reports", "Ringkasan performa toko."],
    settings: ["Dashboard Admin", "Settings", "Atur profil bisnis bakery."],
    profile: ["Dashboard Admin", "Profile", "Kelola profil administrator."],
    notifications: ["Dashboard Admin", "Notification Center", "Pantau notifikasi operasional toko."],
  };
  const [eyebrow, title, subtitle] = titles[pageName] || titles.stats;
  if (topEyebrow) topEyebrow.textContent = eyebrow;
  if (pageTitle) pageTitle.textContent = title;
  if (pageSubtitle) pageSubtitle.textContent = subtitle;
}

function setSession(session, mode = "local") {
  currentSession = session;
  if (session?.role === "admin") {
    localStorage.setItem(storageKeys.adminLoggedIn, "true");
  } else {
    localStorage.removeItem(storageKeys.adminLoggedIn);
  }
  saveSession(mode);
  applySession();
}

function applySession() {
  const isLoggedIn = Boolean(currentSession);
  const isAdmin = currentSession?.role === "admin";
  const isBuyer = currentSession?.role === "buyer";

  if (authScreen) authScreen.hidden = isLoggedIn;
  if (appShell) appShell.hidden = !isLoggedIn;

  document.querySelectorAll(".buyer-only").forEach((element) => {
    element.hidden = !isBuyer;
  });
  document.querySelectorAll(".admin-only").forEach((element) => {
    element.hidden = !isAdmin;
  });

  if (roleLabel) roleLabel.textContent = isAdmin ? "Admin Area" : "Fresh Bread everyday";

  if (!isLoggedIn) {
    cart = [];
    renderCart();
    return;
  }

  if (isAdmin) {
    switchView("admin");
  } else {
    switchView("shop");
  }

  fillProfileForm();
  renderCheckoutProfile();
  renderAll();
}

function loginBuyer(email, password, remember = true) {
  const normalizedEmail = email.trim().toLowerCase();
  setText("#buyerLoginEmailMessage");
  setText("#buyerLoginPasswordMessage");
  const buyerEmailInput = document.querySelector("#buyerLoginEmail");
  const buyerPasswordInput = document.querySelector("#buyerLoginPassword");
  buyerEmailInput?.removeAttribute("aria-invalid");
  buyerPasswordInput?.removeAttribute("aria-invalid");

  if (!normalizedEmail) {
    buyerEmailInput?.setAttribute("aria-invalid", "true");
    showLoginError("#buyerLoginEmailMessage", "Email is required.");
    return;
  }
  if (!password) {
    buyerPasswordInput?.setAttribute("aria-invalid", "true");
    showLoginError("#buyerLoginPasswordMessage", "Password is required.");
    return;
  }
  if (!isValidEmail(normalizedEmail)) {
    buyerEmailInput?.setAttribute("aria-invalid", "true");
    showLoginError("#buyerLoginEmailMessage", "Invalid email format.");
    return;
  }

  const buyer = buyers.find((item) => item.email.toLowerCase() === normalizedEmail);

  if (!buyer) {
    buyerEmailInput?.setAttribute("aria-invalid", "true");
    showLoginError("#buyerLoginEmailMessage", "Email is not registered.");
    return;
  }

  if (buyer.password !== password) {
    buyerPasswordInput?.setAttribute("aria-invalid", "true");
    showLoginError("#buyerLoginPasswordMessage", "Incorrect password.");
    return;
  }

  setSession({ role: "buyer", id: buyer.id, name: buyer.name }, remember ? "local" : "session");
  showToast("Login successful.");
}

function registerBuyer(formData) {
  const email = formData.email.trim().toLowerCase();
  setText("#registerMessage");
  if (!formData.name.trim() || !formData.phone.trim() || !email || !formData.password || !formData.confirmPassword) {
    setText("#registerMessage", "Semua field wajib diisi.");
    return;
  }
  if (!isValidEmail(email)) {
    setText("#registerMessage", "Invalid email format.");
    return;
  }
  if (buyers.some((buyer) => buyer.email.toLowerCase() === email)) {
    setText("#registerMessage", "Email cannot already exist.");
    return;
  }
  if (!isStrongPassword(formData.password)) {
    setText("#registerMessage", "Password minimum 8 karakter serta berisi uppercase, lowercase, dan angka.");
    return;
  }
  if (formData.password !== formData.confirmPassword) {
    setText("#registerMessage", "Confirm password must match.");
    return;
  }

  const buyer = {
    id: `buyer-${Date.now()}`,
    name: formData.name.trim(),
    phone: formData.phone.trim(),
    email,
    password: formData.password,
    address: "",
    photo: "logo.png",
    photoHistory: [],
    joinDate: new Date().toISOString().slice(0, 10),
  };

  buyers.unshift(buyer);
  saveBuyers();
  setSession({ role: "buyer", id: buyer.id, name: buyer.name }, "local");
  showToast("Akun pembeli berhasil dibuat.");
}

function loginAdmin(username, password) {
  if (username.toLowerCase() === adminAccount.email && password === adminAccount.password) {
    setSession({ role: "admin", name: adminAccount.name }, "local");
    showToast("Login admin berhasil.");
    return true;
  }

  showToast("Email atau password admin salah.");
  return false;
}

function fillProfileForm() {
  const buyer = currentBuyer();
  if (!profileForm || !buyer) return;
  document.querySelector("#profileName").value = buyer.name || "";
  document.querySelector("#profileEmail").value = buyer.email || "";
  document.querySelector("#profilePhone").value = buyer.phone || "";
  document.querySelector("#profileAddress").value = buyer.address || "";
  renderProfilePhoto();
}

function renderCheckoutProfile() {
  const buyer = currentBuyer();
  if (!checkoutName || !checkoutPhone) return;
  checkoutName.textContent = buyer?.name || "Pembeli";
  checkoutPhone.textContent = buyer?.phone || "Nomor HP belum diisi";
  const checkoutCustomerName = document.querySelector("#checkoutCustomerName");
  const checkoutCustomerPhone = document.querySelector("#checkoutCustomerPhone");
  const checkoutAddress = document.querySelector("#checkoutAddress");
  if (checkoutCustomerName) checkoutCustomerName.value = buyer?.name || "";
  if (checkoutCustomerPhone) checkoutCustomerPhone.value = buyer?.phone || "";
  if (checkoutAddress) checkoutAddress.value = buyer?.address || "";
}

function renderProfilePhoto() {
  const buyer = currentBuyer();
  const photo = buyer?.photo || "logo.png";
  if (sidebarProfilePhoto) sidebarProfilePhoto.src = photo;
  if (sidebarProfileName) sidebarProfileName.textContent = buyer?.name || "Profil";
  if (customerHeaderPhoto) customerHeaderPhoto.src = photo;
  if (customerHeaderName) customerHeaderName.textContent = buyer?.name || "Customer";
  if (profilePhotoPreview) profilePhotoPreview.src = photo;

  if (!photoHistory) return;
  const history = buyer?.photoHistory || [];
  if (!history.length) {
    photoHistory.innerHTML = `<span class="empty-photo-history">Belum ada foto lama.</span>`;
    return;
  }

  photoHistory.innerHTML = history
    .map(
      (item, index) => `
        <button class="history-photo ${item === photo ? "active" : ""}" data-photo-index="${index}" type="button">
          <img src="${item}" alt="Foto profil lama ${index + 1}">
        </button>
      `,
    )
    .join("");
}

function renderStoreHours() {
  const hoursText = `${formatClock(storeHours.open)} - ${formatClock(storeHours.close)} WIB`;
  if (storeOpenLabel) storeOpenLabel.textContent = "Buka Hari Ini";
  if (storeHoursLabel) storeHoursLabel.textContent = hoursText;
  if (storeOpenTime) storeOpenTime.value = storeHours.open;
  if (storeCloseTime) storeCloseTime.value = storeHours.close;
}

function productSvg(product) {
  const fill = product.color;
  const stroke = "rgba(69, 40, 24, 0.22)";
  const common = `stroke="${stroke}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"`;

  const shapes = {
    croissant: `<svg viewBox="0 0 220 150" role="img" aria-label="${product.name}"><path d="M31 86c22 42 130 51 158-5-19 17-42 12-58-11-20-29-48-32-71-6-13 15-23 22-29 22z" fill="${fill}" ${common}/><path d="M70 68c7 20 22 35 43 43M118 58c3 23 13 40 31 51" fill="none" ${common}/></svg>`,
    bun: `<svg viewBox="0 0 220 150" role="img" aria-label="${product.name}"><path d="M44 103c0-39 30-67 69-67s64 28 64 67v10H44z" fill="${fill}" ${common}/><path d="M82 62l8 18M116 55l7 19M148 66l8 16" fill="none" ${common}/></svg>`,
    loaf: `<svg viewBox="0 0 220 150" role="img" aria-label="${product.name}"><path d="M45 59c0-25 18-43 43-43 15 0 28 7 36 18 8-7 19-11 31-11 23 0 39 17 39 40v57H45z" fill="${fill}" ${common}/><path d="M93 32v88M139 38v82" fill="none" ${common}/></svg>`,
    roll: `<svg viewBox="0 0 220 150" role="img" aria-label="${product.name}"><rect x="42" y="45" width="136" height="62" rx="31" fill="${fill}" ${common}/><path d="M75 49c18 12 18 43 0 55M112 46c18 14 18 47 0 61M149 50c16 12 16 42 0 53" fill="none" ${common}/></svg>`,
    donut: `<svg viewBox="0 0 220 150" role="img" aria-label="${product.name}"><path d="M110 25c43 0 75 25 75 55s-32 55-75 55-75-25-75-55 32-55 75-55zm0 34c-17 0-29 9-29 21s12 21 29 21 29-9 29-21-12-21-29-21z" fill="${fill}" ${common}/></svg>`,
    cake: `<svg viewBox="0 0 220 150" role="img" aria-label="${product.name}"><path d="M53 66h114v55H53z" fill="${fill}" ${common}/><path d="M60 51h100c10 0 17 7 17 15H43c0-8 7-15 17-15z" fill="#fff1f4" ${common}/><path d="M79 44v-18M111 44v-18M143 44v-18" fill="none" ${common}/></svg>`,
    cup: `<svg viewBox="0 0 220 150" role="img" aria-label="${product.name}"><path d="M67 36h84l-12 94H79z" fill="${fill}" ${common}/><path d="M64 36h90l-5-18H69z" fill="#f3eee6" ${common}/><path d="M80 64h58" fill="none" ${common}/></svg>`,
    box: `<svg viewBox="0 0 220 150" role="img" aria-label="${product.name}"><path d="M42 58h136v70H42z" fill="${fill}" ${common}/><path d="M60 58c3-28 28-43 50-14 23-29 48-14 51 14" fill="#f3c56c" ${common}/><path d="M110 45v83M42 79h136" fill="none" ${common}/></svg>`,
  };

  return shapes[product.shape] || shapes.bun;
}

function stockLabel(stock) {
  if (stock <= 0) return { text: "Habis", className: "out" };
  if (stock <= 5) return { text: `Sisa ${stock}`, className: "low" };
  return { text: "Tersedia", className: "" };
}

function renderCategories() {
  if (!categoryTabs) return;
  const categories = ["Semua", ...new Set(products.map((product) => product.category))];
  categoryTabs.innerHTML = categories
    .map(
      (category) => `
        <button class="chip ${category === selectedCategory ? "active" : ""}" data-category="${category}" type="button">
          ${category}
        </button>
      `,
    )
    .join("");
}

function filteredProducts() {
  const visible = products.filter((product) => {
    const matchesCategory = selectedCategory === "Semua" || product.category === selectedCategory;
    const categoryTags = categorySearchTags[product.category] || "";
    const haystack = `${product.name} ${product.category} ${product.label || ""} ${categoryTags} ${product.description}`.toLowerCase();
    return matchesCategory && haystack.includes(searchTerm.toLowerCase());
  });
  return visible.sort((a, b) => {
    if (sortMode === "name") return a.name.localeCompare(b.name);
    if (sortMode === "price-low") return a.price - b.price;
    if (sortMode === "price-high") return b.price - a.price;
    if (sortMode === "stock") return b.stock - a.stock;
    return 0;
  });
}

function productBadges(product, index) {
  const badges = [];
  if (index < 4 || product.name.includes("Baker")) badges.push("Best Seller");
  if (product.id.includes("cloud") || product.id.includes("signature")) badges.push("New");
  if (product.stock <= 5) badges.push("Limited");
  return badges;
}

function renderProducts() {
  if (!productGrid || !productSummary) return;
  const visibleProducts = filteredProducts();
  productSummary.textContent = `${visibleProducts.length} produk cocok dengan pilihan saat ini.`;
  productGrid.innerHTML = visibleProducts
    .map((product, index) => {
      const stock = stockLabel(product.stock);
      const favorite = wishlist.includes(product.id);
      return `
        <article class="product-card">
          <div class="product-image">
            <img src="${product.image}" alt="${product.name}">
          </div>
          <div class="product-body">
            <div class="badge-row">
              ${productBadges(product, index).map((badge) => `<span class="mini-badge">${badge}</span>`).join("")}
            </div>
            <div class="product-info">
              <h3>${product.name}</h3>
              <p>${product.description}</p>
            </div>
            <div class="product-meta">
              <span>${product.category}${product.label ? ` • ${product.label}` : ""}</span>
              <span class="status-pill ${stock.className}">${stock.text}</span>
            </div>
            <div class="product-meta">
              <span>★★★★★ 4.${(index % 5) + 4} • ${18 + index} reviews</span>
            </div>
            <div class="product-meta">
              <strong class="price">${formatPrice(product.price)}</strong>
              <div class="admin-actions">
                <button class="secondary-button" data-detail="${product.id}" type="button">View</button>
                <button class="secondary-button" data-wishlist="${product.id}" type="button">${favorite ? "♥" : "♡"}</button>
                <button class="secondary-button" data-add="${product.id}" ${product.stock <= 0 ? "disabled" : ""} type="button">Cart</button>
                <button class="primary-button" data-buy="${product.id}" ${product.stock <= 0 ? "disabled" : ""} type="button">Buy</button>
              </div>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  if (!visibleProducts.length) {
    productGrid.innerHTML = `<div class="empty-state">Produk tidak ditemukan.</div>`;
  }
}

function renderWishlist() {
  if (!wishlistGrid) return;
  const items = wishlist.map((id) => products.find((product) => product.id === id)).filter(Boolean);
  if (!items.length) {
    wishlistGrid.innerHTML = `<div class="empty-state">Wishlist masih kosong.</div>`;
    return;
  }
  wishlistGrid.innerHTML = items
    .map(
      (product) => `
        <article class="product-card">
          <div class="product-image"><img src="${product.image}" alt="${product.name}"></div>
          <div class="product-body">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-meta"><strong class="price">${formatPrice(product.price)}</strong><span>${product.category}</span></div>
            <div class="admin-actions">
              <button class="secondary-button" data-remove-wishlist="${product.id}" type="button">Remove</button>
              <button class="primary-button" data-move-cart="${product.id}" type="button">Move to Cart</button>
            </div>
          </div>
        </article>
      `,
    )
    .join("");
}

function toggleWishlist(productId) {
  if (wishlist.includes(productId)) {
    wishlist = wishlist.filter((id) => id !== productId);
    showToast("Wishlist dihapus.");
  } else {
    wishlist.unshift(productId);
    showToast("Wishlist Added.");
  }
  saveWishlist();
  renderProducts();
  renderWishlist();
}

function showProductDetail(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product || !productDetailContent || !productDetailDialog) return;
  const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 3);
  productDetailContent.innerHTML = `
    <div class="drawer-header compact">
      <div>
        <p class="eyebrow">${product.category}</p>
        <h2>${product.name}</h2>
      </div>
      <button class="icon-button" data-close-detail type="button">x</button>
    </div>
    <img class="detail-image" src="${product.image}" alt="${product.name}">
    <p>${product.description}</p>
    <div class="product-meta"><strong class="price">${formatPrice(product.price)}</strong><span>Stock ${product.stock} • Rating 4.8</span></div>
    <p><strong>Ingredients:</strong> Flour, butter, milk, sugar. <strong>Allergens:</strong> Gluten, dairy.</p>
    <div>
      <p class="eyebrow">Related Products</p>
      <div class="admin-actions">${related.map((item) => `<button class="secondary-button" data-detail="${item.id}" type="button">${item.name}</button>`).join("")}</div>
    </div>
    <div class="admin-actions">
      <button class="secondary-button" data-wishlist="${product.id}" type="button">Favorite</button>
      <button class="primary-button" data-buy="${product.id}" type="button">Buy Now</button>
    </div>
  `;
  if (!productDetailDialog.open) productDetailDialog.showModal();
}

function cartQuantity() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function cartValue() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function renderCart() {
  if (!cartCount || !cartTotal || !cartItems) return;
  const costs = checkoutCosts();
  cartCount.textContent = cartQuantity();
  if (wishlistCount) wishlistCount.textContent = wishlist.length;
  cartTotal.textContent = formatPrice(costs.total);
  if (checkoutSummary) {
    checkoutSummary.innerHTML = `
      <div><span>Subtotal</span><strong>${formatPrice(costs.subtotal)}</strong></div>
      <div><span>Shipping Fee</span><strong>${formatPrice(costs.shipping)}</strong></div>
      <div><span>Voucher</span><strong>-${formatPrice(costs.discount)}</strong></div>
      <div><span>Tax 11%</span><strong>${formatPrice(costs.tax)}</strong></div>
    `;
  }

  if (!cart.length) {
    cartItems.innerHTML = `<div class="empty-state">Keranjang masih kosong.</div>`;
    return;
  }

  cartItems.innerHTML = cart
    .map(
      (item) => `
        <div class="cart-item">
          <div>
            <h3>${item.name}</h3>
            <p>${formatPrice(item.price)} per item</p>
          </div>
          <div class="qty-control">
            <button class="qty-button" data-decrease="${item.id}" type="button" aria-label="Kurangi ${item.name}">−</button>
            <strong>${item.quantity}</strong>
            <button class="qty-button" data-increase="${item.id}" type="button" aria-label="Tambah ${item.name}">+</button>
            <button class="qty-button" data-remove-cart="${item.id}" type="button" aria-label="Hapus ${item.name}">x</button>
          </div>
        </div>
      `,
    )
    .join("");
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product || product.stock <= 0) return;

  const existing = cart.find((item) => item.id === productId);
  const currentQty = existing?.quantity || 0;
  if (currentQty >= product.stock) {
    showToast("Stok produk tidak mencukupi.");
    return;
  }

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
  }

  renderCart();
  showToast(`${product.name} ditambahkan ke keranjang.`);
}

function changeQuantity(productId, delta) {
  const item = cart.find((entry) => entry.id === productId);
  const product = products.find((entry) => entry.id === productId);
  if (!item || !product) return;

  const nextQty = item.quantity + delta;
  if (nextQty > product.stock) {
    showToast("Stok produk tidak mencukupi.");
    return;
  }

  if (nextQty <= 0) {
    cart = cart.filter((entry) => entry.id !== productId);
  } else {
    item.quantity = nextQty;
  }

  renderCart();
}

function renderOrders() {
  if (!ordersList && !adminOrders) return;

  const buyer = currentBuyer();
  const buyerOrders = buyer
    ? orders.filter(
        (order) =>
          order.buyerId === buyer.id ||
          String(order.customer).toLowerCase() === buyer.name.toLowerCase(),
      )
    : orders;

  if (!orders.length) {
    if (ordersList) ordersList.innerHTML = `<div class="empty-state">Belum ada riwayat pesanan.</div>`;
    if (adminOrders) adminOrders.innerHTML = `<div class="empty-state">Belum ada pesanan masuk.</div>`;
    return;
  }

  if (ordersList) {
    if (!buyerOrders.length) {
      ordersList.innerHTML = `<div class="empty-state">Belum ada riwayat pesanan untuk akun ini.</div>`;
    } else {
      ordersList.innerHTML = buyerOrders
      .map(
        (order) => `
        <article class="order-card">
          <div class="order-meta">
            <div>
              <h3>${order.id}</h3>
              <p>${order.fulfillment} • ${order.payment}</p>
            </div>
            <span class="status-pill">${order.status}</span>
          </div>
          <ul class="order-items">
            ${order.items.map((item) => `<li>${item.quantity}x ${item.name}</li>`).join("")}
          </ul>
          ${renderOrderTimeline(order.status)}
          <div class="cart-total">
            <span>Total</span>
            <strong>${formatPrice(order.total)}</strong>
          </div>
        </article>
      `,
      )
      .join("");
    }
  }

  if (adminOrders) {
    const filteredOrders = filteredAdminOrders();
    if (!filteredOrders.length) {
      adminOrders.innerHTML = `<div class="empty-state">Tidak ada pesanan yang cocok dengan filter.</div>`;
      return;
    }
    adminOrders.innerHTML = filteredOrders
      .map(
        (order) => `
        <article class="admin-card">
          <div class="admin-card-header">
            <div>
              <h3>${order.id}</h3>
              <p>${order.customer} • ${order.phone}</p>
            </div>
            <span class="status-pill">${order.status}</span>
          </div>
          <p>${order.payment} • ${order.fulfillment}${order.note ? ` • ${order.note}` : ""} • ${formatOrderTime(order.createdAt)}</p>
          <ul class="order-items">
            ${order.items.map((item) => `<li>${item.quantity}x ${item.name} - ${formatPrice(item.price * item.quantity)}</li>`).join("")}
          </ul>
          <p><strong>${order.items.reduce((sum, item) => sum + item.quantity, 0)} item</strong> • ${order.address || "Pickup / delivery address belum diisi"}</p>
          <div class="cart-total">
            <span>Total</span>
            <strong>${formatPrice(order.total)}</strong>
          </div>
          <div class="admin-actions">
            <button class="secondary-button" data-detail-order="${order.id}" type="button">Detail</button>
            ${statusFlow
              .map(
                (status) => `
                  <button class="secondary-button" data-status="${status}" data-order="${order.id}" ${
                  status === order.status ? "disabled" : ""
                } type="button">
                    ${status}
                  </button>
                `,
              )
              .join("")}
            <button class="primary-button" data-print="${order.id}" type="button">
              Cetak Struk
            </button>
            <button class="secondary-button" data-cancel-order="${order.id}" type="button">Batalkan Pesanan</button>
          </div>
        </article>
      `,
      )
      .join("");
  }
}

function formatOrderTime(value) {
  if (!value) return "Waktu belum tersedia";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function renderOrderTimeline(status) {
  const steps = ["Pending", "Processing", "Ready for Pickup", "Delivered", "Completed"];
  const currentIndex = status === "Cancelled" ? -1 : Math.max(0, steps.indexOf(status));
  if (status === "Cancelled") {
    return `<div class="order-timeline cancelled"><span>✕ Pesanan Dibatalkan</span></div>`;
  }
  return `
    <div class="order-timeline">
      ${steps
        .map(
          (step, index) => `
            <div class="timeline-step ${index <= currentIndex ? "done" : ""}">
              <span>${index <= currentIndex ? "✓" : "○"}</span>
              <strong>${statusMessages[step]?.[1] || step}</strong>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function filteredAdminOrders() {
  return [...orders]
    .filter((order) => adminOrderFilter === "Semua" || order.status === adminOrderFilter)
    .filter((order) => {
      const haystack = `${order.id} ${order.customer}`.toLowerCase();
      return haystack.includes(adminOrderSearch.toLowerCase());
    })
    .filter((order) => !adminOrderDate || String(order.createdAt || "").slice(0, 10) === adminOrderDate)
    .filter((order) => adminPaymentFilter === "Semua" || order.payment === adminPaymentFilter)
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return adminOrderSort === "oldest" ? dateA - dateB : dateB - dateA;
    });
}

function renderAdminProducts() {
  if (!adminProducts) return;
  const visibleProducts = filteredAdminProducts();
  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / adminProductPageSize));
  adminProductPage = Math.min(adminProductPage, totalPages);
  const pageProducts = visibleProducts.slice((adminProductPage - 1) * adminProductPageSize, adminProductPage * adminProductPageSize);
  if (productPageInfo) productPageInfo.textContent = `Page ${adminProductPage} / ${totalPages}`;
  if (!pageProducts.length) {
    adminProducts.innerHTML = `<div class="empty-state">Produk tidak ditemukan.</div>`;
    return;
  }
  adminProducts.innerHTML = pageProducts
    .map((product) => {
      const stock = stockLabel(product.stock);
      return `
        <article class="product-card admin-product-card">
          <div class="product-image">
            <img src="${product.image}" alt="${product.name}">
          </div>
          <div class="product-body">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
            </div>
            <div class="product-meta">
              <span>${product.category}${product.label ? ` • ${product.label}` : ""}</span>
              <span class="status-pill ${stock.className}">${stock.text}</span>
            </div>
            <strong class="price">${formatPrice(product.price)}</strong>
            <div class="stock-control">
              <label>
                Stok
                <input type="number" min="0" value="${product.stock}" data-stock="${product.id}" />
              </label>
              <button class="secondary-button" data-toggle="${product.id}" type="button">
                ${product.stock > 0 ? "Kosongkan" : "Aktifkan"}
              </button>
            </div>
            <div class="admin-actions">
              <button class="secondary-button" data-detail="${product.id}" type="button">View</button>
              <button class="secondary-button" data-edit-product="${product.id}" type="button">Edit</button>
              <button class="secondary-button" data-duplicate="${product.id}" type="button">Duplicate</button>
              <button class="secondary-button" data-restock="${product.id}" type="button">Restock</button>
              <button class="secondary-button" data-delete-product="${product.id}" type="button">Delete</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function filteredAdminProducts() {
  return [...products]
    .filter((product) => adminProductCategoryFilter === "Semua" || product.category === adminProductCategoryFilter)
    .filter((product) => `${product.name} ${product.category}`.toLowerCase().includes(adminProductSearch.toLowerCase()))
    .sort((a, b) => {
      if (adminProductSort === "stock-low") return a.stock - b.stock;
      if (adminProductSort === "price-high") return b.price - a.price;
      return a.name.localeCompare(b.name);
    });
}

function renderAdminStats() {
  if (!adminStats) return;
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const todayOrders = orders.filter((order) => String(order.createdAt || "").slice(0, 10) === today);
  const revenueToday = todayOrders.reduce((sum, order) => sum + order.total, 0) || orders[0]?.total || 0;
  const soldItemsToday = todayOrders.reduce(
    (sum, order) => sum + order.items.reduce((total, item) => total + item.quantity, 0),
    0,
  ) || orders.reduce((sum, order) => sum + order.items.reduce((total, item) => total + item.quantity, 0), 0);
  const lowStock = products.filter((product) => product.stock <= 5).length;
  const bestSeller = orders
    .flatMap((order) => order.items)
    .reduce((result, item) => {
      result[item.name] = (result[item.name] || 0) + item.quantity;
      return result;
    }, {});
  const bestSellerEntries = Object.entries(bestSeller).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const hour = now.getHours();
  const greeting = hour < 11 ? "Selamat Pagi" : hour < 15 ? "Selamat Siang" : hour < 18 ? "Selamat Sore" : "Selamat Malam";

  if (adminGreeting) {
    adminGreeting.innerHTML = `
      <div>
        <p class="eyebrow">Dashboard Admin</p>
        <h2>${greeting}, Admin</h2>
        <p>Ini ringkasan operasional Serenyt Bakery hari ini.</p>
      </div>
    `;
  }

  adminStats.innerHTML = `
    <article class="stat-card"><span>💰 Pendapatan Hari Ini</span><strong>${formatPrice(revenueToday)}</strong></article>
    <article class="stat-card"><span>📦 Jumlah Pesanan Hari Ini</span><strong>${todayOrders.length || orders.length}</strong></article>
    <article class="stat-card"><span>🍞 Produk Terjual Hari Ini</span><strong>${soldItemsToday}</strong></article>
    <article class="stat-card"><span>⚠ Produk Hampir Habis</span>
      <strong>${lowStock}</strong>
    </article>
  `;

  if (bestSellerList) {
    bestSellerList.innerHTML = bestSellerEntries.length
      ? bestSellerEntries
          .map(([name, count], index) => {
            const product = products.find((item) => item.name === name);
            return `<article class="ranking-item"><strong>#${index + 1}</strong><img src="${product?.image || "logo.png"}" alt="${name}"><span>${name}<small>${count} terjual</small></span></article>`;
          })
          .join("")
      : `<div class="empty-state compact-empty">Belum ada produk terjual.</div>`;
  }

  if (latestOrders) {
    latestOrders.innerHTML = orders.slice(0, 5).length
      ? orders
          .slice(0, 5)
          .map((order) => `<article class="latest-order"><strong>${order.id}</strong><span>${order.customer} • ${formatOrderTime(order.createdAt)}</span><span>${formatPrice(order.total)} • ${order.status}</span><button class="secondary-button" data-detail-order="${order.id}" type="button">Detail</button></article>`)
          .join("")
      : `<div class="empty-state compact-empty">Belum ada pesanan terbaru.</div>`;
  }

  if (lowStockList) {
    const lowItems = products.filter((product) => product.stock <= 5).slice(0, 5);
    lowStockList.innerHTML = lowItems.length
      ? lowItems.map((product) => `<article class="ranking-item"><img src="${product.image}" alt="${product.name}"><span>${product.name}<small>Sisa ${product.stock}</small></span><button class="secondary-button" data-restock="${product.id}" type="button">Restock</button></article>`).join("")
      : `<div class="empty-state compact-empty">Semua stok aman.</div>`;
  }
}

function renderAdminCustomers() {
  if (!adminCustomers) return;
  adminCustomers.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Customer</th>
          <th>Contact</th>
          <th>Join Date</th>
          <th>Total Orders</th>
          <th>Total Spending</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${buyers
          .map((buyer) => {
            const customerOrders = orders.filter((order) => order.buyerId === buyer.id);
            const spending = customerOrders.reduce((sum, order) => sum + order.total, 0);
            return `
              <tr>
                <td><strong>${buyer.name}</strong><br><span>${buyer.address || "Address belum diisi"}</span></td>
                <td>${buyer.phone}<br>${buyer.email}</td>
                <td>${buyer.joinDate || "-"}</td>
                <td>${customerOrders.length}</td>
                <td>${formatPrice(spending)}</td>
                <td><span class="status-pill">Active</span></td>
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
  `;
}

function renderAdminExtras() {
  if (adminCategories) {
    const rows = [...new Set(products.map((product) => product.category))]
      .map((category) => {
        const count = products.filter((product) => product.category === category).length;
        return `<tr><td><strong>${category}</strong></td><td>${count} products</td><td><span class="status-pill">Active</span></td></tr>`;
      })
      .join("");
    adminCategories.innerHTML = `<table class="data-table"><thead><tr><th>Category</th><th>Products</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  if (adminInventory) {
    adminInventory.innerHTML = `<table class="data-table"><thead><tr><th>Product</th><th>Current Stock</th><th>Incoming</th><th>Outgoing</th><th>Status</th><th>Action</th></tr></thead><tbody>${products
      .slice(0, 20)
      .map((product, index) => `<tr><td>${product.name}</td><td>${product.stock}</td><td>${index % 3 === 0 ? 12 : 0}</td><td>${index + 2}</td><td><span class="status-pill ${stockLabel(product.stock).className}">${stockLabel(product.stock).text}</span></td><td><button class="secondary-button" data-restock="${product.id}" type="button">Restock</button></td></tr>`)
      .join("")}</tbody></table>`;
  }

  if (adminPromotions) {
    adminPromotions.innerHTML = `<table class="data-table"><thead><tr><th>Banner</th><th>Discount</th><th>Start Date</th><th>End Date</th><th>Status</th><th>Actions</th></tr></thead><tbody><tr><td>SERENYT10</td><td>10%</td><td>2026-01-01</td><td>2026-12-31</td><td><span class="status-pill">Active</span></td><td><button class="secondary-button">Edit</button> <button class="secondary-button">Delete</button></td></tr></tbody></table>`;
  }

  if (adminReviews) {
    adminReviews.innerHTML = `<table class="data-table"><thead><tr><th>Customer</th><th>Review</th><th>Rating</th><th>Actions</th></tr></thead><tbody><tr><td>Nana</td><td>Rotinya fresh dan dashboard mudah dipakai.</td><td>★★★★★</td><td><button class="secondary-button">Reply</button> <button class="secondary-button">Hide</button> <button class="secondary-button">Delete</button> <button class="secondary-button">Highlight</button></td></tr></tbody></table>`;
  }
}

function renderAdminReports() {
  if (!adminReports) return;
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const completed = orders.filter((order) => order.status === "Selesai" || order.status === "Completed").length;
  const cancelled = orders.filter((order) => order.status === "Cancelled" || order.status === "Dibatalkan").length;
  const topCustomer = buyers
    .map((buyer) => ({
      name: buyer.name,
      total: orders.filter((order) => order.buyerId === buyer.id).reduce((sum, order) => sum + order.total, 0),
    }))
    .sort((a, b) => b.total - a.total)[0];
  adminReports.innerHTML = `
    <article class="stat-card"><span>Daily Revenue</span><strong>${formatPrice(revenue)}</strong></article>
    <article class="stat-card"><span>Orders</span><strong>${orders.length}</strong></article>
    <article class="stat-card"><span>Completed</span><strong>${completed}</strong></article>
    <article class="stat-card"><span>Cancelled</span><strong>${cancelled}</strong></article>
    <article class="stat-card wide"><span>Top Customer</span><strong>${topCustomer?.name || "Belum ada"}</strong><small>${formatPrice(topCustomer?.total || 0)}</small></article>
  `;
}

function renderNewProductCategories() {
  if (!newProductCategory) return;
  const categories = [...new Set(products.map((product) => product.category))];
  newProductCategory.innerHTML = categories.map((category) => `<option>${category}</option>`).join("");
  if (adminProductCategoryFilterElement) {
    adminProductCategoryFilterElement.innerHTML = `<option value="Semua">Semua Kategori</option>${categories.map((category) => `<option>${category}</option>`).join("")}`;
    adminProductCategoryFilterElement.value = adminProductCategoryFilter;
  }
}

function submitOrder(event) {
  event.preventDefault();
  if (checkoutInProgress) return;
  const buyer = currentBuyer();
  if (!buyer) {
    showToast("Login sebagai pembeli dulu sebelum checkout.");
    return;
  }

  if (!cart.length) {
    showToast("Tambahkan produk dulu sebelum checkout.");
    return;
  }

  const customer = document.querySelector("#checkoutCustomerName")?.value.trim() || buyer.name;
  const phone = document.querySelector("#checkoutCustomerPhone")?.value.trim() || buyer.phone;
  const address = document.querySelector("#checkoutAddress")?.value.trim();
  const fulfillment = document.querySelector("#fulfillment")?.value;
  const payment = document.querySelector("#paymentMethod")?.value;
  if (!customer || !phone || !address || !fulfillment || !payment) {
    showToast("Lengkapi nama, nomor HP, alamat, pengiriman, dan metode pembayaran.");
    return;
  }

  for (const item of cart) {
    const product = products.find((entry) => entry.id === item.id);
    if (!product || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > product.stock) {
      showToast(`${item.name || "Produk"} tidak tersedia dalam jumlah yang diminta. Periksa stok lalu coba lagi.`);
      renderCart();
      return;
    }
  }
  checkoutInProgress = true;

  const order = {
    id: makeId("TR"),
    createdAt: new Date().toISOString(),
    buyerId: buyer.id,
    customer,
    phone,
    address,
    fulfillment,
    payment,
    note: document.querySelector("#orderNote").value.trim(),
    status: "Pending",
    subtotal: checkoutCosts().subtotal,
    shipping: checkoutCosts().shipping,
    discount: checkoutCosts().discount,
    tax: checkoutCosts().tax,
    total: checkoutCosts().total,
    items: cart.map((item) => ({ ...item })),
  };

  order.items.forEach((item) => {
    const product = products.find((entry) => entry.id === item.id);
    if (product) product.stock = Math.max(0, product.stock - item.quantity);
  });

  orders.unshift(order);
  addNotification("buyer", {
    buyerId: buyer.id,
    icon: "📦",
    title: "Pesanan diterima",
    description: "Pesanan Anda telah kami terima.",
    eventKey: `order-created-buyer-${order.id}`,
  });
  addNotification("admin", {
    icon: "📦",
    title: "Ada Pesanan Baru",
    description: `${order.customer} membuat pesanan ${order.id}.`,
    eventKey: `order-created-admin-${order.id}`,
  });
  saveOrders();
  saveStocks();
  cart = [];
  cartDialog.close();
  renderAll();
  showToast("Checkout Success.");
  switchView("orders");
  checkoutInProgress = false;
}

function switchView(viewName) {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.view === viewName);
  });
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("active", view.id === `${viewName}View`);
  });

  if (viewName === "admin") {
    switchAdminPage("stats");
    return;
  }

  const titles = {
    shop: ["Freshly Baked Everyday", "Freshly Baked Happiness", "Bakery • Drinks • Desserts"],
    orders: ["Pesanan Pembeli", "Riwayat Pesanan", "Pantau status pesanan dari akun kamu."],
    notifications: ["Notification Center", "Notifikasi Akun", "Update pesanan dan promo Serenyt Bakery."],
    wishlist: ["Wishlist", "Produk Favorit", "Simpan dan pindahkan menu favorit ke keranjang."],
    profile: ["Profil Pembeli", "Data Akun", "Ubah nama, nomor HP, email, dan alamat."],
    admin: ["Dashboard Admin", "Statistika Penjualan", "Kelola pesanan, stok, dan produk toko."],
  };
  const [eyebrow, title, subtitle] = titles[viewName] || titles.shop;
  if (topEyebrow) topEyebrow.textContent = eyebrow;
  if (pageTitle) pageTitle.textContent = title;
  if (pageSubtitle) pageSubtitle.textContent = subtitle;
}

let toastTimer;
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function renderAll() {
  renderCategories();
  renderProducts();
  renderCart();
  renderOrders();
  renderAdminProducts();
  renderAdminStats();
  renderAdminCustomers();
  renderAdminReports();
  renderAdminExtras();
  renderWishlist();
  renderNewProductCategories();
  renderCheckoutProfile();
  renderStoreHours();
  renderProfilePhoto();
  renderNotifications();
  applySettings();
}

function printReceipt(orderId) {
  const order = orders.find((item) => item.id === orderId);
  if (!order) return;

  const receiptItems = order.items
    .map(
      (item) => `
        <tr>
          <td>${item.quantity}x ${item.name}</td>
          <td>${formatPrice(item.price * item.quantity)}</td>
        </tr>
      `,
    )
    .join("");

  const receiptWindow = window.open("", "_blank", "width=420,height=640");
  receiptWindow.document.write(`
    <!doctype html>
    <html lang="id">
      <head>
        <meta charset="utf-8">
        <title>Struk ${order.id}</title>
        <style>
          body { width: 320px; margin: 0 auto; padding: 20px; color: #211c18; font-family: Arial, sans-serif; }
          h1, h2, p { margin: 0; }
          h1 { font-size: 20px; text-align: center; }
          h2 { margin-top: 8px; font-size: 14px; text-align: center; font-weight: 400; }
          .meta { margin: 18px 0; border-top: 1px dashed #999; border-bottom: 1px dashed #999; padding: 12px 0; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          td { padding: 6px 0; vertical-align: top; }
          td:last-child { text-align: right; }
          .total { margin-top: 12px; border-top: 1px dashed #999; padding-top: 10px; display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; }
          .thanks { margin-top: 18px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>serenyt Bakery</h1>
        <h2>Struk Pembelian</h2>
        <div class="meta">
          <p>No: ${order.id}</p>
          <p>Nama: ${order.customer}</p>
          <p>HP: ${order.phone}</p>
          <p>Ambil: ${order.fulfillment}</p>
          <p>Bayar: ${order.payment}</p>
          <p>Status: ${order.status}</p>
        </div>
        <table>${receiptItems}</table>
        <div class="total"><span>Total</span><span>${formatPrice(order.total)}</span></div>
        ${order.note ? `<p class="thanks">Catatan: ${order.note}</p>` : ""}
        <p class="thanks">Terima kasih sudah berbelanja.</p>
        <script>window.print();<\/script>
      </body>
    </html>
  `);
  receiptWindow.document.close();
}

function syncAdminAccess() {
  if (!loginView || !adminPanel) return;
  const isLoggedIn = localStorage.getItem(storageKeys.adminLoggedIn) === "true";
  loginView.hidden = isLoggedIn;
  adminPanel.hidden = !isLoggedIn;
  if (logoutAdmin) logoutAdmin.hidden = !isLoggedIn;
}

authTabs.forEach((tab) => {
  tab.addEventListener("click", () => switchAuthTab(tab.dataset.authTab));
});

adminTabs.forEach((tab) => {
  tab.addEventListener("click", () => switchAdminPage(tab.dataset.adminPage));
});

document.querySelector(".dashboard-panels")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-admin-page]");
  if (button) switchAdminPage(button.dataset.adminPage);
});

function askConfirmation(title, message, action) {
  pendingAction = action;
  if (confirmActionTitle) confirmActionTitle.textContent = title;
  if (confirmActionMessage) confirmActionMessage.textContent = message;
  confirmActionDialog?.showModal();
}

document.querySelector("#confirmActionButton")?.addEventListener("click", () => {
  if (typeof pendingAction === "function") pendingAction();
  pendingAction = null;
});

document.querySelector("#openCustomerNotifications")?.addEventListener("click", () => switchView("notifications"));
document.querySelector("#openAdminNotifications")?.addEventListener("click", () => {
  switchView("admin");
  switchAdminPage("notifications");
});
document.querySelector("#customerHeaderProfile")?.addEventListener("click", () => switchView("profile"));

document.querySelector("#customerNotifications")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-toggle-notification]");
  if (!button) return;
  const item = notifications.find((notification) => notification.id === button.dataset.toggleNotification);
  if (item) item.read = !item.read;
  saveNotifications();
  renderNotifications();
});

document.querySelector("#adminNotifications")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-toggle-notification]");
  if (!button) return;
  const item = notifications.find((notification) => notification.id === button.dataset.toggleNotification);
  if (item) item.read = !item.read;
  saveNotifications();
  renderNotifications();
});

document.querySelectorAll("[data-notification-action]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.notificationAction === "clear-all") {
      askConfirmation("Hapus semua notifikasi?", "Semua notifikasi customer akan dihapus.", () => handleNotificationAction("buyer", "clear-all"));
      return;
    }
    handleNotificationAction("buyer", button.dataset.notificationAction);
  });
});

document.querySelectorAll("[data-admin-notification-action]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.adminNotificationAction === "clear-all") {
      askConfirmation("Hapus semua notifikasi admin?", "Semua notifikasi admin akan dihapus.", () => handleNotificationAction("admin", "clear-all"));
      return;
    }
    handleNotificationAction("admin", button.dataset.adminNotificationAction);
  });
});

document.querySelectorAll("[data-toggle-password]").forEach((button) => {
  button.addEventListener("click", () => {
    const input = document.querySelector(`#${button.dataset.togglePassword}`);
    if (!input) return;
    const shouldShow = input.type === "password";
    input.type = shouldShow ? "text" : "password";
    button.textContent = shouldShow ? "Tutup" : "Lihat";
  });
});

buyerLoginForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const button = document.querySelector("#buyerLoginSubmit");
  button?.classList.add("is-loading");
  button?.setAttribute("disabled", "true");
  setTimeout(() => {
    const hadSession = Boolean(currentSession);
    loginBuyer(
      document.querySelector("#buyerLoginEmail").value.trim(),
      document.querySelector("#buyerLoginPassword").value,
      Boolean(document.querySelector("#rememberMe")?.checked),
    );
    button?.classList.remove("is-loading");
    button?.removeAttribute("disabled");
    if (currentSession) buyerLoginForm.reset();
  }, 350);
});

document.querySelector("#buyerLoginPassword")?.addEventListener("keyup", (event) => {
  const warning = document.querySelector("#buyerLoginCaps");
  if (warning) warning.hidden = !event.getModifierState("CapsLock");
});

demoBuyerLogin?.addEventListener("click", () => {
  const savedDemo = buyers.find((buyer) => buyer.email.toLowerCase() === demoBuyer.email.toLowerCase());
  if (savedDemo) {
    Object.assign(savedDemo, { ...demoBuyer, photoHistory: savedDemo.photoHistory || [] });
  } else {
    buyers.unshift({ ...demoBuyer });
  }
  saveBuyers();
  document.querySelector("#buyerLoginEmail").value = demoBuyer.email;
  document.querySelector("#buyerLoginPassword").value = demoBuyer.password;
  loginBuyer(demoBuyer.email, demoBuyer.password, true);
});

buyerRegisterForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  registerBuyer({
    name: document.querySelector("#registerName").value,
    phone: document.querySelector("#registerPhone").value,
    email: document.querySelector("#registerEmail").value,
    password: document.querySelector("#registerPassword").value,
    confirmPassword: document.querySelector("#registerConfirmPassword").value,
  });
  if (currentSession) buyerRegisterForm.reset();
});

mainAdminLoginForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  loginAdmin(
    document.querySelector("#mainAdminUsername").value.trim(),
    document.querySelector("#mainAdminPassword").value.trim(),
  );
  mainAdminLoginForm.reset();
});

profileForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const buyer = currentBuyer();
  if (!buyer) return;

  const nextEmail = document.querySelector("#profileEmail").value.trim().toLowerCase();
  const emailUsed = buyers.some((item) => item.id !== buyer.id && item.email.toLowerCase() === nextEmail);
  if (emailUsed) {
    showToast("Email itu sudah dipakai akun lain.");
    return;
  }

  buyer.name = document.querySelector("#profileName").value.trim();
  buyer.email = nextEmail;
  buyer.phone = document.querySelector("#profilePhone").value.trim();
  buyer.address = document.querySelector("#profileAddress").value.trim();
  const oldPassword = document.querySelector("#profileOldPassword").value;
  const newPassword = document.querySelector("#profileNewPassword").value;
  if (oldPassword || newPassword) {
    if (oldPassword !== buyer.password) {
      showToast("Password lama tidak cocok.");
      return;
    }
    if (!isStrongPassword(newPassword)) {
      showToast("Password baru harus kuat.");
      return;
    }
    buyer.password = newPassword;
    document.querySelector("#profileOldPassword").value = "";
    document.querySelector("#profileNewPassword").value = "";
  }
  currentSession.name = buyer.name;
  saveBuyers();
  saveSession();
  renderProfilePhoto();
  renderCheckoutProfile();
  showToast("Profil berhasil diperbarui.");
});

profileShortcut?.addEventListener("click", () => {
  if (currentSession?.role === "buyer") switchView("profile");
});

profilePhotoInput?.addEventListener("change", (event) => {
  const buyer = currentBuyer();
  const file = event.target.files?.[0];
  if (!buyer || !file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const nextPhoto = String(reader.result);
    const history = buyer.photoHistory || [];
    buyer.photoHistory = buyer.photo
      ? [buyer.photo, ...history.filter((item) => item !== buyer.photo && item !== nextPhoto)].slice(0, 8)
      : history;
    buyer.photo = nextPhoto;
    saveBuyers();
    renderProfilePhoto();
    showToast("Foto profil berhasil diganti.");
  });
  reader.readAsDataURL(file);
  profilePhotoInput.value = "";
});

photoHistory?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-photo-index]");
  const buyer = currentBuyer();
  if (!button || !buyer) return;

  const selected = buyer.photoHistory?.[Number(button.dataset.photoIndex)];
  if (!selected) return;

  const previous = buyer.photo;
  buyer.photo = selected;
  buyer.photoHistory = previous
    ? [previous, ...buyer.photoHistory.filter((item) => item !== selected && item !== previous)].slice(0, 8)
    : buyer.photoHistory.filter((item) => item !== selected);
  saveBuyers();
  renderProfilePhoto();
  showToast("Foto profil lama dipakai lagi.");
});

storeHoursForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  storeHours = {
    open: storeOpenTime.value,
    close: storeCloseTime.value,
  };
  saveStoreHours();
  renderStoreHours();
  showToast("Jam buka toko berhasil diperbarui.");
});

logoutSession?.addEventListener("click", () => {
  logoutDialog?.showModal();
});

document.querySelector("#confirmLogout")?.addEventListener("click", () => {
  currentSession = null;
  cart = [];
  localStorage.removeItem(storageKeys.adminLoggedIn);
  saveSession();
  applySession();
  showToast("Logout Success.");
});

document.querySelector("#searchInput")?.addEventListener("input", (event) => {
  searchTerm = event.target.value;
  renderProducts();
});

sortProducts?.addEventListener("change", (event) => {
  sortMode = event.target.value;
  renderProducts();
});

categoryTabs?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  selectedCategory = button.dataset.category;
  renderCategories();
  renderProducts();
});

productGrid?.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  const buyButton = event.target.closest("[data-buy]");
  const wishlistButton = event.target.closest("[data-wishlist]");
  const detailButton = event.target.closest("[data-detail]");
  if (addButton) addToCart(addButton.dataset.add);
  if (wishlistButton) toggleWishlist(wishlistButton.dataset.wishlist);
  if (detailButton) showProductDetail(detailButton.dataset.detail);
  if (buyButton) {
    addToCart(buyButton.dataset.buy);
    renderCart();
    cartDialog.showModal();
  }
});

document.querySelector("#addFeatured")?.addEventListener("click", () => addToCart("classic-bakers-box"));

document.querySelector("#openCart")?.addEventListener("click", () => {
  renderCart();
  cartDialog.showModal();
});

document.querySelector("#fulfillment")?.addEventListener("change", renderCart);
document.querySelector("#voucherCode")?.addEventListener("input", renderCart);

cartItems?.addEventListener("click", (event) => {
  const increase = event.target.closest("[data-increase]");
  const decrease = event.target.closest("[data-decrease]");
  const remove = event.target.closest("[data-remove-cart]");
  if (increase) changeQuantity(increase.dataset.increase, 1);
  if (decrease) changeQuantity(decrease.dataset.decrease, -1);
  if (remove) {
    cart = cart.filter((entry) => entry.id !== remove.dataset.removeCart);
    renderCart();
    showToast("Item dihapus dari keranjang.");
  }
});

document.querySelector("#checkoutForm")?.addEventListener("submit", submitOrder);

wishlistGrid?.addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove-wishlist]");
  const moveButton = event.target.closest("[data-move-cart]");
  if (removeButton) toggleWishlist(removeButton.dataset.removeWishlist);
  if (moveButton) {
    addToCart(moveButton.dataset.moveCart);
    wishlist = wishlist.filter((id) => id !== moveButton.dataset.moveCart);
    saveWishlist();
    renderWishlist();
    renderProducts();
  }
});

productDetailContent?.addEventListener("click", (event) => {
  const closeButton = event.target.closest("[data-close-detail]");
  const detailButton = event.target.closest("[data-detail]");
  const wishlistButton = event.target.closest("[data-wishlist]");
  const buyButton = event.target.closest("[data-buy]");
  if (closeButton) productDetailDialog.close();
  if (detailButton) showProductDetail(detailButton.dataset.detail);
  if (wishlistButton) toggleWishlist(wishlistButton.dataset.wishlist);
  if (buyButton) {
    addToCart(buyButton.dataset.buy);
    productDetailDialog.close();
    cartDialog.showModal();
  }
});

document.querySelectorAll(".nav-item[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    switchView(button.dataset.view);
    if (button.dataset.adminNav) switchAdminPage(button.dataset.adminNav);
  });
});

adminOrders?.addEventListener("click", (event) => {
  const printButton = event.target.closest("[data-print]");
  const cancelButton = event.target.closest("[data-cancel-order]");
  const detailButton = event.target.closest("[data-detail-order]");
  if (printButton) {
    printReceipt(printButton.dataset.print);
    return;
  }
  if (detailButton) {
    const order = orders.find((item) => item.id === detailButton.dataset.detailOrder);
    if (order) showToast(`${order.id}: ${order.customer}, ${order.items.length} produk, ${formatPrice(order.total)}.`);
    return;
  }
  if (cancelButton) {
    askConfirmation("Batalkan pesanan?", "Customer akan menerima notifikasi pembatalan.", () => updateOrderStatus(cancelButton.dataset.cancelOrder, "Cancelled"));
    return;
  }

  const button = event.target.closest("[data-order][data-status]");
  if (!button) return;
  updateOrderStatus(button.dataset.order, button.dataset.status);
});

function updateOrderStatus(orderId, status) {
  const order = orders.find((item) => item.id === orderId);
  if (!order || !statusFlow.includes(status) || order.status === status) return;
  if (!(allowedStatusTransitions[order.status] || []).includes(status)) {
    showToast("Perubahan status tersebut tidak valid untuk pesanan ini.");
    return;
  }
  const previousStatus = order.status;
  order.status = status;
  if (status === "Cancelled" && previousStatus !== "Cancelled") {
    order.items.forEach((item) => {
      const product = products.find((entry) => entry.id === item.id);
      if (product) product.stock += Math.max(0, Number(item.quantity) || 0);
    });
    saveStocks();
  }
  saveOrders();
  const message = statusMessages[status];
  if (message) {
    addNotification("buyer", {
      buyerId: order.buyerId,
      icon: message[0],
      title: message[1],
      description: message[2],
      eventKey: `order-status-buyer-${order.id}-${status}`,
    });
  }
  if (status === "Cancelled" || status === "Ready for Pickup") {
    addNotification("admin", {
      icon: status === "Cancelled" ? "✕" : "✅",
      title: status === "Cancelled" ? "Pesanan Dibatalkan" : "Pesanan Siap Diambil",
      description: `${order.id} - ${order.customer}`,
      eventKey: `order-status-admin-${order.id}-${status}`,
    });
  }
  renderAll();
  showToast(`Status ${order.id} berhasil diubah.`);
}

adminProducts?.addEventListener("input", (event) => {
  const input = event.target.closest("[data-stock]");
  if (!input) return;
  const product = products.find((item) => item.id === input.dataset.stock);
  if (!product) return;
  product.stock = Math.max(0, Number(input.value || 0));
  saveStocks();
  renderProducts();
  renderCart();
});

adminProducts?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-toggle]");
  const detailButton = event.target.closest("[data-detail]");
  const duplicateButton = event.target.closest("[data-duplicate]");
  const restockButton = event.target.closest("[data-restock]");
  const deleteButton = event.target.closest("[data-delete-product]");
  if (detailButton) showProductDetail(detailButton.dataset.detail);
  if (button) {
    const product = products.find((item) => item.id === button.dataset.toggle);
    if (!product) return;
    product.stock = product.stock > 0 ? 0 : 10;
    saveStocks();
    renderAll();
  }
  if (duplicateButton) {
    const product = products.find((item) => item.id === duplicateButton.dataset.duplicate);
    if (!product) return;
    const copy = { ...product, id: `${product.id}-copy-${Date.now()}`, name: `${product.name} Copy` };
    products.unshift(copy);
    customProducts.unshift(copy);
    saveCustomProducts();
    saveStocks();
    renderAll();
    showToast("Produk berhasil diduplikasi.");
  }
  if (restockButton) {
    const product = products.find((item) => item.id === restockButton.dataset.restock);
    if (!product) return;
    product.stock += 10;
    saveStocks();
    renderAll();
    showToast("Stok ditambah 10.");
  }
  if (deleteButton) {
    const productId = deleteButton.dataset.deleteProduct;
    const product = products.find((item) => item.id === productId);
    pendingDeleteProductId = productId;
    if (deleteProductName) deleteProductName.textContent = product ? `${product.name} akan dihapus dari katalog.` : "Produk akan dihapus dari katalog.";
    deleteProductDialog?.showModal();
  }
});

document.querySelector("#confirmDeleteProduct")?.addEventListener("click", () => {
  if (!pendingDeleteProductId) return;
  const index = products.findIndex((item) => item.id === pendingDeleteProductId);
  if (index >= 0) products.splice(index, 1);
  customProducts = customProducts.filter((item) => item.id !== pendingDeleteProductId);
  wishlist = wishlist.filter((id) => id !== pendingDeleteProductId);
  pendingDeleteProductId = null;
  saveCustomProducts();
  saveWishlist();
  saveStocks();
  renderAll();
  showToast("Produk dihapus.");
});

addProductForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.querySelector("#newProductName").value.trim();
  const category = document.querySelector("#newProductCategory").value;
  const price = Number(document.querySelector("#newProductPrice").value || 0);
  const stock = Number(document.querySelector("#newProductStock").value || 0);
  const image = document.querySelector("#newProductImage").value.trim() || "logo.png";
  const description = document.querySelector("#newProductDescription").value.trim();
  const product = {
    id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
    name,
    category,
    price,
    discount: 0,
    stock,
    status: "Active",
    rating: 4.8,
    sold: 0,
    weight: "120g",
    ingredients: "Flour, butter, milk, sugar",
    allergens: "Gluten, dairy",
    description,
    image,
  };
  products.unshift(product);
  customProducts.unshift(product);
  saveCustomProducts();
  saveStocks();
  addProductForm.reset();
  renderAll();
  showToast("Produk baru berhasil ditambahkan.");
});

document.querySelector("#openForgotPassword")?.addEventListener("click", () => {
  forgotPasswordDialog?.showModal();
});

document.querySelector("#forgotPasswordForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.querySelector("#forgotEmail").value.trim().toLowerCase();
  if (buyers.some((buyer) => buyer.email.toLowerCase() === email)) {
    setText("#forgotMessage", "Password reset link sent.");
  } else {
    setText("#forgotMessage", "Email is not registered.");
  }
});

document.querySelector("#newsletterForm")?.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    event.preventDefault();
    showToast("Follow link simulation.");
  }
});

darkModeToggle?.addEventListener("change", (event) => {
  appSettings.darkMode = event.target.checked;
  saveSettings();
  applySettings();
});

document.querySelector("#quickDarkMode")?.addEventListener("click", () => {
  appSettings.darkMode = !appSettings.darkMode;
  saveSettings();
  applySettings();
});

notificationToggle?.addEventListener("change", (event) => {
  appSettings.notifications = event.target.checked;
  saveSettings();
  showToast(event.target.checked ? "Notification aktif." : "Notification dimatikan.");
});

languageSelect?.addEventListener("change", (event) => {
  appSettings.language = event.target.value;
  saveSettings();
  showToast("Language setting saved.");
});

document.querySelector("#adminSettingsForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  showToast("Bakery settings saved.");
});

document.querySelector("#printReport")?.addEventListener("click", () => window.print());

window.addEventListener("scroll", () => {
  scrollTopButton?.classList.toggle("show", window.scrollY > 300);
});

scrollTopButton?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

adminLoginForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const username = document.querySelector("#adminUsername").value.trim();
  const password = document.querySelector("#adminPassword").value.trim();

  if (loginAdmin(username, password)) {
    adminLoginForm.reset();
    syncAdminAccess();
    renderAll();
  }
});

logoutAdmin?.addEventListener("click", () => {
  currentSession = null;
  localStorage.removeItem(storageKeys.adminLoggedIn);
  saveSession();
  syncAdminAccess();
  showToast("Admin sudah logout.");
});

// Keeps separate tabs on the same browser in sync. This is intentionally only a
// local-development fallback; localStorage cannot synchronize separate devices.
window.addEventListener("storage", (event) => {
  if (!Object.values(storageKeys).includes(event.key)) return;
  const previousOrderIds = new Set(orders.map((order) => order.id));
  loadSavedData(false);
  const receivedNewOrder = currentSession?.role === "admin" && orders.some((order) => !previousOrderIds.has(order.id));
  renderAll();
  if (receivedNewOrder) playAdminNotificationSound();
});

loadSavedData();
syncAdminAccess();
applySession();
renderAll();
setTimeout(() => loadingScreen?.classList.add("hide"), 1700);
