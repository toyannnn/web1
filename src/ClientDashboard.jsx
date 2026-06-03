import React, { useState, useEffect } from "react";
import ServicesCatalog from "./components/ServicesCatalog";
import ProductsCatalog from "./components/ProductsCatalog";
import NewOrderForm from "./components/NewOrderForm";
import ClientOrders from "./components/ClientOrders";
import ProfileInfo from "./components/ProfileInfo";
import { 
  getClientOrders, 
  addOrder, 
  subscribeToChanges,
  getClientById,
  getProducts,
  getServices
} from "./shared/storage";

export default function ClientDashboard({ onLogout, currentUser }) {
  const [page, setPage] = useState("orders");
  const [selectedService, setSelectedService] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orders, setOrders] = useState([]);
  const [lastOrder, setLastOrder] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [clientInfo, setClientInfo] = useState(null);

  useEffect(() => {
    const loadClientData = () => {
      const client = getClientById(currentUser.id);
      if (client) {
        setClientInfo(client);
      } else {
        setClientInfo({
          fullName: currentUser.fullName,
          login: currentUser.login,
          phone: currentUser.phone || "",
          email: currentUser.email || "",
          registrationDate: new Date().toISOString().slice(0, 10),
        });
      }
    };
    
    loadClientData();
    
    const handleStorageChange = () => {
      loadClientData();
      setRefreshTrigger(prev => prev + 1);
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [currentUser.id, currentUser.fullName, currentUser.login, currentUser.phone, currentUser.email]);

  useEffect(() => {
    const clientOrders = getClientOrders(currentUser.id);
    setOrders(clientOrders);
  }, [refreshTrigger, currentUser.id]);

  useEffect(() => {
    const handleStorageChange = () => setRefreshTrigger(prev => prev + 1);
    subscribeToChanges(handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleNewOrder = (orderData) => {
    const newOrder = addOrder({
      ...orderData,
      clientId: currentUser.id,
      clientName: currentUser.fullName,
      type: orderData.service ? "service" : "product",
    });
    setOrders(getClientOrders(currentUser.id));
    setLastOrder(newOrder);
    setPage("orders");
    setTimeout(() => setLastOrder(null), 5000);
  };

  const cancelLastOrder = () => {
    if (lastOrder) {
      const allOrders = JSON.parse(localStorage.getItem("photo_orders") || "[]");
      const remaining = allOrders.filter(order => order.id !== lastOrder.id);
      localStorage.setItem("photo_orders", JSON.stringify(remaining));
      setOrders(getClientOrders(currentUser.id));
      setLastOrder(null);
      window.dispatchEvent(new StorageEvent("storage", { key: "photo_orders" }));
    }
  };

  const handleOrderFromCatalog = (item, type) => {
    if (type === "service") {
      setSelectedService(item);
      setSelectedProduct(null);
    } else {
      setSelectedProduct(item);
      setSelectedService(null);
    }
    setPage("new-order");
  };

  const handleProfileUpdate = () => {
    const updatedClient = getClientById(currentUser.id);
    if (updatedClient) {
      setClientInfo(updatedClient);
    }
    setRefreshTrigger(prev => prev + 1);
  };

  const renderPage = () => {
    switch (page) {
      case "orders":
        return <ClientOrders orders={orders} lastOrder={lastOrder} onCancelOrder={cancelLastOrder} />;
      case "services":
        return <ServicesCatalog onOrder={handleOrderFromCatalog} refreshTrigger={refreshTrigger} />;
      case "products":
        return <ProductsCatalog onOrder={handleOrderFromCatalog} refreshTrigger={refreshTrigger} />;
      case "new-order":
        return (
          <NewOrderForm
            onSubmit={handleNewOrder}
            selectedService={selectedService}
            selectedProduct={selectedProduct}
            onBack={() => setPage("orders")}
          />
        );
      case "profile":
        return <ProfileInfo currentUser={{ ...currentUser, ...clientInfo }} onProfileUpdate={handleProfileUpdate} />;
      default:
        return <ClientOrders orders={orders} lastOrder={lastOrder} onCancelOrder={cancelLastOrder} />;
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
        <button style={styles.button} onClick={() => setPage("orders")}>Мои заказы</button>
        <button style={styles.button} onClick={() => setPage("new-order")}>Новый заказ</button>
        <button style={styles.button} onClick={() => setPage("services")}>Услуги</button>
        <button style={styles.button} onClick={() => setPage("products")}>Товары</button>
        <button style={styles.button} onClick={() => setPage("profile")}>Профиль</button>
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