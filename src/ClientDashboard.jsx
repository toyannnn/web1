// frontend/src/ClientDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import ServicesCatalog from './components/ServicesCatalog';
import ProductsCatalog from './components/ProductsCatalog';
import NewOrderForm from './components/NewOrderForm';
import EditOrderForm from './components/EditOrderForm';
import ClientOrders from './components/ClientOrders';
import ProfileInfo from './components/ProfileInfo';
import { orders, clients, subscribeToChanges } from './shared/storage';

export default function ClientDashboard({ onLogout, currentUser }) {
  const [page, setPage] = useState('orders');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [ordersList, setOrdersList] = useState([]);
  const [lastOrder, setLastOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clientInfo, setClientInfo] = useState(null);

  const loadClientData = useCallback(async () => {
    try {
      const client = await clients.getById(currentUser.id);
      setClientInfo(client);
    } catch (err) {
      console.error('Ошибка загрузки клиента:', err);
    }
  }, [currentUser.id]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await orders.getByClientId(currentUser.id);
      console.log('Loaded orders:', data);
      setOrdersList(data || []);
    } catch (err) {
      console.error('Ошибка загрузки заказов:', err);
      setOrdersList([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser.id]);

  useEffect(() => {
    loadClientData();
    loadOrders();
  }, [loadClientData, loadOrders]);

  useEffect(() => {
    const unsubscribe = subscribeToChanges(() => {
      loadOrders();
      loadClientData();
    });
    return unsubscribe;
  }, [loadOrders, loadClientData]);

  const handleNewOrder = async (orderData) => {
    try {
      const items = [];
      if (orderData.type === 'service' && orderData.serviceId) {
        items.push({
          itemType: 'service',
          serviceId: orderData.serviceId,
          quantity: orderData.quantity || 1,
        });
      } else if (orderData.type === 'product' && orderData.productId) {
        items.push({
          itemType: 'product',
          productId: orderData.productId,
          quantity: orderData.quantity || 1,
        });
      } else {
        alert('Не удалось создать заказ: не выбран товар или услуга');
        return;
      }

      const orderPayload = {
        clientId: currentUser.id,
        isUrgent: orderData.urgent || false,
        items: items,
      };

      const newOrder = await orders.create(orderPayload);
      await loadOrders();
      setLastOrder(newOrder);
      setPage('orders');
      setTimeout(() => setLastOrder(null), 5000);
    } catch (err) {
      console.error('Ошибка создания заказа:', err);
      alert('Не удалось создать заказ');
    }
  };

  const cancelLastOrder = () => {
    if (lastOrder) {
      setOrdersList(prev => prev.filter(o => o.id !== lastOrder.id));
      setLastOrder(null);
    }
  };

  const handleEditOrder = (orderId) => {
    setEditingOrderId(orderId);
    setPage('edit-order');
  };

  const handleEditSaved = async () => {
    await loadOrders();
  };

  const handleOrderFromCatalog = (item, type) => {
    if (type === 'service') {
      setSelectedService(item);
      setSelectedProduct(null);
    } else {
      setSelectedProduct(item);
      setSelectedService(null);
    }
    setPage('new-order');
  };

  const handleProfileUpdate = () => {
    loadClientData();
  };

  const renderPage = () => {
    if (loading && page === 'orders') return <div style={{ textAlign: 'center', padding: '40px' }}>Загрузка...</div>;

    switch (page) {
      case 'orders':
        return <ClientOrders orders={ordersList} lastOrder={lastOrder} onCancelOrder={cancelLastOrder} onEditOrder={handleEditOrder} />;
      case 'services':
        return <ServicesCatalog onOrder={handleOrderFromCatalog} />;
      case 'products':
        return <ProductsCatalog onOrder={handleOrderFromCatalog} />;
      case 'new-order':
        return <NewOrderForm onSubmit={handleNewOrder} selectedService={selectedService} selectedProduct={selectedProduct} onBack={() => setPage('orders')} clientInfo={clientInfo} />;
      case 'edit-order':
        return <EditOrderForm orderId={editingOrderId} onBack={() => setPage('orders')} clientInfo={clientInfo} onSaved={handleEditSaved} />;
      case 'profile':
        return <ProfileInfo
          currentUser={{
            id: currentUser.id,
            fullName: clientInfo?.fullName || currentUser?.fullName,
            phone: clientInfo?.phone || currentUser?.phone,
            email: clientInfo?.email || currentUser?.email,
            login: currentUser?.login
          }}
          onProfileUpdate={handleProfileUpdate}
        />;
      default:
        return <ClientOrders orders={ordersList} lastOrder={lastOrder} onCancelOrder={cancelLastOrder} onEditOrder={handleEditOrder} />;
    }
  };

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <h2>PHOTO CLIENT</h2>
        <div style={styles.userInfo}>
          <p style={styles.userName}>{clientInfo?.fullName || currentUser?.fullName}</p>
          <p style={styles.userStatus}>Клиент</p>
        </div>
        <button style={styles.button} onClick={() => setPage('orders')}>Мои заказы</button>
        <button style={styles.button} onClick={() => setPage('new-order')}>Новый заказ</button>
        <button style={styles.button} onClick={() => setPage('services')}>Услуги</button>
        <button style={styles.button} onClick={() => setPage('products')}>Товары</button>
        <button style={styles.button} onClick={() => setPage('profile')}>Профиль</button>
        <button style={styles.logout} onClick={onLogout}>Выйти</button>
      </aside>
      <main style={styles.content}>{renderPage()}</main>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    background: "#f0f4f8",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  sidebar: {
    width: "260px",
    background: "linear-gradient(180deg, #0f2b3d 0%, #1a3a4f 100%)",
    color: "#fff",
    padding: "24px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  userInfo: {
    background: "#1e3a5f",
    padding: "16px",
    borderRadius: "12px",
    marginBottom: "16px",
    textAlign: "center",
  },
  userName: {
    fontWeight: "bold",
    fontSize: "15px",
    marginBottom: "6px",
    color: "#fff",
  },
  userStatus: {
    fontSize: "12px",
    color: "#93c5fd",
  },
  button: {
    background: "rgba(255,255,255,0.1)",
    color: "#e2e8f0",
    border: "none",
    padding: "12px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
    fontSize: "14px",
    fontWeight: "500",
  },
  logout: {
    marginTop: "auto",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "12px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },
  content: {
    flex: 1,
    padding: "24px",
  },
};
