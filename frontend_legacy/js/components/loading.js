/**
 * Loading and Skeleton Components
 * Provides loading indicators and skeleton loaders
 */

/**
 * Show full-page loading overlay
 * @param {string} message - Optional loading message
 */
function showLoading(message = "Cargando datos del sistema...") {
  let loadingElement = document.getElementById("global-loading");

  if (!loadingElement) {
    const loadingHTML = `
      <div id="global-loading" class="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
        <div class="text-center">
          <div class="relative w-20 h-20 mx-auto mb-4">
            <div class="absolute inset-0 rounded-full border-4 border-blue-200 animate-pulse"></div>
            <div class="absolute inset-2 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
            <div class="absolute inset-4 rounded-full bg-linear-to-r from-blue-500 to-cyan-500 opacity-20"></div>
          </div>
          <p class="text-slate-700 font-medium" id="loading-message">${message}</p>
          <p class="text-slate-500 text-sm mt-1">Conectando con PIXSOFT API</p>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", loadingHTML);
    loadingElement = document.getElementById("global-loading");
  } else {
    loadingElement.classList.remove("hidden");
    const messageElement = document.getElementById("loading-message");
    if (messageElement) {
      messageElement.textContent = message;
    }
  }
}

/**
 * Hide full-page loading overlay
 */
function hideLoading() {
  const loadingElement = document.getElementById("global-loading");
  if (loadingElement) {
    loadingElement.classList.add("hidden");
  }
}

/**
 * Create inline spinner
 * @param {string} size - Size: 'sm', 'md', 'lg' (default: 'md')
 * @param {string} color - Color: 'primary', 'white', 'slate' (default: 'primary')
 * @returns {string} HTML string for spinner
 */
function createSpinner(size = "md", color = "primary") {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const colors = {
    primary: "border-pixsoft-primary",
    white: "border-white",
    slate: "border-slate-500",
  };

  const sizeClass = sizes[size] || sizes.md;
  const colorClass = colors[color] || colors.primary;

  return `
    <div class="inline-block ${sizeClass} border-4 border-slate-200 border-t-transparent ${colorClass} rounded-full animate-spin"></div>
  `;
}

/**
 * Show loading in specific container
 * @param {string} containerId - ID of container element
 * @param {string} message - Optional loading message
 */
function showContainerLoading(containerId, message = "Cargando...") {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="flex flex-col items-center justify-center py-12">
      ${createSpinner("lg", "primary")}
      <p class="text-slate-600 mt-4">${message}</p>
    </div>
  `;
}

/**
 * Skeleton loader for table rows
 * @param {number} rows - Number of skeleton rows
 * @param {number} columns - Number of columns
 * @returns {string} HTML string for skeleton table
 */
function createTableSkeleton(rows = 5, columns = 6) {
  const skeletonRows = Array(rows)
    .fill(null)
    .map(
      () => `
    <tr class="border-b border-slate-200">
      ${Array(columns)
        .fill(null)
        .map(
          () => `
        <td class="px-6 py-4">
          <div class="h-4 bg-slate-200 rounded animate-pulse"></div>
        </td>
      `
        )
        .join("")}
    </tr>
  `
    )
    .join("");

  return skeletonRows;
}

/**
 * Skeleton loader for product cards
 * @param {number} count - Number of skeleton cards
 * @returns {string} HTML string for skeleton cards
 */
function createProductCardsSkeleton(count = 4) {
  return Array(count)
    .fill(null)
    .map(
      () => `
    <div class="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse">
      <div class="aspect-square bg-slate-200 rounded-lg mb-4"></div>
      <div class="h-4 bg-slate-200 rounded mb-2"></div>
      <div class="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
      <div class="h-8 bg-slate-200 rounded"></div>
    </div>
  `
    )
    .join("");
}

/**
 * Skeleton loader for KPI cards
 * @param {number} count - Number of skeleton cards
 * @returns {string} HTML string for skeleton KPI cards
 */
function createKPISkeleton(count = 4) {
  return Array(count)
    .fill(null)
    .map(
      () => `
    <div class="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse">
      <div class="flex justify-between items-start mb-4">
        <div class="flex-1">
          <div class="h-3 bg-slate-200 rounded w-1/2 mb-2"></div>
          <div class="h-8 bg-slate-200 rounded w-3/4"></div>
        </div>
        <div class="w-12 h-12 bg-slate-200 rounded-xl"></div>
      </div>
      <div class="h-3 bg-slate-200 rounded w-2/3"></div>
    </div>
  `
    )
    .join("");
}

/**
 * Show empty state in container
 * @param {string} containerId - ID of container element
 * @param {string} icon - FontAwesome icon class
 * @param {string} message - Empty state message
 * @param {string} submessage - Optional submessage
 */
function showEmptyState(
  containerId,
  icon = "fa-inbox",
  message = "No hay datos disponibles",
  submessage = ""
) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="flex flex-col items-center justify-center py-12 text-center">
      <i class="fa-solid ${icon} text-6xl text-slate-300 mb-4"></i>
      <p class="text-slate-600 font-medium text-lg">${message}</p>
      ${
        submessage
          ? `<p class="text-slate-400 text-sm mt-2">${submessage}</p>`
          : ""
      }
    </div>
  `;
}

/**
 * Show error state in container
 * @param {string} containerId - ID of container element
 * @param {string} message - Error message
 * @param {Function} onRetry - Optional retry callback
 */
function showErrorState(
  containerId,
  message = "Error al cargar los datos",
  onRetry = null
) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const retryButton = onRetry
    ? `
    <button onclick="(${onRetry.toString()})()" class="mt-4 px-4 py-2 bg-pixsoft-primary text-white rounded-lg hover:bg-pixsoft-secondary transition-colors">
      <i class="fa-solid fa-rotate-right mr-2"></i>
      Reintentar
    </button>
  `
    : "";

  container.innerHTML = `
    <div class="flex flex-col items-center justify-center py-12 text-center">
      <i class="fa-solid fa-exclamation-triangle text-6xl text-red-400 mb-4"></i>
      <p class="text-slate-600 font-medium text-lg">${message}</p>
      <p class="text-slate-400 text-sm mt-2">Por favor, intenta de nuevo más tarde</p>
      ${retryButton}
    </div>
  `;
}
