/**
 * Renders the Client Navbar component
 * @param {number} cartItemCount - Number of items in cart
 * @param {string} userName - Name of logged in user (optional)
 */
function renderNavbar(cartItemCount = 0, userName = null) {
  const navbarHTML = `
    <nav class="fixed top-0 w-full z-50 nav-glass">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-20 gap-8">
                <!-- Logo -->
                <div class="shrink-0 flex items-center gap-3">
                    <div class="relative w-10 h-10 flex items-center justify-center">
                        <span class="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-br from-[#5DADE2] to-[#85C1E2]" style="font-family: sans-serif;">P</span>
                    </div>
                    <span class="text-2xl font-bold tracking-tight text-black">PIXSOFT</span>
                </div>

                <!-- Search Bar -->
                <div class="flex-1 max-w-2xl hidden md:block">
                    <div class="relative group">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <i class="fa-solid fa-search text-slate-400 group-focus-within:text-pixsoft-primary transition-colors"></i>
                        </div>
                        <input type="text" id="navbar-search"
                            class="block w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pixsoft-primary/50 focus:bg-white transition-all shadow-sm"
                            placeholder="Buscar hardware, componentes, laptops...">
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-4">
                    <div class="relative">
                        <a href="../cart.html" class="p-2 text-slate-600 hover:text-pixsoft-primary transition-colors relative block">
                            <i class="fa-solid fa-cart-shopping text-xl"></i>
                            <span id="cart-item-count" class="absolute -top-1 -right-1 w-5 h-5 bg-pixsoft-primary text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">${cartItemCount}</span>
                        </a>

                        <!-- Cart Dropdown -->
                        <div id="cart-dropdown" class="hidden opacity-0 scale-95 transition-all duration-200 absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                            <!-- Empty Cart Message -->
                            <div id="cart-empty-message" class="p-8 text-center">
                                <i class="fa-solid fa-cart-shopping text-5xl text-slate-300 mb-3"></i>
                                <p class="text-slate-500 font-medium">Tu carrito está vacío</p>
                                <p class="text-slate-400 text-sm mt-1">Agrega productos para comenzar</p>
                            </div>

                            <!-- Cart Content -->
                            <div id="cart-content" class="hidden">
                                <!-- Header -->
                                <div class="px-4 py-3 border-b border-slate-200 bg-slate-50/50">
                                    <div class="flex items-center justify-between">
                                        <h3 class="font-bold text-slate-900">Mi Carrito</h3>
                                        <button onclick="clearCart()" class="text-xs text-red-500 hover:text-red-600 transition-colors font-medium">
                                            Vaciar
                                        </button>
                                    </div>
                                </div>

                                <!-- Cart Items -->
                                <div id="cart-items" class="max-h-80 overflow-y-auto p-2">
                                    <!-- Items will be rendered here by JavaScript -->
                                </div>

                                <!-- Footer -->
                                <div class="border-t border-slate-200 p-4 bg-slate-50/50">
                                    <div class="flex items-center justify-between mb-3">
                                        <span class="text-slate-600 font-medium">Subtotal:</span>
                                        <span id="cart-total" class="text-xl font-bold text-slate-900">$0.00</span>
                                    </div>
                                    <a href="../cart.html" class="block w-full py-2.5 rounded-lg bg-pixsoft-primary hover:bg-pixsoft-secondary text-white text-center font-semibold transition-all shadow-lg shadow-pixsoft-primary/20 hover:-translate-y-0.5">
                                        Ver Carrito Completo
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <a href="profile.html" class="p-2 text-slate-600 hover:text-pixsoft-primary transition-colors relative" title="Mi Perfil">
                        <i class="fa-solid fa-user text-xl"></i>
                    </a>
                    <button id="navbar-logout-btn" class="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 transition-all transform hover:-translate-y-0.5 text-sm font-medium">
                        <i class="fa-solid fa-sign-out-alt"></i>
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Secondary Nav -->
        <div class="border-t border-slate-200 bg-white/50 backdrop-blur-md">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center h-12 gap-8 overflow-x-auto text-sm font-medium text-slate-600 no-scrollbar">
                    <a href="#" class="category-link hover:text-pixsoft-primary transition-colors whitespace-nowrap" data-category="hardware">Hardware</a>
                    <a href="#" class="category-link hover:text-pixsoft-primary transition-colors whitespace-nowrap" data-category="computadoras">Computadoras</a>
                    <a href="#" class="category-link hover:text-pixsoft-primary transition-colors whitespace-nowrap" data-category="laptops">Laptops</a>
                    <a href="#" class="category-link hover:text-pixsoft-primary transition-colors whitespace-nowrap" data-category="arrendamiento">Arrendamiento</a>
                    <a href="#" class="category-link hover:text-pixsoft-primary transition-colors whitespace-nowrap" data-category="software">Software</a>
                    <a href="#" class="category-link hover:text-pixsoft-primary transition-colors whitespace-nowrap" data-category="accesorios">Accesorios</a>
                    <a href="#" class="category-link hover:text-red-500 transition-colors whitespace-nowrap" data-category="ofertas">Ofertas</a>
                </div>
            </div>
        </div>
    </nav>
  `;

  const container = document.getElementById("navbar-container");
  if (container) {
    container.outerHTML = navbarHTML;
    initializeNavbarEvents();
  } else {
    console.error("Navbar container not found");
  }
}

/**
 * Initialize navbar event listeners
 */
function initializeNavbarEvents() {
  const logoutBtn = document.getElementById("navbar-logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = "../Login.html";
    });
  }
}

/**
 * Update cart item count in navbar
 * @param {number} count - New cart item count
 */
function updateNavbarCartCount(count) {
  const cartCountElement = document.getElementById("cart-item-count");
  if (cartCountElement) {
    cartCountElement.textContent = count;
  }
}
