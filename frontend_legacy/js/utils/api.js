/**
 * API Utilities
 * Centralized API service for making HTTP requests
 */

// API Configuration
const API_CONFIG = {
  BASE_URL: "http://localhost:8000/api/v1/",
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// API Endpoints
const API_ENDPOINTS = {
  // Products
  PRODUCTS: "products/productos/",
  PRODUCT_DETAIL: (id) => `products/productos/${id}/`,
  PRODUCT_CATEGORIES: "products/categories/",

  // Orders
  ORDERS: "orders/orders/",
  ORDER_DETAIL: (id) => `orders/orders/${id}/`,

  // Users
  USERS: "users/",
  USER_DETAIL: (id) => `users/${id}/`,
  USER_PROFILE: "users/profile/",

  // Auth
  LOGIN: "users/login/",
  REGISTER: "users/register/",
  LOGOUT: "users/logout/",
  REFRESH_TOKEN: "users/token/refresh/",

  // Leasing
  LEASES: "leasing/leases/",
  LEASE_DETAIL: (id) => `leasing/leases/${id}/`,

  // Shipping
  SHIPMENTS: "shipping/shipments/",
  SHIPMENT_DETAIL: (id) => `shipping/shipments/${id}/`,
};

/**
 * Get auth token from localStorage
 */
function getAuthToken() {
  return localStorage.getItem("accessToken");
}

/**
 * Set auth token in localStorage
 */
function setAuthToken(token) {
  localStorage.setItem("accessToken", token);
}

/**
 * Remove auth token from localStorage
 */
function removeAuthToken() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

/**
 * Build full API URL
 */
function buildApiUrl(endpoint) {
  if (endpoint.startsWith("http")) {
    return endpoint;
  }
  return API_CONFIG.BASE_URL + endpoint;
}

/**
 * Build query string from params object
 */
function buildQueryString(params) {
  if (!params || Object.keys(params).length === 0) {
    return "";
  }

  const queryString = Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&");

  return queryString ? `?${queryString}` : "";
}

/**
 * Make HTTP request with authentication
 * @param {string} url - API endpoint
 * @param {Object} options - Fetch options
 * @param {number} retryCount - Current retry attempt
 */
async function fetchWithAuth(url, options = {}, retryCount = 0) {
  const token = getAuthToken();

  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(buildApiUrl(url), config);

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && retryCount === 0) {
      const refreshed = await refreshAuthToken();
      if (refreshed) {
        return fetchWithAuth(url, options, retryCount + 1);
      } else {
        // Redirect to login
        window.location.href = "/Login.html";
        throw new Error("Authentication failed");
      }
    }

    // Handle other error responses
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(
        error.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        error
      );
    }

    // Parse response
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }

    return await response.text();
  } catch (error) {
    // Retry on network errors
    if (retryCount < API_CONFIG.RETRY_ATTEMPTS && error.name === "TypeError") {
      await sleep(API_CONFIG.RETRY_DELAY * (retryCount + 1));
      return fetchWithAuth(url, options, retryCount + 1);
    }

    throw error;
  }
}

/**
 * Refresh authentication token
 */
async function refreshAuthToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return false;

  try {
    const response = await fetch(buildApiUrl(API_ENDPOINTS.REFRESH_TOKEN), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      setAuthToken(data.access);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return false;
  }
}

/**
 * API Methods
 */
const api = {
  /**
   * GET request
   */
  get: async (endpoint, params = {}) => {
    const queryString = buildQueryString(params);
    return fetchWithAuth(endpoint + queryString, { method: "GET" });
  },

  /**
   * POST request
   */
  post: async (endpoint, data = {}) => {
    return fetchWithAuth(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * PUT request
   */
  put: async (endpoint, data = {}) => {
    return fetchWithAuth(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * PATCH request
   */
  patch: async (endpoint, data = {}) => {
    return fetchWithAuth(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE request
   */
  delete: async (endpoint) => {
    return fetchWithAuth(endpoint, { method: "DELETE" });
  },

  /**
   * Upload file
   */
  upload: async (endpoint, formData) => {
    const token = getAuthToken();
    const headers = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return fetch(buildApiUrl(endpoint), {
      method: "POST",
      headers,
      body: formData,
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ApiError(
          error.message || `HTTP ${response.status}`,
          response.status,
          error
        );
      }
      return response.json();
    });
  },
};

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Handle API errors and show user-friendly messages
 */
function handleApiError(error) {
  console.error("API Error:", error);

  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        return "Datos inválidos. Por favor verifica la información.";
      case 401:
        return "Sesión expirada. Por favor inicia sesión nuevamente.";
      case 403:
        return "No tienes permisos para realizar esta acción.";
      case 404:
        return "Recurso no encontrado.";
      case 500:
        return "Error del servidor. Por favor intenta más tarde.";
      default:
        return error.message || "Error al procesar la solicitud.";
    }
  }

  if (error.name === "TypeError") {
    return "Error de conexión. Verifica tu conexión a internet.";
  }

  return "Error inesperado. Por favor intenta nuevamente.";
}

/**
 * Sleep utility for retries
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Extract array data from API response
 * Handles different response formats (array, {results: []}, {data: []})
 */
function extractArrayData(response) {
  if (Array.isArray(response)) return response;
  if (response && response.results && Array.isArray(response.results))
    return response.results;
  if (response && response.data && Array.isArray(response.data))
    return response.data;
  return [];
}
