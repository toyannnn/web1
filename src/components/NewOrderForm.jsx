import React, { useState, useEffect } from "react";
import { services, products } from "../shared/storage";

const calculateOrderPrice = ({
  servicePrice,
  photoCount,
  urgency,
  clientRole,
  hasDiscountCard,
  personalDiscount = 0,
}) => {
  let total = servicePrice * photoCount;
  if (urgency) total *= 2;
  if (clientRole === "Профессионал") total *= 0.9;
  if (hasDiscountCard) total *= 0.75;
  if (photoCount >= 100) total *= 0.85;
  if (personalDiscount > 0) total *= (1 - personalDiscount / 100);
  return Math.round(total);
};

export default function NewOrderForm({ onSubmit, selectedService, selectedProduct, onBack, clientInfo }) {
  const [servicesList, setServicesList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    service: null,
    product: selectedProduct || null,
    type: selectedProduct ? "product" : "service",
    photoCount: 36,
    productQuantity: 1,
    photosPerFrame: 1,
    format: "10x15",
    paperType: "Глянцевая",
    urgent: false,
    discountCard: clientInfo?.discountCard ?? false,
    clientRole: clientInfo?.role ?? "Любитель",
    personalDiscount: clientInfo?.personalDiscount ?? 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [servicesData, productsData] = await Promise.all([
          services.getAll(),
          products.getAll(),
        ]);
        setServicesList(servicesData);
        setProductsList(productsData);
        if (selectedService) {
          setFormData(prev => ({ ...prev, service: selectedService, type: "service", product: null }));
        } else if (selectedProduct) {
          setFormData(prev => ({ ...prev, product: selectedProduct, type: "product", service: null }));
        } else if (servicesData.length > 0) {
          setFormData(prev => ({ ...prev, service: servicesData[0] }));
        }
      } catch (err) {
        console.error("Ошибка загрузки данных:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedService, selectedProduct]);

  useEffect(() => {
    if (selectedService) {
      setFormData(prev => ({ ...prev, service: selectedService, type: "service", product: null }));
    }
    if (selectedProduct) {
      setFormData(prev => ({ ...prev, product: selectedProduct, type: "product", service: null }));
    }
  }, [selectedService, selectedProduct]);

  useEffect(() => {
    if (clientInfo) {
      setFormData(prev => ({
        ...prev,
        discountCard: clientInfo.discountCard ?? false,
        clientRole: clientInfo.role ?? "Любитель",
        personalDiscount: clientInfo.personalDiscount ?? 0,
      }));
    }
  }, [clientInfo]);

  const calculateTotal = () => {
    if (formData.type === "product" && formData.product) {
      const qty = formData.productQuantity || 1;
      return calculateOrderPrice({
        servicePrice: formData.product.price || 0,
        photoCount: qty,
        urgency: formData.urgent,
        clientRole: formData.clientRole,
        hasDiscountCard: formData.discountCard,
        personalDiscount: formData.personalDiscount,
      });
    }
    if (!formData.service) return 0;
    return calculateOrderPrice({
      servicePrice: formData.service.price || 0,
      photoCount: formData.photoCount || 0,
      urgency: formData.urgent,
      clientRole: formData.clientRole,
      hasDiscountCard: formData.discountCard,
      personalDiscount: formData.personalDiscount,
    });
  };

  const handleSubmit = () => {
    const total = calculateTotal();
    if (total <= 0) {
      alert("Пожалуйста, заполните все поля корректно");
      return;
    }

    const orderData = {
      type: formData.type,
      serviceId: formData.type === "service" ? formData.service?.id : undefined,
      productId: formData.type === "product" ? formData.product?.id : undefined,
      quantity: formData.type === "service" ? formData.photoCount : (formData.productQuantity || 1),
      urgent: formData.urgent,
      total: total,
    };

    console.log("Submitting order data:", orderData);
    onSubmit(orderData);
  };

  const total = calculateTotal();

  if (loading) {
    return <div style={{ textAlign: "center", padding: "40px" }}>Загрузка...</div>;
  }

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
          onChange={(e) => setFormData({ ...formData, type: e.target.value, product: null, service: servicesList[0] })}
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
                const selected = servicesList.find(s => s.id === Number(e.target.value));
                setFormData({ ...formData, service: selected });
              }}
            >
              {servicesList.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name} - {service.price} ₽
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
          </>
        ) : (
          <>
            <label>Товар</label>
            <select
              value={formData.product?.id || ""}
              onChange={(e) => {
                const selected = productsList.find(p => p.id === Number(e.target.value));
                setFormData({ ...formData, product: selected });
              }}
            >
              <option value="">Выберите товар</option>
              {productsList.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - {product.price} ₽ (в наличии: {product.quantity} шт.)
                </option>
              ))}
            </select>

            {formData.product && (
              <div style={styles.productInfo}>
                <h3>{formData.product.name}</h3>
                <p>Категория: {formData.product.category}</p>
                <p>Цена: {formData.product.price} ₽</p>
                <p>В наличии: {formData.product.quantity} шт.</p>
              </div>
            )}

            <label>Количество</label>
            <input
              type="number"
              min="1"
              max={formData.product?.quantity || 999}
              value={formData.productQuantity}
              onChange={(e) => setFormData({ ...formData, productQuantity: Number(e.target.value) || 1 })}
            />
          </>
        )}

        <label style={styles.checkbox}>
          <input type="checkbox" checked={formData.urgent} onChange={() => setFormData({ ...formData, urgent: !formData.urgent })} />
          Срочный заказ (цена ×2)
        </label>

        <label style={styles.checkbox}>
          <input type="checkbox" checked={formData.discountCard} onChange={() => setFormData({ ...formData, discountCard: !formData.discountCard })} />
          Дисконтная карта (скидка 25%)
        </label>

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
  container: { background: "#fff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" },
  header: { display: "flex", alignItems: "center", gap: "20px", marginBottom: "24px" },
  backButton: { background: "#64748b", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "10px", cursor: "pointer" },
  form: { display: "flex", flexDirection: "column", gap: "14px" },
  checkbox: { display: "flex", gap: "10px", alignItems: "center", cursor: "pointer" },
  summary: { background: "#f8fafc", padding: "20px", borderRadius: "12px", marginTop: "16px", textAlign: "center", border: "1px solid #e2e8f0" },
  totalPrice: { color: "#3b82f6", marginTop: "8px", fontSize: "24px" },
  button: { background: "#3b82f6", color: "#fff", border: "none", padding: "14px", borderRadius: "10px", cursor: "pointer", marginTop: "16px", fontWeight: "600", fontSize: "16px" },
  productInfo: { background: "#d1fae5", padding: "16px", borderRadius: "12px", borderLeft: "4px solid #10b981" },
};
