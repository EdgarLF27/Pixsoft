// Configuración de Supabase
const SUPABASE_URL = "https://twzakkmqyjchdihxkinp.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3emFra21xeWpjaGRpaHhraW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NjEyMDksImV4cCI6MjA4MDQzNzIwOX0.W4QbqH6lZL8a33stnMpT0UBYsHJ8NYBeZMeeDB8PCe4";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Función para alternar entre formularios (login, registro, recuperación)
function toggleAuth(type) {
  ["login-form", "register-form", "recovery-form"].forEach((id) => {
    document.getElementById(id).classList.add("hidden");
  });
  document.getElementById(`${type}-form`).classList.remove("hidden");
}

// Función de Login - Redirige a Admin
async function handleLogin(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  // Estado de carga visual
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML =
    '<i class="fa-solid fa-circle-notch fa-spin"></i> Cargando...';

  try {
    // Autenticar con Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) throw error;

    // Guardar token en localStorage
    const accessToken = data.session.access_token;
    localStorage.setItem("pixsoft_token", accessToken);
    localStorage.setItem("pixsoft_user", JSON.stringify(data.user));

    showToast("Inicio de sesión exitoso", "success");

    // Redirigir al dashboard de administrador
    setTimeout(() => {
      window.location.href = "./Admin/index.html";
    }, 500);
  } catch (error) {
    showToast(error.message || "Error al iniciar sesión", "error");
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

// Función de Registro
async function handleRegister(e) {
  e.preventDefault();
  const inputs = e.target.querySelectorAll("input");
  const nombre = inputs[0].value;
  const apellido = inputs[1].value;
  const email = inputs[2].value;
  const password = inputs[3].value;

  try {
    // Crear usuario en Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          first_name: nombre,
          last_name: apellido,
        },
      },
    });

    if (error) throw error;

    showToast("Cuenta creada. ¡Revisa tu correo para confirmar!", "success");
    setTimeout(() => toggleAuth("login"), 2000);
  } catch (error) {
    showToast(error.message, "error");
  }
}

// Función de Recuperación de Contraseña
async function handleRecovery(e) {
  e.preventDefault();
  const email = e.target.querySelector('input[type="email"]').value;

  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    showToast("Enlace de recuperación enviado", "info");
    setTimeout(() => toggleAuth("login"), 2000);
  } catch (error) {
    showToast(error.message, "error");
  }
}

// Función para mostrar notificaciones Toast
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;
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
