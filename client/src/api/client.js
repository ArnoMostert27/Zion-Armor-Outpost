/**
 * Thin fetch wrapper for the Zion Armor Outpost API.
 * In dev, Vite proxies /api to http://localhost:5000 (see vite.config.js).
 * In production set VITE_API_URL if the API lives on another origin.
 */

const BASE = import.meta.env.VITE_API_URL || '';

const TOKEN_KEY = 'zao.token';

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
};

export const setToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable - session-only auth */
  }
};

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const request = async (path, { method = 'GET', body, headers = {} } = {}) => {
  const token = getToken();

  const res = await fetch(`${BASE}/api${path}`, {
    method,
    credentials: 'include',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }

  if (!res.ok) {
    throw new ApiError(data?.message || `Request failed (${res.status})`, res.status);
  }

  return data;
};

const qs = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === false) return;
    search.set(key, Array.isArray(value) ? value.join(',') : String(value));
  });
  const s = search.toString();
  return s ? `?${s}` : '';
};

export const api = {
  // --- products
  products: (params) => request(`/products${qs(params)}`),
  featured: () => request('/products/featured'),
  bySlot: () => request('/products/by-slot'),
  product: (slug) => request(`/products/${slug}`),
  createProduct: (body) => request('/products', { method: 'POST', body }),
  updateProduct: (id, body) => request(`/products/${id}`, { method: 'PUT', body }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // --- auth / users
  register: (body) => request('/users/register', { method: 'POST', body }),
  login: (body) => request('/users/login', { method: 'POST', body }),
  logout: () => request('/users/logout', { method: 'POST' }),
  profile: () => request('/users/profile'),
  updateProfile: (body) => request('/users/profile', { method: 'PUT', body }),
  rankDossier: () => request('/users/rank'),
  getScroll: () => request('/users/scroll'),
  toggleScroll: (productId) => request(`/users/scroll/${productId}`, { method: 'POST' }),
  users: () => request('/users'),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),

  // --- orders
  quote: (items) => request('/orders/quote', { method: 'POST', body: { items } }),
  placeOrder: (body) => request('/orders', { method: 'POST', body }),
  myOrders: () => request('/orders/mine'),
  order: (id) => request(`/orders/${id}`),
  allOrders: () => request('/orders'),
  orderStats: () => request('/orders/stats'),
  setOrderStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PUT', body: { status } }),

  // --- reviews
  reviews: (productId) => request(`/reviews/${productId}`),
  createReview: (productId, body) => request(`/reviews/${productId}`, { method: 'POST', body }),

  // --- bundle
  armorSlots: () => request('/bundle/slots'),
  validateBundle: (selection) => request('/bundle/validate', { method: 'POST', body: { selection } }),

  // --- reading plans
  plans: () => request('/plans'),
  plan: (slug) => request(`/plans/${slug}`),
  togglePlanDay: (slug, day) => request(`/plans/${slug}/day/${day}`, { method: 'POST' }),
};

export default api;
