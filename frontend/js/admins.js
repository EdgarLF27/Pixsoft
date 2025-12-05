const API_BASE = "http://localhost:8000/api/v1/users/";
let allUsers = [];

// --- Inicialización ---
document.addEventListener("DOMContentLoaded", async () => {
    // Verificar Auth
    const token = localStorage.getItem('accessToken');
    if (!token) {
        window.location.href = '../Login.html';
        return;
    }

    await fetchUsers();
});

// --- API Helper ---
async function apiCall(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('accessToken');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    try {
        const res = await fetch(API_BASE + endpoint, {
            method, headers, body: body ? JSON.stringify(body) : null
        });

        if (res.status === 401) {
            alert('Sesión expirada');
            window.location.href = '../Login.html';
            return null;
        }

        if (res.status === 403) {
            alert('No tienes permisos para realizar esta acción');
            return null;
        }

        if (!res.ok) {
            const err = await res.json();
            throw new Error(JSON.stringify(err));
        }

        return res.status === 204 ? true : await res.json();
    } catch (e) {
        console.error("API Error:", e);
        alert("Error: " + e.message);
        return null;
    }
}

async function fetchUsers() {
    const data = await apiCall('');
    if (data) {
        // Filtramos para mostrar solo admins/staff si se desea, 
        // pero el req dice "gestionar admins", quizás queramos ver todos y promoverlos.
        // Mostraremos todos.
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

    users.forEach(u => {
        let role = '<span class="px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs">Cliente</span>';
        if (u.is_superuser) {
            role = '<span class="px-2 py-1 rounded bg-purple-100 text-purple-700 text-xs font-bold">Super Admin</span>';
        } else if (u.is_staff) {
            role = '<span class="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-medium">Staff</span>';
        }

        const tr = document.createElement("tr");
        tr.className = "hover:bg-slate-50 border-b border-slate-100";
        tr.innerHTML = `
            <td class="px-6 py-4 font-medium text-slate-900">${u.username}</td>
            <td class="px-6 py-4 text-slate-600">${u.email || '-'}</td>
            <td class="px-6 py-4">${role}</td>
            <td class="px-6 py-4 text-right">
                <button onclick='editUser(${JSON.stringify(u).replace(/'/g, "&#39;")})' class="text-slate-400 hover:text-[#5DADE2] mr-2">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button onclick="deleteUser(${u.id})" class="text-slate-400 hover:text-red-500">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// --- Modal ---
let isEditing = false;
let currentUserId = null;

function openUserModal() {
    isEditing = false;
    currentUserId = null;
    document.getElementById("modalTitle").textContent = "Nuevo Usuario";
    document.getElementById("userId").value = "";
    document.getElementById("username").value = "";
    document.getElementById("email").value = "";
    document.getElementById("fullname").value = "";
    document.getElementById("password").value = "";
    document.getElementById("isStaff").checked = false;
    document.getElementById("isSuperuser").checked = false;

    document.getElementById("userModal").classList.remove("hidden");
    setTimeout(() => {
        document.getElementById("modalOverlay").classList.remove("opacity-0");
        document.getElementById("userModalPanel").classList.remove("opacity-0", "scale-95");
        document.getElementById("userModalPanel").classList.add("opacity-100", "scale-100");
    }, 10);
}

function editUser(user) {
    isEditing = true;
    currentUserId = user.id;
    document.getElementById("modalTitle").textContent = "Editar Usuario";
    document.getElementById("userId").value = user.id;
    document.getElementById("username").value = user.username;
    document.getElementById("email").value = user.email;
    document.getElementById("fullname").value = user.name || "";
    document.getElementById("password").value = ""; // Don't show password
    document.getElementById("isStaff").checked = user.is_staff;
    document.getElementById("isSuperuser").checked = user.is_superuser;

    document.getElementById("userModal").classList.remove("hidden");
    setTimeout(() => {
        document.getElementById("modalOverlay").classList.remove("opacity-0");
        document.getElementById("userModalPanel").classList.remove("opacity-0", "scale-95");
        document.getElementById("userModalPanel").classList.add("opacity-100", "scale-100");
    }, 10);
}

function closeUserModal() {
    document.getElementById("modalOverlay").classList.add("opacity-0");
    document.getElementById("userModalPanel").classList.remove("opacity-100", "scale-100");
    document.getElementById("userModalPanel").classList.add("opacity-0", "scale-95");
    setTimeout(() => {
        document.getElementById("userModal").classList.add("hidden");
    }, 300);
}

// --- CRUD ---
async function saveUser() {
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const name = document.getElementById("fullname").value;
    const password = document.getElementById("password").value;
    const is_staff = document.getElementById("isStaff").checked;
    const is_superuser = document.getElementById("isSuperuser").checked;

    if (!username) {
        alert("El nombre de usuario es obligatorio");
        return;
    }

    const payload = {
        username, email, name, is_staff, is_superuser
    };

    if (password) {
        payload.password = password;
    }

    let success;
    if (isEditing && currentUserId) {
        success = await apiCall(`${currentUserId}/`, 'PATCH', payload);
    } else {
        if (!password) {
            alert("La contraseña es obligatoria para nuevos usuarios");
            return;
        }
        success = await apiCall('', 'POST', payload);
    }

    if (success) {
        alert("Usuario guardado correctamente");
        closeUserModal();
        fetchUsers();
    }
}

async function deleteUser(id) {
    if (confirm("¿Estás seguro de eliminar este usuario?")) {
        const success = await apiCall(`${id}/`, 'DELETE');
        if (success) {
            fetchUsers();
        }
    }
}
