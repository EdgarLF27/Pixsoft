const API_BASE = "http://localhost:8000/api/v1/products/";

let allProducts = [];
let currentCategory = 'arrendamiento';

// --- Inicialización ---
document.addEventListener("DOMContentLoaded", async () => {
  await fetchProducts();
  setupCategoryFilters();
  setupLogoutButton();
});

// --- Configurar filtros por categoría ---
function setupCategoryFilters() {
  const categoryLinks = document.querySelectorAll('.category-link');

  categoryLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const category = this.getAttribute('data-category');
      filterProductsByCategory(category);
    });
  });
}

// --- Configurar botón de logout ---
function setupLogoutButton() {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      alert('Has cerrado la sesión.');
      window.location.href = '../Login.html';
    });
  }
}

// --- Función global para filtrar productos ---
function filterProductsByCategory(category) {
  currentCategory = category;

  // Actualizar UI de categorías activas
  updateCategoryLinks(category);

  // Actualizar título y descripción
  updateCategoryTitle(category);

  // Filtrar productos según la categoría
  let filteredProducts = [];

  if (allProducts.length === 0) {
    console.log("No hay productos cargados aún");
    showLoadingState();
    return;
  }

  console.log("Filtrando categoría:", category);
  console.log("Total de productos:", allProducts.length);

  if (category === 'todos') {
    filteredProducts = allProducts;
  } else if (category === 'ofertas') {
    // Filtrar productos en oferta
    filteredProducts = allProducts.filter(product => {
      const descuento = product.custom_attributes?.descuento;
      return descuento && parseFloat(descuento) > 0;
    });
  } else {
    // Filtrar por categoría específica - VERSIÓN MEJORADA
    filteredProducts = allProducts.filter(product => {
      try {
        // DEPURACIÓN: Mostrar información del producto
        console.log("Producto para filtrar:", {
          id: product.id,
          name: product.name,
          category: product.category,
          custom_attributes: product.custom_attributes,
          description: product.description
        });

        // Obtener datos del producto
        const tipo = product.custom_attributes?.tipo || '';
        const categoria = product.category || '';
        const descripcion = product.description || '';
        const nombre = product.name || '';

        // Convertir todo a texto en minúsculas
        const tipoText = String(tipo).toLowerCase();
        const categoriaText = String(categoria).toLowerCase();
        const descripcionText = String(descripcion).toLowerCase();
        const nombreText = String(nombre).toLowerCase();

        const searchCategory = category.toLowerCase();
        const searchText = `${tipoText} ${categoriaText} ${descripcionText} ${nombreText}`;

        console.log("Texto de búsqueda:", searchText);
        console.log("Categoría buscada:", searchCategory);

        // Palabras clave para cada categoría (ampliadas)
        const categoryKeywords = {
          'hardware': [
            // Componentes
            'hardware', 'componente', 'tarjeta', 'gráfica', 'procesador', 'cpu', 'gpu',
            'memoria', 'ram', 'disco', 'duro', 'ssd', 'm.2', 'nvme',
            'fuente', 'poder', 'alimentación', 'motherboard', 'placa', 'base',
            'cooler', 'ventilador', 'disipador', 'gabinete', 'chasis',
            // Marcas específicas
            'nvidia', 'geforce', 'rtx', 'gtx',
            'amd', 'radeon', 'ryzen',
            'intel', 'core i', 'i3', 'i5', 'i7', 'i9',
            'corsair', 'kingston', 'samsung', 'wd', 'seagate', 'asus', 'msi', 'gigabyte'
          ],
          'computadoras': [
            'computadora', 'pc', 'escritorio', 'torre', 'desktop',
            'equipo completo', 'all in one', 'aio',
            'workstation', 'estación', 'trabajo',
            'gaming', 'gamer', 'gamers',
            'oficina', 'hogar', 'empresa',
            // Tipos específicos
            'preensamblado', 'ensamblado', 'armado', 'prearmado'
          ],
          'laptops': [
            'laptop', 'portátil', 'notebook', 'ultrabook', 'chromebook',
            'macbook', 'convertible', '2 en 1',
            'gaming', 'gamer',
            'negocios', 'empresarial', 'estudiante',
            // Marcas
            'lenovo', 'hp', 'dell', 'acer', 'asus', 'msi', 'razer', 'apple'
          ],
          'arrendamiento': [
            'arrendamiento', 'leasing', 'renta', 'alquiler',
            'mensual', 'mensualidad', 'por mes',
            // Frases comunes
            'disponible para arrendamiento', 'arrendar', 'rentar'
          ],
          'software': [
            'software', 'licencia', 'programa', 'aplicación', 'app',
            'sistema operativo', 'windows', 'linux', 'macos',
            'office', 'microsoft office', 'word', 'excel', 'powerpoint',
            'antivirus', 'seguridad', 'norton', 'mcafee', 'kaspersky',
            'suite', 'paquete', 'adobe', 'photoshop', 'autocad'
          ],
          'accesorios': [
            'accesorio', 'periférico', 'teclado', 'keyboard', 'mouse',
            'ratón', 'audífono', 'headset', 'auricular',
            'monitor', 'pantalla', 'impresora', 'scanner', 'escáner',
            'webcam', 'cámara web', 'micrófono', 'parlante', 'altavoz',
            'router', 'switch', 'hub', 'docking', 'base',
            'cable', 'adaptador', 'cargador', 'batería'
          ]
        };

        // Buscar coincidencias
        const keywords = categoryKeywords[searchCategory] || [searchCategory];
        let found = false;

        for (const keyword of keywords) {
          if (searchText.includes(keyword.toLowerCase())) {
            console.log(`Coincidencia encontrada: "${keyword}" en "${searchText}"`);
            found = true;
            break;
          }
        }

        console.log("Producto", product.name, "coincide con", category + "?", found);
        return found;

      } catch (error) {
        console.error("Error filtrando producto:", product, error);
        return false;
      }
    });
  }

  console.log(`Filtrando ${category}: ${filteredProducts.length} productos encontrados`);
  renderProducts(filteredProducts);
}

// --- Actualizar enlaces de categoría activa ---
function updateCategoryLinks(category) {
  const categoryLinks = document.querySelectorAll('.category-link');

  categoryLinks.forEach(link => {
    const linkCategory = link.getAttribute('data-category');
    if (linkCategory === category) {
      link.classList.add('text-pixsoft-primary', 'font-semibold');
      link.classList.remove('text-slate-600');
    } else {
      link.classList.remove('text-pixsoft-primary', 'font-semibold');
      link.classList.add('text-slate-600');
    }
  });
}

// --- Actualizar título de categoría ---
function updateCategoryTitle(category) {
  const categoryTitles = {
    'hardware': 'Hardware y Componentes',
    'computadoras': 'Computadoras de Escritorio',
    'laptops': 'Laptops y Portátiles',
    'arrendamiento': 'Productos en Arrendamiento',
    'software': 'Software y Licencias',
    'accesorios': 'Accesorios y Periféricos',
    'ofertas': 'Ofertas Especiales',
    'todos': 'Todos los Productos'
  };

  const categoryDescriptions = {
    'hardware': 'Componentes de PC de alta gama para gamers y profesionales',
    'computadoras': 'PCs completas listas para usar',
    'laptops': 'Portátiles para trabajo, estudio y gaming',
    'arrendamiento': 'Equipos en renta para empresas',
    'software': 'Programas y aplicaciones con licencia oficial',
    'accesorios': 'Todo lo que necesitas para complementar tu setup',
    'ofertas': 'Los mejores precios con descuento especial',
    'todos': 'Todo nuestro catálogo de productos'
  };

  const titleElement = document.querySelector('#category-title h2');
  const descriptionElement = document.getElementById('category-description');

  if (titleElement) {
    titleElement.textContent = categoryTitles[category] || 'Productos';
  }

  if (descriptionElement) {
    descriptionElement.textContent = categoryDescriptions[category] || 'Explora nuestra selección';
  }
}

// --- Mostrar estado de carga ---
function showLoadingState() {
  const container = document.getElementById("products-grid");
  if (container) {
    container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fa-solid fa-spinner fa-spin text-5xl text-pixsoft-primary mb-4"></i>
                <p class="text-slate-500 text-lg">Cargando productos...</p>
            </div>
        `;
  }
}

// --- API Calls ---
async function fetchProducts() {
  try {
    console.log('Conectando a la API...');
    const response = await fetch(API_BASE + "productos/");

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    allProducts = data;
    console.log("✅ Productos cargados:", allProducts.length);

    // Mostrar estructura de los primeros productos para depuración
    if (allProducts.length > 0) {
      console.log("📋 Primer producto (estructura completa):", JSON.stringify(allProducts[0], null, 2));
      console.log("📋 Segundo producto (estructura completa):", allProducts[1] ? JSON.stringify(allProducts[1], null, 2) : "No hay segundo producto");
    }

    // Filtrar inicialmente por arrendamiento
    filterProductsByCategory('arrendamiento');
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    showErrorMessage(error);
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
                <p class="text-slate-500 text-lg">No hay productos en esta categoría.</p>
                <p class="text-slate-400 text-sm mb-4">Intenta con otra categoría o verifica los filtros.</p>
                <button onclick="filterProductsByCategory('todos')" class="mt-4 px-4 py-2 rounded-lg bg-pixsoft-primary text-white text-sm font-medium hover:bg-pixsoft-secondary transition-colors">
                    Ver todos los productos (${allProducts.length})
                </button>
            </div>
        `;
    return;
  }

  // Renderizar cada producto
  products.forEach((product) => {
    try {
      const productCard = createProductCard(product);
      container.appendChild(productCard);
    } catch (error) {
      console.error("Error renderizando producto:", product, error);
    }
  });
}

// --- Crear Tarjeta de Producto ---
function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "glass-card rounded-xl p-4 flex flex-col group relative bg-white hover:shadow-xl transition-all border border-slate-100";

  // Determinar si es LEASING o VENTA
  const tipo = product.custom_attributes?.tipo;
  const isLeasing = tipo && String(tipo).toLowerCase().includes("leasing");

  // Badge de tipo
  const badgeHTML = isLeasing
    ? `<span class="px-2 py-1 rounded bg-pixsoft-primary/10 text-pixsoft-primary text-xs font-bold border border-pixsoft-primary/20">LEASING</span>`
    : `<span class="px-2 py-1 rounded bg-green-100 text-green-600 text-xs font-bold border border-green-200">VENTA</span>`;

  // Imagen del producto - USAR IMAGEN LOCAL SI FALLA
  let imageUrl = "/img/placeholder.jpg"; // Cambia esto a una imagen local
  const defaultImage = "/img/placeholder.jpg"; // Crea esta imagen en tu proyecto

  if (product.image) {
    if (typeof product.image === 'string') {
      if (product.image.startsWith("http")) {
        imageUrl = product.image;
      } else if (product.image.startsWith("/")) {
        imageUrl = `http://localhost:8000${product.image}`;
      } else {
        imageUrl = product.image;
      }
    }
  } else if (product.custom_attributes?.image_url) {
    const imageAttr = product.custom_attributes.image_url;
    if (typeof imageAttr === 'string') {
      imageUrl = imageAttr;
    }
  }

  // Convertir valores a números para cálculos
  const price = parseFloat(product.price) || 0;
  const originalPrice = product.custom_attributes?.original_price ? parseFloat(product.custom_attributes.original_price) : null;
  const descuento = product.custom_attributes?.descuento ? parseFloat(product.custom_attributes.descuento) : 0;

  // Contenido según tipo de producto
  let priceHTML = "";
  let buttonHTML = "";

  if (isLeasing) {
    const monthlyPrice = product.custom_attributes?.monthly_price
      ? parseFloat(product.custom_attributes.monthly_price)
      : (price / 24).toFixed(2);

    priceHTML = `
            <div class="flex items-end justify-between mb-3">
                <div>
                    <p class="text-xs text-slate-400">Renta mensual desde</p>
                    <p class="text-xl font-bold text-pixsoft-primary">$${monthlyPrice.toLocaleString("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })} <span class="text-xs font-normal text-slate-400">/mes</span></p>
                </div>
            </div>
        `;
    buttonHTML = `
            <button onclick="event.stopPropagation(); showLeasingDetails(${product.id})" 
                    class="w-full py-2 rounded-lg bg-slate-100 hover:bg-pixsoft-secondary border border-slate-200 hover:border-pixsoft-secondary text-slate-700 hover:text-white transition-all font-medium flex items-center justify-center gap-2">
                Ver Planes
            </button>
        `;
  } else {
    // Calcular precio con descuento si aplica
    const precioFinal = descuento > 0 ? price * (1 - descuento / 100) : price;

    priceHTML = `
            <div class="flex items-end justify-between mb-3">
                <div>
                    ${descuento > 0 ? `
                        <p class="text-xs text-slate-400 line-through">$${price.toLocaleString("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}</p>
                    ` : ''}
                    <p class="text-xl font-bold text-slate-900">$${precioFinal.toLocaleString("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}</p>
                </div>
                <span class="text-xs ${product.stock_quantity > 0
        ? "text-green-600 bg-green-50"
        : "text-red-600 bg-red-50"
      } font-medium px-2 py-0.5 rounded-full">
                    <i class="fa-solid ${product.stock_quantity > 0
        ? "fa-check-circle"
        : "fa-times-circle"
      } mr-1"></i>
                    ${product.stock_quantity > 0 ? "Stock" : "Agotado"}
                </span>
            </div>
        `;

    buttonHTML = `
            <button onclick="event.stopPropagation(); addToCart(${product.id})" 
                    class="w-full py-2 rounded-lg bg-slate-100 hover:bg-pixsoft-primary border border-slate-200 hover:border-pixsoft-primary text-slate-700 hover:text-white transition-all font-medium flex items-center justify-center gap-2 group/btn" 
                    ${product.stock_quantity === 0 ? "disabled" : ""}>
                <i class="fa-solid fa-cart-plus group-hover/btn:scale-110 transition-transform"></i> Agregar
            </button>
        `;
  }

  // Descripción del producto
  const description = product.description || "Descripción no disponible";
  const descriptionText = typeof description === 'string' ? description : JSON.stringify(description);
  const truncatedDescription = descriptionText.length > 100
    ? descriptionText.substring(0, 100) + '...'
    : descriptionText;

  const descriptionHTML = `<p class="text-xs text-slate-500 mb-4">${truncatedDescription}</p>`;

  // Nombre del producto
  const productName = product.name || "Producto sin nombre";
  const productNameText = typeof productName === 'string' ? productName : JSON.stringify(productName);

  // Marca del producto
  const brand = product.brand || "Generico";
  const brandText = typeof brand === 'string' ? brand : JSON.stringify(brand);

  // Categoría del producto para mostrar
  const category = product.category || product.custom_attributes?.categoria || "Sin categoría";
  const categoryText = typeof category === 'string' ? category : JSON.stringify(category);

  card.innerHTML = `
        <div class="absolute top-4 left-4 z-10">
            ${badgeHTML}
        </div>
        <div class="absolute top-4 right-4 z-10">
            <span class="px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                ${categoryText}
            </span>
        </div>
        <div class="h-64 w-full flex items-center justify-center mb-4 relative overflow-hidden bg-slate-50 rounded-lg">
            <img src="${imageUrl}" alt="${productNameText}" 
                 class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 p-4"
                 onerror="this.onerror=null; this.src='${defaultImage}'; this.classList.add('object-contain', 'p-4'); this.classList.remove('object-cover')">
        </div>

        <div class="px-2 w-full flex-1 flex flex-col">
            <div class="mb-2">
                <p class="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">${brandText}</p>
                <h3 class="font-bold text-slate-800 leading-tight group-hover:text-pixsoft-primary transition-colors line-clamp-2 min-h-[2.5em]">${productNameText}</h3>
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

// --- Mostrar detalles de leasing ---
function showLeasingDetails(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (product) {
    alert(`Detalles de arrendamiento para: ${product.name}\n\nContacta a nuestro equipo para cotizar un plan personalizado.`);
  }
}

// --- Agregar al Carrito ---
function addToCart(productId) {
  const product = allProducts.find(p => p.id === productId);

  if (!product) {
    console.error("Producto no encontrado:", productId);
    return;
  }

  // Verificar stock
  const stock = parseInt(product.stock_quantity) || 0;
  if (stock === 0) {
    alert("Este producto está agotado");
    return;
  }

  // Agregar al carrito
  if (typeof addProductToCart === 'function') {
    addProductToCart(product);
  } else {
    alert(`Producto "${product.name}" agregado al carrito`);
    // Actualizar contador del carrito
    const cartCount = document.getElementById('cart-item-count');
    let currentCount = parseInt(cartCount.textContent) || 0;
    cartCount.textContent = currentCount + 1;
  }
}

// --- Mostrar Mensaje de Error ---
function showErrorMessage(error) {
  const container = document.getElementById("products-grid");
  if (container) {
    let errorMessage = "Error al cargar los productos.";
    let errorDetails = "";

    if (error.message.includes("Failed to fetch") || error.message.includes("ERR_CONNECTION_REFUSED")) {
      errorMessage = "No se puede conectar al servidor";
      errorDetails = "Verifica que el backend esté funcionando en: " + API_BASE;
    } else if (error.message) {
      errorDetails = error.message;
    }

    container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fa-solid fa-exclamation-triangle text-5xl text-red-300 mb-4"></i>
                <p class="text-slate-500 text-lg">${errorMessage}</p>
                ${errorDetails ? `<p class="text-slate-400 text-sm mb-4">${errorDetails}</p>` : ''}
                <button onclick="fetchProducts()" class="mt-4 px-6 py-2 bg-pixsoft-primary text-white rounded-lg hover:bg-pixsoft-secondary transition-colors">
                    Reintentar
                </button>
            </div>
        `;
  }
}