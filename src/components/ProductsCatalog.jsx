// frontend/src/components/ProductsCatalog.jsx
import React, { useState, useEffect } from "react";
import { products } from "../shared/storage";

export default function ProductsCatalog({ onOrder, refreshTrigger }) {
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await products.getAll();
      setProductsList(data);
    } catch (err) {
      console.error("Ошибка загрузки товаров:", err);
      setProductsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [refreshTrigger]);

  if (loading) {
    return <div style={{ textAlign: "center", padding: "40px" }}>Загрузка товаров...</div>;
  }

  return (
    <div>
      <h2>Каталог товаров</h2>
      <div style={styles.grid}>
        {productsList.map((product) => (
          <div key={product.id} style={styles.card}>
            <h3>{product.name}</h3>
            <p>Категория: {product.category}</p>
            <p>Остаток: {product.quantity} шт.</p>
            <h2>{product.price} ₽</h2>
<button style={styles.button} onClick={() => onOrder(product, "product")}>
  Купить товар
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
    background: "#10b981",
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
