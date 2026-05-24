import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('bankingToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('bankingToken');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login:    (data) => API.post('/auth/login', data),
  getMe:    ()     => API.get('/auth/me'),
  updateProfile:  (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/change-password', data),
};

export const accountAPI = {
  getAll:       ()     => API.get('/accounts'),
  getOne:       (id)   => API.get(`/accounts/${id}`),
  create:       (data) => API.post('/accounts', data),
  getStatement: (id, limit) => API.get(`/accounts/${id}/statement?limit=${limit || 10}`),
};

export const transactionAPI = {
  getAll:    (params) => API.get('/transactions', { params }),
  deposit:   (data)   => API.post('/transactions/deposit', data),
  withdraw:  (data)   => API.post('/transactions/withdraw', data),
  transfer:  (data)   => API.post('/transactions/transfer', data),
};

export const adminAPI = {
  getDashboard:      ()     => API.get('/admin/dashboard'),
  getUsers:          (params) => API.get('/admin/users', { params }),
  toggleUser:        (id)   => API.put(`/admin/users/${id}/toggle`),
  getTransactions:   (params) => API.get('/admin/transactions', { params }),
};

export default API;
