/**
 * Generic Modal Component
 * Creates and manages modal dialogs with animations
 */

class Modal {
  /**
   * @param {Object} config - Modal configuration
   * @param {string} config.id - Unique modal ID
   * @param {string} config.title - Modal title
   * @param {string} config.content - Modal HTML content
   * @param {Array} config.buttons - Array of button configs [{text, onClick, className}]
   * @param {Function} config.onClose - Callback when modal closes
   * @param {string} config.size - Modal size: 'sm', 'md', 'lg', 'xl' (default: 'md')
   */
  constructor(config) {
    this.id = config.id || `modal-${Date.now()}`;
    this.title = config.title || "";
    this.content = config.content || "";
    this.buttons = config.buttons || [];
    this.onClose = config.onClose || null;
    this.size = config.size || "md";
    this.isOpen = false;
    this.element = null;
  }

  /**
   * Get max-width class based on size
   */
  getSizeClass() {
    const sizes = {
      sm: "max-w-md",
      md: "max-w-2xl",
      lg: "max-w-4xl",
      xl: "max-w-6xl",
    };
    return sizes[this.size] || sizes.md;
  }

  /**
   * Render modal HTML
   */
  render() {
    const buttonsHTML = this.buttons
      .map(
        (btn) => `
      <button 
        class="${
          btn.className ||
          "px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors font-medium"
        }"
        data-action="${btn.action || "custom"}">
        ${btn.text}
      </button>
    `
      )
      .join("");

    const modalHTML = `
      <div id="${this.id}" class="fixed inset-0 z-50 overflow-y-auto hidden">
        <div class="modal-overlay fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"></div>
        
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="modal-panel bg-white rounded-2xl shadow-2xl w-full ${this.getSizeClass()} max-h-[90vh] overflow-y-auto transform transition-all">
            <!-- Modal Header -->
            <div class="modal-header sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl z-10">
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-bold text-slate-900">${this.title}</h2>
                <button class="modal-close text-slate-400 hover:text-slate-600 transition-colors">
                  <i class="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>
            </div>

            <!-- Modal Body -->
            <div class="modal-body p-6">
              ${this.content}
            </div>

            <!-- Modal Footer -->
            ${
              this.buttons.length > 0
                ? `
              <div class="modal-footer sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 rounded-b-2xl flex justify-end gap-3">
                ${buttonsHTML}
              </div>
            `
                : ""
            }
          </div>
        </div>
      </div>
    `;

    // Remove existing modal with same ID
    const existing = document.getElementById(this.id);
    if (existing) {
      existing.remove();
    }

    // Append to body
    document.body.insertAdjacentHTML("beforeend", modalHTML);
    this.element = document.getElementById(this.id);
    this.attachEventListeners();
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    if (!this.element) return;

    // Close button
    const closeBtn = this.element.querySelector(".modal-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.close());
    }

    // Overlay click
    const overlay = this.element.querySelector(".modal-overlay");
    if (overlay) {
      overlay.addEventListener("click", () => this.close());
    }

    // ESC key
    this.escHandler = (e) => {
      if (e.key === "Escape" && this.isOpen) {
        this.close();
      }
    };
    document.addEventListener("keydown", this.escHandler);

    // Button actions
    this.buttons.forEach((btn, index) => {
      const btnElement = this.element.querySelectorAll("[data-action]")[index];
      if (btnElement && btn.onClick) {
        btnElement.addEventListener("click", (e) => {
          btn.onClick(e, this);
        });
      }
    });
  }

  /**
   * Open modal with animation
   */
  open() {
    if (!this.element) {
      this.render();
    }

    this.element.classList.remove("hidden");
    this.isOpen = true;

    // Trigger animation
    requestAnimationFrame(() => {
      const overlay = this.element.querySelector(".modal-overlay");
      const panel = this.element.querySelector(".modal-panel");

      if (overlay) {
        overlay.classList.remove("opacity-0");
        overlay.classList.add("opacity-100");
      }

      if (panel) {
        panel.classList.remove("opacity-0", "scale-95");
        panel.classList.add("opacity-100", "scale-100");
      }
    });

    // Prevent body scroll
    document.body.style.overflow = "hidden";
  }

  /**
   * Close modal with animation
   */
  close() {
    const overlay = this.element.querySelector(".modal-overlay");
    const panel = this.element.querySelector(".modal-panel");

    if (overlay) {
      overlay.classList.remove("opacity-100");
      overlay.classList.add("opacity-0");
    }

    if (panel) {
      panel.classList.remove("opacity-100", "scale-100");
      panel.classList.add("opacity-0", "scale-95");
    }

    // Wait for animation to complete
    setTimeout(() => {
      this.element.classList.add("hidden");
      this.isOpen = false;
      document.body.style.overflow = "";

      if (this.onClose) {
        this.onClose();
      }
    }, 300);
  }

  /**
   * Update modal content
   */
  updateContent(newContent) {
    const body = this.element?.querySelector(".modal-body");
    if (body) {
      body.innerHTML = newContent;
    }
  }

  /**
   * Update modal title
   */
  updateTitle(newTitle) {
    const titleElement = this.element?.querySelector(".modal-header h2");
    if (titleElement) {
      titleElement.textContent = newTitle;
    }
  }

  /**
   * Destroy modal and remove from DOM
   */
  destroy() {
    if (this.escHandler) {
      document.removeEventListener("keydown", this.escHandler);
    }
    if (this.element) {
      this.element.remove();
    }
    this.element = null;
    this.isOpen = false;
    document.body.style.overflow = "";
  }
}

/**
 * Helper function to create and open a modal quickly
 * @param {Object} config - Modal configuration
 * @returns {Modal} Modal instance
 */
function createModal(config) {
  const modal = new Modal(config);
  modal.render();
  modal.open();
  return modal;
}

/**
 * Confirm dialog helper
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @param {Function} onConfirm - Callback when confirmed
 * @param {Function} onCancel - Callback when cancelled
 */
function confirmDialog(title, message, onConfirm, onCancel) {
  return createModal({
    title: title,
    content: `<p class="text-slate-600">${message}</p>`,
    size: "sm",
    buttons: [
      {
        text: "Cancelar",
        className:
          "px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors font-medium",
        onClick: (e, modal) => {
          modal.close();
          if (onCancel) onCancel();
        },
      },
      {
        text: "Confirmar",
        className: "btn-primary",
        onClick: (e, modal) => {
          modal.close();
          if (onConfirm) onConfirm();
        },
      },
    ],
  });
}
