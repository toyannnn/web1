import React, { useMemo, useState, useEffect } from "react";
import { 
  getProducts, 
  getServices, 
  getOrders, 
  saveProducts, 
  saveServices, 
  updateOrderStatus, 
  subscribeToChanges,
  getClients,
  getClientOrders,
  getClientById
} from "./shared/storage";

function Badge({ text, color }) {
  return <span style={{ background: color, color: "#fff", padding: "5px 10px", borderRadius: "10px", fontSize: "12px" }}>{text}</span>;
}

function Sidebar({ current, setCurrent }) {
  const menu = ["Заказы", "Новые заказы", "Продажи", "Товары", "Услуги", "Клиенты"];
  return (
    <div style={styles.sidebar}>
      <h2 style={{ color: "#fff" }}>PHOTO CENTER</h2>
      {menu.map((item) => (
        <button key={item} onClick={() => setCurrent(item)} style={{ ...styles.menuButton, background: current === item ? "#1976d2" : "transparent" }}>
          {item} {item === "Новые заказы" && <span style={styles.newBadge}>!</span>}
        </button>
      ))}
    </div>
  );
}

function ClientsPageForEmployee() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [clientOrders, setClientOrders] = useState([]);

  useEffect(() => {
    loadClients();
    const handleStorageChange = () => {
      loadClients();
      setRefreshTrigger(prev => prev + 1);
    };
    subscribeToChanges(handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (selectedClient) {
      const orders = getClientOrders(selectedClient.id);
      setClientOrders(orders);
    }
  }, [selectedClient, refreshTrigger]);

  const loadClients = () => {
    setClients(getClients());
  };

  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;
    const term = searchTerm.toLowerCase();
    return clients.filter(c => 
      c.fullName?.toLowerCase().includes(term) || 
      c.login?.toLowerCase().includes(term) ||
      c.phone?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term)
    );
  }, [clients, searchTerm]);

  const getStatusColor = (status) => {
    switch(status) {
      case "Принят": return "#1976d2";
      case "В работе": return "#ff9800";
      case "Готов к выдаче": return "#9c27b0";
      case "Выдан": return "#4caf50";
      default: return "#757575";
    }
  };

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
    setRefreshTrigger(prev => prev + 1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return dateString;
  };

  return (
    <div>
      <div style={styles.pageHeader}>
        <h2>Клиенты сети</h2>
        <div style={styles.headerControls}>
          <input
            type="text"
            placeholder="Поиск по имени, логину, телефону..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ ...styles.searchInput, width: "300px" }}
          />
        </div>
      </div>

      <div style={styles.clientsContainer}>
        <div style={styles.clientList}>
          <h3 style={{ marginBottom: "15px", color: "#333" }}>Все клиенты ({filteredClients.length})</h3>
          {filteredClients.length === 0 ? (
            <div style={styles.emptyList}>Нет зарегистрированных клиентов</div>
          ) : (
            filteredClients.map((client) => (
              <div
                key={client.id}
                style={{
                  ...styles.clientCard,
                  background: selectedClient?.id === client.id ? "#e3f2fd" : "#fff",
                  borderLeft: selectedClient?.id === client.id ? "4px solid #1976d2" : "4px solid transparent",
                }}
                onClick={() => setSelectedClient(client)}
              >
                <div style={{ fontWeight: "bold", marginBottom: "5px" }}>{client.fullName}</div>
                <div style={{ fontSize: "12px", color: "#666" }}>Логин: {client.login}</div>
                <div style={{ fontSize: "12px", color: "#666" }}>{client.phone || "Нет телефона"}</div>
                <div style={{ fontSize: "12px", color: "#1976d2", marginTop: "5px" }}>
                Регистрация: {formatDate(client.registrationDate)}
                </div>
                <div style={{ marginTop: "5px" }}>
                  <Badge text={client.role === "professional" ? "Профессионал" : "Любитель"} color={client.role === "professional" ? "#ff9800" : "#4caf50"} />
                </div>
              </div>
            ))
          )}
        </div>

        <div style={styles.clientDetails}>
          {selectedClient ? (
            <>
              <div style={styles.clientHeader}>
                <div>
                  <h2>{selectedClient.fullName}</h2>
                  <p style={{ color: "#666", margin: "5px 0" }}>
                    <strong>Логин:</strong> {selectedClient.login}
                  </p>
                  <p style={{ color: "#666", margin: "5px 0" }}>
                    <strong>Телефон:</strong> {selectedClient.phone || "-"}
                  </p>
                  <p style={{ color: "#666", margin: "5px 0" }}>
                    <strong>Email:</strong> {selectedClient.email || "-"}
                  </p>
                  <p style={{ color: "#666", margin: "5px 0" }}>
                    <strong>Дата регистрации:</strong> {formatDate(selectedClient.registrationDate)}
                  </p>
                  <p style={{ color: "#1976d2", margin: "5px 0" }}>
                    <strong>Статус:</strong> {selectedClient.role === "professional" ? "Профессионал" : "Любитель"}
                  </p>
                  <p style={{ color: "#4caf50", margin: "5px 0" }}>
                    <strong>Дисконтная карта:</strong> {selectedClient.discountCard ? "Активна" : "Нет"}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px", flexDirection: "column", alignItems: "flex-end" }}>
                  <Badge text="Клиент" color="#4caf50" />
                  <Badge 
                    text={`${clientOrders.length} заказов`} 
                    color="#1976d2" 
                  />
                  <Badge 
                    text={`${clientOrders.reduce((sum, o) => sum + o.total, 0)} ₽`} 
                    color="#ff9800" 
                  />
                </div>
              </div>

              <h3 style={{ marginTop: "25px", marginBottom: "15px" }}>История заказов клиента</h3>
              
              {clientOrders.length === 0 ? (
                <div style={styles.emptyBlock}>
                  <div style={{ fontSize: "48px", marginBottom: "10px" }}></div>
                  <div>У клиента пока нет заказов</div>
                  <div style={{ fontSize: "14px", marginTop: "10px", color: "#666" }}>
                    Заказы будут появляться здесь после оформления через панель клиента
                  </div>
                </div>
              ) : (
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeader}>
                        <th style={styles.th}>№ заказа</th>
                        <th style={styles.th}>Дата</th>
                        <th style={styles.th}>Услуга/Товар</th>
                        <th style={styles.th}>Тип</th>
                        <th style={styles.th}>Статус</th>
                        <th style={styles.th}>Сумма</th>
                        <th style={styles.th}>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientOrders.map((order) => (
                        <tr key={order.id} style={styles.tableRow}>
                          <td style={styles.td}>#{order.id}</td>
                          <td style={styles.td}>{order.date}</td>
                          <td style={styles.td}>{order.service || order.product}</td>
                          <td style={styles.td}>
                            <Badge text={order.type === "service" ? "Услуга" : "Товар"} color={order.type === "service" ? "#1976d2" : "#2e7d32"} />
                          </td>
                          <td style={styles.td}>
                            <Badge text={order.status} color={getStatusColor(order.status)} />
                          </td>
                          <td style={styles.td}><b>{order.total} ₽</b></td>
                          <td style={styles.td}>
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              style={styles.statusSelect}
                            >
                              <option>Принят</option>
                              <option>В работе</option>
                              <option>Готов к выдаче</option>
                              <option>Выдан</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div style={styles.emptyBlock}>
              <div style={{ fontSize: "48px", marginBottom: "10px" }}></div>
              <div>Выберите клиента для просмотра его информации и заказов</div>
              <div style={{ fontSize: "14px", marginTop: "10px", color: "#666" }}>
                Все зарегистрированные клиенты отображаются в списке слева
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OrdersPage({ refreshTrigger }) {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("Все");

  useEffect(() => {
    setOrders(getOrders());
  }, [refreshTrigger]);

  const updateStatus = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
    setOrders(getOrders());
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const nameMatch = order.client?.toLowerCase().includes(filter.toLowerCase()) || 
                       order.service?.toLowerCase().includes(filter.toLowerCase()) ||
                       order.product?.toLowerCase().includes(filter.toLowerCase());
      const statusMatch = statusFilter === "Все" || order.status === statusFilter;
      return nameMatch && statusMatch;
    });
  }, [orders, filter, statusFilter]);

  const getStatusColor = (status) => {
    switch(status) {
      case "Принят": return "#1976d2";
      case "В работе": return "#ff9800";
      case "Готов к выдаче": return "#9c27b0";
      case "Выдан": return "#4caf50";
      default: return "#757575";
    }
  };

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
        <thead><tr><th>№</th><th>Дата</th><th>Клиент</th><th>Услуга/Товар</th><th>Тип</th><th>Статус</th><th>Сумма</th><th>Действия</th></tr></thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.date}</td>
              <td>{order.client || "Клиент"}</td>
              <td>{order.service || order.product}</td>
              <td>{order.type === "service" ? "Услуга" : "Товар"}</td>
              <td><Badge text={order.status} color={getStatusColor(order.status)} /></td>
              <td><b>{order.total} ₽</b></td>
              <td>
                <select onChange={(e) => updateStatus(order.id, e.target.value)} value={order.status} style={styles.statusSelect}>
                  <option>Принят</option><option>В работе</option><option>Готов к выдаче</option><option>Выдан</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NewOrdersPage({ refreshTrigger }) {
  const [newOrders, setNewOrders] = useState([]);

  useEffect(() => {
    const orders = getOrders();
    setNewOrders(orders.filter(order => order.status === "Принят"));
  }, [refreshTrigger]);

  const acceptOrder = (orderId) => {
    updateOrderStatus(orderId, "В работе");
    setNewOrders(prev => prev.filter(order => order.id !== orderId));
  };

  if (newOrders.length === 0) {
    return <div style={styles.emptyState}>Нет новых заказов</div>;
  }

  return (
    <div>
      <h2>Новые заказы клиентов</h2>
      <div style={styles.newOrdersList}>
        {newOrders.map((order) => (
          <div key={order.id} style={styles.newOrderCard}>
            <div style={styles.newOrderHeader}>
              <h3>Заказ №{order.id}</h3>
              <span style={styles.newLabel}>Новый!</span>
            </div>
            <p><b>Клиент:</b> {order.client || "Клиент"}</p>
            <p><b>Дата:</b> {order.date}</p>
            <p><b>{order.type === "service" ? "Услуга:" : "Товар:"}</b> {order.service || order.product}</p>
            <p><b>Сумма:</b> {order.total} ₽</p>
            <button style={styles.acceptButton} onClick={() => acceptOrder(order.id)}>Принять в работу</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductsPage({ refreshTrigger, onDataChange }) {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", category: "", price: "", quantity: "" });

  useEffect(() => {
    setProducts(getProducts());
  }, [refreshTrigger]);

  const addProduct = () => {
    const product = { id: Date.now(), ...newProduct, price: Number(newProduct.price), quantity: Number(newProduct.quantity) };
    const updated = [...products, product];
    setProducts(updated);
    saveProducts(updated);
    onDataChange();
    setNewProduct({ name: "", category: "", price: "", quantity: "" });
  };

  const updatePrice = (id, newPrice) => {
    const updated = products.map(p => p.id === id ? { ...p, price: Number(newPrice) } : p);
    setProducts(updated);
    saveProducts(updated);
    onDataChange();
  };

  const updateQuantity = (id, newQuantity) => {
    const updated = products.map(p => p.id === id ? { ...p, quantity: Number(newQuantity) } : p);
    setProducts(updated);
    saveProducts(updated);
    onDataChange();
  };

  const deleteProduct = (id) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    saveProducts(updated);
    onDataChange();
  };

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
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.category}</td>
              <td><input type="number" value={product.price} onChange={(e) => updatePrice(product.id, e.target.value)} style={styles.editInput} /></td>
              <td><input type="number" value={product.quantity} onChange={(e) => updateQuantity(product.id, e.target.value)} style={styles.editInput} /></td>
              <td><button style={styles.deleteButton} onClick={() => deleteProduct(product.id)}>Удалить</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ServicesPage({ refreshTrigger, onDataChange }) {
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({ name: "", category: "", price: "", description: "" });

  useEffect(() => {
    setServices(getServices());
  }, [refreshTrigger]);

  const addService = () => {
    const service = { id: Date.now(), ...newService, price: Number(newService.price) };
    const updated = [...services, service];
    setServices(updated);
    saveServices(updated);
    onDataChange();
    setNewService({ name: "", category: "", price: "", description: "" });
  };

  const updatePrice = (id, newPrice) => {
    const updated = services.map(s => s.id === id ? { ...s, price: Number(newPrice) } : s);
    setServices(updated);
    saveServices(updated);
    onDataChange();
  };

  const deleteService = (id) => {
    const updated = services.filter(s => s.id !== id);
    setServices(updated);
    saveServices(updated);
    onDataChange();
  };

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
          {services.map((service) => (
            <tr key={service.id}>
              <td>{service.name}</td>
              <td>{service.category}</td>
              <td><input type="number" value={service.price} onChange={(e) => updatePrice(service.id, e.target.value)} style={styles.editInput} /></td>
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
  const [cart, setCart] = useState([]);
  const products = getProducts();

  const addToCart = (product) => { setCart(prev => [...prev, product]); };
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div>
      <h2>Продажа товаров</h2>
      <div style={styles.salesLayout}>
        <div style={styles.productsGrid}>
          {products.map((product) => (
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
          <button style={styles.checkoutButton}>Оформить продажу</button>
        </div>
      </div>
    </div>
  );
}

export default function EmployeeDashboard({ onLogout }) {
  const [page, setPage] = useState("Заказы");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const handleStorageChange = () => setRefreshTrigger(prev => prev + 1);
    subscribeToChanges(handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const renderPage = () => {
    switch (page) {
      case "Заказы": 
        return <OrdersPage refreshTrigger={refreshTrigger} />;
      case "Новые заказы": 
        return <NewOrdersPage refreshTrigger={refreshTrigger} />;
      case "Продажи": 
        return <SalesPage />;
      case "Товары": 
        return <ProductsPage refreshTrigger={refreshTrigger} onDataChange={() => setRefreshTrigger(prev => prev + 1)} />;
      case "Услуги": 
        return <ServicesPage refreshTrigger={refreshTrigger} onDataChange={() => setRefreshTrigger(prev => prev + 1)} />;
      case "Клиенты": 
        return <ClientsPageForEmployee />;
      default: 
        return null;
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar current={page} setCurrent={setPage} />
      <div style={styles.content}>
        <header style={styles.header}>
          <div>
            <h1>Панель сотрудника</h1>
            <p>Управление заказами, товарами, услугами и клиентами</p>
          </div>
          <button style={styles.logoutButton} onClick={onLogout}>Выйти</button>
        </header>
        {renderPage()}
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", minHeight: "100vh", background: "#f0f4f8", fontFamily: "'Segoe UI',Tahoma,Geneva,Verdana,sans-serif",},
  sidebar: { width: "250px", background: "linear-gradient(180deg,#0f2b3d 0%,#1a3a4f 100%)", padding: "24px 16px", display: "flex", flexDirection: "column", gap: "10px",},
  menuButton: { border: "none", color: "#e2e8f0", padding: "12px 16px", borderRadius: "10px", cursor: "pointer", textAlign: "left", position: "relative", fontSize: "14px", fontWeight: "500", transition: "all 0.3s ease", background: "transparent",},
  newBadge: { background: "#ef4444", borderRadius: "50%", padding: "2px 8px", fontSize: "10px", marginLeft: "8px", },
  content: { flex: 1, padding: "24px", },
  header: { background: "#fff", padding: "20px 24px", borderRadius: "16px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", },
  logoutButton: { background: "#ef4444", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "10px", cursor: "pointer", fontWeight: "500", fontSize: "14px", transition: "background 0.2s ease",  },
 
  table: { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", },
  tableContainer: { background: "#fff", borderRadius: "16px", overflow: "auto", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", },
  tableHeader: { background: "#f8fafc", borderBottom: "2px solid #e2e8f0", },
  th: { padding: "14px 12px", textAlign: "left", fontWeight: "600", color: "#1e293b", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", },
  td: { padding: "12px", borderBottom: "1px solid #e2e8f0", fontSize: "14px", color: "#334155", },
  tableRow: { transition: "background 0.2s ease", },
  
  input: { padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", width: "200px", fontSize: "14px", backgroundColor: "#fff", },
  select: { padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", backgroundColor: "#fff", fontSize: "14px", color: "#334155", },
  searchInput: { padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", width: "250px", fontSize: "14px", backgroundColor: "#fff", },
  pageHeader: { display: "flex", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px", },
  headerControls: { display: "flex", gap: "12px", alignItems: "center", },
  filters: { display: "flex", gap: "12px", },
  form: { display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", },
  
  addButton: { background: "#3b82f6", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "10px", cursor: "pointer", fontWeight: "600", fontSize: "14px", transition: "all 0.2s ease", },
  deleteButton: { background: "#fee2e2", color: "#dc2626", border: "none", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", transition: "all 0.2s ease", },
  editInput: { width: "80px", padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", },
  statusSelect: { padding: "6px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#fff", fontSize: "13px", cursor: "pointer", },
  
  salesLayout: { display: "flex", gap: "24px", flexWrap: "wrap", },
  productsGrid: { flex: 2, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "16px", },
  productCard: { background: "#fff", padding: "16px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", },
  saleButton: { background: "#3b82f6", color: "#fff", border: "none", padding: "10px", borderRadius: "10px", cursor: "pointer", width: "100%", fontWeight: "500", marginTop: "10px", transition: "all 0.2s ease", },
  cart: { width: "320px", background: "#fff", padding: "20px", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", },
  cartItem: { display: "flex", justifyContent: "space-between", marginBottom: "10px", padding: "10px", background: "#f8fafc", borderRadius: "8px", fontSize: "14px", },
  checkoutButton: { width: "100%", background: "#10b981", color: "#fff", border: "none", padding: "12px", borderRadius: "10px", cursor: "pointer", marginTop: "16px", fontWeight: "600", transition: "all 0.2s ease", },
  
  clientsContainer: { display: "flex", gap: "24px", flexWrap: "wrap", },
  clientList: { width: "320px", maxHeight: "600px", overflowY: "auto", borderRadius: "16px", },
  clientCard: { padding: "16px", borderRadius: "12px", marginBottom: "12px", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", transition: "all 0.3s ease", border: "1px solid #e2e8f0", },
  clientDetails: { flex: 1, background: "#fff", padding: "24px", borderRadius: "16px", minWidth: "500px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", },
  clientHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", paddingBottom: "16px", borderBottom: "2px solid #e2e8f0", },
  
  emptyState: { textAlign: "center", padding: "60px", background: "#fff", borderRadius: "16px", fontSize: "16px", color: "#94a3b8", },
  emptyList: { textAlign: "center", padding: "40px", color: "#94a3b8", background: "#fff", borderRadius: "16px", },
  emptyBlock: { height: "400px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "#94a3b8", fontSize: "16px", },
  
  newOrdersList: { display: "flex", flexDirection: "column", gap: "16px", },
  newOrderCard: { background: "linear-gradient(135deg,#fff,#f0f9ff)", padding: "20px", borderRadius: "16px", border: "1px solid #bfdbfe", },
  newOrderHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", },
  newLabel: { background: "#f59e0b", color: "#fff", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", },
  acceptButton: {background: "#10b981", color: "#fff", border: "none", padding: "8px 20px", borderRadius: "10px", cursor: "pointer", marginTop: "12px", fontWeight: "500", transition: "all 0.2s ease", },
};