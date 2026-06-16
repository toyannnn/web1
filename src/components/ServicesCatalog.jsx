// frontend/src/components/ServicesCatalog.jsx
import React, { useState, useEffect } from "react";
import { services } from "../shared/storage";

export default function ServicesCatalog({ onOrder, refreshTrigger }) {
  const [servicesList, setServicesList] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await services.getAll();
      setServicesList(data);
    } catch (err) {
      console.error("Ошибка загрузки услуг:", err);
      setServicesList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [refreshTrigger]);

  if (loading) {
    return <div style={{ textAlign: "center", padding: "40px" }}>Загрузка услуг...</div>;
  }

  return (
    <div>
      <h2>Каталог услуг</h2>
      <div style={styles.grid}>
        {servicesList.map((service) => (
          <div key={service.id} style={styles.card}>
            <h3>{service.name}</h3>
            <p>Категория: {service.category}</p>
            <p>{service.description}</p>
            <h2>{service.price} ₽</h2>
            <button style={styles.button} onClick={() => onOrder(service, "service")}>
              Заказать услугу
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    border: "1px solid #e2e8f0",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  button: {
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    padding: "12px",
    borderRadius: "10px",
    cursor: "pointer",
    width: "100%",
    marginTop: "12px",
    fontWeight: "500",
    fontSize: "14px",
    transition: "all 0.2s ease",
  },
};