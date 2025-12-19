const API_BASE = "http://localhost:8000/api/v1/users/";
let allUsers = [];
let userModal;
let isEditing = false;
let currentUserId = null;

// --- Inicialización ---
document.addEventListener("DOMContentLoaded", async () => {
  // 1. Initialize Sidebar
  if (typeof renderSidebar === "function") renderSidebar("admins");

  // 2. Verificar Auth
  const token = localStorage.getItem("accessToken");
  if (!token) {
    window.location.href = "../Login.html";
    return;
  }

  // 3. Initialize Modal
  initializeModal();

  // 4. Load Data
  await fetchUsers();
});

// --- API Helper ---
async function apiCall(endpoint, method = "GET", body = null) {
  const token = localStorage.getItem("accessToken");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  try {
    const res = await fetch(API_BASE + endpoint, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    if (res.status === 401) {
      Toast.show({ type: "error", message: "Sesión expirada" });
      setTimeout(() => (window.location.href = "../Login.html"), 1500);
      return null;
    }

    if (res.status === 403) {
      Toast.show({
        type: "error",
        message: "No tienes permisos para realizar esta acción",
      });
      return null;
    }

    if (!res.ok) {
      const err = await res.json();
      throw new Error(JSON.stringify(err));
    }

    return res.status === 204 ? true : await res.json();
  } catch (e) {
    console.error("API Error:", e);
    Toast.show({ type: "error", message: "Error: " + e.message });
    return null;
  }
}

async function fetchUsers() {
  const data = await apiCall("");
  if (data) {
    allUsers = data;
    renderUsers(allUsers);
  }
}

// --- Renderizado ---
function renderUsers(users) {
  const tbody = document.getElementById("usersTableBody");
  tbody.innerHTML = "";

  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center p-4">No hay usuarios</td></tr>`;
    return;
  }

  users.forEach((u) => {
    let role =
      '<span class="px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs">Cliente</span>';
    if (u.is_superuser) {
      role =
        '<span class="px-2 py-1 rounded bg-purple-100 text-purple-700 text-xs font-bold">Super Admin</span>';
    } else if (u.is_staff) {
      role =
        '<span class="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-medium">Staff</span>';
    }

    const tr = document.createElement("tr");
    tr.className = "hover:bg-slate-50 border-b border-slate-100";
    tr.innerHTML = `
            <td class="px-6 py-4 font-medium text-slate-900">${u.username}</td>
            <td class="px-6 py-4 text-slate-600">${u.email || "-"}</td>
            <td class="px-6 py-4">${role}</td>
            <td class="px-6 py-4 text-right">
                <button onclick='editUser(${JSON.stringify(u).replace(
                  /'/g,
                  "&#39;"
                )})' class="text-slate-400 hover:text-[#5DADE2] mr-2">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button onclick="deleteUser(${
                  u.id
                })" class="text-slate-400 hover:text-red-500">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
    tbody.appendChild(tr);
  });
}

// --- Modal Initialization ---
function initializeModal() {
  userModal = new Modal({
    title: "Nuevo Administrador",
    content: getUserFormHTML(),
    size: "lg",
    buttons: [
      {
        text: "Cancelar",
        class:
          "px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors",
        onClick: () => userModal.close(),
      },
      {
        text: "Guardar",
        class: "btn-primary",
        onClick: handleSaveUser,
      },
    ],
    onClose: () => {
      resetForm();
    },
  });
}

function getUserFormHTML() {
  return `
        <form class="space-y-4" onsubmit="event.preventDefault();">
            <input type="hidden" id="userId">

            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Username *</label>
                <input type="text" id="username" class="input-field w-full" required>
            </div>

            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                <input type="email" id="email" class="input-field w-full" required>
            </div>

            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                <input type="text" id="fullname" class="input-field w-full">
            </div>

            <div id="passwordField">
                <label class="block text-sm font-medium text-slate-700 mb-1">Contraseña <span id="passwordHint">*</span></label>
                <input type="password" id="password" class="input-field w-full" placeholder="Mínimo 8 caracteres">
            </div>

            <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Privilegios</label>
                <div class="flex flex-col gap-2">
                    <label class="flex items-center gap-2">
                        <input type="checkbox" id="isStaff" class="w-4 h-4 text-[#5DADE2] rounded">
                        <span class="text-slate-600">Staff (Acceso básico al panel)</span>
                    </label>
                    <label class="flex items-center gap-2">
                        <input type="checkbox" id="isSuperuser" class="w-4 h-4 text-[#5DADE2] rounded">
                        <span class="text-slate-600">Superusuario (Acceso total)</span>
                    </label>
                </div>
            </div>
        </form>
    `;
}

function resetForm() {
  const form = document.querySelector("#userModalPanel form");
  if (form) form.reset();
  isEditing = false;
  currentUserId = null;
}

// --- Modal Actions ---
window.openUserModal = function () {
  isEditing = false;
  currentUserId = null;
  userModal.updateTitle("Nuevo Administrador");
  resetForm();
  userModal.open();
  // Make password required for new users
  const passwordHint = document.getElementById("passwordHint");
  if (passwordHint) passwordHint.textContent = "*";
};

window.editUser = function (user) {
  isEditing = true;
  currentUserId = user.id;
  userModal.updateTitle("Editar Usuario");
  userModal.open();

  // Fill form
  document.getElementById("userId").value = user.id;
  document.getElementById("username").value = user.username;
  document.getElementById("email").value = user.email;
  document.getElementById("fullname").value = user.name || "";
  document.getElementById("password").value = "";
  document.getElementById("isStaff").checked = user.is_staff;
  document.getElementById("isSuperuser").checked = user.is_superuser;

  // Make password optional for editing
  const passwordHint = document.getElementById("passwordHint");
  if (passwordHint) passwordHint.textContent = "(dejar vacío para no cambiar)";
};

// --- CRUD ---
async function handleSaveUser() {
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const name = document.getElementById("fullname").value;
  const password = document.getElementById("password").value;
  const is_staff = document.getElementById("isStaff").checked;
  const is_superuser = document.getElementById("isSuperuser").checked;

  if (!username || !email) {
    Toast.show({
      type: "warning",
      message: "Por favor completa los campos obligatorios (*)",
    });
    return;
  }

  const payload = {
    username,
    email,
    name,
    is_staff,
    is_superuser,
  };

  if (password) {
    payload.password = password;
  }

  let success;
  if (isEditing && currentUserId) {
    success = await apiCall(`${currentUserId}/`, "PATCH", payload);
  } else {
    if (!password) {
      Toast.show({
        type: "warning",
        message: "La contraseña es obligatoria para nuevos usuarios",
      });
      return;
    }
    success = await apiCall("", "POST", payload);
  }

  if (success) {
    Toast.show({
      type: "success",
      message: isEditing
        ? "Usuario actualizado correctamente"
        : "Usuario creado correctamente",
    });
    userModal.close();
    fetchUsers();
  }
}

window.deleteUser = async function (id) {
  Modal.confirm({
    title: "Eliminar Usuario",
    message:
      "¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.",
    onConfirm: async () => {
      const success = await apiCall(`${id}/`, "DELETE");
      if (success) {
        Toast.show({
          type: "success",
          message: "Usuario eliminado correctamente",
        });
        fetchUsers();
      }
    },
  });
};
