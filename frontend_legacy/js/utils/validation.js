/**
 * Validation Utilities
 * Form validation functions
 */

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function validateEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Mexican format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
function validatePhone(phone) {
  if (!phone) return false;
  // Remove spaces, dashes, parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  // Mexican phone: 10 digits
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @returns {boolean} True if not empty
 */
function validateRequired(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * Validate string length
 * @param {string} value - String to validate
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @returns {boolean} True if within range
 */
function validateLength(value, min = 0, max = Infinity) {
  if (!value) return min === 0;
  const length = value.toString().length;
  return length >= min && length <= max;
}

/**
 * Validate number range
 * @param {number} value - Number to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} True if within range
 */
function validateNumber(value, min = -Infinity, max = Infinity) {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  return num >= min && num <= max;
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} {valid: boolean, strength: string, message: string}
 */
function validatePassword(password) {
  if (!password) {
    return {
      valid: false,
      strength: "none",
      message: "La contraseña es requerida",
    };
  }

  const length = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (length < 8) {
    return {
      valid: false,
      strength: "weak",
      message: "Debe tener al menos 8 caracteres",
    };
  }

  let strength = 0;
  if (hasLower) strength++;
  if (hasUpper) strength++;
  if (hasNumber) strength++;
  if (hasSpecial) strength++;

  if (strength < 2) {
    return {
      valid: false,
      strength: "weak",
      message:
        "Debe incluir mayúsculas, minúsculas, números o caracteres especiales",
    };
  }

  if (strength === 2) {
    return { valid: true, strength: "medium", message: "Contraseña aceptable" };
  }

  return { valid: true, strength: "strong", message: "Contraseña segura" };
}

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
function validateUrl(url) {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate date
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid date
 */
function validateDate(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * Validate file size
 * @param {File} file - File object
 * @param {number} maxSizeMB - Maximum size in MB
 * @returns {boolean} True if within size limit
 */
function validateFileSize(file, maxSizeMB = 5) {
  if (!file) return false;
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
}

/**
 * Validate file type
 * @param {File} file - File object
 * @param {Array} allowedTypes - Array of allowed MIME types
 * @returns {boolean} True if type is allowed
 */
function validateFileType(file, allowedTypes = []) {
  if (!file) return false;
  if (allowedTypes.length === 0) return true;
  return allowedTypes.includes(file.type);
}

/**
 * Validate credit card number (Luhn algorithm)
 * @param {string} cardNumber - Card number to validate
 * @returns {boolean} True if valid
 */
function validateCreditCard(cardNumber) {
  if (!cardNumber) return false;

  // Remove spaces and dashes
  const cleaned = cardNumber.replace(/[\s\-]/g, "");

  // Check if only digits
  if (!/^\d+$/.test(cleaned)) return false;

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Validate RFC (Mexican tax ID)
 * @param {string} rfc - RFC to validate
 * @returns {boolean} True if valid
 */
function validateRFC(rfc) {
  if (!rfc) return false;

  // RFC can be 12 or 13 characters
  const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;
  return rfcRegex.test(rfc.toUpperCase());
}

/**
 * Form validation helper
 * @param {HTMLFormElement} form - Form element
 * @param {Object} rules - Validation rules {fieldName: [validators]}
 * @returns {Object} {valid: boolean, errors: {}}
 */
function validateForm(form, rules) {
  const errors = {};
  let valid = true;

  for (const [fieldName, validators] of Object.entries(rules)) {
    const field = form.elements[fieldName];
    if (!field) continue;

    const value = field.value;

    for (const validator of validators) {
      const result = validator(value);

      if (result !== true) {
        errors[fieldName] = result;
        valid = false;

        // Add error class to field
        field.classList.add("border-red-500");

        // Show error message
        const errorElement =
          field.parentElement.querySelector(".error-message");
        if (errorElement) {
          errorElement.textContent = result;
          errorElement.classList.remove("hidden");
        }

        break;
      } else {
        // Remove error class
        field.classList.remove("border-red-500");

        // Hide error message
        const errorElement =
          field.parentElement.querySelector(".error-message");
        if (errorElement) {
          errorElement.classList.add("hidden");
        }
      }
    }
  }

  return { valid, errors };
}

/**
 * Clear form validation errors
 * @param {HTMLFormElement} form - Form element
 */
function clearFormErrors(form) {
  form.querySelectorAll(".border-red-500").forEach((field) => {
    field.classList.remove("border-red-500");
  });

  form.querySelectorAll(".error-message").forEach((error) => {
    error.classList.add("hidden");
  });
}
