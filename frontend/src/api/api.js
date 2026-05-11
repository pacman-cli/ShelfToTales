import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

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
};

export const bookService = {
  getAll: () => api.get('/books'),
  getMyBooks: () => api.get('/books/my-books'),
  getById: (id) => api.get(`/books/${id}`),
  getByCategory: (category) => api.get(`/books/category/${category}`),
};

export const reviewService = {
  getByBookId: (bookId) => api.get(`/reviews/book/${bookId}`),
  addReview: (reviewData) => api.post('/reviews', reviewData),
};

export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
};

export const orderService = {
  getCart: () => api.get('/orders/cart'),
  addToCart: (bookId, quantity) => api.post('/orders/cart/add', { bookId, quantity }),
  checkout: () => api.post('/orders/checkout'),
  getUserOrders: (userId) => api.get(`/orders/user/${userId}`),
};

export default api;


