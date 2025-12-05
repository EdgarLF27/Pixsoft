/**
 * Formatting Utilities
 * Data formatting and display helpers
 */

/**
 * Format currency (Mexican Peso)
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: MXN)
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount, currency = "MXN") {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "$0.00";
  }

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

/**
 * Format number with thousands separator
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
function formatNumber(number, decimals = 0) {
  if (number === null || number === undefined || isNaN(number)) {
    return "0";
  }

  return new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
}

/**
 * Format date
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type: 'short', 'long', 'full', 'time', 'datetime'
 * @returns {string} Formatted date string
 */
function formatDate(date, format = "short") {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (!(dateObj instanceof Date) || isNaN(dateObj)) return "";

  const formats = {
    short: { day: "2-digit", month: "2-digit", year: "numeric" },
    long: { day: "numeric", month: "long", year: "numeric" },
    full: { weekday: "long", day: "numeric", month: "long", year: "numeric" },
    time: { hour: "2-digit", minute: "2-digit" },
    datetime: {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  };

  return new Intl.DateTimeFormat(
    "es-MX",
    formats[format] || formats.short
  ).format(dateObj);
}

/**
 * Format relative time (e.g., "hace 2 horas")
 * @param {Date|string} date - Date to format
 * @returns {string} Relative time string
 */
function formatRelativeTime(date) {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (!(dateObj instanceof Date) || isNaN(dateObj)) return "";

  const now = new Date();
  const diffMs = now - dateObj;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return "hace unos segundos";
  if (diffMin < 60)
    return `hace ${diffMin} ${diffMin === 1 ? "minuto" : "minutos"}`;
  if (diffHour < 24)
    return `hace ${diffHour} ${diffHour === 1 ? "hora" : "horas"}`;
  if (diffDay < 7) return `hace ${diffDay} ${diffDay === 1 ? "día" : "días"}`;
  if (diffWeek < 4)
    return `hace ${diffWeek} ${diffWeek === 1 ? "semana" : "semanas"}`;
  if (diffMonth < 12)
    return `hace ${diffMonth} ${diffMonth === 1 ? "mes" : "meses"}`;
  return `hace ${diffYear} ${diffYear === 1 ? "año" : "años"}`;
}

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted file size string
 */
function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  if (!bytes) return "";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
  );
}

/**
 * Truncate text
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
function truncateText(text, length = 50, suffix = "...") {
  if (!text) return "";
  if (text.length <= length) return text;
  return text.substring(0, length - suffix.length) + suffix;
}

/**
 * Format phone number (Mexican format)
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
function formatPhone(phone) {
  if (!phone) return "";

  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, "");

  // Format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
  }

  return phone;
}

/**
 * Format percentage
 * @param {number} value - Value to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) {
    return "0%";
  }

  return `${formatNumber(value, decimals)}%`;
}

/**
 * Capitalize first letter
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
function capitalize(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Capitalize each word
 * @param {string} text - Text to capitalize
 * @returns {string} Title case text
 */
function titleCase(text) {
  if (!text) return "";
  return text
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
}

/**
 * Format SKU (product code)
 * @param {string} sku - SKU to format
 * @returns {string} Formatted SKU
 */
function formatSKU(sku) {
  if (!sku) return "";
  return sku.toUpperCase().replace(/\s+/g, "-");
}

/**
 * Format order status
 * @param {string} status - Order status
 * @returns {Object} {text: string, className: string}
 */
function formatOrderStatus(status) {
  const statusMap = {
    pending: { text: "Pendiente", className: "badge-neon-yellow" },
    processing: { text: "Procesando", className: "badge-neon-blue" },
    completed: { text: "Completado", className: "badge-neon-green" },
    cancelled: { text: "Cancelado", className: "badge-neon-red" },
    shipped: { text: "Enviado", className: "badge-neon-blue" },
    delivered: { text: "Entregado", className: "badge-neon-green" },
  };

  const normalized = status?.toLowerCase() || "pending";
  return (
    statusMap[normalized] || { text: status, className: "badge-neon-blue" }
  );
}

/**
 * Format stock status
 * @param {number} quantity - Stock quantity
 * @param {number} lowStockThreshold - Threshold for low stock
 * @returns {Object} {text: string, className: string}
 */
function formatStockStatus(quantity, lowStockThreshold = 10) {
  if (quantity === 0) {
    return { text: "Agotado", className: "badge-neon-red" };
  }
  if (quantity < lowStockThreshold) {
    return { text: "Bajo Stock", className: "badge-neon-yellow" };
  }
  return { text: "En Stock", className: "badge-neon-green" };
}

/**
 * Format address
 * @param {Object} address - Address object
 * @returns {string} Formatted address string
 */
function formatAddress(address) {
  if (!address) return "";

  const parts = [
    address.street,
    address.number,
    address.colony,
    address.city,
    address.state,
    address.zipCode,
  ].filter(Boolean);

  return parts.join(", ");
}

/**
 * Slugify text (for URLs)
 * @param {string} text - Text to slugify
 * @returns {string} Slugified text
 */
function slugify(text) {
  if (!text) return "";

  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/-+/g, "-") // Replace multiple - with single -
    .trim();
}
