/**
 * Table Component
 * Reusable table with sorting, pagination, and filtering
 */

class DataTable {
  /**
   * @param {Object} config - Table configuration
   * @param {string} config.containerId - ID of container element
   * @param {Array} config.columns - Column definitions [{key, label, sortable, render}]
   * @param {Array} config.data - Table data
   * @param {Object} config.options - Table options
   */
  constructor(config) {
    this.containerId = config.containerId;
    this.columns = config.columns || [];
    this.data = config.data || [];
    this.options = {
      pagination: true,
      pageSize: 10,
      sortable: true,
      searchable: false,
      emptyMessage: "No hay datos disponibles",
      ...config.options,
    };

    this.currentPage = 1;
    this.sortColumn = null;
    this.sortDirection = "asc";
    this.filteredData = [...this.data];
  }

  /**
   * Render the table
   */
  render() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`Container ${this.containerId} not found`);
      return;
    }

    const tableHTML = `
      <div class="glass-panel rounded-2xl overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50/50">
                ${this.renderHeaders()}
              </tr>
            </thead>
            <tbody id="${
              this.containerId
            }-body" class="text-sm divide-y divide-slate-200">
              ${this.renderRows()}
            </tbody>
          </table>
        </div>
        ${this.options.pagination ? this.renderPagination() : ""}
      </div>
    `;

    container.innerHTML = tableHTML;
    this.attachEventListeners();
  }

  /**
   * Render table headers
   */
  renderHeaders() {
    return this.columns
      .map((col) => {
        const sortable = col.sortable !== false && this.options.sortable;
        const isSorted = this.sortColumn === col.key;
        const sortIcon = isSorted
          ? this.sortDirection === "asc"
            ? "fa-sort-up"
            : "fa-sort-down"
          : "fa-sort";

        return `
        <th class="px-6 py-4 font-medium ${
          sortable ? "cursor-pointer hover:bg-slate-100 transition-colors" : ""
        }" 
            ${sortable ? `data-sort="${col.key}"` : ""}>
          <div class="flex items-center gap-2">
            ${col.label}
            ${
              sortable
                ? `<i class="fa-solid ${sortIcon} text-xs ${
                    isSorted ? "text-pixsoft-primary" : "text-slate-400"
                  }"></i>`
                : ""
            }
          </div>
        </th>
      `;
      })
      .join("");
  }

  /**
   * Render table rows
   */
  renderRows() {
    if (this.filteredData.length === 0) {
      return `
        <tr>
          <td colspan="${this.columns.length}" class="px-6 py-12 text-center text-slate-500">
            <i class="fa-solid fa-inbox text-4xl mb-2 block text-slate-300"></i>
            ${this.options.emptyMessage}
          </td>
        </tr>
      `;
    }

    const start = (this.currentPage - 1) * this.options.pageSize;
    const end = start + this.options.pageSize;
    const pageData = this.options.pagination
      ? this.filteredData.slice(start, end)
      : this.filteredData;

    return pageData
      .map(
        (row) => `
      <tr class="hover:bg-slate-50 transition-colors">
        ${this.columns
          .map(
            (col) => `
          <td class="px-6 py-4">
            ${
              col.render
                ? col.render(row[col.key], row)
                : this.escapeHtml(row[col.key])
            }
          </td>
        `
          )
          .join("")}
      </tr>
    `
      )
      .join("");
  }

  /**
   * Render pagination
   */
  renderPagination() {
    const totalPages = Math.ceil(
      this.filteredData.length / this.options.pageSize
    );
    if (totalPages <= 1) return "";

    const pages = this.getPageNumbers(totalPages);

    return `
      <div class="p-4 border-t border-slate-200 flex justify-between items-center">
        <button 
          class="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          data-page="prev"
          ${this.currentPage === 1 ? "disabled" : ""}>
          Anterior
        </button>
        
        <div class="flex gap-1">
          ${pages
            .map((page) => {
              if (page === "...") {
                return `<span class="px-3 py-1.5 text-slate-400">...</span>`;
              }
              return `
              <button 
                class="w-8 h-8 rounded-lg flex items-center justify-center font-medium transition-colors ${
                  page === this.currentPage
                    ? "bg-[#5DADE2] text-white"
                    : "hover:bg-slate-100 text-slate-600"
                }"
                data-page="${page}">
                ${page}
              </button>
            `;
            })
            .join("")}
        </div>
        
        <button 
          class="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          data-page="next"
          ${this.currentPage === totalPages ? "disabled" : ""}>
          Siguiente
        </button>
      </div>
    `;
  }

  /**
   * Get page numbers for pagination
   */
  getPageNumbers(totalPages) {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (this.currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(this.currentPage - 1);
        pages.push(this.currentPage);
        pages.push(this.currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    // Sort headers
    container.querySelectorAll("[data-sort]").forEach((header) => {
      header.addEventListener("click", () => {
        const column = header.dataset.sort;
        this.sort(column);
      });
    });

    // Pagination buttons
    container.querySelectorAll("[data-page]").forEach((button) => {
      button.addEventListener("click", () => {
        const page = button.dataset.page;
        if (page === "prev") {
          this.prevPage();
        } else if (page === "next") {
          this.nextPage();
        } else {
          this.goToPage(parseInt(page));
        }
      });
    });
  }

  /**
   * Sort table by column
   */
  sort(columnKey) {
    if (this.sortColumn === columnKey) {
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
    } else {
      this.sortColumn = columnKey;
      this.sortDirection = "asc";
    }

    this.filteredData.sort((a, b) => {
      const aVal = a[columnKey];
      const bVal = b[columnKey];

      if (aVal === bVal) return 0;

      const comparison = aVal > bVal ? 1 : -1;
      return this.sortDirection === "asc" ? comparison : -comparison;
    });

    this.render();
  }

  /**
   * Filter table data
   */
  filter(filterFn) {
    this.filteredData = this.data.filter(filterFn);
    this.currentPage = 1;
    this.render();
  }

  /**
   * Update table data
   */
  updateData(newData) {
    this.data = newData;
    this.filteredData = [...newData];
    this.currentPage = 1;
    this.render();
  }

  /**
   * Go to specific page
   */
  goToPage(page) {
    const totalPages = Math.ceil(
      this.filteredData.length / this.options.pageSize
    );
    if (page >= 1 && page <= totalPages) {
      this.currentPage = page;
      this.render();
    }
  }

  /**
   * Go to previous page
   */
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.render();
    }
  }

  /**
   * Go to next page
   */
  nextPage() {
    const totalPages = Math.ceil(
      this.filteredData.length / this.options.pageSize
    );
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.render();
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    if (text === null || text === undefined) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

/**
 * Helper function to create a table quickly
 */
function createTable(containerId, columns, data, options = {}) {
  const table = new DataTable({ containerId, columns, data, options });
  table.render();
  return table;
}
