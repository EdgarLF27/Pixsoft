const API_BASE = "http://localhost:8000/api/v1/products/";

let allProducts = [];

// --- Inicialización ---
document.addEventListener("DOMContentLoaded", async () => {
  await fetchProducts();
});

// --- API Calls ---
async function fetchProducts() {
  try {
    const response = await fetch(API_BASE + "productos/");
    if (!response.ok) {
      throw new Error("Error al cargar los productos");
    }
    const data = await response.json();
    allProducts = data;
    renderProducts(allProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    showErrorMessage();
  }
}

// --- Renderizado de Productos ---
function renderProducts(products) {
  const container = document.getElementById("products-grid");

  if (!container) {
    console.error("Container 'products-grid' not found");
    return;
  }

  // Limpiar el contenedor
  container.innerHTML = "";

  if (products.length === 0) {
    container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fa-solid fa-box-open text-5xl text-slate-300 mb-4"></i>
                <p class="text-slate-500 text-lg">No hay productos disponibles en este momento.</p>
            </div>
        `;
    return;
  }

  // Renderizar cada producto
  products.forEach((product) => {
    const productCard = createProductCard(product);
    container.appendChild(productCard);
  });
}

// --- Crear Tarjeta de Producto ---
function createProductCard(product) {
  const card = document.createElement("div");
  card.className =
    "glass-card rounded-xl p-4 flex flex-col group relative bg-white hover:shadow-xl transition-all border border-slate-100";

  // Determinar si es LEASING o VENTA
  const isLeasing =
    product.custom_attributes && product.custom_attributes.tipo === "leasing";

  // Badge de tipo
  const badgeHTML = isLeasing
    ? `<span class="px-2 py-1 rounded bg-pixsoft-primary/10 text-pixsoft-primary text-xs font-bold border border-pixsoft-primary/20">LEASING</span>`
    : `<span class="px-2 py-1 rounded bg-green-100 text-green-600 text-xs font-bold border border-green-200">VENTA</span>`;

  // Imagen del producto (usar placeholder si no hay imagen)
  let imageUrl = "https://via.placeholder.com/300x300?text=Producto";
  if (product.image) {
    imageUrl = product.image.startsWith("http")
      ? product.image
      : `http://localhost:8000${product.image}`;
  } else if (product.custom_attributes?.image_url) {
    imageUrl = product.custom_attributes.image_url;
  }

  // Generar estrellas de rating (simulado, puedes agregar este campo al modelo si lo necesitas)
  const rating = product.custom_attributes?.rating || 4.5;
  const reviews = product.custom_attributes?.reviews || 0;
  const starsHTML = generateStars(rating);

  // Contenido según tipo de producto
  let priceHTML = "";
  let buttonHTML = "";

  if (isLeasing) {
    const monthlyPrice =
      product.custom_attributes?.monthly_price ||
      (product.price / 24).toFixed(2);
    priceHTML = `
            <div class="flex items-end justify-between mb-3">
                <div>
                    <p class="text-xs text-slate-400">Renta mensual desde</p>
                    <p class="text-xl font-bold text-pixsoft-primary">$${parseFloat(
                      monthlyPrice
                    ).toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                    })} <span class="text-xs font-normal text-slate-400">/mes</span></p>
                </div>
            </div>
        `;
    buttonHTML = `
            <button class="w-full py-2 rounded-lg bg-slate-100 hover:bg-pixsoft-secondary border border-slate-200 hover:border-pixsoft-secondary text-slate-700 hover:text-white transition-all font-medium flex items-center justify-center gap-2">
                Ver Planes
            </button>
        `;
  } else {
    const hasDiscount = product.custom_attributes?.original_price;
    const originalPrice = hasDiscount
      ? product.custom_attributes.original_price
      : null;

    priceHTML = `
            <div class="flex items-end justify-between mb-3">
                <div>
                    ${
                      originalPrice
                        ? `<p class="text-xs text-slate-400 line-through">$${parseFloat(
                            originalPrice
                          ).toLocaleString("es-MX")}</p>`
                        : ""
                    }
                    <p class="text-xl font-bold text-slate-900">$${parseFloat(
                      product.price
                    ).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
                </div>
                <span class="text-xs ${
                  product.stock_quantity > 0
                    ? "text-green-600 bg-green-50"
                    : "text-red-600 bg-red-50"
                } font-medium px-2 py-0.5 rounded-full">
                    <i class="fa-solid ${
                      product.stock_quantity > 0
                        ? "fa-check-circle"
                        : "fa-times-circle"
                    } mr-1"></i>
                    ${product.stock_quantity > 0 ? "Stock" : "Agotado"}
                </span>
            </div>
        `;
    buttonHTML = `
            <button onclick="event.stopPropagation(); addToCart(${
              product.id
            })" class="w-full py-2 rounded-lg bg-slate-100 hover:bg-pixsoft-primary border border-slate-200 hover:border-pixsoft-primary text-slate-700 hover:text-white transition-all font-medium flex items-center justify-center gap-2 group/btn" ${
      product.stock_quantity === 0 ? "disabled" : ""
    }>
                <i class="fa-solid fa-cart-plus group-hover/btn:scale-110 transition-transform"></i> Agregar
            </button>
        `;
  }

  // Descripción del producto (para leasing) o rating (para venta)
  const descriptionHTML = isLeasing
    ? `<p class="text-xs text-slate-500 mb-4">${
        product.description || "Producto disponible para arrendamiento"
      }</p>`
    : `<div class="flex items-center gap-2 mb-4">
                <div class="flex text-yellow-400 text-xs">
                    ${starsHTML}
                </div>
                <span class="text-xs text-slate-400">(${reviews})</span>
           </div>`;

  card.innerHTML = `
        <div class="absolute top-4 left-4 z-10">
            ${badgeHTML}
        </div>
        <div class="h-64 w-full flex items-center justify-center mb-4 relative overflow-hidden bg-white">
            <img src="${imageUrl}" alt="${
    product.name
  }" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
        </div>

        <div class="px-2 w-full flex-1 flex flex-col">
            <div class="mb-2">
                <p class="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">${
                  product.brand || "Generico"
                }</p>
                <h3 class="font-bold text-slate-800 leading-tight group-hover:text-pixsoft-primary transition-colors line-clamp-2 min-h-[2.5em]">${
                  product.name
                }</h3>
            </div>
            
            ${descriptionHTML}
            
            <div class="mt-auto">
                ${priceHTML}
                ${buttonHTML}
            </div>
        </div>
    `;

  return card;
}

// --- Generar Estrellas de Rating ---
function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let starsHTML = "";

  for (let i = 0; i < fullStars; i++) {
    starsHTML += '<i class="fa-solid fa-star"></i>';
  }

  if (hasHalfStar) {
    starsHTML += '<i class="fa-solid fa-star-half-stroke"></i>';
  }

  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    starsHTML += '<i class="fa-regular fa-star"></i>';
  }

  return starsHTML;
}

// --- Mostrar Mensaje de Error ---
function showErrorMessage() {
  const container = document.getElementById("products-grid");
  if (container) {
    container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fa-solid fa-exclamation-triangle text-5xl text-red-300 mb-4"></i>
                <p class="text-slate-500 text-lg">Error al cargar los productos.</p>
                <button onclick="location.reload()" class="mt-4 px-6 py-2 bg-pixsoft-primary text-white rounded-lg hover:bg-pixsoft-secondary transition-colors">
                    Reintentar
                </button>
            </div>
        `;
  }
}

// --- Agregar al Carrito ---
function addToCart(productId) {
  // Buscar el producto en la lista de productos
  const product = allProducts.find((p) => p.id === productId);

  if (!product) {
    console.error("Producto no encontrado:", productId);
    return;
  }

  // Verificar stock para productos de venta
  const isLeasing =
    product.custom_attributes && product.custom_attributes.tipo === "leasing";
  if (!isLeasing && product.stock_quantity === 0) {
    alert("Este producto está agotado");
    return;
  }

  // Agregar al carrito usando la función de cart.js
  addProductToCart(product);
}
