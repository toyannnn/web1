// frontend/src/EmployeeDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { orders, products, services, clients, subscribeToChanges } from './shared/storage';

function Badge({ text, color }) {
  return <span style={{ background: color, color: '#fff', padding: '5px 10px', borderRadius: '10px', fontSize: '12px' }}>{text}</span>;
}

function Sidebar({ current, setCurrent }) {
  const menu = ['Заказы', 'Новые заказы', 'Продажи', 'Товары', 'Услуги', 'Клиенты'];
  return (
    <div style={styles.sidebar}>
      <h2 style={{ color: '#fff' }}>PHOTO CENTER</h2>
      {menu.map((item) => (
        <button key={item} onClick={() => setCurrent(item)} style={{ ...styles.menuButton, background: current === item ? '#1976d2' : 'transparent' }}>
          {item} {item === 'Новые заказы' && <span style={styles.newBadge}>!</span>}
        </button>
      ))}
    </div>
  );
}

function OrdersPage() {
  const [ordersList, setOrdersList] = useState([]);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('Все');
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await orders.getAll();
      setOrdersList(data);
    } catch (err) {
      console.error('Ошибка загрузки заказов:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    const unsubscribe = subscribeToChanges(loadOrders);
    return unsubscribe;
  }, [loadOrders]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await orders.updateStatus(orderId, newStatus);
      await loadOrders();
    } catch (err) {
      console.error('Ошибка обновления статуса:', err);
    }
  };

  const filteredOrders = ordersList.filter(order => {
    const nameMatch = order.clientName?.toLowerCase().includes(filter.toLowerCase()) || 
                     order.orderNumber?.toLowerCase().includes(filter.toLowerCase());
    const statusMatch = statusFilter === 'Все' || order.status === statusFilter;
    return nameMatch && statusMatch;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Принят': return '#1976d2';
      case 'В работе': return '#ff9800';
      case 'Готов к выдаче': return '#9c27b0';
      case 'Выдан': return '#4caf50';
      default: return '#757575';
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Загрузка...</div>;

  return (
    <div>
      <div style={styles.pageHeader}>
        <h2>Журнал заказов</h2>
        <div style={styles.filters}>
          <input placeholder="Поиск" value={filter} onChange={(e) => setFilter(e.target.value)} style={styles.input} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.select}>
            <option>Все</option><option>Принят</option><option>В работе</option><option>Готов к выдаче</option><option>Выдан</option>
          </select>
        </div>
      </div>
      <table style={styles.table}>
        <thead><tr><th>№</th><th>Дата</th><th>Клиент</th><th>Услуга/Товар</th><th>Статус</th><th>Сумма</th><th>Действия</th></tr></thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order.id}>
              <td>{order.orderNumber || order.id}</td>
              <td>{new Date(order.orderDate).toLocaleDateString()}</td>
              <td>{order.clientName || 'Клиент'}</td>
              <td>{order.items?.map(i => i.name).join(', ') || '-'}</td>
              <td><Badge text={order.status} color={getStatusColor(order.status)} /></td>
              <td><b>{order.totalAmount} ₽</b></td>
              <td><select onChange={(e) => updateStatus(order.id, e.target.value)} value={order.status} style={styles.statusSelect}>
                <option>Принят</option><option>В работе</option><option>Готов к выдаче</option><option>Выдан</option>
              </select></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NewOrdersPage() {
  const [newOrders, setNewOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNewOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await orders.getAll();
      setNewOrders(data.filter(order => order.status === 'Принят'));
    } catch (err) {
      console.error('Ошибка загрузки:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNewOrders();
    const unsubscribe = subscribeToChanges(loadNewOrders);
    return unsubscribe;
  }, [loadNewOrders]);

  const acceptOrder = async (orderId) => {
    try {
      await orders.updateStatus(orderId, 'В работе');
      await loadNewOrders();
    } catch (err) {
      console.error('Ошибка:', err);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Загрузка...</div>;
  if (newOrders.length === 0) return <div style={styles.emptyState}>Нет новых заказов</div>;

  return (
    <div>
      <h2>Новые заказы клиентов</h2>
      <div style={styles.newOrdersList}>
        {newOrders.map((order) => (
          <div key={order.id} style={styles.newOrderCard}>
            <div style={styles.newOrderHeader}><h3>Заказ №{order.orderNumber || order.id}</h3><span style={styles.newLabel}>Новый!</span></div>
            <p><b>Клиент:</b> {order.clientName || 'Клиент'}</p>
            <p><b>Дата:</b> {new Date(order.orderDate).toLocaleDateString()}</p>
            <p><b>Сумма:</b> {order.totalAmount} ₽</p>
            <button style={styles.acceptButton} onClick={() => acceptOrder(order.id)}>Принять в работу</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductsPage() {
  const [productsList, setProductsList] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: '', quantity: '' });
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await products.getAll();
      setProductsList(data);
    } catch (err) {
      console.error('Ошибка:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    const unsubscribe = subscribeToChanges(loadProducts);
    return unsubscribe;
  }, [loadProducts]);

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.category || !newProduct.price) return;
    try {
      await products.create({
        name: newProduct.name,
        category: newProduct.category,
        price: Number(newProduct.price),
        quantity: Number(newProduct.quantity) || 0,
      });
      setNewProduct({ name: '', category: '', price: '', quantity: '' });
      await loadProducts();
    } catch (err) {
      console.error('Ошибка добавления:', err);
    }
  };

  const updateProduct = async (id, field, value) => {
    const product = productsList.find(p => p.id === id);
    if (!product) return;
    try {
      await products.update(id, { ...product, [field]: Number(value) });
      await loadProducts();
    } catch (err) {
      console.error('Ошибка обновления:', err);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Удалить товар?')) return;
    try {
      await products.delete(id);
      await loadProducts();
    } catch (err) {
      console.error('Ошибка удаления:', err);
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div>
      <h2>Управление товарами</h2>
      <div style={styles.form}>
        <input placeholder="Название" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
        <input placeholder="Категория" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} />
        <input placeholder="Цена" type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
        <input placeholder="Количество" type="number" value={newProduct.quantity} onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })} />
        <button style={styles.addButton} onClick={addProduct}>Добавить товар</button>
      </div>
      <table style={styles.table}>
        <thead><tr><th>Название</th><th>Категория</th><th>Цена</th><th>Остаток</th><th>Действия</th></tr></thead>
        <tbody>
          {productsList.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.category}</td>
              <td><input type="number" value={product.price} onChange={(e) => updateProduct(product.id, 'price', e.target.value)} style={styles.editInput} /></td>
              <td><input type="number" value={product.quantity} onChange={(e) => updateProduct(product.id, 'quantity', e.target.value)} style={styles.editInput} /></td>
              <td><button style={styles.deleteButton} onClick={() => deleteProduct(product.id)}>Удалить</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ServicesPage() {
  const [servicesList, setServicesList] = useState([]);
  const [newService, setNewService] = useState({ name: '', category: '', price: '', description: '' });
  const [loading, setLoading] = useState(true);

  const loadServices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await services.getAll();
      setServicesList(data);
    } catch (err) {
      console.error('Ошибка:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
    const unsubscribe = subscribeToChanges(loadServices);
    return unsubscribe;
  }, [loadServices]);

  const addService = async () => {
    if (!newService.name || !newService.category || !newService.price) return;
    try {
      await services.create({
        name: newService.name,
        category: newService.category,
        price: Number(newService.price),
        description: newService.description,
      });
      setNewService({ name: '', category: '', price: '', description: '' });
      await loadServices();
    } catch (err) {
      console.error('Ошибка добавления:', err);
    }
  };

  const updateService = async (id, newPrice) => {
    const service = servicesList.find(s => s.id === id);
    if (!service) return;
    try {
      await services.update(id, { ...service, price: Number(newPrice) });
      await loadServices();
    } catch (err) {
      console.error('Ошибка обновления:', err);
    }
  };

  const deleteService = async (id) => {
    if (!window.confirm('Удалить услугу?')) return;
    try {
      await services.delete(id);
      await loadServices();
    } catch (err) {
      console.error('Ошибка удаления:', err);
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div>
      <h2>Управление услугами</h2>
      <div style={styles.form}>
        <input placeholder="Название" value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} />
        <input placeholder="Категория" value={newService.category} onChange={(e) => setNewService({ ...newService, category: e.target.value })} />
        <input placeholder="Цена" type="number" value={newService.price} onChange={(e) => setNewService({ ...newService, price: e.target.value })} />
        <input placeholder="Описание" value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} />
        <button style={styles.addButton} onClick={addService}>Добавить услугу</button>
      </div>
      <table style={styles.table}>
        <thead><tr><th>Название</th><th>Категория</th><th>Цена</th><th>Описание</th><th>Действия</th></tr></thead>
        <tbody>
          {servicesList.map((service) => (
            <tr key={service.id}>
              <td>{service.name}</td>
              <td>{service.category}</td>
              <td><input type="number" value={service.price} onChange={(e) => updateService(service.id, e.target.value)} style={styles.editInput} /></td>
              <td>{service.description}</td>
              <td><button style={styles.deleteButton} onClick={() => deleteService(service.id)}>Удалить</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SalesPage() {
  const [productsList, setProductsList] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await products.getAll();
        setProductsList(data);
      } catch (err) {
        console.error('Ошибка:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const addToCart = (product) => setCart(prev => [...prev, product]);
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  if (loading) return <div>Загрузка...</div>;

  return (
    <div>
      <h2>Продажа товаров</h2>
      <div style={styles.salesLayout}>
        <div style={styles.productsGrid}>
          {productsList.map((product) => (
            <div key={product.id} style={styles.productCard}>
              <h3>{product.name}</h3><p>{product.price} ₽</p><p>В наличии: {product.quantity}</p>
              <button style={styles.saleButton} onClick={() => addToCart(product)}>Добавить</button>
            </div>
          ))}
        </div>
        <div style={styles.cart}>
          <h3>Корзина</h3>
          {cart.map((item, index) => (<div key={index} style={styles.cartItem}><span>{item.name}</span><span>{item.price} ₽</span></div>))}
          <h2>Итого: {total} ₽</h2>
          <button style={styles.checkoutButton} onClick={() => { alert(`Продажа на сумму ${total} ₽`); setCart([]); }}>Оформить продажу</button>
        </div>
      </div>
    </div>
  );
}

function ClientsPageForEmployee() {
  const [clientsList, setClientsList] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientOrders, setClientOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await clients.getAll();
      setClientsList(data);
    } catch (err) {
      console.error('Ошибка загрузки клиентов:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
    const unsubscribe = subscribeToChanges(loadClients);
    return unsubscribe;
  }, [loadClients]);

  useEffect(() => {
    if (selectedClient) {
      const loadOrders = async () => {
        try {
          const data = await clients.getOrders(selectedClient.id);
          setClientOrders(data);
        } catch (err) {
          console.error('Ошибка загрузки заказов:', err);
        }
      };
      loadOrders();
    }
  }, [selectedClient]);

  const filteredClients = clientsList.filter(c => 
    c.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.login?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await orders.updateStatus(orderId, newStatus);
      const updated = await clients.getOrders(selectedClient.id);
      setClientOrders(updated);
    } catch (err) {
      console.error('Ошибка обновления статуса:', err);
    }
  };

  const formatDate = (date) => date ? new Date(date).toLocaleDateString() : '-';

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Загрузка...</div>;

  return (
    <div>
      <div style={styles.pageHeader}>
        <h2>Клиенты сети</h2>
        <input type="text" placeholder="Поиск..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ ...styles.searchInput, width: '300px' }} />
      </div>
      <div style={styles.clientsContainer}>
        <div style={styles.clientList}>
          <h3>Все клиенты ({filteredClients.length})</h3>
          {filteredClients.map((client) => (
            <div key={client.id} style={{ ...styles.clientCard, background: selectedClient?.id === client.id ? '#e3f2fd' : '#fff' }} onClick={() => setSelectedClient(client)}>
              <div style={{ fontWeight: 'bold' }}>{client.fullName}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{client.phone || 'Нет телефона'}</div>
            </div>
          ))}
        </div>
        <div style={styles.clientDetails}>
          {selectedClient ? (
            <>
              <h2>{selectedClient.fullName}</h2>
              <p><strong>Логин:</strong> {selectedClient.login}</p>
              <p><strong>Телефон:</strong> {selectedClient.phone || '-'}</p>
              <p><strong>Email:</strong> {selectedClient.email || '-'}</p>
              <p><strong>Дата регистрации:</strong> {formatDate(selectedClient.registrationDate)}</p>
              <p><strong>Статус:</strong> {selectedClient.role === 'professional' ? 'Профессионал' : 'Любитель'}</p>
              <h3>История заказов ({clientOrders.length})</h3>
              {clientOrders.length === 0 ? <p>Нет заказов</p> : (
                <table style={styles.table}>
                  <thead><tr><th>№</th><th>Дата</th><th>Сумма</th><th>Статус</th><th>Действия</th></tr></thead>
                  <tbody>
                    {clientOrders.map(order => (
                      <tr key={order.id}>
                        <td>{order.orderNumber || order.id}</td>
                        <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                        <td>{order.totalAmount} ₽</td>
                        <td><Badge text={order.status} color={order.status === 'Принят' ? '#1976d2' : '#ff9800'} /></td>
                        <td><select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)} style={styles.statusSelect}>
                          <option>Принят</option><option>В работе</option><option>Готов к выдаче</option><option>Выдан</option>
                        </select></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          ) : <div>Выберите клиента</div>}
        </div>
      </div>
    </div>
  );
}

export default function EmployeeDashboard({ onLogout }) {
  const [page, setPage] = useState('Заказы');

  const renderPage = () => {
    switch (page) {
      case 'Заказы': return <OrdersPage />;
      case 'Новые заказы': return <NewOrdersPage />;
      case 'Продажи': return <SalesPage />;
      case 'Товары': return <ProductsPage />;
      case 'Услуги': return <ServicesPage />;
      case 'Клиенты': return <ClientsPageForEmployee />;
      default: return <OrdersPage />;
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar current={page} setCurrent={setPage} />
      <div style={styles.content}>
        <header style={styles.header}>
          <div><h1>Панель сотрудника</h1><p>Управление заказами, товарами, услугами и клиентами</p></div>
          <button style={styles.logoutButton} onClick={onLogout}>Выйти</button>
        </header>
        {renderPage()}
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  sidebar: { width: '250px', background: 'linear-gradient(180deg,#0f2b3d 0%,#1a3a4f 100%)', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '10px' },
  menuButton: { border: 'none', color: '#e2e8f0', padding: '12px 16px', borderRadius: '10px', cursor: 'pointer', textAlign: 'left', fontSize: '14px', fontWeight: '500', background: 'transparent' },
  newBadge: { background: '#ef4444', borderRadius: '50%', padding: '2px 8px', fontSize: '10px', marginLeft: '8px' },
  content: { flex: 1, padding: '24px' },
  header: { background: '#fff', padding: '20px 24px', borderRadius: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logoutButton: { background: '#ef4444', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '500' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '16px', overflow: 'hidden' },
  input: { padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', width: '200px' },
  select: { padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' },
  searchInput: { padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', width: '250px' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  filters: { display: 'flex', gap: '12px' },
  form: { display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' },
  addButton: { background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' },
  deleteButton: { background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' },
  editInput: { width: '80px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' },
  statusSelect: { padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer' },
  salesLayout: { display: 'flex', gap: '24px', flexWrap: 'wrap' },
  productsGrid: { flex: 2, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '16px' },
  productCard: { background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' },
  saleButton: { background: '#3b82f6', color: '#fff', border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer', width: '100%', marginTop: '10px' },
  cart: { width: '320px', background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' },
  cartItem: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px', padding: '10px', background: '#f8fafc', borderRadius: '8px' },
  checkoutButton: { width: '100%', background: '#10b981', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer', marginTop: '16px', fontWeight: '600' },
  clientsContainer: { display: 'flex', gap: '24px', flexWrap: 'wrap' },
  clientList: { width: '320px', maxHeight: '600px', overflowY: 'auto', borderRadius: '16px' },
  clientCard: { padding: '16px', borderRadius: '12px', marginBottom: '12px', cursor: 'pointer', border: '1px solid #e2e8f0' },
  clientDetails: { flex: 1, background: '#fff', padding: '24px', borderRadius: '16px', minWidth: '500px' },
  emptyState: { textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '16px', color: '#94a3b8' },
  newOrdersList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  newOrderCard: { background: 'linear-gradient(135deg,#fff,#f0f9ff)', padding: '20px', borderRadius: '16px', border: '1px solid #bfdbfe' },
  newOrderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  newLabel: { background: '#f59e0b', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  acceptButton: { background: '#10b981', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '10px', cursor: 'pointer', marginTop: '12px', fontWeight: '500' },
};