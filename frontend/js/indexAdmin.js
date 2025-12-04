// Sidebar Toggle for Mobile
const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");

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

// Chart.js Configuration
Chart.defaults.color = "#94a3b8";
Chart.defaults.borderColor = "rgba(255, 255, 255, 0.05)";
Chart.defaults.font.family = "'Inter', sans-serif";

// Performance Chart
const ctx = document.getElementById("performanceChart").getContext("2d");
const gradientVentas = ctx.createLinearGradient(0, 0, 0, 400);
gradientVentas.addColorStop(0, "rgba(93, 173, 226, 0.5)");
gradientVentas.addColorStop(1, "rgba(93, 173, 226, 0)");

const gradientLeasing = ctx.createLinearGradient(0, 0, 0, 400);
gradientLeasing.addColorStop(0, "rgba(168, 85, 247, 0.5)");
gradientLeasing.addColorStop(1, "rgba(168, 85, 247, 0)");

new Chart(ctx, {
  type: "line",
  data: {
    labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    datasets: [
      {
        label: "Ventas",
        data: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
        borderColor: "#5DADE2",
        backgroundColor: gradientVentas,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#5DADE2",
        borderWidth: 2,
      },
      {
        label: "Arrendamientos",
        data: [8000, 12000, 10000, 15000, 14000, 18000, 16000],
        borderColor: "#a855f7",
        backgroundColor: gradientLeasing,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#a855f7",
        borderWidth: 2,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleColor: "#fff",
        bodyColor: "#cbd5e1",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          drawBorder: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  },
});

// Doughnut Chart
const ctxDoughnut = document.getElementById("doughnutChart").getContext("2d");
new Chart(ctxDoughnut, {
  type: "doughnut",
  data: {
    labels: ["Ventas", "Arrendamientos"],
    datasets: [
      {
        data: [65, 35],
        backgroundColor: ["#5DADE2", "#a855f7"],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "75%",
    plugins: {
      legend: {
        display: false,
      },
    },
  },
});
