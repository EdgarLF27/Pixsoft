/**
 * User Management for Admin
 */

const API_BASE = "http://127.0.0.1:8000/api/v1/users/manage/";

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Sidebar
  if (typeof renderSidebar === "function") {
    renderSidebar("usuarios");
  }

  // Load Users
  loadUsers();

  // Setup Search
  setupSearch();
});

async function loadUsers() {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      window.location.href = "../Login.html";
      return;
    }

    const response = await fetch(API_BASE, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const users = await response.json();
      window.allUsersCache = users; // Store for search filtering
      renderUsers(users);
    } else {
      console.error("Error fetching users:", response.status);
      if (response.status === 401) {
        Toast.show({
          type: "error",
          message: "Sesión expirada. Por favor inicia sesión nuevamente.",
        });
        setTimeout(() => (window.location.href = "../Login.html"), 1500);
      } else if (response.status === 403) {
        Toast.show({
          type: "error",
          message: "Acceso denegado. No tienes permisos de administrador.",
        });
        setTimeout(
          () => (window.location.href = "../Cliente/index.html"),
          1500
        );
      }
    }
  } catch (error) {
    console.error("Network error:", error);
    Toast.show({ type: "error", message: "Error de conexión" });
  }
}

function renderUsers(users) {
  const tbody = document.getElementById("userTableBody");
  tbody.innerHTML = "";

  if (users.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="text-center py-8 text-slate-500">No se encontraron usuarios</td></tr>';
    return;
  }

  users.forEach((user) => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-slate-50 transition-colors group";

    const isStaff = user.is_staff === true;
    const isDisabled = user.username === "admin" ? "disabled" : "";

    tr.innerHTML = `
            <td class="px-6 py-4 font-medium text-slate-900">#${user.id}</td>
            <td class="px-6 py-4 font-medium text-slate-900">${
              user.username
            }</td>
            <td class="px-6 py-4 text-slate-500">${user.email || "-"}</td>
            <td class="px-6 py-4">
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" 
                           class="sr-only peer" 
                           onchange="toggleAdminStatus(${
                             user.id
                           }, this.checked)" 
                           ${isStaff ? "checked" : ""} 
                           ${isDisabled}>
                    <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#5DADE2]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5DADE2]"></div>
                </label>
            </td>
            <td class="px-6 py-4 text-right">
                <button onclick="deleteUser(${
                  user.id
                })" class="text-slate-400 hover:text-red-500 transition-colors" ${isDisabled}>
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;

    tbody.appendChild(tr);
  });
}

window.toggleAdminStatus = async function (userId, isStaff) {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${API_BASE}${userId}/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ is_staff: isStaff }),
    });

    if (response.ok) {
      Toast.show({
        type: "success",
        message: `Permisos actualizados: ${
          isStaff ? "Admin activado" : "Admin desactivado"
        }`,
      });
    } else {
      console.error("Failed to update status");
      Toast.show({ type: "error", message: "Error al actualizar permisos" });
      loadUsers(); // Reload to revert state
    }
  } catch (error) {
    console.error("Network error:", error);
    Toast.show({ type: "error", message: "Error de conexión" });
    loadUsers();
  }
};

window.deleteUser = function (userId) {
  Modal.confirm({
    title: "Eliminar Usuario",
    message:
      "¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.",
    onConfirm: async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`${API_BASE}${userId}/`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          Toast.show({
            type: "success",
            message: "Usuario eliminado correctamente",
          });
          loadUsers();
        } else {
          Toast.show({ type: "error", message: "Error al eliminar usuario" });
        }
      } catch (error) {
        console.error("Delete error:", error);
        Toast.show({ type: "error", message: "Error de conexión" });
      }
    },
  });
};

function setupSearch() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();

    if (!window.allUsersCache) return;

    const filtered = window.allUsersCache.filter(
      (user) =>
        user.username.toLowerCase().includes(query) ||
        (user.email && user.email.toLowerCase().includes(query))
    );

    renderUsers(filtered);
  });
}
