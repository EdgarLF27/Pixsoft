// ===== SHOPPING CART MANAGEMENT =====

let cart = [];

// --- Inicialización ---
document.addEventListener("DOMContentLoaded", () => {
  loadCart();
  updateCartCounter();
  setupCartListeners();
});

// --- Setup Event Listeners ---
function setupCartListeners() {
  const cartIcon = document.querySelector('a[href="../cart.html"]');
  if (cartIcon) {
    cartIcon.addEventListener("click", (e) => {
      e.preventDefault();
      toggleCartDropdown();
    });
  }

  // Cerrar dropdown al hacer clic fuera
  document.addEventListener("click", (e) => {
    const dropdown = document.getElementById("cart-dropdown");
    const cartIcon = document.querySelector('a[href="../cart.html"]');

    if (
      dropdown &&
      !dropdown.contains(e.target) &&
      !cartIcon.contains(e.target)
    ) {
      closeCartDropdown();
    }
  });
}

// --- LocalStorage Functions ---
function saveCart() {
  localStorage.setItem("pixsoft_cart", JSON.stringify(cart));
}

function loadCart() {
  const savedCart = localStorage.getItem("pixsoft_cart");
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
    } catch (e) {
      console.error("Error loading cart:", e);
      cart = [];
    }
  }
}

// --- Add to Cart ---
function addProductToCart(product) {
  // Verificar si el producto ya está en el carrito
  const existingProduct = cart.find((item) => item.id === product.id);

  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image:
        product.custom_attributes?.image_url ||
        "https://via.placeholder.com/100x100?text=Producto",
      quantity: 1,
    });
  }

  saveCart();
  updateCartCounter();
  renderCartDropdown();
  openCartDropdown();

  // Mostrar notificación
  showNotification("Producto agregado al carrito");
}

// --- Remove from Cart ---
function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  updateCartCounter();
  renderCartDropdown();
}

// --- Update Quantity ---
function updateQuantity(productId, change) {
  const product = cart.find((item) => item.id === productId);
  if (product) {
    product.quantity += change;

    if (product.quantity <= 0) {
      removeFromCart(productId);
    } else {
      saveCart();
      renderCartDropdown();
      updateCartCounter();
    }
  }
}

// --- Update Cart Counter ---
function updateCartCounter() {
  const counter = document.getElementById("cart-item-count");
  if (counter) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    counter.textContent = totalItems;
  }
}

// --- Calculate Total ---
function calculateTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// --- Toggle Dropdown ---
function toggleCartDropdown() {
  const dropdown = document.getElementById("cart-dropdown");
  if (dropdown) {
    if (dropdown.classList.contains("hidden")) {
      openCartDropdown();
    } else {
      closeCartDropdown();
    }
  }
}

function openCartDropdown() {
  const dropdown = document.getElementById("cart-dropdown");
  if (dropdown) {
    renderCartDropdown();
    dropdown.classList.remove("hidden");
    setTimeout(() => {
      dropdown.classList.remove("opacity-0", "scale-95");
      dropdown.classList.add("opacity-100", "scale-100");
    }, 10);
  }
}

function closeCartDropdown() {
  const dropdown = document.getElementById("cart-dropdown");
  if (dropdown) {
    dropdown.classList.remove("opacity-100", "scale-100");
    dropdown.classList.add("opacity-0", "scale-95");
    setTimeout(() => {
      dropdown.classList.add("hidden");
    }, 200);
  }
}

// --- Render Cart Dropdown ---
function renderCartDropdown() {
  const dropdown = document.getElementById("cart-dropdown");
  if (!dropdown) return;

  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const emptyMessage = document.getElementById("cart-empty-message");
  const cartContent = document.getElementById("cart-content");

  if (cart.length === 0) {
    emptyMessage.classList.remove("hidden");
    cartContent.classList.add("hidden");
    return;
  }

  emptyMessage.classList.add("hidden");
  cartContent.classList.remove("hidden");

  // Renderizar items
  cartItems.innerHTML = cart
    .map(
      (item) => `
        <div class="flex gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors group">
            <div class="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                <img src="${item.image}" alt="${
        item.name
      }" class="w-full h-full object-contain">
            </div>
            <div class="flex-1 min-w-0">
                <h4 class="text-sm font-semibold text-slate-800 line-clamp-2 mb-1">${
                  item.name
                }</h4>
                <p class="text-sm font-bold text-slate-900">$${parseFloat(
                  item.price
                ).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
                <div class="flex items-center gap-2 mt-1">
                    <button onclick="event.stopPropagation(); updateQuantity(${
                      item.id
                    }, -1)" class="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 transition-colors">
                        <i class="fa-solid fa-minus text-xs"></i>
                    </button>
                    <span class="text-sm font-medium text-slate-700 w-8 text-center">${
                      item.quantity
                    }</span>
                    <button onclick="event.stopPropagation(); updateQuantity(${
                      item.id
                    }, 1)" class="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 transition-colors">
                        <i class="fa-solid fa-plus text-xs"></i>
                    </button>
                </div>
            </div>
            <button onclick="event.stopPropagation(); removeFromCart(${
              item.id
            })" class="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 self-start">
                <i class="fa-solid fa-trash text-sm"></i>
            </button>
        </div>
    `
    )
    .join("");

  // Actualizar total
  const total = calculateTotal();
  cartTotal.textContent = `$${total.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
  })}`;
}

// --- Notification ---
function showNotification(message) {
  // Crear elemento de notificación
  const notification = document.createElement("div");
  notification.className =
    "fixed top-24 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-0 opacity-100";
  notification.innerHTML = `
        <div class="flex items-center gap-2">
            <i class="fa-solid fa-check-circle"></i>
            <span class="font-medium">${message}</span>
        </div>
    `;

  document.body.appendChild(notification);

  // Animar entrada
  setTimeout(() => {
    notification.classList.add("translate-x-0");
  }, 10);

  // Remover después de 3 segundos
  setTimeout(() => {
    notification.classList.add("translate-x-full", "opacity-0");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// --- Clear Cart ---
function clearCart() {
  if (confirm("¿Estás seguro de vaciar el carrito?")) {
    cart = [];
    saveCart();
    updateCartCounter();
    renderCartDropdown();
  }
}
