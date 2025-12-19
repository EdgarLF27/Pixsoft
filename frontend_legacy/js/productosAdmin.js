/**
 * Product Management Logic
 * Uses Table, Modal, Toast components and API utilities
 */

// Globals
let productTable;
let productModal;
let allCategories = [];
let currentProduct = null;
let isEditing = false;

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Initialize Sidebar
  if (typeof renderSidebar === "function") renderSidebar("productos");

  // 2. Initialize Components
  initializeTable();
  initializeModal();

  // 3. Load Initial Data
  await loadCategories();
  await loadProducts();

  // 4. Setup Global Listeners
  setupFilters();
  setupImagePreview();
});

// --- Initialization ---

function initializeTable() {
  productTable = new Table({
    containerId: "products-table-container",
    columns: [
      {
        key: "name",
        label: "Producto",
        sortable: true,
        render: (val, row) => {
          let img = row.image;
          if (img && !img.startsWith("http"))
            img = API_BASE.replace("/api/v1/", "") + img;
          if (!img) img = "https://via.placeholder.com/40?text=IMG";

          return `
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                <img src="${img}" alt="${val}" class="w-full h-full object-cover" onerror="this.src='https://via.placeholder.com/40?text=IMG'">
                            </div>
                            <div>
                                <p class="font-medium text-slate-900 line-clamp-1">${val}</p>
                                <p class="text-xs text-slate-500">${
                                  row.brand || ""
                                } <span class="text-slate-300">|</span> SKU: ${
            row.sku || "N/A"
          }</p>
                            </div>
                        </div>
                    `;
        },
      },
      {
        key: "category_name",
        label: "Categoría",
        sortable: true,
        render: (val) =>
          `<span class="text-slate-600">${val || "Sin Categoría"}</span>`,
      },
      {
        key: "price",
        label: "Precio",
        sortable: true,
        render: (val) =>
          `<span class="font-medium text-slate-900">${formatCurrency(
            val
          )}</span>`,
      },
      {
        key: "stock_quantity",
        label: "Stock",
        sortable: true,
        render: (val) => {
          const stock = parseInt(val) || 0;
          return `<span class="text-slate-700 font-medium">${stock}</span> <span class="text-xs text-slate-400">unid.</span>`;
        },
      },
      {
        key: "status",
        label: "Estado",
        render: (_, row) => {
          const stock = parseInt(row.stock_quantity) || 0;
          if (stock > 5)
            return `<span class="badge badge-success"><i class="fa-solid fa-check mr-1"></i>En Stock</span>`;
          if (stock > 0)
            return `<span class="badge badge-warning"><i class="fa-solid fa-triangle-exclamation mr-1"></i>Bajo Stock</span>`;
          return `<span class="badge badge-error"><i class="fa-solid fa-xmark mr-1"></i>Agotado</span>`;
        },
      },
      {
        key: "actions",
        label: "Acciones",
        alignment: "right",
        render: (_, row) => `
                    <div class="flex items-center justify-end gap-2">
                        <button onclick="editProduct('${row.id}')" class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button onclick="deleteProduct('${row.id}')" class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                `,
      },
    ],
    itemsPerPage: 10,
    emptyState: {
      icon: "fa-solid fa-box-open",
      title: "No se encontraron productos",
      message: "Intenta ajustar los filtros o agrega un nuevo producto.",
    },
  });

  // Handle pagination change implicitly by the component
}

function initializeModal() {
  productModal = new Modal({
    title: "Nuevo Producto",
    content: getProductFormHTML(),
    size: "2xl",
    buttons: [
      {
        text: "Cancelar",
        class:
          "px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors",
        onClick: () => productModal.close(),
      },
      {
        text: "Guardar Producto",
        class: "btn-primary",
        onClick: handleSaveProduct, // Call function to handle save
      },
    ],
    onOpen: () => {
      // Re-attach event listeners if needed when modal opens
      // (Not strictly necessary if form is static, but dynamic cats need re-populating)
      populateModalCategories(isEditing ? currentProduct?.category : null);
    },
    onClose: () => {
      resetForm();
    },
  });
}

// --- Data Loading ---

async function loadCategories() {
  try {
    allCategories = await api.get("products/categories/");
    populateFilterCategories();
  } catch (error) {
    console.error("Error loading categories:", error);
    Toast.show({ type: "error", message: "Error al cargar categorías" });
  }
}

async function loadProducts() {
  try {
    const loadingContainer = document.getElementById(
      "products-table-container"
    );
    if (loadingContainer)
      loadingContainer.innerHTML = Loading.spinner("Cargando productos...");

    const products = await api.get("products/productos/");

    // Use Global allProducts for client-side filtering if API doesn't support filter params yet
    // Or just pass to table
    window.allProductsCache = products; // Store for filtering
    productTable.render(products);

    // Update counts
    const countEl = document.getElementById("showingCount");
    if (countEl) countEl.textContent = products.length;
  } catch (error) {
    console.error("Error loading products:", error);
    const container = document.getElementById("products-table-container");
    if (container)
      container.innerHTML = Loading.error(
        "No se pudieron cargar los productos"
      );
  }
}

// --- Filtering ---

function setupFilters() {
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const statusFilter = document.getElementById("statusFilter");

  const handleFilter = () => {
    const search = searchInput.value.toLowerCase();
    const catId = categoryFilter.value;
    const status = statusFilter.value;

    const filtered = window.allProductsCache.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search) ||
        (p.sku && p.sku.toLowerCase().includes(search));

      const matchesCategory = !catId || p.category == catId; // Note: type coercion intended

      let matchesStatus = true;
      if (status === "in_stock") matchesStatus = p.stock_quantity > 5;
      if (status === "low_stock")
        matchesStatus = p.stock_quantity > 0 && p.stock_quantity <= 5;
      if (status === "out_of_stock") matchesStatus = p.stock_quantity == 0;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    productTable.render(filtered);

    const countEl = document.getElementById("showingCount");
    if (countEl) countEl.textContent = filtered.length;
  };

  searchInput.addEventListener("input", handleFilter);
  categoryFilter.addEventListener("change", handleFilter);
  statusFilter.addEventListener("change", handleFilter);
}

function populateFilterCategories() {
  const select = document.getElementById("categoryFilter");
  select.innerHTML = '<option value="">Todas las Categorías</option>';

  allCategories.forEach((cat) => {
    select.add(new Option(cat.name, cat.id));
    if (cat.subcategories) {
      cat.subcategories.forEach((sub) => {
        select.add(new Option(`- ${sub.name}`, sub.id));
      });
    }
  });
}

// --- CRUD Actions ---

window.openCreateModal = function () {
  isEditing = false;
  currentProduct = null;
  productModal.updateTitle("Nuevo Producto");
  resetForm();
  productModal.open();
  attachFormListeners(); // Re-attach listener for subcategories
};

window.editProduct = function (id) {
  const product = window.allProductsCache.find((p) => p.id == id);
  if (!product) return;

  isEditing = true;
  currentProduct = product;

  productModal.updateTitle("Editar Producto");
  productModal.open();

  // Fill Form
  fillForm(product);
  attachFormListeners();
};

window.deleteProduct = async function (id) {
  // Uses Modal.confirm
  Modal.confirm({
    title: "Eliminar Producto",
    message:
      "¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.",
    onConfirm: async () => {
      try {
        await api.delete(`products/productos/${id}/`);
        Toast.show({
          type: "success",
          message: "Producto eliminado correctamente",
        });
        loadProducts();
      } catch (error) {
        console.error("Delete error:", error);
        Toast.show({ type: "error", message: "Error al eliminar el producto" });
      }
    },
  });
};

async function handleSaveProduct() {
  // Validate
  const form = document.querySelector("#productModalPanel form");
  // Manual validation since button is outside form
  const name = document.getElementById("prodName").value;
  const price = document.getElementById("prodPrice").value;
  const sku = document.getElementById("prodSku").value;
  const stock = document.getElementById("prodStock").value;
  const category = document.getElementById("modalCategory").value;
  const subcategory = document.getElementById("modalSubcategory").value;
  const finalCategory = subcategory || category;

  if (!name || !price || !sku || !finalCategory) {
    Toast.show({
      type: "warning",
      message: "Por favor completa todos los campos obligatorios (*)",
    });
    return;
  }

  // Build FormData
  const formData = new FormData();
  formData.append("name", name);
  formData.append("price", price);
  formData.append("sku", sku);
  formData.append("stock_quantity", stock || 0);
  formData.append("category", finalCategory);

  // Optional fields
  const brand = document.getElementById("prodBrand").value;
  const model = document.getElementById("prodModel").value;
  if (brand) formData.append("brand", brand);
  if (model) formData.append("model", model);

  // Image
  const imageInput = document.getElementById("prodImage");
  if (imageInput.files[0]) {
    formData.append("image", imageInput.files[0]);
  }

  // Custom attrs logic could be added here if needed

  try {
    const btn = document.querySelector(".btn-primary"); // The save button
    if (btn) {
      btn.disabled = true;
      btn.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Guardando...';
    }

    if (isEditing && currentProduct) {
      await api.patch(`products/productos/${currentProduct.id}/`, formData);
      Toast.show({ type: "success", message: "Producto actualizado" });
    } else {
      await api.post("products/productos/", formData);
      Toast.show({ type: "success", message: "Producto creado" });
    }

    productModal.close();
    loadProducts();
  } catch (error) {
    console.error("Save error:", error);
    Toast.show({
      type: "error",
      message: "Error al guardar el producto. Verifica los datos.",
    });
  } finally {
    // Reset button state managed by reconstruction of modal or manual reset
    // Since modal closes, we don't need to manually reset button usually
  }
}

// --- Form Helpers ---

function getProductFormHTML() {
  return `
        <form class="space-y-6" onsubmit="event.preventDefault();">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-slate-700 mb-2">Nombre del Producto *</label>
                    <input type="text" id="prodName" class="input-field w-full" placeholder="Ej: Monitor Gaming" required>
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Marca</label>
                    <input type="text" id="prodBrand" class="input-field w-full" placeholder="Ej: Samsung">
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Modelo</label>
                    <input type="text" id="prodModel" class="input-field w-full" placeholder="Ej: Odyssey G5">
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Precio *</label>
                    <div class="relative">
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                        <input type="number" id="prodPrice" class="input-field w-full pl-8" placeholder="0.00" step="0.01" min="0" required>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">SKU *</label>
                    <input type="text" id="prodSku" class="input-field w-full" placeholder="Ej: MON-001" required>
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Stock</label>
                    <input type="number" id="prodStock" class="input-field w-full" placeholder="0" min="0" value="0">
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Categoría *</label>
                    <select id="modalCategory" class="input-field w-full" required>
                        <option value="">Seleccionar...</option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Subcategoría</label>
                    <select id="modalSubcategory" class="input-field w-full" disabled>
                        <option value="">Selecciona categoría primero</option>
                    </select>
                </div>
            </div>

            <!-- Image Upload -->
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Imagen del Producto</label>
                <div class="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-[#5DADE2] transition-colors">
                    <input type="file" id="prodImage" accept="image/*" class="hidden">
                    <div id="imagePreview" class="hidden mb-2 relative group w-fit mx-auto">
                        <img id="previewImage" src="" alt="Preview" class="max-h-40 rounded-lg shadow-sm">
                        <button type="button" onclick="removeImage()" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <i class="fa-solid fa-times text-xs"></i>
                        </button>
                    </div>
                    <div id="imagePlaceholder">
                        <i class="fa-solid fa-cloud-arrow-up text-3xl text-slate-300 mb-2"></i>
                        <p class="text-sm text-slate-600">Haz clic para seleccionar</p>
                    </div>
                    <button type="button" onclick="document.getElementById('prodImage').click()" class="mt-2 text-sm text-[#5DADE2] hover:text-[#3498DB] font-medium">
                        Elegir archivo
                    </button>
                </div>
            </div>
        </form>
    `;
}

function resetForm() {
  const form = document.querySelector("#productModalPanel form");
  if (form) form.reset();
  document.getElementById("modalSubcategory").innerHTML =
    '<option value="">Selecciona categoría primero</option>';
  document.getElementById("modalSubcategory").disabled = true;
  removeImage();
  isEditing = false;
  currentProduct = null;
}

function fillForm(product) {
  document.getElementById("prodName").value = product.name;
  document.getElementById("prodBrand").value = product.brand || "";
  document.getElementById("prodModel").value = product.model || "";
  document.getElementById("prodPrice").value = product.price;
  document.getElementById("prodSku").value = product.sku;
  document.getElementById("prodStock").value = product.stock_quantity;

  // Handle Category/Subcategory logic
  // We assume backend sends 'category' as ID. We need to find if it is a parent or sub.
  let parentId, subId;

  // Find category in allCategories tree
  // Case 1: product.category matches a parent ID
  const directParent = allCategories.find((c) => c.id == product.category);
  if (directParent) {
    parentId = directParent.id;
  } else {
    // Case 2: product.category matches a subcategory ID
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
    // Trigger generic change event or manually update subs
    updateSubcategories(parentId);
    if (subId) document.getElementById("modalSubcategory").value = subId;
  }

  // Image
  if (product.image) {
    // Show existing image
    let imgUrl = product.image;
    if (!imgUrl.startsWith("http"))
      imgUrl = API_BASE.replace("/api/v1/", "") + imgUrl;

    document.getElementById("previewImage").src = imgUrl;
    document.getElementById("imagePreview").classList.remove("hidden");
    document.getElementById("imagePlaceholder").classList.add("hidden");
  }
}

function attachFormListeners() {
  const catSelect = document.getElementById("modalCategory");
  if (catSelect) {
    catSelect.onchange = (e) => updateSubcategories(e.target.value);
  }
}

function populateModalCategories(selectedId = null) {
  const select = document.getElementById("modalCategory");
  if (!select) return;

  select.innerHTML = '<option value="">Seleccionar...</option>';
  allCategories.forEach((cat) => {
    select.add(new Option(cat.name, cat.id, false, cat.id == selectedId));
  });
}

function updateSubcategories(parentId) {
  const subSelect = document.getElementById("modalSubcategory");
  if (!subSelect) return;

  subSelect.innerHTML = '<option value="">Seleccionar...</option>';

  if (!parentId) {
    subSelect.disabled = true;
    subSelect.innerHTML =
      '<option value="">Selecciona categoría primero</option>';
    return;
  }

  const parent = allCategories.find((c) => c.id == parentId);
  if (parent && parent.subcategories && parent.subcategories.length > 0) {
    subSelect.disabled = false;
    parent.subcategories.forEach((sub) => {
      subSelect.add(new Option(sub.name, sub.id));
    });
  } else {
    subSelect.disabled = true;
    subSelect.innerHTML = '<option value="">No hay subcategorías</option>';
  }
}

// --- Image Preview Logic ---

function setupImagePreview() {
  // This is now handled dynamically inside the HTML string or we can delegate
  document.addEventListener("change", (e) => {
    if (e.target.id === "prodImage") {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          Toast.show({
            type: "warning",
            message: "La imagen debe ser menor a 5MB",
          });
          e.target.value = "";
          return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
          document.getElementById("previewImage").src = ev.target.result;
          document.getElementById("imagePreview").classList.remove("hidden");
          document.getElementById("imagePlaceholder").classList.add("hidden");
        };
        reader.readAsDataURL(file);
      }
    }
  });
}

window.removeImage = function () {
  const input = document.getElementById("prodImage");
  if (input) input.value = "";
  document.getElementById("imagePreview").classList.add("hidden");
  document.getElementById("imagePlaceholder").classList.remove("hidden");
  document.getElementById("previewImage").src = "";
};
