const API_BASE = "http://localhost:8000/api/v1/shipping/";
let allShipments = [];
let currentId = null;
let isEditing = false;

// --- Inicialización ---
window.onload = async () => {
    checkAuth();
    await fetchShippingMethods();
    await fetchShipments();

    // Listeners para filtros
    document.getElementById("searchInput").addEventListener("input", filterShipments);
    document.getElementById("statusFilter").addEventListener("change", filterShipments);
};

function checkAuth() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        // Redirigir a login si no hay token
        console.warn("No hay token de acceso");
        window.location.href = '../Login.html';
    }
}

// --- API Helper ---
async function apiCall(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('accessToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const res = await fetch(API_BASE + endpoint, {
            method, headers, body: body ? JSON.stringify(body) : null
        });

        if (res.status === 401) {
            alert("Sesión expirada.");
            window.location.href = '../Login.html';
            return null;
        }

        if (!res.ok) {
            const errorText = await res.text();
            try {
                const errorJson = JSON.parse(errorText);
                // Intenta mostrar un mensaje amigable si es un objeto de errores de Django
                const msg = Object.entries(errorJson).map(([k, v]) => `${k}: ${v}`).join('\n');
                throw new Error(msg || errorText);
            } catch (e) {
                throw new Error(errorText);
            }
        }
        return res.status === 204 ? true : await res.json();
    } catch (e) {
        console.error("API Error:", e);
        alert("Error al guardar: \n" + e.message);
        return null;
    }
}

// --- Métodos de Envío ---
async function fetchShippingMethods() {
    const methods = await apiCall('methods/');
    if (methods) {
        const select = document.getElementById("shipMethod");
        select.innerHTML = '<option value="">Seleccionar...</option>';
        methods.forEach(m => {
            select.innerHTML += `<option value="${m.id}">${m.name} (${m.type}) - $${m.base_cost}</option>`;
        });
    }
}

// --- Envíos (CRUD) ---
async function fetchShipments() {
    const data = await apiCall('shipments/');
    if (data) {
        allShipments = data;
        renderShipments(allShipments);
    }
}

function renderShipments(list) {
    const tbody = document.getElementById("shipmentsTableBody");
    const countSpan = document.getElementById("showingCount");

    tbody.innerHTML = "";
    countSpan.textContent = list.length;

    if (list.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-8 text-center text-slate-500">
                    <i class="fa-solid fa-truck-fast text-3xl mb-2 opacity-30"></i>
                    <p>No se encontraron envíos.</p>
                </td>
            </tr>
        `;
        return;
    }

    list.forEach(s => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-slate-50 transition-colors";

        let statusColor = "bg-slate-100 text-slate-700";
        let icon = "fa-circle";
        let statusText = s.status; // Fallback

        // Mapeo de estados para visualización
        const statusMap = {
            'PENDING': { text: 'Pendiente', color: 'bg-yellow-100 text-yellow-700', icon: 'fa-clock' },
            'PROCESSING': { text: 'Procesando', color: 'bg-blue-100 text-blue-700', icon: 'fa-gears' },
            'SHIPPED': { text: 'Enviado', color: 'bg-indigo-100 text-indigo-700', icon: 'fa-box' },
            'IN_TRANSIT': { text: 'En Tránsito', color: 'bg-cyan-100 text-cyan-700', icon: 'fa-truck-fast' },
            'DELIVERED': { text: 'Entregado', color: 'bg-green-100 text-green-700', icon: 'fa-check' },
            'RETURNED': { text: 'Devuelto', color: 'bg-red-100 text-red-700', icon: 'fa-rotate-left' },
            'SCHEDULED_PICKUP': { text: 'Prog. Recogida', color: 'bg-purple-100 text-purple-700', icon: 'fa-calendar-check' },
            'PICKED_UP': { text: 'Recogido', color: 'bg-purple-200 text-purple-800', icon: 'fa-people-carry-box' }
        };

        if (statusMap[s.status]) {
            statusText = statusMap[s.status].text;
            statusColor = statusMap[s.status].color;
            icon = statusMap[s.status].icon;
        }

        const dateStr = s.scheduled_date ? new Date(s.scheduled_date).toLocaleString() : '-';
        // Asumiendo que el backend devuelve el nombre del método, si no, habría que buscarlo
        // Si el serializador no incluye shipping_method_name, mostrar ID o ajustar serializador.
        // Por ahora asumo que shipping_method es el ID, y tal vez no tengo el nombre fácil.
        // Pero para robustez, mostraré el ID si no hay nombre.
        const methodName = s.shipping_method_name || `Método #${s.shipping_method}`;

        tr.innerHTML = `
            <td class="px-6 py-4 font-medium text-slate-900">
                ${s.tracking_number || '<span class="text-slate-400 italic">Sin Tracking</span>'}
                <div class="text-xs text-slate-400">ID: ${s.id}</div>
            </td>
            <td class="px-6 py-4">
                <div class="text-slate-900 font-medium">${s.customer_name}</div>
                <div class="text-xs text-slate-500">${s.customer_email}</div>
            </td>
            <td class="px-6 py-4 text-slate-600">${methodName}</td>
            <td class="px-6 py-4 text-slate-600 text-xs max-w-[200px] truncate" title="${s.destination_address}">
                ${s.destination_address}
            </td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 rounded-full text-xs font-medium flex w-fit items-center gap-1 ${statusColor}">
                    <i class="fa-solid ${icon}"></i> ${statusText}
                </span>
            </td>
            <td class="px-6 py-4 text-slate-600 text-xs">${dateStr}</td>
            <td class="px-6 py-4 text-right">
                <button onclick='editShipment(${JSON.stringify(s).replace(/'/g, "&#39;")})' class="text-slate-400 hover:text-[#5DADE2] transition-colors mr-2">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button onclick="deleteShipment(${s.id})" class="text-slate-400 hover:text-red-500 transition-colors">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filterShipments() {
    const term = document.getElementById("searchInput").value.toLowerCase();
    const status = document.getElementById("statusFilter").value;

    const filtered = allShipments.filter(s => {
        const matchesTerm = (s.tracking_number && s.tracking_number.toLowerCase().includes(term)) ||
            s.customer_name.toLowerCase().includes(term) ||
            s.customer_email.toLowerCase().includes(term);
        const matchesStatus = status ? s.status === status : true;
        return matchesTerm && matchesStatus;
    });

    renderShipments(filtered);
}

// --- Modal ---
function openShipmentModal() {
    isEditing = false;
    currentId = null;
    document.getElementById("modalTitle").textContent = "Nuevo Envío";

    // Reset form
    document.getElementById("shipTracking").value = "";
    document.getElementById("shipStatus").value = "PENDING";
    document.getElementById("shipMethod").value = "";
    document.getElementById("shipDate").value = "";
    document.getElementById("custName").value = "";
    document.getElementById("custEmail").value = "";
    document.getElementById("shipOrigin").value = "";
    document.getElementById("shipDestination").value = "";

    document.getElementById("shipmentModal").classList.remove("hidden");
    document.getElementById("modalOverlay").classList.remove("opacity-0");
    document.getElementById("shipmentModalPanel").classList.remove("scale-95", "opacity-0");
}

function closeShipmentModal() {
    document.getElementById("modalOverlay").classList.add("opacity-0");
    document.getElementById("shipmentModalPanel").classList.add("scale-95", "opacity-0");
    setTimeout(() => {
        document.getElementById("shipmentModal").classList.add("hidden");
    }, 200);
}

function editShipment(s) {
    isEditing = true;
    currentId = s.id;
    document.getElementById("modalTitle").textContent = "Editar Envío";

    document.getElementById("shipTracking").value = s.tracking_number || "";
    document.getElementById("shipStatus").value = s.status;
    document.getElementById("shipMethod").value = s.shipping_method;

    // Formato fecha para input datetime-local: YYYY-MM-DDTHH:mm
    if (s.scheduled_date) {
        const d = new Date(s.scheduled_date);
        // Ajuste zona horaria simplificado (o usar librería)
        const iso = d.toISOString().slice(0, 16);
        document.getElementById("shipDate").value = iso;
    } else {
        document.getElementById("shipDate").value = "";
    }

    document.getElementById("custName").value = s.customer_name;
    document.getElementById("custEmail").value = s.customer_email;
    document.getElementById("shipOrigin").value = s.origin_address;
    document.getElementById("shipDestination").value = s.destination_address;

    document.getElementById("shipmentModal").classList.remove("hidden");
    document.getElementById("modalOverlay").classList.remove("opacity-0");
    document.getElementById("shipmentModalPanel").classList.remove("scale-95", "opacity-0");
}

async function saveShipment() {
    const trackingInput = document.getElementById("shipTracking").value.trim();

    const payload = {
        tracking_number: trackingInput === "" ? null : trackingInput,
        status: document.getElementById("shipStatus").value,
        shipping_method: document.getElementById("shipMethod").value,
        scheduled_date: document.getElementById("shipDate").value || null,
        customer_name: document.getElementById("custName").value.trim(),
        customer_email: document.getElementById("custEmail").value.trim(),
        origin_address: document.getElementById("shipOrigin").value.trim(),
        destination_address: document.getElementById("shipDestination").value.trim()
    };

    // Validación básica
    if (!payload.shipping_method) {
        alert("Por favor selecciona un método de envío.");
        return;
    }
    if (!payload.customer_name) {
        alert("El nombre del cliente es obligatorio.");
        return;
    }
    if (!payload.customer_email) {
        alert("El email del cliente es obligatorio.");
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.customer_email)) {
        alert("Por favor ingresa un correo electrónico válido.");
        return;
    }
    if (!payload.origin_address || !payload.destination_address) {
        alert("Las direcciones de origen y destino son obligatorias.");
        return;
    }

    let success;
    if (isEditing) {
        success = await apiCall(`shipments/${currentId}/`, 'PUT', payload);
    } else {
        success = await apiCall('shipments/', 'POST', payload);
    }

    if (success) {
        closeShipmentModal();
        fetchShipments();
    }
}

async function deleteShipment(id) {
    if (confirm("¿Estás seguro de eliminar este envío?")) {
        const success = await apiCall(`shipments/${id}/`, 'DELETE');
        if (success) fetchShipments();
    }
}
