import React, { useState, useEffect } from "react";
import { services as initialServices } from "../data/services";
import { getServices } from "../shared/storage";

const calculateOrderPrice = ({
  servicePrice,
  photoCount,
  urgency,
  clientRole,
  hasDiscountCard,
}) => {
  let total = servicePrice * photoCount;

  // Срочность = x2
  if (urgency) {
    total *= 2;
  }

  // Скидка профессионалам
  if (clientRole === "Профессионал") {
    total *= 0.9;
  }

  // Дисконтная карта
  if (hasDiscountCard) {
    total *= 0.75;
  }

  // Скидка за большое количество
  if (photoCount >= 100) {
    total *= 0.85;
  }

  return Math.round(total);
};

export default function NewOrderForm({ onSubmit, selectedService, selectedProduct, onBack }) {
  const [services, setServices] = useState(initialServices);
  
  useEffect(() => {
    setServices(getServices());
  }, []);

  const [formData, setFormData] = useState({
    service: selectedService || (services[0] || initialServices[0]),
    product: selectedProduct || null,
    type: selectedProduct ? "product" : "service",
    photoCount: 36,
    photosPerFrame: 1,
    format: "10x15",
    paperType: "Глянцевая",
    urgent: false,
    discountCard: true,
    clientRole: "Профессионал",
  });

  useEffect(() => {
    if (selectedService) {
      setFormData(prev => ({ ...prev, service: selectedService, type: "service", product: null }));
    }
    if (selectedProduct) {
      setFormData(prev => ({ ...prev, product: selectedProduct, type: "product", service: null }));
    }
  }, [selectedService, selectedProduct]);

  const calculateTotal = () => {
    if (formData.type === "product" && formData.product) {
      return formData.product.price;
    }
    
    if (!formData.service) return 0;
    
    return calculateOrderPrice({
      servicePrice: formData.service.price || formData.service.basePrice || 0,
      photoCount: formData.photoCount || 0,
      urgency: formData.urgent,
      clientRole: formData.clientRole,
      hasDiscountCard: formData.discountCard,
    });
  };

  const handleSubmit = () => {
    const total = calculateTotal();
    
    const orderData = {
      type: formData.type,
      service: formData.type === "service" ? (formData.service?.name || "Услуга") : null,
      product: formData.type === "product" ? formData.product?.name : null,
      details: formData.type === "service" ? {
        format: formData.format,
        paper: formData.paperType,
        photosCount: formData.photoCount,
        photosPerFrame: formData.photosPerFrame,
        urgent: formData.urgent,
      } : null,
      total: total,
    };
    
    if (total > 0) {
      onSubmit(orderData);
    } else {
      alert("Пожалуйста, заполните все поля корректно");
    }
  };

  const total = calculateTotal();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={onBack}>← Назад</button>
        <h2>Создание заказа</h2>
      </div>

      <div style={styles.form}>
        <label>Тип заказа</label>
        <select 
          value={formData.type} 
          onChange={(e) => setFormData({ ...formData, type: e.target.value, product: null, service: services[0] })}
        >
          <option value="service">Услуга</option>
          <option value="product">Товар</option>
        </select>

        {formData.type === "service" ? (
          <>
            <label>Услуга</label>
            <select 
              value={formData.service?.id || ""} 
              onChange={(e) => {
                const selected = services.find(s => s.id === Number(e.target.value));
                setFormData({ ...formData, service: selected });
              }}
            >
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name} - {service.price || service.basePrice} ₽
                </option>
              ))}
            </select>

            <label>Количество фотографий</label>
            <input 
              type="number" 
              min="1"
              value={formData.photoCount} 
              onChange={(e) => setFormData({ ...formData, photoCount: Number(e.target.value) || 0 })} 
            />

            <label>Фото с каждого кадра</label>
            <input 
              type="number" 
              min="1"
              value={formData.photosPerFrame} 
              onChange={(e) => setFormData({ ...formData, photosPerFrame: Number(e.target.value) || 1 })} 
            />

            <label>Формат</label>
            <select value={formData.format} onChange={(e) => setFormData({ ...formData, format: e.target.value })}>
              <option>10x15</option>
              <option>15x21</option>
              <option>A4</option>
              <option>A3</option>
            </select>

            <label>Тип бумаги</label>
            <select value={formData.paperType} onChange={(e) => setFormData({ ...formData, paperType: e.target.value })}>
              <option>Глянцевая</option>
              <option>Матовая</option>
              <option>Премиум</option>
            </select>

            <label style={styles.checkbox}>
              <input type="checkbox" checked={formData.urgent} onChange={() => setFormData({ ...formData, urgent: !formData.urgent })} />
              Срочный заказ (цена ×2)
            </label>

            <label style={styles.checkbox}>
              <input type="checkbox" checked={formData.discountCard} onChange={() => setFormData({ ...formData, discountCard: !formData.discountCard })} />
              Дисконтная карта (скидка 25%)
            </label>
          </>
        ) : (
          formData.product && (
            <div style={styles.productInfo}>
              <h3>{formData.product.name}</h3>
              <p>Категория: {formData.product.category}</p>
              <p>Цена: {formData.product.price} ₽</p>
              <p>В наличии: {formData.product.quantity} шт.</p>
            </div>
          )
        )}

        <div style={styles.summary}>
          <h3>Итоговая стоимость</h3>
          <h2 style={styles.totalPrice}>{isNaN(total) ? 0 : total} ₽</h2>
        </div>

        <button style={styles.button} onClick={handleSubmit}>
          Оформить заказ
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "#fff",
    padding: "24px",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "24px",
  },
  backButton: {
    background: "#64748b",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "background 0.2s ease",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  checkbox: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    cursor: "pointer",
  },
  summary: {
    background: "#f8fafc",
    padding: "20px",
    borderRadius: "12px",
    marginTop: "16px",
    textAlign: "center",
    border: "1px solid #e2e8f0",
  },
  totalPrice: {
    color: "#3b82f6",
    marginTop: "8px",
    fontSize: "24px",
  },
  button: {
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    padding: "14px",
    borderRadius: "10px",
    cursor: "pointer",
    marginTop: "16px",
    fontWeight: "600",
    fontSize: "16px",
    transition: "all 0.2s ease",
  },
  productInfo: {
    background: "#d1fae5",
    padding: "16px",
    borderRadius: "12px",
    borderLeft: "4px solid #10b981",
  },
};