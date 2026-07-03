const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const statusFlow = [
  "Menunggu konfirmasi",
  "Diproses",
  "Siap diambil",
  "Dalam pengantaran",
  "Selesai",
];

const products = [
  {
    id: "croissant-butter",
    name: "Butter Croissant",
    category: "Pastry",
    price: 18000,
    stock: 14,
    description: "Pastry renyah berlapis dengan aroma butter yang kuat.",
    color: "#f6d46d",
    shape: "croissant",
  },
  {
    id: "roti-cokelat",
    name: "Roti Cokelat Lumer",
    category: "Roti Manis",
    price: 12000,
    stock: 22,
    description: "Roti lembut dengan isian cokelat pekat.",
    color: "#b86a35",
    shape: "bun",
  },
  {
    id: "roti-tawar",
    name: "Roti Tawar Susu",
    category: "Roti Tawar",
    price: 26000,
    stock: 7,
    description: "Roti tawar tebal untuk sarapan dan bekal.",
    color: "#f1c681",
    shape: "loaf",
  },
  {
    id: "cheese-roll",
    name: "Cheese Roll",
    category: "Roti Manis",
    price: 15000,
    stock: 4,
    description: "Roti gulung lembut dengan keju gurih.",
    color: "#e8b24c",
    shape: "roll",
  },
  {
    id: "donat-kayu-manis",
    name: "Donat Kayu Manis",
    category: "Pastry",
    price: 10000,
    stock: 0,
    description: "Donat empuk dengan taburan gula kayu manis.",
    color: "#c9793d",
    shape: "donut",
  },
  {
    id: "cake-berry",
    name: "Mini Berry Cake",
    category: "Kue",
    price: 34000,
    stock: 9,
    description: "Kue mini dengan krim ringan dan saus berry.",
    color: "#d85e72",
    shape: "cake",
  },
  {
    id: "kopi-susu",
    name: "Kopi Susu Rotii",
    category: "Minuman",
    price: 16000,
    stock: 18,
    description: "Kopi susu dingin untuk teman pastry.",
    color: "#8d644d",
    shape: "cup",
  },
  {
    id: "morning-box",
    name: "Morning Bread Box",
    category: "Paket",
    price: 72000,
    stock: 6,
    description: "Paket 6 roti campur untuk keluarga atau kantor.",
    color: "#db8d44",
    shape: "box",
  },
];

let selectedCategory = "Semua";
let searchTerm = "";
let cart = [];
let orders = [
  {
    id: "TR-260703-001",
    customer: "Alya",
    phone: "081288889999",
    fulfillment: "Ambil di toko",
    payment: "Bayar di toko",
    note: "Ambil pukul 16.00",
    status: "Diproses",
    total: 56000,
    items: [
      { name: "Butter Croissant", quantity: 2, price: 18000 },
      { name: "Kopi Susu Rotii", quantity: 1, price: 16000 },
    ],
  },
];

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
const toast = document.querySelector("#toast");

function formatPrice(value) {
  return currency.format(value).replace(/\s/g, "");
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
  return products.filter((product) => {
    const matchesCategory = selectedCategory === "Semua" || product.category === selectedCategory;
    const haystack = `${product.name} ${product.category} ${product.description}`.toLowerCase();
    return matchesCategory && haystack.includes(searchTerm.toLowerCase());
  });
}

function renderProducts() {
  const visibleProducts = filteredProducts();
  productSummary.textContent = `${visibleProducts.length} produk cocok dengan pilihan saat ini.`;
  productGrid.innerHTML = visibleProducts
    .map((product) => {
      const stock = stockLabel(product.stock);
      return `
        <article class="product-card">
          <div class="product-art" style="--art-bg: ${product.stock > 0 ? "#fff2dc" : "#f3ece4"}">
            ${productSvg(product)}
          </div>
          <div class="product-body">
            <div class="product-info">
              <h3>${product.name}</h3>
              <p>${product.description}</p>
            </div>
            <div class="product-meta">
              <span>${product.category}</span>
              <span class="status-pill ${stock.className}">${stock.text}</span>
            </div>
            <div class="product-meta">
              <strong class="price">${formatPrice(product.price)}</strong>
              <button class="secondary-button" data-add="${product.id}" ${product.stock <= 0 ? "disabled" : ""} type="button">
                Tambah
              </button>
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

function cartQuantity() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function cartValue() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function renderCart() {
  cartCount.textContent = cartQuantity();
  cartTotal.textContent = formatPrice(cartValue());

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
  if (!orders.length) {
    ordersList.innerHTML = `<div class="empty-state">Belum ada riwayat pesanan.</div>`;
    adminOrders.innerHTML = `<div class="empty-state">Belum ada pesanan masuk.</div>`;
    return;
  }

  const orderCards = orders
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
          <div class="cart-total">
            <span>Total</span>
            <strong>${formatPrice(order.total)}</strong>
          </div>
        </article>
      `,
    )
    .join("");

  ordersList.innerHTML = orderCards;
  adminOrders.innerHTML = orders
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
          <p>${order.fulfillment}${order.note ? ` • ${order.note}` : ""}</p>
          <div class="admin-actions">
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
          </div>
        </article>
      `,
    )
    .join("");
}

function renderAdminProducts() {
  adminProducts.innerHTML = products
    .map((product) => {
      const stock = stockLabel(product.stock);
      return `
        <article class="admin-card">
          <div class="admin-card-header">
            <div>
              <h3>${product.name}</h3>
              <p>${product.category} • ${formatPrice(product.price)}</p>
            </div>
            <span class="status-pill ${stock.className}">${stock.text}</span>
          </div>
          <div class="stock-control">
            <label>
              Stok
              <input type="number" min="0" value="${product.stock}" data-stock="${product.id}" />
            </label>
            <button class="secondary-button" data-toggle="${product.id}" type="button">
              ${product.stock > 0 ? "Kosongkan" : "Aktifkan"}
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function submitOrder(event) {
  event.preventDefault();
  if (!cart.length) {
    showToast("Tambahkan produk dulu sebelum checkout.");
    return;
  }

  const order = {
    id: `TR-260703-${String(orders.length + 1).padStart(3, "0")}`,
    customer: document.querySelector("#customerName").value.trim(),
    phone: document.querySelector("#customerPhone").value.trim(),
    fulfillment: document.querySelector("#fulfillment").value,
    payment: document.querySelector("#paymentMethod").value,
    note: document.querySelector("#orderNote").value.trim(),
    status: "Menunggu konfirmasi",
    total: cartValue(),
    items: cart.map((item) => ({ ...item })),
  };

  order.items.forEach((item) => {
    const product = products.find((entry) => entry.id === item.id);
    if (product) product.stock = Math.max(0, product.stock - item.quantity);
  });

  orders.unshift(order);
  cart = [];
  cartDialog.close();
  renderAll();
  showToast("Pesanan berhasil dibuat dan menunggu konfirmasi.");
  switchView("orders");
}

function switchView(viewName) {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.view === viewName);
  });
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("active", view.id === `${viewName}View`);
  });
}

let toastTimer;
function showToast(message) {
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
}

document.querySelector("#searchInput").addEventListener("input", (event) => {
  searchTerm = event.target.value;
  renderProducts();
});

categoryTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  selectedCategory = button.dataset.category;
  renderCategories();
  renderProducts();
});

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (button) addToCart(button.dataset.add);
});

document.querySelector("#addFeatured").addEventListener("click", () => addToCart("morning-box"));

document.querySelector("#openCart").addEventListener("click", () => {
  renderCart();
  cartDialog.showModal();
});

cartItems.addEventListener("click", (event) => {
  const increase = event.target.closest("[data-increase]");
  const decrease = event.target.closest("[data-decrease]");
  if (increase) changeQuantity(increase.dataset.increase, 1);
  if (decrease) changeQuantity(decrease.dataset.decrease, -1);
});

document.querySelector("#checkoutForm").addEventListener("submit", submitOrder);

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.view));
});

adminOrders.addEventListener("click", (event) => {
  const button = event.target.closest("[data-order][data-status]");
  if (!button) return;
  const order = orders.find((item) => item.id === button.dataset.order);
  if (!order) return;
  order.status = button.dataset.status;
  renderOrders();
  showToast(`Status ${order.id} diperbarui.`);
});

adminProducts.addEventListener("input", (event) => {
  const input = event.target.closest("[data-stock]");
  if (!input) return;
  const product = products.find((item) => item.id === input.dataset.stock);
  if (!product) return;
  product.stock = Math.max(0, Number(input.value || 0));
  renderProducts();
  renderCart();
});

adminProducts.addEventListener("click", (event) => {
  const button = event.target.closest("[data-toggle]");
  if (!button) return;
  const product = products.find((item) => item.id === button.dataset.toggle);
  if (!product) return;
  product.stock = product.stock > 0 ? 0 : 10;
  renderAll();
});

renderAll();
