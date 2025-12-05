/**
 * Leasing Administration Logic
 * Uses Components: Table, Modal, Toast, API
 */

// Globals
let contractsTable;
let quoteModal;
let signModal;
let allProducts = [];
let currentCategory = "computers";
let selectedProduct = null;
let currentQuote = null;
let activeContractId = null;

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Sidebar
  if (typeof renderSidebar === "function") renderSidebar("arrendamientos");

  // 2. Initialize Components
  initializeContractsTable();
  initializeModals();

  // 3. Load Data
  await loadProducts();

  // 4. Setup Tabs
  setupTabs();
});

// --- Initialization ---

function initializeContractsTable() {
  contractsTable = new Table({
    containerId: "contracts-table-container",
    columns: [
      {
        key: "id",
        label: "ID",
        render: (val) => `<span class="text-slate-500">#${val}</span>`,
      },
      {
        key: "product_name",
        label: "Equipo",
        sortable: true,
        render: (val) =>
          `<span class="font-medium text-slate-900">${val}</span>`,
      },
      {
        key: "plan_period",
        label: "Periodo",
        render: (val) => {
          const map = {
            DAILY: "Diario",
            WEEKLY: "Semanal",
            MONTHLY: "Mensual",
            ANNUAL: "Anual",
          };
          return map[val] || val;
        },
      },
      {
        key: "total_cost",
        label: "Costo Total",
        render: (val) => formatCurrency(val),
      },
      {
        key: "status",
        label: "Estado",
        render: (_, row) => {
          if (row.is_signed)
            return `<span class="badge badge-success">Firmado / Activo</span>`;
          return `<span class="badge badge-warning">Pendiente de Firma</span>`;
        },
      },
      {
        key: "actions",
        label: "Acciones",
        alignment: "right",
        render: (_, row) => {
          if (!row.is_signed) {
            return `<button onclick="openSignModal('${
              row.id
            }', \`${encodeURIComponent(
              row.contract_document || ""
            )}\`)" class="text-blue-500 hover:text-blue-700 font-medium transition-colors">Firmar</button>`;
          }
          return '<span class="text-slate-400 text-xs">Firmado</span>';
        },
      },
    ],
    msgEmpty: "No tienes contratos activos.",
    itemsPerPage: 5,
  });
}

function initializeModals() {
  // Quote Modal
  quoteModal = new Modal({
    title: "Configurar Arrendamiento",
    content: getQuoteFormHTML(),
    size: "2xl",
    buttons: [
      {
        text: "Cotizar",
        class: "btn-secondary mr-2",
        onClick: handleCalculateQuote,
      },
      {
        text: "Generar Contrato",
        class: "btn-primary disabled:opacity-50 disabled:cursor-not-allowed",
        id: "btn-create-contract", // ID handling inside component might be tricky, usually handled by ref
        onClick: handleCreateContract,
      },
    ],
    onOpen: () => {
      // Reset state
      const btn = document.querySelector("button.btn-primary"); // Hacky selector based on class added above
      if (btn) btn.disabled = true;
      document.getElementById("quote-summary").classList.add("hidden");

      // Setup Dates
      const today = new Date().toISOString().split("T")[0];
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      const nextYearStr = nextYear.toISOString().split("T")[0];

      const startV = document.getElementById("modal-start");
      const endV = document.getElementById("modal-end");
      if (startV && !startV.value) startV.value = today;
      if (endV && !endV.value) endV.value = nextYearStr;

      updateModalProductInfo();
    },
  });

  // Sign Modal
  signModal = new Modal({
    title: "Firma de Contrato",
    content: getSignFormHTML(),
    size: "3xl",
    buttons: [
      {
        text: "Cancelar",
        class: "text-slate-500 hover:text-slate-700 px-4",
        onClick: () => signModal.close(),
      },
      {
        text: "Firmar Digitalmente",
        class: "btn-primary bg-linear-to-r from-blue-500 to-emerald-400",
        onClick: handleSubmitSignature,
      },
    ],
  });
}

// --- Logic ---

async function loadProducts() {
  const loader = document.getElementById("catalog-view");
  if (loader) loader.innerHTML = Loading.spinner("Cargando catálogo...");

  try {
    allProducts = await api.get("products/products/"); // Endpoint matching backend
    renderCatalog();
  } catch (error) {
    console.error("Error loading products:", error);
    if (loader) loader.innerHTML = Loading.error("Error al cargar equipos");
  }
}

async function loadContracts() {
  try {
    const contracts = await api.get("leasing/contracts/");
    contractsTable.render(contracts);
  } catch (error) {
    console.error("Error loading contracts:", error);
    // Table handle empty/error implicitly if passed empty array?
    contractsTable.render([]);
    Toast.show({ type: "error", message: "Error cargando contratos" });
  }
}

// --- UI Actions ---

function setupTabs() {
  window.switchTab = (tab) => {
    // UI Updates
    ["computers", "servers", "printing", "contracts"].forEach((t) => {
      const btn = document.getElementById(`tab-${t}`);
      if (btn) {
        if (t === tab) {
          btn.classList.add("text-blue-600", "border-blue-600");
          btn.classList.remove(
            "border-transparent",
            "text-slate-500",
            "hover:text-slate-700",
            "hover:border-slate-300"
          );
        } else {
          btn.classList.remove("text-blue-600", "border-blue-600");
          btn.classList.add(
            "border-transparent",
            "text-slate-500",
            "hover:text-slate-700",
            "hover:border-slate-300"
          );
        }
      }
    });

    if (tab === "contracts") {
      document.getElementById("catalog-view").classList.add("hidden");
      document.getElementById("contracts-view").classList.remove("hidden");
      loadContracts();
    } else {
      document.getElementById("catalog-view").classList.remove("hidden");
      document.getElementById("contracts-view").classList.add("hidden");
      currentCategory = tab;
      renderCatalog();
    }
  };

  // Initial State - Manually trigger logic
  renderCatalog();
}

function renderCatalog() {
  const container = document.getElementById("catalog-view");
  if (!container) return;
  container.innerHTML = "";

  const categoryMap = {
    computers: ["computadoras", "laptops", "escritorio"],
    servers: ["servidores", "redes", "networking"],
    printing: ["impresión", "impresoras", "multifuncionales"],
  };

  const targetKeywords = categoryMap[currentCategory] || [];

  // Filter loosely based on category name matching keywords
  const filtered = allProducts.filter((p) => {
    const catName = (p.category_name || "").toLowerCase();
    return targetKeywords.some((k) => catName.includes(k));
  });

  // Fallback if no specific filtering logic matches standard categories
  if (
    filtered.length === 0 &&
    allProducts.length > 0 &&
    currentCategory === "computers"
  ) {
    // Show all if logic is too strict for demo
    // filtered = allProducts;
  }

  if (filtered.length === 0) {
    container.innerHTML = Loading.empty(
      "No hay equipos disponibles en esta categoría"
    );
    return;
  }

  filtered.forEach((p) => {
    const specs = p.specifications
      ? Object.entries(p.specifications)
          .slice(0, 3)
          .map(
            ([k, v]) =>
              `<div class="flex justify-between text-xs text-slate-600"><span>${k}:</span> <span class="font-medium">${v}</span></div>`
          )
          .join("")
      : "";

    const card = document.createElement("div");
    card.className =
      "bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-slate-100";
    card.innerHTML = `
            <div class="p-5">
                <div class="h-40 bg-slate-50 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                     <img src="${
                       p.image || "https://via.placeholder.com/150"
                     }" class="h-full object-contain" alt="${p.name}">
                </div>
                <h3 class="font-bold text-slate-900 truncate" title="${
                  p.name
                }">${p.name}</h3>
                <p class="text-xs text-slate-500 mb-3 h-8 line-clamp-2">${
                  p.description || "Sin descripción"
                }</p>
                
                <div class="bg-slate-50 p-2 rounded-lg space-y-1 mb-4 border border-slate-100">
                    ${
                      specs ||
                      '<span class="text-xs text-slate-400">Sin especificaciones</span>'
                    }
                </div>

                <div class="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <div>
                        <span class="text-xs text-slate-500 block">Precio Lista</span>
                        <span class="font-semibold text-slate-700">${formatCurrency(
                          p.price
                        )}</span>
                    </div>
                    <button onclick='openQuoteModal(${JSON.stringify(p).replace(
                      /'/g,
                      "&#39;"
                    )})' class="btn-primary py-1.5 px-4 text-xs">
                        Cotizar
                    </button>
                </div>
            </div>
        `;
    container.appendChild(card);
  });
}

// --- Quote Modal ---

window.openQuoteModal = function (product) {
  selectedProduct = product;
  quoteModal.open();
  // Info update is handled in onOpen or we call it here
  updateModalProductInfo();
};

function updateModalProductInfo() {
  if (!selectedProduct) return;
  const nameEl = document.getElementById("modal-product-name");
  const descEl = document.getElementById("modal-product-desc");
  const specsEl = document.getElementById("modal-product-specs");

  if (nameEl) nameEl.textContent = selectedProduct.name;
  if (descEl) descEl.textContent = selectedProduct.description;

  if (specsEl) {
    specsEl.innerHTML = "";
    if (selectedProduct.specifications) {
      Object.entries(selectedProduct.specifications).forEach(([k, v]) => {
        specsEl.innerHTML += `<div class="flex justify-between border-b border-gray-200 pb-1 last:border-0 mb-1"><span>${k}</span> <span class="font-semibold">${v}</span></div>`;
      });
    }
  }
}

async function handleCalculateQuote() {
  const period = document.getElementById("modal-period").value;
  const start = document.getElementById("modal-start").value;
  const end = document.getElementById("modal-end").value;

  if (!start || !end) {
    Toast.show({
      type: "warning",
      message: "Selecciona fechas de inicio y fin",
    });
    return;
  }

  try {
    const payload = {
      product_id: selectedProduct.id,
      period,
      start_date: start,
      end_date: end,
    };

    const data = await api.post("leasing/quote/", payload);
    currentQuote = data;

    // Calc Maintenance
    let cost = parseFloat(data.total_cost);
    if (document.getElementById("modal-maintenance").checked) {
      cost *= 1.1;
    }

    const costEl = document.getElementById("modal-total-cost");
    if (costEl) costEl.textContent = formatCurrency(cost);

    const durationEl = document.getElementById("modal-duration-text");
    if (durationEl)
      durationEl.textContent = `Duración: ${data.duration_days} días`;

    document.getElementById("quote-summary").classList.remove("hidden");

    // Enable create button (found via text content or specific selector if I added ID)
    // I added ID 'btn-create-contract' in buttons config
    // Note: Modal structure might rebuild buttons, so we need to find it
    // The buttons are in modal footer.
    // Actually, my Modal component renders buttons dynamically. I can try to find button by text or just rely on global class.
    const allBtns = document.querySelectorAll(
      "#modal-ref-Configurar_Arrendamiento button"
    ); // Hacky if title has spaces
    // Safer:
    const btn = Array.from(document.querySelectorAll("button")).find(
      (b) => b.textContent.trim() === "Generar Contrato"
    );
    if (btn) btn.disabled = false;
  } catch (error) {
    console.error("Quote error:", error);
    Toast.show({ type: "error", message: "Error al calcular cotización" });
  }
}

async function handleCreateContract() {
  if (!currentQuote) return;

  let finalCost = parseFloat(currentQuote.total_cost);
  if (document.getElementById("modal-maintenance").checked) {
    finalCost *= 1.1;
  }

  const payload = {
    product: selectedProduct.id,
    plan: currentQuote.plan_id,
    start_date: document.getElementById("modal-start").value,
    end_date: document.getElementById("modal-end").value,
    total_cost: finalCost,
    contract_document: currentQuote.contract_document,
    status: "PENDING",
  };

  try {
    const res = await api.post("leasing/contracts/", payload);
    Toast.show({ type: "success", message: `Contrato #${res.id} generado` });
    quoteModal.close();
    window.switchTab("contracts");
  } catch (error) {
    console.error("Contract error:", error);
    Toast.show({ type: "error", message: "Error al generar contrato" });
  }
}

// --- Sign Modal ---

window.openSignModal = function (id, docEncoded) {
  activeContractId = id;
  signModal.open();
  setTimeout(() => {
    const pre = document.getElementById("contract-text");
    if (pre) pre.textContent = decodeURIComponent(docEncoded);
    const inp = document.getElementById("signature-input");
    if (inp) inp.value = "";
  }, 100);
};

async function handleSubmitSignature() {
  const sig = document.getElementById("signature-input").value;
  if (sig.trim().length < 5) {
    Toast.show({ type: "warning", message: "Firma con tu nombre completo" });
    return;
  }

  try {
    await api.patch(`leasing/contracts/${activeContractId}/`, {
      is_signed: true,
      status: "ACTIVE",
    });
    Toast.show({ type: "success", message: "Contrato firmado" });
    signModal.close();
    loadContracts();
  } catch (error) {
    console.error("Sign error:", error);
    Toast.show({ type: "error", message: "Error al firmar contrato" });
  }
}

// --- HTML Templates ---

function getQuoteFormHTML() {
  return `
        <div class="flex gap-6 h-96">
            <!-- Sidebar Info -->
            <div class="w-1/3 border-r border-slate-200 pr-6 overflow-y-auto">
                <h4 class="font-bold text-slate-900 text-lg mb-2" id="modal-product-name">Equipo</h4>
                <p class="text-sm text-slate-600 mb-4" id="modal-product-desc">...</p>
                <div class="bg-slate-50 p-3 rounded-lg text-xs space-y-2" id="modal-product-specs"></div>
            </div>

            <!-- Form -->
            <div class="w-2/3 space-y-5 overflow-y-auto">
                 <div>
                    <label class="block text-sm font-medium text-slate-700">Periodo de Arrendamiento</label>
                    <select id="modal-period" class="input-field mt-1 w-full">
                        <option value="DAILY">Diario</option>
                        <option value="WEEKLY">Semanal</option>
                        <option value="MONTHLY">Mensual</option>
                        <option value="ANNUAL" selected>Anual</option>
                    </select>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700">Inicio</label>
                        <input type="date" id="modal-start" class="input-field mt-1 w-full">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700">Fin</label>
                        <input type="date" id="modal-end" class="input-field mt-1 w-full">
                    </div>
                </div>

                <div class="flex items-center p-3 border border-blue-100 bg-blue-50/50 rounded-lg">
                    <input id="modal-maintenance" type="checkbox" class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500">
                    <label for="modal-maintenance" class="ml-2 block text-sm text-slate-700 font-medium">
                        Incluir Protección Total (+10%)
                        <span class="block text-xs text-slate-500 font-normal">Cubre daños accidentales y mantenimiento</span>
                    </label>
                </div>

                 <div id="quote-summary" class="bg-emerald-50 p-4 rounded-lg border border-emerald-100 hidden">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-emerald-900 font-medium text-sm">Costo Total Estimado</span>
                        <span id="modal-total-cost" class="text-emerald-700 font-bold text-xl">$0.00</span>
                    </div>
                    <p class="text-xs text-emerald-600 text-right" id="modal-duration-text"></p>
                </div>
            </div>
        </div>
    `;
}

function getSignFormHTML() {
  return `
        <div class="flex flex-col h-[60vh]">
            <div class="flex-1 bg-slate-50 p-4 border border-slate-200 rounded-lg mb-4 overflow-y-auto font-mono text-xs text-slate-700 shadow-inner">
                <pre id="contract-text" class="whitespace-pre-wrap font-inherit"></pre>
            </div>
            
            <div class="border-t border-slate-100 pt-4">
                <label class="block text-sm font-medium text-slate-700 mb-2">Firma Digital de Aceptación</label>
                <div class="relative">
                    <input type="text" id="signature-input" placeholder="Escriba su nombre completo para firmar" 
                        class="input-field w-full pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                    <i class="fa-solid fa-pen-nib absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                </div>
                <p class="text-xs text-slate-400 mt-2">
                    <i class="fa-solid fa-circle-info mr-1"></i>
                    Al firmar digitalmente, acepta todos los términos y condiciones estipulados en el documento superior.
                </p>
            </div>
        </div>
    `;
}
