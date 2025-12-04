// --- Navigation Logic ---
function navigateTo(viewId) {
  // Update Sidebar Active State
  document.querySelectorAll(".nav-item").forEach((el) => {
    el.classList.remove(
      "bg-white/10",
      "text-white",
      "border-l-4",
      "border-pixsoft-primary"
    );
    el.classList.add("text-slate-300");
    if (el.getAttribute("onclick").includes(viewId)) {
      el.classList.add("bg-white/10", "text-white");
      el.classList.remove("text-slate-300");
    }
  });

  // Switch Content
  document
    .querySelectorAll(".view-section")
    .forEach((el) => el.classList.add("hidden"));
  const target = document.getElementById(`view-${viewId}`);
  if (target) {
    target.classList.remove("hidden");
    // Re-trigger animation
    target.classList.remove("fade-in");
    void target.offsetWidth; // trigger reflow
    target.classList.add("fade-in");
  }

  // Update Title
  const titles = {
    dashboard: "Dashboard",
    profile: "Mi Perfil",
    orders: "Historial de Compras",
    leases: "Arrendamientos",
    support: "Centro de Soporte",
  };
  document.getElementById("page-title").innerText = titles[viewId] || "Pixsoft";
}

// --- Auth Logic ---
function toggleAuth(type) {
  ["login-form", "register-form", "recovery-form"].forEach((id) => {
    document.getElementById(id).classList.add("hidden");
  });
  document.getElementById(`${type}-form`).classList.remove("hidden");
}

function handleLogin(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.innerHTML;

  // Loading State
  btn.disabled = true;
  btn.innerHTML =
    '<i class="fa-solid fa-circle-notch fa-spin"></i> Cargando...';

  setTimeout(() => {
    document
      .getElementById("auth-view")
      .classList.add("opacity-0", "pointer-events-none");
    setTimeout(() => {
      document.getElementById("auth-view").classList.add("hidden");
      document.getElementById("main-layout").classList.remove("hidden");
      showToast("Bienvenido de nuevo, Juan", "success");
    }, 500);
  }, 1500);
}

function handleRegister(e) {
  e.preventDefault();
  showToast("Cuenta creada exitosamente", "success");
  setTimeout(() => toggleAuth("login"), 1000);
}

function handleRecovery(e) {
  e.preventDefault();
  showToast("Enlace de recuperación enviado", "info");
  setTimeout(() => toggleAuth("login"), 2000);
}

function logout() {
  document.getElementById("main-layout").classList.add("hidden");
  document
    .getElementById("auth-view")
    .classList.remove("hidden", "opacity-0", "pointer-events-none");
  // Reset forms
  document.getElementById("login-form").reset();
  const btn = document.querySelector('#login-form button[type="submit"]');
  btn.disabled = false;
  btn.innerHTML = "Iniciar Sesión";
  showToast("Sesión cerrada correctamente", "info");
}

// --- Profile Logic ---
function enableEdit(formId) {
  const form = document.getElementById(formId);
  const inputs = form.querySelectorAll("input");
  inputs.forEach((input) => {
    input.disabled = false;
    input.classList.remove("bg-slate-50");
    input.classList.add("bg-white");
  });
  document.getElementById("profile-actions").classList.remove("hidden");
  inputs[0].focus();
}

function cancelEdit(formId) {
  const form = document.getElementById(formId);
  const inputs = form.querySelectorAll("input");
  inputs.forEach((input) => {
    input.disabled = true;
    input.classList.add("bg-slate-50");
    input.classList.remove("bg-white");
  });
  document.getElementById("profile-actions").classList.add("hidden");
}

function saveProfile() {
  showToast("Perfil actualizado correctamente", "success");
  cancelEdit("profile-form");
}

// --- Support Chat Logic ---
function sendMessage(e) {
  e.preventDefault();
  const input = document.getElementById("chat-input");
  const text = input.value.trim();
  if (!text) return;

  const container = document.getElementById("chat-messages");

  // User Message
  const userMsg = document.createElement("div");
  userMsg.className = "flex justify-end slide-in-right";
  userMsg.innerHTML = `<div class="bg-pixsoft-primary text-white rounded-2xl rounded-tr-none py-2 px-4 max-w-[80%] shadow-md text-sm">${text}</div>`;
  container.appendChild(userMsg);

  input.value = "";
  container.scrollTop = container.scrollHeight;

  // Simulated Reply
  setTimeout(() => {
    const replyMsg = document.createElement("div");
    replyMsg.className = "flex justify-start fade-in";
    replyMsg.innerHTML = `<div class="bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-none py-2 px-4 max-w-[80%] shadow-sm text-sm">Gracias por tu mensaje. Un agente revisará tu caso en breve.</div>`;
    container.appendChild(replyMsg);
    container.scrollTop = container.scrollHeight;
  }, 1000);
}

// --- Modal Logic ---
function showModal(id) {
  document.getElementById(id).classList.remove("hidden");
}

function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
}

function addAddress(e) {
  e.preventDefault();
  closeModal("address-modal");
  showToast("Dirección agregada correctamente", "success");
}

// --- Toast Notification System ---
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");

  const colors = {
    success: "border-l-4 border-green-500 text-green-700",
    error: "border-l-4 border-red-500 text-red-700",
    info: "border-l-4 border-pixsoft-primary text-slate-700",
  };

  const icons = {
    success: "fa-check-circle",
    error: "fa-exclamation-circle",
    info: "fa-info-circle",
  };

  toast.className = `glass-card p-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] slide-in-right bg-white/90 ${colors[type]}`;
  toast.innerHTML = `
                <i class="fa-solid ${icons[type]}"></i>
                <span class="font-medium text-sm">${message}</span>
            `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.4s ease";
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // Set initial active state
  document.querySelector(".nav-item").click();
});
