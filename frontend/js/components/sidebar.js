/**
 * Renders the Sidebar component into the specified container.
 * @param {string} activePageId - The ID of the current page to highlight in the navigation.
 */
function renderSidebar(activePageId) {
  const sidebarHTML = `
    <aside class="w-64 glass-sidebar flex flex-col h-full fixed md:relative z-50 transition-transform -translate-x-full md:translate-x-0" id="sidebar">
        <!-- Logo -->
        <div class="h-20 flex items-center px-8 border-b border-white/5">
            <div class="flex items-center gap-3">
                <div class="relative w-8 h-8 flex items-center justify-center">
                    <span class="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-br from-[#5DADE2] to-[#85C1E2]" style="font-family: sans-serif;">P</span>
                </div>
                <span class="text-xl font-bold text-slate-900 tracking-wide">PIXSOFT</span>
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
            <a href="#" class="${getLinkClass(activePageId, "clientes")}">
                <i class="fa-solid fa-users w-5 ${getIconClass(
                  activePageId,
                  "clientes"
                )}"></i>
                Clientes
            </a>
            <div class="pt-4 pb-2">
                <p class="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sistema</p>
            </div>
            <a href="#" class="${getLinkClass(activePageId, "configuracion")}">
                <i class="fa-solid fa-gear w-5 ${getIconClass(
                  activePageId,
                  "configuracion"
                )}"></i>
                Configuración
            </a>
        </nav>

        <!-- User Profile -->
        <div class="p-4 border-t border-white/5">
            <div class="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">
                <img src="https://ui-avatars.com/api/?name=Admin+User&background=5DADE2&color=fff" alt="Admin" class="w-8 h-8 rounded-full">
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-slate-900 truncate">Administrador</p>
                    <p class="text-xs text-slate-500 truncate">admin@pixsoft.com</p>
                </div>
                <i class="fa-solid fa-chevron-right text-xs text-slate-400"></i>
            </div>
        </div>
    </aside>
    `;

  const container = document.getElementById("sidebar-container");
  if (container) {
    container.outerHTML = sidebarHTML;
  } else {
    console.error("Sidebar container not found");
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
