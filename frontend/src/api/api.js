import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to add the JWT token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  googleAuth: (idToken) => api.post('/auth/google', { idToken }),
};

export const bookService = {
  getAll: (params = {}) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
  getByCategory: (categoryId) => api.get(`/books`, { params: { categoryId } }),
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
  getProfile: () => api.get('/users/profile'), // Note: this might not exist in backend, but keeping if frontend needs it and we didn't check UserController
  updateProfile: (profileData) => api.put('/users/profile', profileData),
};

// Mock services to prevent compilation errors for unsupported pages
export const orderService = {
  getCart: () => Promise.resolve({ data: { items: [], totalAmount: 0 } }),
  addToCart: () => Promise.resolve({ data: {} }),
  checkout: () => Promise.resolve({ data: {} }),
  getUserOrders: () => Promise.resolve({ data: [] }),
  getHistory: () => Promise.resolve({ data: [] }),
};

export const reviewService = {
  getByBookId: () => Promise.resolve({ data: [] }),
  addReview: () => Promise.resolve({ data: {} }),
};

export default api;
