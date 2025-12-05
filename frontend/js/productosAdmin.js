const API_BASE = "http://localhost:8000/api/v1/products/";
let allProducts = [];
let allCategories = [];

// --- Inicialización ---
document.addEventListener("DOMContentLoaded", async () => {
  // Verificar autenticación
  const token = localStorage.getItem("accessToken");
  if (!token) {
    window.location.href = "../Login.html";
    return;
  }

  await fetchCategories();
  await fetchProducts();

  // Event Listeners
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

// --- API Calls ---
async function apiCall(endpoint, method = "GET", body = null) {
  const token = localStorage.getItem("accessToken");
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // Si el body NO es FormData, agregamos Content-Type json
  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const config = {
      method,
      headers,
    };

    if (body) {
      config.body = body instanceof FormData ? body : JSON.stringify(body);
    }

    const res = await fetch(API_BASE + endpoint, config);

    if (res.status === 401) {
      alert("Sesión expirada");
      window.location.href = "../Login.html";
      return null;
    }

    if (!res.ok) throw new Error(await res.text());
    return res.status === 204 ? true : await res.json();
  } catch (e) {
    console.error("API Error:", e);
    alert("Error: " + e.message);
    return null;
  }
}

async function fetchCategories() {
  const data = await apiCall("categories/");
  if (data) {
    allCategories = data;
    populateCategoryFilters();
    populateModalCategories();
  }
}

async function fetchProducts() {
  const data = await apiCall("productos/");
  if (data) {
    allProducts = data;
    renderProducts(allProducts);
  }
}

// --- Renderizado ---
function renderProducts(productsToRender) {
  const tbody = document.getElementById("productsTableBody");
  const countSpan = document.getElementById("showingCount");

  tbody.innerHTML = "";
  countSpan.textContent = productsToRender.length;

  if (productsToRender.length === 0) {
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

  productsToRender.forEach((p) => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-slate-50 transition-colors group";

    let statusBadge = "";
    if (p.stock_quantity > 5) {
      statusBadge = `<span class="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium flex w-fit items-center gap-1"><i class="fa-solid fa-check"></i> En Stock</span>`;
    } else if (p.stock_quantity > 0) {
      statusBadge = `<span class="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium flex w-fit items-center gap-1"><i class="fa-solid fa-triangle-exclamation"></i> Bajo Stock</span>`;
    } else {
      statusBadge = `<span class="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium flex w-fit items-center gap-1"><i class="fa-solid fa-xmark"></i> Agotado</span>`;
    }

    let imageUrl = "https://via.placeholder.com/40";
    if (p.image) {
      imageUrl = p.image.startsWith("http")
        ? p.image
        : `http://localhost:8000${p.image}`;
    } else if (p.custom_attributes && p.custom_attributes.image_url) {
      imageUrl = p.custom_attributes.image_url;
    }

    tr.innerHTML = `
            <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                    <div class="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                        <img src="${imageUrl}" alt="${
      p.name
    }" class="w-full h-full object-cover" onerror="this.src='https://via.placeholder.com/40?text=IMG'">
                    </div>
                    <div>
                        <p class="font-medium text-slate-900">${p.name}</p>
                        <p class="text-xs text-slate-500">${p.brand} - SKU: ${
      p.sku
    }</p>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4">
                <p class="text-slate-700 text-sm">${
                  p.category_name || "Sin Categoría"
                }</p>
            </td>
            <td class="px-6 py-4 font-medium text-slate-900">
                $${parseFloat(p.price).toLocaleString("es-MX", {
                  minimumFractionDigits: 2,
                })}
            </td>
            <td class="px-6 py-4">
                <span class="text-slate-700 font-medium">${
                  p.stock_quantity
                }</span>
                <span class="text-xs text-slate-400">unidades</span>
            </td>
            <td class="px-6 py-4">
                ${statusBadge}
            </td>
            <td class="px-6 py-4 text-right">
                <button onclick='editProduct(${JSON.stringify(p).replace(
                  /'/g,
                  "&#39;"
                )})' class="text-slate-400 hover:text-[#5DADE2] transition-colors mr-2" title="Editar">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button onclick="deleteProduct(${
                  p.id
                })" class="text-slate-400 hover:text-red-500 transition-colors" title="Eliminar">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
    tbody.appendChild(tr);
  });
}

// --- Filtros ---
function populateCategoryFilters() {
  const select = document.getElementById("categoryFilter");
  select.innerHTML = '<option value="">Todas las Categorías</option>';

  allCategories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.name;
    select.appendChild(option);

    if (cat.subcategories) {
      cat.subcategories.forEach((sub) => {
        const subOpt = document.createElement("option");
        subOpt.value = sub.id;
        subOpt.textContent = `- ${sub.name}`;
        select.appendChild(subOpt);
      });
    }
  });
}

function handleFilter() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const categoryId = document.getElementById("categoryFilter").value;
  const statusValue = document.getElementById("statusFilter").value;

  const filtered = allProducts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm) ||
      p.brand.toLowerCase().includes(searchTerm) ||
      p.sku.toLowerCase().includes(searchTerm);

    const matchesCategory = categoryId ? p.category == categoryId : true;

    let matchesStatus = true;
    if (statusValue === "in_stock") matchesStatus = p.stock_quantity > 5;
    if (statusValue === "low_stock")
      matchesStatus = p.stock_quantity > 0 && p.stock_quantity <= 5;
    if (statusValue === "out_of_stock") matchesStatus = p.stock_quantity === 0;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  renderProducts(filtered);
}

// --- Modal y CRUD ---
let isEditing = false;
let currentProductId = null;

function openProductModal() {
  isEditing = false;
  currentProductId = null;
  document.getElementById("modalTitle").textContent = "Nuevo Producto";

  document
    .querySelectorAll("#productModal input")
    .forEach((i) => (i.value = ""));
  document.getElementById("modalCategory").value = "";
  document.getElementById("modalSubcategory").innerHTML =
    '<option value="">Selecciona categoría primero</option>';
  document.getElementById("modalSubcategory").disabled = true;
  document.getElementById("dynamicAttributesSection").classList.add("hidden");

  // Limpiar input de imagen y preview
  const imgInput = document.getElementById("prodImage");
  if (imgInput) imgInput.value = "";
  removeImage();

  toggleModal(true);
}

function editProduct(product) {
  isEditing = true;
  currentProductId = product.id;
  document.getElementById("modalTitle").textContent = "Editar Producto";

  document.getElementById("prodName").value = product.name;
  document.getElementById("prodBrand").value = product.brand;
  document.getElementById("prodModel").value = product.model;
  document.getElementById("prodPrice").value = product.price;
  document.getElementById("prodSku").value = product.sku;
  document.getElementById("prodStock").value = product.stock_quantity;

  // Limpiar imagen previa
  removeImage();

  let parentId = null;
  let subId = null;

  const parent = allCategories.find((c) => c.id == product.category);
  if (parent) {
    parentId = parent.id;
  } else {
    for (const cat of allCategories) {
      if (cat.subcategories) {
        const sub = cat.subcategories.find((s) => s.id == product.category);
        if (sub) {
          parentId = cat.id;
          subId = sub.id;
          break;
        }
      }
    }
  }

  if (parentId) {
    document.getElementById("modalCategory").value = parentId;
    updateModalSubcategories();
    if (subId) {
      document.getElementById("modalSubcategory").value = subId;
    }
  }

  if (product.custom_attributes) {
    for (const [key, value] of Object.entries(product.custom_attributes)) {
      const input = document.querySelector(
        `#dynamicFieldsContainer input[data-attr="${key}"]`
      );
      if (input) {
        input.value = value;
      }
    }
  }

  toggleModal(true);
}

function toggleModal(show) {
  const modal = document.getElementById("productModal");
  const panel = document.getElementById("productModalPanel");
  const overlay = document.getElementById("modalOverlay");

  if (show) {
    modal.classList.remove("hidden");
    setTimeout(() => {
      overlay.classList.remove("opacity-0");
      panel.classList.remove("opacity-0", "scale-95");
      panel.classList.add("opacity-100", "scale-100");
    }, 10);
  } else {
    overlay.classList.add("opacity-0");
    panel.classList.remove("opacity-100", "scale-100");
    panel.classList.add("opacity-0", "scale-95");
    setTimeout(() => modal.classList.add("hidden"), 300);
  }
}

function closeProductModal() {
  toggleModal(false);
}

function populateModalCategories() {
  const select = document.getElementById("modalCategory");
  select.innerHTML = '<option value="">Seleccionar...</option>';
  allCategories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.name;
    select.appendChild(option);
  });
}

function updateModalSubcategories() {
  const categoryId = document.getElementById("modalCategory").value;
  const subSelect = document.getElementById("modalSubcategory");
  const dynamicSection = document.getElementById("dynamicAttributesSection");
  const dynamicContainer = document.getElementById("dynamicFieldsContainer");

  subSelect.innerHTML = '<option value="">Seleccionar...</option>';
  dynamicContainer.innerHTML = "";

  if (!categoryId) {
    subSelect.disabled = true;
    dynamicSection.classList.add("hidden");
    return;
  }

  const category = allCategories.find((c) => c.id == categoryId);
  if (category && category.subcategories && category.subcategories.length > 0) {
    category.subcategories.forEach((sub) => {
      const option = document.createElement("option");
      option.value = sub.id;
      option.textContent = sub.name;
      subSelect.appendChild(option);
    });
    subSelect.disabled = false;
  } else {
    subSelect.disabled = true;
  }

  // Mostrar atributos dinámicos básicos
  dynamicSection.classList.remove("hidden");
  let attributes = [];

  const catName = category.name.toLowerCase();

  // Lógica simple para atributos basada en nombre de categoría
  if (catName.includes("computadoras") || catName.includes("laptops")) {
    attributes = ["Procesador", "RAM", "Almacenamiento", "Gráficos"];
  } else if (catName.includes("cables")) {
    attributes = ["Longitud", "Conector A", "Conector B"];
  } else if (catName.includes("componentes")) {
    attributes = ["Socket", "Velocidad", "Capacidad"];
  } else {
    attributes = ["Color", "Material", "Dimensiones"]; // Default
  }

  attributes.forEach((attr) => {
    const div = document.createElement("div");
    div.innerHTML = `
            <label class="block text-xs font-medium text-slate-700 mb-1">${attr}</label>
            <input type="text" data-attr="${attr}" class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-[#5DADE2] outline-none transition-all" placeholder="Especificar ${attr}">
        `;
    dynamicContainer.appendChild(div);
  });
}

async function deleteProduct(id) {
  if (confirm("¿Estás seguro de eliminar este producto?")) {
    const success = await apiCall(`productos/${id}/`, "DELETE");
    if (success) {
      fetchProducts();
    }
  }
}

async function saveProduct() {
  const name = document.getElementById("prodName").value;
  const brand = document.getElementById("prodBrand").value;
  const model = document.getElementById("prodModel").value;
  const price = document.getElementById("prodPrice").value;
  const sku = document.getElementById("prodSku").value;
  const stock = document.getElementById("prodStock").value;
  const imageInput = document.getElementById("prodImage");

  const catId = document.getElementById("modalCategory").value;
  const subId = document.getElementById("modalSubcategory").value;
  const finalCategoryId = subId || catId;

  const customAttributes = {};
  document
    .querySelectorAll("#dynamicFieldsContainer input")
    .forEach((input) => {
      if (input.dataset.attr && input.value) {
        customAttributes[input.dataset.attr] = input.value;
      }
    });

  if (!name || !price || !sku || !finalCategoryId) {
    alert(
      "Por favor complete los campos obligatorios (Nombre, Precio, SKU, Categoría)."
    );
    return;
  }

  // Crear FormData
  const formData = new FormData();
  formData.append("name", name);
  formData.append("brand", brand);
  formData.append("model", model);
  formData.append("price", price); // El backend lo convertirá a float
  formData.append("sku", sku);
  formData.append("stock_quantity", stock || 0);
  formData.append("category", finalCategoryId);
  formData.append("description", `${name} - ${brand} ${model}`);

  // Serializar custom_attributes como JSON string si es necesario,
  // o el backend de Django REST Framework con JSONField lo maneja si se envía apropiadamente.
  // Para simplificar y compatibilidad, lo enviamos como string parseado en backend o objeto directo si backend soporta multipart anidado (raro).
  // Mejor estrategia: enviar key por key si el backend espera un JSONField,
  // pero como es FormData, lo ideal es enviar un string JSON.
  formData.append("custom_attributes", JSON.stringify(customAttributes));

  // Agregar imagen si existe
  if (imageInput && imageInput.files.length > 0) {
    console.log(
      "📸 Imagen seleccionada:",
      imageInput.files[0].name,
      imageInput.files[0].size,
      "bytes"
    );
    formData.append("image", imageInput.files[0]);
  } else {
    console.log("⚠️ No se seleccionó ninguna imagen");
  }

  // Debug: mostrar contenido del FormData
  console.log("📦 Datos a enviar:");
  for (let pair of formData.entries()) {
    if (pair[0] === "image") {
      console.log(`  ${pair[0]}:`, pair[1].name);
    } else {
      console.log(`  ${pair[0]}:`, pair[1]);
    }
  }

  let success;
  if (isEditing && currentProductId) {
    // En PUT con FormData a veces hay problemas en Django si no es multipart parsing explícito.
    // PATCH es más seguro para actualizaciones parciales con archivos.
    success = await apiCall(
      `productos/${currentProductId}/`,
      "PATCH",
      formData
    );
  } else {
    success = await apiCall("productos/", "POST", formData);
  }

  if (success) {
    alert(
      isEditing
        ? "Producto actualizado exitosamente."
        : "Producto creado exitosamente."
    );
    closeProductModal();
    fetchProducts();
  }
}
