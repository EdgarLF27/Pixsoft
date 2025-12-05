// --- Configuración y Estado ---
const API_BASE = "http://localhost:8000/api/v1/leasing/";
let allProducts = [];
let currentCategory = "computers";
let currentQuote = null;
let activeContractId = null;

// --- Inicialización ---
document.addEventListener("DOMContentLoaded", async () => {
  if (window.lucide) lucide.createIcons();
  checkAuth();
  await loadProducts();
  setupDates();

  // Initialize Sidebar
  if (typeof renderSidebar === "function") {
    renderSidebar("arrendamientos");
  }

  // Mobile menu toggle logic is now handled by sidebar.js or indexAdmin.js if shared,
  // but since we are extracting specific logic, we might need to ensure it doesn't conflict.
  // The sidebar component might not have the toggle logic built-in for the mobile button
  // if it was previously inline. Let's add it here or ensure sidebar.js handles it.
  // For now, I'll keep the specific event listeners here but adapted.

  const menuBtn = document.getElementById("menu-btn");
  const sidebar = document.getElementById("sidebar");

  if (menuBtn && sidebar) {
    menuBtn.addEventListener("click", () => {
      sidebar.classList.toggle("-translate-x-full");
    });

    document.addEventListener("click", (e) => {
      if (window.innerWidth < 768) {
        if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
          sidebar.classList.add("-translate-x-full");
        }
      }
    });
  }
});

function checkAuth() {
  const token = localStorage.getItem("accessToken");
  // const statusEl = document.getElementById('auth-status'); // Element might not exist in new layout, check first
  // if (statusEl) {
  //     if (!token) {
  //         statusEl.textContent = "No autenticado";
  //         statusEl.classList.add('text-red-500');
  //     } else {
  //         statusEl.textContent = "Sesión Activa";
  //         statusEl.classList.add('text-green-600');
  //     }
  // }
  if (!token) {
    // Optional: Redirect
    // window.location.href = '../Login.html';
  }
}

function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  window.location.href = "../Login.html";
}

function setupDates() {
  const today = new Date().toISOString().split("T")[0];
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  const startEl = document.getElementById("modal-start");
  const endEl = document.getElementById("modal-end");

  if (startEl) startEl.value = today;
  if (endEl) endEl.value = nextYear.toISOString().split("T")[0];
}

// --- API Helper ---
async function apiCall(endpoint, method = "GET", body = null) {
  const token = localStorage.getItem("accessToken");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(API_BASE + endpoint, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    if (res.status === 401) {
      alert("Sesión expirada. Por favor ingrese nuevamente.");
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

// --- Lógica de UI ---
async function loadProducts() {
  const data = await apiCall("products/");
  if (data) {
    allProducts = data;
    renderCatalog();
  }
}

function switchTab(tab) {
  // Actualizar estilos de tabs
  ["computers", "servers", "printing", "contracts"].forEach((t) => {
    const btn = document.getElementById(`tab-${t}`);
    if (!btn) return;

    if (t === tab) {
      btn.className = "tab-btn tab-btn-active";
      // Remove old classes if they persist? No, we are replacing the class string.
    } else {
      btn.className = "tab-btn tab-btn-inactive";
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
}

function renderCatalog() {
  const container = document.getElementById("catalog-view");
  if (!container) return;
  container.innerHTML = "";

  // Mapeo de categorías del backend a tabs del frontend
  const categoryMap = {
    computers: "Computadoras Portátiles y de Escritorio",
    servers: "Servidores y Equipos de Red",
    printing: "Equipos de Impresión y Digitalización",
  };

  const filtered = allProducts.filter(
    (p) => p.category_name === categoryMap[currentCategory]
  );

  if (filtered.length === 0) {
    container.innerHTML = `<div class="col-span-full text-center py-12 text-slate-400">No hay equipos disponibles en esta categoría.</div>`;
    return;
  }

  filtered.forEach((p) => {
    // Renderizar especificaciones
    let specsHtml = "";
    if (p.specifications) {
      Object.entries(p.specifications)
        .slice(0, 4)
        .forEach(([k, v]) => {
          specsHtml += `<div class="flex justify-between text-xs text-slate-600 mb-1"><span>${k}:</span> <span class="font-medium">${v}</span></div>`;
        });
    }

    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
            <div class="px-4 py-5 sm:p-6">
                <h3 class="text-lg leading-6 font-medium text-slate-900 truncate">${
                  p.name
                }</h3>
                <p class="mt-1 max-w-2xl text-sm text-slate-600 h-10 overflow-hidden">${
                  p.description
                }</p>
                
                <div class="mt-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    ${specsHtml}
                </div>

                <div class="mt-5">
                    <button onclick='openQuoteModal(${JSON.stringify(p).replace(
                      /'/g,
                      "&#39;"
                    )})' class="w-full btn-primary justify-center">
                        Cotizar Arrendamiento
                    </button>
                </div>
            </div>
        `;
    container.appendChild(card);
  });
}

// --- Cotización ---
let selectedProduct = null;

function openQuoteModal(product) {
  selectedProduct = product;
  document.getElementById("modal-product-name").textContent = product.name;
  document.getElementById("modal-product-desc").textContent =
    product.description;

  // Render specs en modal
  const specsContainer = document.getElementById("modal-product-specs");
  specsContainer.innerHTML = "";
  if (product.specifications) {
    Object.entries(product.specifications).forEach(([k, v]) => {
      specsContainer.innerHTML += `<div class="flex justify-between border-b border-gray-200 pb-1 last:border-0"><span>${k}</span> <span class="font-semibold">${v}</span></div>`;
    });
  }

  document.getElementById("quote-summary").classList.add("hidden");
  document.getElementById("btn-create-contract").disabled = true;
  document.getElementById("quote-modal").classList.remove("hidden");
  // Trigger fade in if needed, or just remove hidden
  setTimeout(() => {
    document
      .querySelector("#quote-modal .modal-overlay")
      .classList.remove("opacity-0");
    document
      .querySelector("#quote-modal .modal-panel")
      .classList.remove("opacity-0", "scale-95");
  }, 10);
}

function closeModal() {
  const modal = document.getElementById("quote-modal");
  document
    .querySelector("#quote-modal .modal-overlay")
    .classList.add("opacity-0");
  document
    .querySelector("#quote-modal .modal-panel")
    .classList.add("opacity-0", "scale-95");
  setTimeout(() => {
    modal.classList.add("hidden");
  }, 300);
}

async function calculateQuote() {
  const payload = {
    product_id: selectedProduct.id,
    period: document.getElementById("modal-period").value,
    start_date: document.getElementById("modal-start").value,
    end_date: document.getElementById("modal-end").value,
  };

  const data = await apiCall("quote/", "POST", payload);
  if (data) {
    currentQuote = data;

    // Aplicar recargo de mantenimiento si está seleccionado
    let cost = parseFloat(data.total_cost);
    if (document.getElementById("modal-maintenance").checked) {
      cost *= 1.1; // +10%
    }

    document.getElementById("modal-total-cost").textContent = `$${cost.toFixed(
      2
    )}`;
    document.getElementById(
      "modal-duration-text"
    ).textContent = `Duración: ${data.duration_days} días`;
    document.getElementById("quote-summary").classList.remove("hidden");
    document.getElementById("btn-create-contract").disabled = false;
  }
}

async function createContract() {
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
    is_signed: false,
    status: "PENDING",
  };

  const res = await apiCall("contracts/", "POST", payload);
  if (res) {
    alert(`Contrato #${res.id} generado exitosamente.`);
    closeModal();
    switchTab("contracts");
  }
}

// --- Contratos ---
async function loadContracts() {
  const list = document.getElementById("contracts-list");
  list.innerHTML =
    '<tr><td colspan="5" class="text-center py-4">Cargando...</td></tr>';

  const data = await apiCall("contracts/");
  list.innerHTML = "";

  if (!data || data.length === 0) {
    list.innerHTML =
      '<tr><td colspan="5" class="text-center py-4 text-slate-500">No tienes contratos activos.</td></tr>';
    return;
  }

  data.forEach((c) => {
    const tr = document.createElement("tr");
    const statusColor = c.is_signed
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
    const statusText = c.is_signed ? "Firmado / Activo" : "Pendiente de Firma";

    tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">#${
              c.id
            }</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">${
              c.product_name
            }</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${
              c.plan_period
            }</td>
            <td class="px-6 py-4 whitespace-nowrap"><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}">${statusText}</span></td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                ${
                  !c.is_signed
                    ? `<button onclick="openSignModal(${
                        c.id
                      }, '${encodeURIComponent(
                        c.contract_document
                      )}')" class="text-[#5DADE2] hover:text-[#34D399] transition-colors">Firmar</button>`
                    : '<span class="text-slate-400">Firmado</span>'
                }
            </td>
        `;
    list.appendChild(tr);
  });
}

function openSignModal(id, docEncoded) {
  activeContractId = id;
  document.getElementById("contract-text").textContent =
    decodeURIComponent(docEncoded);
  document.getElementById("signature-input").value = "";
  document.getElementById("sign-modal").classList.remove("hidden");
}

async function submitSignature() {
  const sig = document.getElementById("signature-input").value;
  if (sig.trim().length < 5) {
    alert("Por favor escriba su nombre completo para firmar.");
    return;
  }

  const res = await apiCall(`contracts/${activeContractId}/`, "PATCH", {
    is_signed: true,
    status: "ACTIVE",
  });

  if (res) {
    alert("Contrato firmado correctamente.");
    document.getElementById("sign-modal").classList.add("hidden");
    loadContracts();
  }
}

// Expose functions to global scope for HTML event handlers
window.switchTab = switchTab;
window.openQuoteModal = openQuoteModal;
window.closeModal = closeModal;
window.calculateQuote = calculateQuote;
window.createContract = createContract;
window.openSignModal = openSignModal;
window.submitSignature = submitSignature;
window.logout = logout;
