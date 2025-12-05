/**
 * Shipping Management Logic
 * Uses Components: Table, Modal, Toast, API
 */

// Globals
let shipmentsTable;
let shipmentModal;
let shippingMethods = [];
let allShipmentsCache = [];
let isEditing = false;
let currentId = null;

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Sidebar
  if (typeof renderSidebar === "function") renderSidebar("envios");

  // 2. Initialize
  initializeTable();
  initializeModal();

  // 3. Load Data
  await loadMethods();
  await loadShipments();

  // 4. Filters
  setupFilters();
});

// --- Initialization ---

function initializeTable() {
  shipmentsTable = new Table({
    containerId: "shipments-table-container",
    columns: [
      {
        key: "tracking_number",
        label: "Tracking / ID",
        render: (val, row) => `
                    <div>
                        <span class="font-medium text-slate-900">${
                          val ||
                          '<span class="text-slate-400 italic">Sin Tracking</span>'
                        }</span>
                        <div class="text-xs text-slate-400">ID: ${row.id}</div>
                    </div>
                `,
      },
      {
        key: "customer_name",
        label: "Cliente",
        render: (val, row) => `
                    <div>
                        <div class="text-slate-900 font-medium">${val}</div>
                        <div class="text-xs text-slate-500">${row.customer_email}</div>
                    </div>
                `,
      },
      {
        key: "shipping_method_name",
        label: "Método",
        render: (val, row) =>
          `<span class="text-slate-600">${
            val || "ID: " + row.shipping_method
          }</span>`,
      },
      {
        key: "destination_address",
        label: "Destino",
        render: (val) =>
          `<div class="max-w-[200px] truncate text-slate-600 text-xs" title="${val}">${val}</div>`,
      },
      {
        key: "status",
        label: "Estado",
        render: (val) => {
          const map = {
            PENDING: {
              text: "Pendiente",
              badge: "bg-yellow-100 text-yellow-700",
              icon: "fa-clock",
            },
            PROCESSING: {
              text: "Procesando",
              badge: "bg-blue-100 text-blue-700",
              icon: "fa-gears",
            },
            SHIPPED: {
              text: "Enviado",
              badge: "bg-indigo-100 text-indigo-700",
              icon: "fa-box",
            },
            IN_TRANSIT: {
              text: "En Tránsito",
              badge: "bg-cyan-100 text-cyan-700",
              icon: "fa-truck-fast",
            },
            DELIVERED: {
              text: "Entregado",
              badge: "bg-green-100 text-green-700",
              icon: "fa-check",
            },
            RETURNED: {
              text: "Devuelto",
              badge: "bg-red-100 text-red-700",
              icon: "fa-rotate-left",
            },
            SCHEDULED_PICKUP: {
              text: "Prog. Recogida",
              badge: "bg-purple-100 text-purple-700",
              icon: "fa-calendar-check",
            },
            PICKED_UP: {
              text: "Recogido",
              badge: "bg-purple-200 text-purple-800",
              icon: "fa-people-carry-box",
            },
          };
          const st = map[val] || {
            text: val,
            badge: "badge-ghost",
            icon: "fa-circle",
          };
          return `<span class="badge ${st.badge}"><i class="fa-solid ${st.icon} mr-1"></i>${st.text}</span>`;
        },
      },
      {
        key: "scheduled_date",
        label: "Fecha Prog.",
        render: (val) =>
          `<span class="text-slate-600 text-xs">${
            val ? formatDate(val, true) : "-"
          }</span>`,
      },
      {
        key: "actions",
        label: "Acciones",
        alignment: "right",
        render: (_, row) => `
                    <div class="flex items-center justify-end gap-2">
                        <button onclick="editShipment('${row.id}')" class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button onclick="deleteShipment('${row.id}')" class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                `,
      },
    ],
    emptyState: {
      icon: "fa-solid fa-truck-fast",
      title: "No hay envíos",
      message: "Registra un envío para comenzar el seguimiento.",
    },
  });
}

function initializeModal() {
  shipmentModal = new Modal({
    title: "Nuevo Envío",
    content: getShipmentFormHTML(), // Defined below
    size: "2xl",
    buttons: [
      {
        text: "Cancelar",
        class: "px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg",
        onClick: () => shipmentModal.close(),
      },
      {
        text: "Guardar Envío",
        class: "btn-primary",
        onClick: handleSaveShipment,
      },
    ],
    onOpen: () => {
      populateMethodSelect();
      if (!isEditing) {
        // Set default status if new
        const statusSel = document.getElementById("shipStatus");
        if (statusSel) statusSel.value = "PENDING";
      }
    },
  });
}

// --- Data Loading ---

async function loadMethods() {
  try {
    shippingMethods = await api.get("shipping/methods/");
  } catch (error) {
    console.error("Error loading methods:", error);
  }
}

async function loadShipments() {
  try {
    const container = document.getElementById("shipments-table-container");
    if (container) container.innerHTML = Loading.spinner("Cargando envíos...");

    const data = await api.get("shipping/shipments/");
    allShipmentsCache = data; // Cache for filtering
    shipmentsTable.render(data);

    const count = document.getElementById("showingCount");
    if (count) count.textContent = data.length;
  } catch (error) {
    console.error("Error shipments:", error);
    shipmentsTable.render([]);
    Toast.show({ type: "error", message: "Error cargando envíos" });
  }
}

// --- Logic ---

function setupFilters() {
  const search = document.getElementById("searchInput");
  const status = document.getElementById("statusFilter");

  const handleFilter = () => {
    const term = search.value.toLowerCase();
    const stat = status.value;

    const filtered = allShipmentsCache.filter((s) => {
      const matchesTerm =
        (s.tracking_number || "").toLowerCase().includes(term) ||
        (s.customer_name || "").toLowerCase().includes(term) ||
        (s.customer_email || "").toLowerCase().includes(term);
      const matchesStatus = !stat || s.status === stat;
      return matchesTerm && matchesStatus;
    });

    shipmentsTable.render(filtered);
    document.getElementById("showingCount").textContent = filtered.length;
  };

  search.addEventListener("input", handleFilter);
  status.addEventListener("change", handleFilter);
}

function populateMethodSelect() {
  const select = document.getElementById("shipMethod");
  if (!select) return;

  // Preserve value if editing
  const currentVal = select.value;

  select.innerHTML = '<option value="">Seleccionar...</option>';
  shippingMethods.forEach((m) => {
    select.add(
      new Option(`${m.name} (${m.type}) - ${formatCurrency(m.base_cost)}`, m.id)
    );
  });

  if (currentVal) select.value = currentVal;
}

// --- Actions ---

window.openShipmentModal = function () {
  isEditing = false;
  currentId = null;
  shipmentModal.updateTitle("Nuevo Envío");
  shipmentModal.open();
  // Form is reset by modal close usually, but let's be safe
  const form = document.getElementById("shipmentForm");
  if (form) form.reset();
};

window.editShipment = function (id) {
  const item = allShipmentsCache.find((s) => s.id == id);
  if (!item) return;

  isEditing = true;
  currentId = item.id;
  shipmentModal.updateTitle("Editar Envío");
  shipmentModal.open();

  // Fill Data
  document.getElementById("shipTracking").value = item.tracking_number || "";
  document.getElementById("shipStatus").value = item.status;

  // Fill specific fields (populate select first in onOpen, then value)
  // Since onOpen runs async/sync before this if called after open(), we need to wait or manually populate here if needed.
  // However, onOpen fires when we call open().
  // We can rely on onOpen triggering populate, then setting value.
  // Or call populate explicit here.
  populateMethodSelect();
  document.getElementById("shipMethod").value = item.shipping_method;

  if (item.scheduled_date) {
    const d = new Date(item.scheduled_date);
    // Local datetime format: YYYY-MM-DDTHH:mm
    // Hacky local adjust
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    document.getElementById("shipDate").value = local;
  } else {
    document.getElementById("shipDate").value = "";
  }

  document.getElementById("custName").value = item.customer_name;
  document.getElementById("custEmail").value = item.customer_email;
  document.getElementById("shipOrigin").value = item.origin_address;
  document.getElementById("shipDestination").value = item.destination_address;
};

window.deleteShipment = async function (id) {
  Modal.confirm({
    title: "Eliminar Envío",
    message: "¿Confirma que desea eliminar este registro?",
    onConfirm: async () => {
      try {
        await api.delete(`shipping/shipments/${id}/`);
        Toast.show({ type: "success", message: "Envío eliminado" });
        loadShipments();
      } catch (error) {
        Toast.show({ type: "error", message: "No se pudo eliminar" });
      }
    },
  });
};

async function handleSaveShipment() {
  // Validate
  const payload = {
    tracking_number:
      document.getElementById("shipTracking").value.trim() || null,
    status: document.getElementById("shipStatus").value,
    shipping_method: document.getElementById("shipMethod").value,
    scheduled_date: document.getElementById("shipDate").value || null,
    customer_name: document.getElementById("custName").value.trim(),
    customer_email: document.getElementById("custEmail").value.trim(),
    origin_address: document.getElementById("shipOrigin").value.trim(),
    destination_address: document
      .getElementById("shipDestination")
      .value.trim(),
  };

  // Basic Val
  if (
    !payload.shipping_method ||
    !payload.customer_name ||
    !payload.customer_email ||
    !payload.origin_address ||
    !payload.destination_address
  ) {
    Toast.show({
      type: "warning",
      message: "Completa todos los campos obligatorios",
    });
    return;
  }

  try {
    if (isEditing) {
      await api.put(`shipping/shipments/${currentId}/`, payload);
      Toast.show({ type: "success", message: "Envío actualizado" });
    } else {
      await api.post("shipping/shipments/", payload);
      Toast.show({ type: "success", message: "Envío creado" });
    }
    shipmentModal.close();
    loadShipments();
  } catch (error) {
    console.error("Save error:", error);
    Toast.show({ type: "error", message: "Error al guardar envío" });
  }
}

// --- Template ---

function getShipmentFormHTML() {
  return `
        <form id="shipmentForm" class="space-y-6" onsubmit="event.preventDefault();">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-medium text-slate-700 mb-1">Número de Seguimiento</label>
                    <input type="text" id="shipTracking" class="input-field w-full" placeholder="Ej. TRK-123456789">
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-700 mb-1">Estado</label>
                    <select id="shipStatus" class="input-field w-full">
                        <option value="PENDING">Pendiente</option>
                        <option value="PROCESSING">Procesando</option>
                        <option value="SHIPPED">Enviado</option>
                        <option value="IN_TRANSIT">En Tránsito</option>
                        <option value="DELIVERED">Entregado</option>
                        <option value="SCHEDULED_PICKUP">Programado Recogida</option>
                    </select>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-medium text-slate-700 mb-1">Método de Envío *</label>
                    <select id="shipMethod" class="input-field w-full" required>
                        <!-- Populated by JS -->
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-700 mb-1">Fecha Programada</label>
                    <input type="datetime-local" id="shipDate" class="input-field w-full">
                </div>
            </div>

            <div class="border-t border-slate-100 pt-4">
                <h3 class="text-sm font-bold text-slate-900 mb-3">Datos del Cliente</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-medium text-slate-700 mb-1">Nombre *</label>
                        <input type="text" id="custName" class="input-field w-full" placeholder="Nombre completo" required>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-slate-700 mb-1">Email *</label>
                        <input type="email" id="custEmail" class="input-field w-full" placeholder="email@cliente.com" required>
                    </div>
                </div>
            </div>

            <div class="border-t border-slate-100 pt-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-medium text-slate-700 mb-1">Dirección Origen *</label>
                        <textarea id="shipOrigin" rows="3" class="input-field w-full" placeholder="Dirección salida" required></textarea>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-slate-700 mb-1">Dirección Destino *</label>
                        <textarea id="shipDestination" rows="3" class="input-field w-full" placeholder="Dirección entrega" required></textarea>
                    </div>
                </div>
            </div>
        </form>
    `;
}
