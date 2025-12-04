// Mock Data
const categories = {
  computadoras: {
    label: "Computadoras",
    subcategories: ["Laptops", "Desktops", "All-in-One", "Servidores"],
    attributes: [
      {
        id: "cpu",
        label: "Procesador",
        type: "text",
        placeholder: "Ej. Intel Core i7",
      },
      {
        id: "ram",
        label: "Memoria RAM",
        type: "text",
        placeholder: "Ej. 16GB DDR4",
      },
      {
        id: "storage",
        label: "Almacenamiento",
        type: "text",
        placeholder: "Ej. 512GB SSD",
      },
      {
        id: "gpu",
        label: "Tarjeta Gráfica",
        type: "text",
        placeholder: "Ej. NVIDIA RTX 3060",
      },
    ],
  },
  componentes: {
    label: "Componentes",
    subcategories: [
      "Procesadores",
      "Tarjetas Madre",
      "Memorias RAM",
      "Discos Duros",
      "Fuentes de Poder",
      "Gabinetes",
    ],
    attributes: [
      {
        id: "socket",
        label: "Socket/Factor de Forma",
        type: "text",
        placeholder: "Ej. AM4, ATX",
      },
      {
        id: "speed",
        label: "Velocidad/Frecuencia",
        type: "text",
        placeholder: "Ej. 3200MHz",
      },
    ],
  },
  cables: {
    label: "Cables y Adaptadores",
    subcategories: [
      "HDMI",
      "USB",
      "Ethernet",
      "VGA/DVI",
      "Audio",
      "Adaptadores de Corriente",
    ],
    attributes: [
      {
        id: "length",
        label: "Longitud",
        type: "text",
        placeholder: "Ej. 1.5m",
      },
      {
        id: "connector_a",
        label: "Conector A",
        type: "text",
        placeholder: "Ej. USB-C Macho",
      },
      {
        id: "connector_b",
        label: "Conector B",
        type: "text",
        placeholder: "Ej. HDMI Hembra",
      },
    ],
  },
  perifericos: {
    label: "Periféricos",
    subcategories: ["Monitores", "Teclados", "Mouse", "Impresoras", "Webcams"],
    attributes: [
      {
        id: "connectivity",
        label: "Conectividad",
        type: "text",
        placeholder: "Ej. Inalámbrico, USB",
      },
      { id: "color", label: "Color", type: "text", placeholder: "Ej. Negro" },
    ],
  },
  redes: {
    label: "Conectividad y Redes",
    subcategories: ["Routers", "Switches", "Access Points", "Tarjetas de Red"],
    attributes: [
      {
        id: "speed",
        label: "Velocidad",
        type: "text",
        placeholder: "Ej. 1000 Mbps",
      },
      { id: "ports", label: "Puertos", type: "number", placeholder: "Ej. 8" },
    ],
  },
};

let products = [
  {
    id: 1,
    name: "Laptop HP Pavilion 15",
    brand: "HP",
    category: "computadoras",
    subcategory: "Laptops",
    price: 15499.0,
    stock: 12,
    status: "in_stock",
    image: "https://placehold.co/100x100/png",
  },
  {
    id: 2,
    name: "Cable HDMI 2.1 8K",
    brand: "Ugreen",
    category: "cables",
    subcategory: "HDMI",
    price: 299.0,
    stock: 45,
    status: "in_stock",
    image: "https://placehold.co/100x100/png",
  },
  {
    id: 3,
    name: "Procesador AMD Ryzen 5 5600X",
    brand: "AMD",
    category: "componentes",
    subcategory: "Procesadores",
    price: 3200.0,
    stock: 3,
    status: "low_stock",
    image: "https://placehold.co/100x100/png",
  },
  {
    id: 4,
    name: "Monitor LG UltraGear 27''",
    brand: "LG",
    category: "perifericos",
    subcategory: "Monitores",
    price: 5800.0,
    stock: 0,
    status: "out_of_stock",
    image: "https://placehold.co/100x100/png",
  },
  {
    id: 5,
    name: "Router TP-Link Archer AX50",
    brand: "TP-Link",
    category: "redes",
    subcategory: "Routers",
    price: 1200.0,
    stock: 8,
    status: "in_stock",
    image: "https://placehold.co/100x100/png",
  },
];

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  populateCategoryFilters();
  populateModalCategories();

  // Event Listeners for Filters
  document
    .getElementById("searchInput")
    .addEventListener("input", handleFilter);
  document
    .getElementById("categoryFilter")
    .addEventListener("change", handleFilter);
  document
    .getElementById("statusFilter")
    .addEventListener("change", handleFilter);
});

// Render Functions
function renderProducts(filteredProducts = products) {
  const tbody = document.getElementById("productsTableBody");
  const countSpan = document.getElementById("showingCount");

  tbody.innerHTML = "";
  countSpan.textContent = filteredProducts.length;

  if (filteredProducts.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center text-slate-500">
                    <i class="fa-solid fa-box-open text-3xl mb-2 opacity-30"></i>
                    <p>No se encontraron productos.</p>
                </td>
            </tr>
        `;
    return;
  }

  filteredProducts.forEach((product) => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-slate-50 transition-colors group";

    const categoryLabel =
      categories[product.category]?.label || product.category;

    let statusBadge = "";
    if (product.status === "in_stock") {
      statusBadge = `<span class="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium flex w-fit items-center gap-1"><i class="fa-solid fa-check"></i> En Stock</span>`;
    } else if (product.status === "low_stock") {
      statusBadge = `<span class="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium flex w-fit items-center gap-1"><i class="fa-solid fa-triangle-exclamation"></i> Bajo Stock</span>`;
    } else {
      statusBadge = `<span class="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium flex w-fit items-center gap-1"><i class="fa-solid fa-xmark"></i> Agotado</span>`;
    }

    tr.innerHTML = `
            <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                        <i class="fa-solid fa-image text-slate-300"></i>
                    </div>
                    <div>
                        <p class="font-medium text-slate-900">${
                          product.name
                        }</p>
                        <p class="text-xs text-slate-500">${product.brand}</p>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4">
                <p class="text-slate-700 text-sm">${categoryLabel}</p>
                <p class="text-xs text-slate-400">${product.subcategory}</p>
            </td>
            <td class="px-6 py-4 font-medium text-slate-900">
                $${product.price.toLocaleString("es-MX", {
                  minimumFractionDigits: 2,
                })}
            </td>
            <td class="px-6 py-4">
                <span class="text-slate-700 font-medium">${product.stock}</span>
                <span class="text-xs text-slate-400">unidades</span>
            </td>
            <td class="px-6 py-4">
                ${statusBadge}
            </td>
            <td class="px-6 py-4 text-right">
                <button class="text-slate-400 hover:text-[#5DADE2] transition-colors mr-2" title="Editar">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="text-slate-400 hover:text-red-500 transition-colors" title="Eliminar" onclick="deleteProduct(${
                  product.id
                })">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
    tbody.appendChild(tr);
  });
}

function populateCategoryFilters() {
  const select = document.getElementById("categoryFilter");
  for (const [key, value] of Object.entries(categories)) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = value.label;
    select.appendChild(option);
  }
}

function handleFilter() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const categoryValue = document.getElementById("categoryFilter").value;
  const statusValue = document.getElementById("statusFilter").value;

  const filtered = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm) ||
      product.brand.toLowerCase().includes(searchTerm);
    const matchesCategory = categoryValue
      ? product.category === categoryValue
      : true;
    const matchesStatus = statusValue ? product.status === statusValue : true;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  renderProducts(filtered);
}

// Modal Logic
// Modal Logic
function openProductModal() {
  const modal = document.getElementById("productModal");
  const panel = document.getElementById("productModalPanel");
  const overlay = document.getElementById("modalOverlay");

  modal.classList.remove("hidden");

  // Small delay to allow display:block to apply before animating opacity
  setTimeout(() => {
    overlay.classList.remove("opacity-0");
    panel.classList.remove("opacity-0", "scale-95");
    panel.classList.add("opacity-100", "scale-100");
  }, 10);
}

function closeProductModal() {
  const modal = document.getElementById("productModal");
  const panel = document.getElementById("productModalPanel");
  const overlay = document.getElementById("modalOverlay");

  overlay.classList.add("opacity-0");
  panel.classList.remove("opacity-100", "scale-100");
  panel.classList.add("opacity-0", "scale-95");

  setTimeout(() => {
    modal.classList.add("hidden");
  }, 300);
}

function populateModalCategories() {
  const select = document.getElementById("modalCategory");
  for (const [key, value] of Object.entries(categories)) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = value.label;
    select.appendChild(option);
  }
}

function updateModalSubcategories() {
  const categoryKey = document.getElementById("modalCategory").value;
  const subSelect = document.getElementById("modalSubcategory");
  const dynamicSection = document.getElementById("dynamicAttributesSection");
  const dynamicContainer = document.getElementById("dynamicFieldsContainer");

  subSelect.innerHTML = '<option value="">Seleccionar...</option>';
  dynamicContainer.innerHTML = "";

  if (!categoryKey) {
    subSelect.disabled = true;
    dynamicSection.classList.add("hidden");
    return;
  }

  // Populate Subcategories
  const categoryData = categories[categoryKey];
  categoryData.subcategories.forEach((sub) => {
    const option = document.createElement("option");
    option.value = sub;
    option.textContent = sub;
    subSelect.appendChild(option);
  });
  subSelect.disabled = false;

  // Render Dynamic Attributes
  if (categoryData.attributes && categoryData.attributes.length > 0) {
    dynamicSection.classList.remove("hidden");
    categoryData.attributes.forEach((attr) => {
      const div = document.createElement("div");
      div.innerHTML = `
                <label class="block text-xs font-medium text-slate-700 mb-1">${attr.label}</label>
                <input type="${attr.type}" class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-[#5DADE2] outline-none transition-all" placeholder="${attr.placeholder}">
            `;
      dynamicContainer.appendChild(div);
    });
  } else {
    dynamicSection.classList.add("hidden");
  }
}

function deleteProduct(id) {
  if (confirm("¿Estás seguro de eliminar este producto?")) {
    products = products.filter((p) => p.id !== id);
    handleFilter(); // Re-render with current filters
  }
}
