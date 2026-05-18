// Ported 1:1 from frontend/src/api/api.js. Uses axios + JWT in localStorage,
// matching the CRA app's CSR auth posture. All callers must run client-side.
'use client';

import axios from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({ baseURL: API_BASE_URL });

// Request interceptor: attach JWT from localStorage if present.
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = window.localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: clear session and redirect to /shop-login on 401,
// except when the failing call is itself an auth endpoint or we are
// already on the login page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes('/auth/');
      const isLoginPage = window.location.pathname === '/shop-login';
      if (!isAuthEndpoint && !isLoginPage) {
        window.localStorage.removeItem('token');
        window.localStorage.removeItem('user');
        window.location.href = '/shop-login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  googleAuth: (idToken) => api.post('/auth/google', { idToken }),
};

export const bookService = {
  getAll: (params = {}) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
  getByCategory: (categoryId) => api.get('/books', { params: { categoryId } }),
  getMyBooks: () => api.get('/books'),
};

export const categoryService = {
  getAll: () => api.get('/categories'),
};

export const wishlistService = {
  getWishlist: () => api.get('/wishlist'),
  addToWishlist: (bookId) => api.post(`/wishlist/${bookId}`),
  removeFromWishlist: (bookId) => api.delete(`/wishlist/${bookId}`),
};

export const userService = {
  getProfile: () => api.get('/profile'),
  updateProfile: (profileData) => api.put('/profile', profileData),
};

export const bookshelfService = {
  getAll: () => api.get('/bookshelves'),
  create: (data) => api.post('/bookshelves', data),
  update: (id, data) => api.put(`/bookshelves/${id}`, data),
  delete: (id) => api.delete(`/bookshelves/${id}`),
  reorder: (shelfIds) => api.post('/bookshelves/reorder', shelfIds),
  getBooks: (shelfId) => api.get(`/bookshelves/${shelfId}/books`),
  addBook: (shelfId, bookId) => api.post(`/bookshelves/${shelfId}/books/${bookId}`),
  removeBook: (shelfId, bookId) =>
    api.delete(`/bookshelves/${shelfId}/books/${bookId}`),
};

export const cartService = {
  getCart: () => api.get('/cart'),
  addToCart: (bookId, quantity = 1) => api.post(`/cart/${bookId}`, { quantity }),
  updateQuantity: (bookId, quantity) => api.put(`/cart/${bookId}`, { quantity }),
  removeFromCart: (bookId) => api.delete(`/cart/${bookId}`),
};

export const orderService = {
  checkout: (orderData) => api.post('/orders', orderData),
  getUserOrders: () => api.get('/orders'),
  getHistory: () => api.get('/orders/history'),
};

export const reviewService = {
  getByBookId: () => Promise.resolve({ data: [] }),
  addReview: () => Promise.resolve({ data: {} }),
};

export const dashboardService = {
  getDashboard: () => api.get('/dashboard'),
};

export default api;
