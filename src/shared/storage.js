export const STORAGE_KEYS = {
  PRODUCTS: "photo_products",
  SERVICES: "photo_services",
  ORDERS: "photo_orders",
  CLIENTS: "photo_clients",
  BRANCHES: "photo_branches",
  EMPLOYEES: "photo_employees",
  USERS: "photo_users",
  getClients,
  getClientOrders,
  getClientById,
  updateClient,
};

export function getClients() {
  const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
  if (saved) return JSON.parse(saved);
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(initialClients));
  return initialClients;
}

export function saveClients(clients) {
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEYS.CLIENTS }));
}

export function addClient(clientData) {
  const clients = getClients();
  const newClient = {
    id: Date.now(),
    fullName: clientData.fullName,
    login: clientData.login,
    password: clientData.password,
    phone: clientData.phone || "",
    email: clientData.email || "",
    registrationDate: new Date().toISOString().slice(0, 10),
    discountCard: false,
  };
  
  if (clients.some(c => c.login === newClient.login)) {
    throw new Error("Клиент с таким логином уже существует");
  }
  
  clients.push(newClient);
  saveClients(clients);
  return newClient;
}

export function updateClient(clientId, updates) {
  const clients = getClients();
  const updated = clients.map(c => 
    c.id === clientId 
      ? { ...c, ...updates }
      : c
  );
  saveClients(updated);
  
  const users = getUsers();
  const updatedUsers = users.map(u => 
    u.id === clientId && u.role === "client"
      ? { ...u, fullName: updates.fullName || u.fullName, phone: updates.phone || u.phone, email: updates.email || u.email }
      : u
  );
  saveUsers(updatedUsers);
  
  return updated;
}

export function deleteClient(clientId) {
  const clients = getClients();
  const updated = clients.filter(c => c.id !== clientId);
  saveClients(updated);
  return updated;
}

export function getClientById(clientId) {
  const clients = getClients();
  return clients.find(c => c.id === clientId) || null;
}

export function getClientByLogin(login) {
  const clients = getClients();
  return clients.find(c => c.login === login) || null;
}

export function getClientOrders(clientId) {
  const orders = getOrders();
  return orders.filter(order => order.clientId === clientId);
}

const initialUsers = [
  {
    id: 1,
    login: "admin",
    password: "admin123",
    role: "admin",
    fullName: "Главный администратор",
    phone: "+7 (999) 111-22-33",
    email: "admin@photocenter.ru",
    createdAt: "2024-01-01",
  },
  {
    id: 2,
    login: "employee",
    password: "employee123",
    role: "employee",
    fullName: "Сотрудник фотоцентра",
    phone: "+7 (999) 222-33-44",
    email: "employee@photocenter.ru",
    createdAt: "2024-01-01",
  },
];

const initialClients = [];

const initialBranches = [
  {
    id: 1,
    name: "Фотоцентр Центральный",
    type: "Филиал",
    address: "Москва, ул. Ленина, 12",
    status: "Активна",
    phone: "+7 (495) 123-45-67",
    email: "central@photocenter.ru",
    workingHours: "09:00 - 21:00",
  },
  {
    id: 2,
    name: "ФотоКиоск ТЦ Европа",
    type: "Киоск",
    address: "Москва, ТЦ Европа, 2 этаж",
    status: "Активна",
    processor: "Фотоцентр Центральный",
    phone: "+7 (495) 765-43-21",
    email: "europa@photocenter.ru",
    workingHours: "10:00 - 22:00",
  },
  {
    id: 3,
    name: "ФотоМаркет Север",
    type: "Магазин",
    address: "Москва, ул. Победы, 55",
    status: "Архив",
    phone: "+7 (495) 987-65-43",
    email: "north@photocenter.ru",
    workingHours: "09:00 - 20:00",
  },
];

const initialEmployees = [
  {
    id: 1,
    name: "Иванов Иван",
    login: "ivanov",
    role: "Администратор",
    status: "Активен",
    phone: "+7 (999) 111-22-33",
    email: "ivanov@photocenter.ru",
    hireDate: "2024-01-15",
  },
  {
    id: 2,
    name: "Петров Алексей",
    login: "petrov",
    role: "Сотрудник точки",
    status: "Активен",
    phone: "+7 (999) 222-33-44",
    email: "petrov@photocenter.ru",
    hireDate: "2024-03-20",
  },
  {
    id: 3,
    name: "Сидорова Анна",
    login: "sidorova",
    role: "Управляющий",
    status: "Заблокирован",
    phone: "+7 (999) 333-44-55",
    email: "sidorova@photocenter.ru",
    hireDate: "2023-11-10",
  },
];

export function getBranches() {
  const saved = localStorage.getItem(STORAGE_KEYS.BRANCHES);
  if (saved) return JSON.parse(saved);
  localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(initialBranches));
  return initialBranches;
}

export function saveBranches(branches) {
  localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(branches));
  window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEYS.BRANCHES }));
}

export function getEmployees() {
  const saved = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
  if (saved) return JSON.parse(saved);
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(initialEmployees));
  return initialEmployees;
}

export function saveEmployees(employees) {
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEYS.EMPLOYEES }));
}

export function addBranch(branch) {
  const branches = getBranches();
  const newBranch = { ...branch, id: Date.now() };
  branches.push(newBranch);
  saveBranches(branches);
  return newBranch;
}

export function updateBranch(branchId, updates) {
  const branches = getBranches();
  const updated = branches.map(b => b.id === branchId ? { ...b, ...updates } : b);
  saveBranches(updated);
  return updated;
}

export function deleteBranch(branchId) {
  const branches = getBranches();
  const updated = branches.filter(b => b.id !== branchId);
  saveBranches(updated);
  return updated;
}

export function addEmployee(employee) {
  const employees = getEmployees();
  const newEmployee = { ...employee, id: Date.now(), hireDate: new Date().toISOString().slice(0, 10) };
  employees.push(newEmployee);
  saveEmployees(employees);
  return newEmployee;
}

export function updateEmployee(employeeId, updates) {
  const employees = getEmployees();
  const updated = employees.map(e => e.id === employeeId ? { ...e, ...updates } : e);
  saveEmployees(updated);
  return updated;
}

export function deleteEmployee(employeeId) {
  const employees = getEmployees();
  const updated = employees.filter(e => e.id !== employeeId);
  saveEmployees(updated);
  return updated;
}

export function getUsers() {
  const saved = localStorage.getItem(STORAGE_KEYS.USERS);
  if (saved) return JSON.parse(saved);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
  return initialUsers;
}

export function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEYS.USERS }));
}

export function addUser(userData) {
  const users = getUsers();
  const newUser = {
    id: Date.now(),
    login: userData.login,
    password: userData.password,
    role: userData.role,
    fullName: userData.fullName,
    phone: userData.phone || "",
    email: userData.email || "",
    createdAt: new Date().toISOString().slice(0, 10),
  };
  if (users.some(u => u.login === newUser.login)) {
    throw new Error("Пользователь с таким логином уже существует");
  }
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function addClientUser(clientData) {
  const users = getUsers();
  const newUser = {
    id: clientData.id,
    login: clientData.login,
    password: clientData.password,
    role: "client",
    fullName: clientData.fullName,
    phone: clientData.phone || "",
    email: clientData.email || "",
    createdAt: clientData.registrationDate,
  };
  if (users.some(u => u.login === newUser.login)) {
    throw new Error("Пользователь с таким логином уже существует");
  }
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function updateUser(userId, updates) {
  const users = getUsers();
  const updated = users.map(u => u.id === userId ? { ...u, ...updates } : u);
  saveUsers(updated);
  return updated;
}

export function deleteUser(userId) {
  const users = getUsers();
  const updated = users.filter(u => u.id !== userId);
  saveUsers(updated);
  return updated;
}

export function authenticateUser(login, password) {
  const users = getUsers();
  return users.find(u => u.login === login && u.password === password) || null;
}

const initialProducts = [
  { id: 1, name: "Фотопленка Kodak Gold", category: "Фотопленки", price: 1200, quantity: 20 },
  { id: 2, name: "Фотоаппарат Canon EOS", category: "Фотоаппараты", price: 95000, quantity: 3 },
  { id: 3, name: "Фотоальбом Premium", category: "Альбомы", price: 1800, quantity: 15 },
  { id: 4, name: "Фотобумага A4", category: "Фотобумага", price: 900, quantity: 50 },
  { id: 5, name: "Прокат фотоаппарата", category: "Прокат", price: 3500, quantity: 10 },
  { id: 6, name: "Объектив Canon RF", category: "Аксессуары", price: 45000, quantity: 4 },
  { id: 7, name: "Штатив Manfrotto", category: "Аксессуары", price: 12000, quantity: 7 },
];

const initialServices = [
  { id: 1, name: "Проявка пленки", category: "Фотопечать", price: 500, description: "Проявка фотопленок любых форматов" },
  { id: 2, name: "Печать фотографий", category: "Фотопечать", price: 15, description: "Печать фотографий на профессиональной бумаге" },
  { id: 3, name: "Проявка + печать", category: "Комплексная услуга", price: 1200, description: "Полный цикл проявки и печати фотографий" },
  { id: 4, name: "Фото на документы", category: "Документы", price: 450, description: "Фотографии на паспорт, визу и документы" },
  { id: 5, name: "Реставрация фотографий", category: "Обработка", price: 2500, description: "Восстановление старых фотографий" },
  { id: 6, name: "Художественное фото", category: "Фотосессии", price: 7000, description: "Профессиональная художественная съемка" },
  { id: 7, name: "Услуги фотографа", category: "Фотосессии", price: 5000, description: "Работа профессионального фотографа" },
];

export function getProducts() {
  const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (saved) return JSON.parse(saved);
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts));
  return initialProducts;
}

export function getServices() {
  const saved = localStorage.getItem(STORAGE_KEYS.SERVICES);
  if (saved) return JSON.parse(saved);
  localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(initialServices));
  return initialServices;
}

export function getOrders() {
  const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
  return saved ? JSON.parse(saved) : [];
}

export function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEYS.ORDERS }));
}

export function saveProducts(products) {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

export function saveServices(services) {
  localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
}

export function addOrder(orderData) {
  const orders = getOrders();
  const newOrder = {
    id: Date.now(),
    ...orderData,
    date: new Date().toISOString().slice(0, 10),
    status: "Принят",
  };
  orders.unshift(newOrder);
  saveOrders(orders);
  return newOrder;
}

export function updateOrderStatus(orderId, newStatus) {
  const orders = getOrders();
  const updated = orders.map(order => order.id === orderId ? { ...order, status: newStatus } : order);
  saveOrders(updated);
  return updated;
}

export function subscribeToChanges(callback) {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEYS.PRODUCTS || e.key === STORAGE_KEYS.SERVICES || 
        e.key === STORAGE_KEYS.ORDERS || e.key === STORAGE_KEYS.CLIENTS || 
        e.key === STORAGE_KEYS.USERS || e.key === STORAGE_KEYS.BRANCHES || 
        e.key === STORAGE_KEYS.EMPLOYEES) {
      callback();
    }
  });
}