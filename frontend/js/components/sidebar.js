/**
 * Renders the Sidebar component into the specified container.
 * @param {string} activePageId - The ID of the current page to highlight in the navigation.
 */
function renderSidebar(activePageId) {
  const sidebarHTML = `
    <aside class="w-64 glass-sidebar flex flex-col h-full fixed md:relative z-50 transition-transform -translate-x-full md:translate-x-0" id="sidebar">
        <!-- Logo -->
        <div class="h-20 flex items-center justify-center px-8 border-b border-white/5">
            <div class="w-32 h-16 flex items-center justify-center">
                <img src="../img/Logo.png" alt="PIXSOFT Logo" class="w-full h-full object-contain">
            </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto py-6 px-4 space-y-2">
            <a href="index.html" class="${getLinkClass(
              activePageId,
              "dashboard"
            )}">
                <i class="fa-solid fa-chart-line w-5 ${getIconClass(
                  activePageId,
                  "dashboard"
                )}"></i>
                Dashboard
            </a>
            <a href="productos.html" class="${getLinkClass(
              activePageId,
              "productos"
            )}">
                <i class="fa-solid fa-box-open w-5 ${getIconClass(
                  activePageId,
                  "productos"
                )}"></i>
                Productos
            </a>
            <a href="arrendamiento.html" class="${getLinkClass(
              activePageId,
              "arrendamientos"
            )}">
                <i class="fa-solid fa-file-contract w-5 ${getIconClass(
                  activePageId,
                  "arrendamientos"
                )}"></i>
                Arrendamientos
            </a>
            <a href="envios.html" class="${getLinkClass(
              activePageId,
              "envios"
            )}">
                <i class="fa-solid fa-truck-fast w-5 ${getIconClass(
                  activePageId,
                  "envios"
                )}"></i>
                Envíos
            </a>
            <a href="usuarios.html" class="${getLinkClass(
              activePageId,
              "usuarios"
            )}">
                <i class="fa-solid fa-user-shield w-5 ${getIconClass(
                  activePageId,
                  "usuarios"
                )}"></i>
                Usuarios
            </a>
            <div class="pt-4 pb-2">
                <p class="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sistema</p>
            </div>
            <a href="perfil.html" class="${getLinkClass(
              activePageId,
              "configuracion"
            )}">
                <i class="fa-solid fa-gear w-5 ${getIconClass(
                  activePageId,
                  "configuracion"
                )}"></i>
                Configuración
            </a>
                <button onclick="logout()" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group text-red-500 hover:bg-red-50">
                    <i class="fa-solid fa-sign-out-alt w-5 group-hover:text-red-600 transition-colors"></i>
                    Cerrar Sesión
                </button>
            </nav>
    </aside>
    `;

  const container = document.getElementById("sidebar-container");
  if (container) {
    container.outerHTML = sidebarHTML;

    // Initialize mobile menu toggle after sidebar is rendered
    initializeMobileMenu();
  } else {
    console.error("Sidebar container not found");
  }
}

/**
 * Initializes the mobile menu toggle functionality
 */
function initializeMobileMenu() {
  const menuBtn = document.getElementById("menu-btn");
  const sidebar = document.getElementById("sidebar");

  if (menuBtn && sidebar) {
    // Toggle sidebar on menu button click
    menuBtn.addEventListener("click", () => {
      sidebar.classList.toggle("-translate-x-full");
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener("click", (e) => {
      if (window.innerWidth < 768) {
        if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
          sidebar.classList.add("-translate-x-full");
        }
      }
    });
  }
}

function getLinkClass(activePageId, pageId) {
  const baseClass =
    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group";
  const activeClass =
    "bg-linear-to-r from-[#5DADE2]/20 to-transparent text-[#5DADE2] border border-[#5DADE2]/20 font-medium";
  const inactiveClass =
    "text-slate-600 hover:text-slate-900 hover:bg-slate-100";

  return activePageId === pageId
    ? `${baseClass} ${activeClass}`
    : `${baseClass} ${inactiveClass}`;
}

function getIconClass(activePageId, pageId) {
  return activePageId === pageId
    ? ""
    : "group-hover:text-[#5DADE2] transition-colors";
}
function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  window.location.href = "../Login.html";
}
