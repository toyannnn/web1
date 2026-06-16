// frontend/src/shared/storage.js

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5191/api';

// Получение токена
const getToken = () => localStorage.getItem('token');

// Базовый запрос к API
const request = async (endpoint, options = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    window.dispatchEvent(new CustomEvent('unauthorized'));
    throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Ошибка сервера' }));
    throw new Error(error.message || `Ошибка: ${response.status}`);
  }
  
  return response.json();
};

// ==================== АУТЕНТИФИКАЦИЯ ====================
export const auth = {
  login: async (login, password) => {
    const data = await request('/Auth/login', {
      method: 'POST',
      body: JSON.stringify({ login, password }),
    });
    localStorage.setItem('token', data.token);
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    return data.user;
  },
  
  register: async (userData) => {
    return request('/Auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  },
  
  isAuthenticated: () => !!getToken(),
};

// ==================== КЛИЕНТЫ ====================
export const clients = {
  getAll: async () => request('/Clients'),
  getById: async (id) => request(`/Clients/${id}`),
  update: async (id, data) => request(`/Clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  getOrders: async (clientId) => request(`/Orders/client/${clientId}`),
};

// ==================== ЗАКАЗЫ ====================
export const orders = {
  getAll: async () => request('/Orders'),
  getById: async (id) => request(`/Orders/${id}`),
  getByClientId: async (clientId) => request(`/Orders/client/${clientId}`),
  create: async (orderData) => request('/Orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  }),
  update: async (id, orderData) => request(`/Orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(orderData),
  }),
  updateStatus: async (orderId, status) => request(`/Orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify(status),
  }),
  calculateTotal: async (orderData) => request('/Orders/calculate', {
    method: 'POST',
    body: JSON.stringify(orderData),
  }),
};

// ==================== ТОВАРЫ ====================
export const products = {
  getAll: async () => request('/Products'),  // ← теперь через request (с токеном)
  getById: async (id) => request(`/Products/${id}`),
  create: async (productData) => request('/Products', {
    method: 'POST',
    body: JSON.stringify(productData),
  }),
  update: async (id, productData) => request(`/Products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  }),
  delete: async (id) => request(`/Products/${id}`, { method: 'DELETE' }),
};

// ==================== УСЛУГИ ====================
export const services = {
  getAll: async () => request('/Services'),  // ← теперь через request (с токеном)
  getById: async (id) => request(`/Services/${id}`),
  create: async (serviceData) => request('/Services', {
    method: 'POST',
    body: JSON.stringify(serviceData),
  }),
  update: async (id, serviceData) => request(`/Services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(serviceData),
  }),
  delete: async (id) => request(`/Services/${id}`, { method: 'DELETE' }),
};

// ==================== ТОЧКИ ПРОДАЖ ====================
export const branches = {
  getAll: async () => request('/Branches'),
  getById: async (id) => request(`/Branches/${id}`),
  create: async (branchData) => request('/Branches', {
    method: 'POST',
    body: JSON.stringify({
      ...branchData,
      openDate: branchData.openDate || new Date().toISOString().slice(0, 10)
    }),
  }),
  update: async (id, branchData) => request(`/Branches/${id}`, {
    method: 'PUT',
    body: JSON.stringify(branchData),
  }),
  delete: async (id) => request(`/Branches/${id}`, { method: 'DELETE' }),
};

// ==================== СОТРУДНИКИ ====================
export const employees = {
  getAll: async () => request('/Employees'),
  getById: async (id) => request(`/Employees/${id}`),
  create: async (employeeData) => request('/Employees', {
    method: 'POST',
    body: JSON.stringify(employeeData),
  }),
  update: async (id, employeeData) => request(`/Employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(employeeData),
  }),
  delete: async (id) => request(`/Employees/${id}`, { method: 'DELETE' }),
};

// ==================== ПОЛЬЗОВАТЕЛИ ====================
export const users = {
  getAll: async () => request('/Users'),
  create: async (userData) => request('/Users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  update: async (id, userData) => request(`/Users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
  delete: async (id) => request(`/Users/${id}`, { method: 'DELETE' }),
  resetPassword: async (id, newPassword) => request(`/Users/${id}/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ newPassword }),
  }),
};

// ==================== СЛУШАТЕЛЬ СОБЫТИЙ ====================
let storageCallbacks = [];

export const subscribeToChanges = (callback) => {
  storageCallbacks.push(callback);
  return () => {
    storageCallbacks = storageCallbacks.filter(cb => cb !== callback);
  };
};

if (typeof window !== 'undefined') {
  window.addEventListener('unauthorized', () => {
    storageCallbacks.forEach(cb => cb({ type: 'unauthorized' }));
  });
  
  window.addEventListener('storage', (e) => {
    if (e.key === 'photo_orders' || e.key === 'photo_clients') {
      storageCallbacks.forEach(cb => cb({ type: 'storage', key: e.key }));
    }
  });
}

// Для обратной совместимости
export const getClients = () => clients.getAll();
export const getClientById = (id) => clients.getById(id);
export const getClientOrders = (clientId) => clients.getOrders(clientId);
export const getOrders = () => orders.getAll();
export const updateOrderStatus = (orderId, status) => orders.updateStatus(orderId, status);
export const addOrder = (orderData) => orders.create(orderData);
export const getProducts = () => products.getAll();
export const getServices = () => services.getAll();
export const getBranches = () => branches.getAll();
export const addBranch = (branchData) => branches.create(branchData);
export const updateBranch = (id, branchData) => branches.update(id, branchData);
export const deleteBranch = (id) => branches.delete(id);
export const getEmployees = () => employees.getAll();
export const addEmployee = (employeeData) => employees.create(employeeData);
export const updateEmployee = (id, employeeData) => employees.update(id, employeeData);
export const deleteEmployee = (id) => employees.delete(id);
export const getUsers = () => users.getAll();
export const addUser = (userData) => users.create(userData);
export const updateUser = (id, userData) => users.update(id, userData);
export const deleteUser = (id) => users.delete(id);
export const calculateOrderPrice = (params) => orders.calculateTotal(params);