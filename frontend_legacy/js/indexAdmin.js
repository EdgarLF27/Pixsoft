/**
 * Admin Dashboard Logic
 * Handles data fetching, KPI calculation, and Chart rendering
 */

// Globals
let productsByCategoryChart = null;
let performanceChart = null;
let products = [];
let orders = [];
let users = [];
let dataLastUpdated = null;

document.addEventListener("DOMContentLoaded", () => {
  // Render sidebar
  if (typeof renderSidebar === "function") {
    renderSidebar("dashboard");
  }

  // Initial load
  loadDashboardData();
  updateTodayDate();

  // Auto-refresh every 30s
  setInterval(() => {
    console.log("🔄 Actualizando datos del dashboard...");
    loadDashboardData(true); // true = silent refresh
  }, 30000);

  // Refresh on focus
  window.addEventListener("focus", () => {
    console.log("🔍 Ventana enfocada, actualizando datos...");
    loadDashboardData(true);
  });
});

/**
 * Main data loading function
 * @param {boolean} silent - If true, doesn't show full screen loader
 */
async function loadDashboardData(silent = false) {
  if (!silent) showDashboardLoading();
  dataLastUpdated = new Date();

  try {
    // Fetch data in parallel using generic API utility
    const [productsDesc, ordersDesc, usersDesc] = await Promise.allSettled([
      api.get("products/productos/"), // Ensure correct endpoint path
      api.get("orders/orders/"),
      api.get("users/"),
    ]);

    // Process results
    products = handleApiResult("products", productsDesc);
    orders = handleApiResult("orders", ordersDesc);
    users = handleApiResult("users", usersDesc);

    // Update UI
    updateKPICards();
    updateQuickStats();
    createCharts();
    updateLastUpdatedTime();

    if (!silent) hideDashboardLoading();
  } catch (error) {
    console.error("Critical Dashboard Error:", error);
    if (!silent) hideDashboardLoading();
    showRealDataError();
  }
}

/**
 * Helper to handle Promise.allSettled results and update Status UI
 */
function handleApiResult(type, result) {
  const statusEl = document.getElementById(`${type}-status`);
  const statusTextEl = document.getElementById(`${type}-status-text`);
  const sourceEl = document.getElementById(
    type === "users" ? "clients-source" : `${type}-source`
  );

  if (result.status === "fulfilled") {
    // Success
    if (statusEl) {
      statusEl.className = "w-3 h-3 rounded-full bg-green-500";
      statusEl.classList.remove("animate-pulse");
    }

    const data = extractArrayData(result.value);
    if (statusTextEl) statusTextEl.textContent = `OK (${data.length})`;
    if (sourceEl) sourceEl.textContent = `${data.length} registros`;

    return data;
  } else {
    // Error
    if (statusEl) statusEl.className = "w-3 h-3 rounded-full bg-red-500";
    if (statusTextEl) statusTextEl.textContent = "Error de conexión";
    if (sourceEl) sourceEl.textContent = "ERROR";
    console.error(`Error fetching ${type}:`, result.reason);
    return [];
  }
}

/**
 * KPI Calculations
 */
function updateKPICards() {
  // Total Revenue (Completed Orders)
  const totalRevenue = orders.reduce((sum, order) => {
    const status = (order.status || "").toLowerCase();
    const isCompleted = [
      "completed",
      "completado",
      "approved",
      "aprobado",
    ].some((s) => status.includes(s));
    return isCompleted
      ? sum + (parseFloat(order.total || order.total_price) || 0)
      : sum;
  }, 0);

  safeSetText("total-revenue", formatCurrency(totalRevenue));

  // Revenue Source Label
  const revenueSourceEl = document.getElementById("revenue-source");
  if (revenueSourceEl) {
    revenueSourceEl.innerHTML = `<i class="fa-solid fa-check-circle mr-1"></i>${orders.length} órdenes`;
  }

  // Counts
  safeSetText("total-orders", orders.length);
  safeSetText("total-products", products.length);

  // Active Clients (excluding admins)
  const activeClients = users.filter((user) => {
    const isAdmin =
      user.is_staff || user.role === "admin" || user.username === "admin";
    return !isAdmin;
  }).length;
  safeSetText("total-clients", activeClients);
}

/**
 * Quick Stats Calculations
 */
function updateQuickStats() {
  // Low Stock
  const lowStockCount = products.filter((p) => {
    const stock = parseInt(p.stock_quantity || p.stock || 0);
    return stock < 10 && stock > 0;
  }).length;
  safeSetText("low-stock-count", lowStockCount);

  // Pending Orders
  const pendingOrders = orders.filter((o) => {
    const status = (o.status || "").toLowerCase();
    return ["pending", "pendiente", "processing", "procesando"].some((s) =>
      status.includes(s)
    );
  }).length;
  safeSetText("pending-orders", pendingOrders);

  // Today's Activity
  const today = new Date().toISOString().split("T")[0];
  const newToday = orders.filter((o) => {
    const date = o.created_at || o.order_date || o.date_created;
    return date && date.includes(today);
  }).length;
  safeSetText("new-today", newToday);
}

/**
 * Chart Creation
 */
function createCharts() {
  if (typeof Chart === "undefined") return;

  createProductsByCategoryChart();
  createPerformanceChart();
}

function createProductsByCategoryChart() {
  const ctx = document
    .getElementById("productsByCategoryChart")
    ?.getContext("2d");
  if (!ctx) return;

  if (productsByCategoryChart) productsByCategoryChart.destroy();

  // Group by category
  const categories = {};
  products.forEach((p) => {
    const cat = p.category || p.categoria || p.category_name || "Sin categoría";
    categories[cat] = (categories[cat] || 0) + 1;
  });

  const sortedCats = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const labels = sortedCats.map((item) => item[0]);
  const counts = sortedCats.map((item) => item[1]);

  // Update Stats Text
  const statsEl = document.getElementById("categories-data-source");
  if (statsEl) {
    if (products.length === 0) {
      statsEl.innerHTML = '<span class="text-red-500">⚠️ Sin datos</span>';
    } else {
      statsEl.innerHTML = `<strong>${products.length}</strong> productos`;
    }
  }

  // Chart Data
  const softColors = [
    "rgba(102, 126, 234, 0.7)",
    "rgba(240, 147, 251, 0.7)",
    "rgba(79, 172, 254, 0.7)",
    "rgba(67, 233, 123, 0.7)",
    "rgba(255, 193, 7, 0.7)",
    "rgba(156, 39, 176, 0.7)",
  ];

  productsByCategoryChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          data: counts,
          backgroundColor: softColors.slice(0, labels.length),
          borderRadius: 8,
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: { beginAtZero: true, grid: { color: "#f1f5f9" } },
        x: { grid: { display: false } },
      },
    },
  });
}

function createPerformanceChart() {
  const ctx = document.getElementById("performanceChart")?.getContext("2d");
  if (!ctx) return;

  if (performanceChart) performanceChart.destroy();

  // 6 Month Analysis
  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  const now = new Date();
  const displayMonths = [];
  const revenueData = [];
  const ordersData = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mIdx = d.getMonth();
    const year = d.getFullYear();

    displayMonths.push(months[mIdx]);

    // Filter orders for this month
    const monthOrders = orders.filter((o) => {
      const dateStr = o.created_at || o.order_date;
      if (!dateStr) return false;
      const date = new Date(dateStr);
      return date.getMonth() === mIdx && date.getFullYear() === year;
    });

    // Calculate revenue
    const rev = monthOrders.reduce((sum, o) => {
      const status = (o.status || "").toLowerCase();
      const isCompleted = ["completed", "approved"].some((s) =>
        status.includes(s)
      );
      return isCompleted
        ? sum + (parseFloat(o.total || o.total_price) || 0)
        : sum;
    }, 0);

    revenueData.push(rev);
    ordersData.push(monthOrders.length);
  }

  // Stats
  const totalRev = revenueData.reduce((a, b) => a + b, 0);
  const avgRev = totalRev / 6;
  const totalOrds = ordersData.reduce((a, b) => a + b, 0);
  const avgOrds = totalOrds / 6;

  safeSetText("avg-revenue", formatCurrency(avgRev));
  safeSetText("avg-orders", Math.round(avgOrds));

  // Growth
  let growth = 0;
  if (revenueData[4] > 0) {
    growth = (
      ((revenueData[5] - revenueData[4]) / revenueData[4]) *
      100
    ).toFixed(1);
  }
  const growthEl = document.getElementById("growth-rate");
  if (growthEl) {
    growthEl.textContent = `${growth}%`;
    growthEl.className = `text-lg font-bold ${
      growth >= 0 ? "text-emerald-600" : "text-rose-600"
    }`;
  }

  // Best Month
  const maxRev = Math.max(...revenueData);
  const bestIdx = revenueData.indexOf(maxRev);
  safeSetText("best-month", maxRev > 0 ? displayMonths[bestIdx] : "-");

  // Chart
  performanceChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: displayMonths,
      datasets: [
        {
          label: "Ingresos",
          data: revenueData,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Órdenes",
          data: ordersData,
          borderColor: "#2dd4bf",
          backgroundColor: "rgba(45, 212, 191, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } }, // Custom legend used in html
      scales: {
        y: { beginAtZero: true, grid: { color: "#f1f5f9" } },
        x: { grid: { display: false } },
      },
    },
  });
}

/**
 * UI Utilities
 */
function updateTodayDate() {
  const el = document.getElementById("today-date");
  if (el) {
    el.textContent = formatDate(new Date(), "long"); // uses formatting.js or fallback
  }
}

function updateLastUpdatedTime() {
  if (!dataLastUpdated) return;
  const timeStr = formatDate(dataLastUpdated, "time");

  document.querySelectorAll(".text-white\\/80").forEach((el) => {
    if (
      el.textContent.includes("Datos reales") ||
      el.textContent.includes("Actualizado")
    ) {
      el.textContent = `Actualizado: ${timeStr}`;
    }
  });
}

function safeSetText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function showDashboardLoading() {
  const el = document.getElementById("loading");
  if (el) el.classList.remove("hidden");
}

function hideDashboardLoading() {
  const el = document.getElementById("loading");
  if (el) el.classList.add("hidden");
}

function showRealDataError() {
  safeSetText("categories-data-source", "Error de carga");
}

// Make explicit global for refresh buttons if needed
window.refreshProductsData = async function () {
  await loadDashboardData(false);
};
