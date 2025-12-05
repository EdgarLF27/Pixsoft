/**
 * Toast Notification System
 * Displays temporary notification messages
 */

class ToastManager {
  constructor() {
    this.toasts = [];
    this.container = null;
    this.init();
  }

  /**
   * Initialize toast container
   */
  init() {
    if (!document.getElementById("toast-container")) {
      const containerHTML = `
        <div id="toast-container" class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-md">
        </div>
      `;
      document.body.insertAdjacentHTML("beforeend", containerHTML);
    }
    this.container = document.getElementById("toast-container");
  }

  /**
   * Show a toast notification
   * @param {string} message - Toast message
   * @param {string} type - Toast type: 'success', 'error', 'warning', 'info'
   * @param {number} duration - Duration in milliseconds (0 = no auto-dismiss)
   * @returns {string} Toast ID
   */
  show(message, type = "info", duration = 4000) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const icons = {
      success: "fa-check-circle",
      error: "fa-exclamation-circle",
      warning: "fa-exclamation-triangle",
      info: "fa-info-circle",
    };

    const colors = {
      success: "bg-emerald-50 border-emerald-200 text-emerald-800",
      error: "bg-red-50 border-red-200 text-red-800",
      warning: "bg-amber-50 border-amber-200 text-amber-800",
      info: "bg-blue-50 border-blue-200 text-blue-800",
    };

    const iconColors = {
      success: "text-emerald-500",
      error: "text-red-500",
      warning: "text-amber-500",
      info: "text-blue-500",
    };

    const toastHTML = `
      <div id="${id}" class="toast-item ${colors[type]} border rounded-xl px-4 py-3 shadow-lg backdrop-blur-sm transform translate-x-full transition-all duration-300 flex items-start gap-3">
        <i class="fa-solid ${icons[type]} ${iconColors[type]} text-lg mt-0.5"></i>
        <div class="flex-1">
          <p class="font-medium text-sm">${message}</p>
        </div>
        <button onclick="toastManager.dismiss('${id}')" class="text-slate-400 hover:text-slate-600 transition-colors ml-2">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `;

    this.container.insertAdjacentHTML("beforeend", toastHTML);
    const toastElement = document.getElementById(id);

    // Trigger animation
    requestAnimationFrame(() => {
      toastElement.classList.remove("translate-x-full");
      toastElement.classList.add("translate-x-0");
    });

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }

    this.toasts.push({ id, element: toastElement });
    return id;
  }

  /**
   * Dismiss a toast
   * @param {string} id - Toast ID
   */
  dismiss(id) {
    const toast = this.toasts.find((t) => t.id === id);
    if (!toast) return;

    toast.element.classList.remove("translate-x-0");
    toast.element.classList.add("translate-x-full");

    setTimeout(() => {
      toast.element.remove();
      this.toasts = this.toasts.filter((t) => t.id !== id);
    }, 300);
  }

  /**
   * Dismiss all toasts
   */
  dismissAll() {
    this.toasts.forEach((toast) => {
      this.dismiss(toast.id);
    });
  }

  /**
   * Show success toast
   */
  success(message, duration = 4000) {
    return this.show(message, "success", duration);
  }

  /**
   * Show error toast
   */
  error(message, duration = 5000) {
    return this.show(message, "error", duration);
  }

  /**
   * Show warning toast
   */
  warning(message, duration = 4000) {
    return this.show(message, "warning", duration);
  }

  /**
   * Show info toast
   */
  info(message, duration = 4000) {
    return this.show(message, "info", duration);
  }
}

// Create global toast manager instance
const toastManager = new ToastManager();

/**
 * Helper functions for quick access
 */
function showToast(message, type = "info", duration = 4000) {
  return toastManager.show(message, type, duration);
}

function showSuccess(message, duration = 4000) {
  return toastManager.success(message, duration);
}

function showError(message, duration = 5000) {
  return toastManager.error(message, duration);
}

function showWarning(message, duration = 4000) {
  return toastManager.warning(message, duration);
}

function showInfo(message, duration = 4000) {
  return toastManager.info(message, duration);
}
