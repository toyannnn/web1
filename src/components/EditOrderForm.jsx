// frontend/src/components/EditOrderForm.jsx
import React, { useState, useEffect } from "react";
import { services, products, orders } from "../shared/storage";

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

export default function EditOrderForm({ orderId, onBack, clientInfo, onSaved }) {
  const [servicesList, setServicesList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    type: "service",
    service: null,
    product: null,
    photoCount: 1,
    productQuantity: 1,
    urgent: false,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [orderData, servicesData, productsData] = await Promise.all([
          orders.getById(orderId),
          services.getAll(),
          products.getAll(),
        ]);
        setServicesList(servicesData);
        setProductsList(productsData);

        if (orderData.items && orderData.items.length > 0) {
          const item = orderData.items[0];
          const isService = item.type === "service";
          setFormData({
            type: isService ? "service" : "product",
            service: isService ? servicesData.find(s => s.name === item.name) || servicesData[0] : null,
            product: !isService ? productsData.find(p => p.name === item.name) || productsData[0] : null,
            photoCount: isService ? item.quantity : 1,
            productQuantity: !isService ? item.quantity : 1,
            urgent: orderData.isUrgent || false,
          });
        }
      } catch (err) {
        console.error("Ошибка загрузки заказа:", err);
        setError("Не удалось загрузить заказ");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [orderId]);

  const calculateTotal = () => {
    if (formData.type === "product" && formData.product) {
      return calculateOrderPrice({
        servicePrice: formData.product.price || 0,
        photoCount: formData.productQuantity || 1,
        urgency: formData.urgent,
        clientRole: clientInfo?.role ?? "Любитель",
        hasDiscountCard: clientInfo?.discountCard ?? false,
        personalDiscount: clientInfo?.personalDiscount ?? 0,
      });
    }
    if (!formData.service) return 0;
    return calculateOrderPrice({
      servicePrice: formData.service.price || 0,
      photoCount: formData.photoCount || 0,
      urgency: formData.urgent,
      clientRole: clientInfo?.role ?? "Любитель",
      hasDiscountCard: clientInfo?.discountCard ?? false,
      personalDiscount: clientInfo?.personalDiscount ?? 0,
    });
  };

  const handleSubmit = async () => {
    const total = calculateTotal();
    if (total <= 0) {
      alert("Пожалуйста, заполните все поля корректно");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const items = [{
        itemType: formData.type,
        serviceId: formData.type === "service" ? formData.service?.id : undefined,
        productId: formData.type === "product" ? formData.product?.id : undefined,
        quantity: formData.type === "service" ? formData.photoCount : (formData.productQuantity || 1),
      }];

      await orders.update(orderId, {
        isUrgent: formData.urgent,
        items: items,
      });

      alert("Заказ успешно обновлён");
      onSaved?.();
      onBack();
    } catch (err) {
      console.error("Ошибка обновления заказа:", err);
      setError(err.message || "Не удалось обновить заказ");
    } finally {
      setSaving(false);
    }
  };

  const total = calculateTotal();

  if (loading) {
    return <div style={{ textAlign: "center", padding: "40px" }}>Загрузка...</div>;
  }

  if (error && !formData.service && !formData.product) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backButton} onClick={onBack}>← Назад</button>
          <h2>Редактирование заказа</h2>
        </div>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={onBack}>← Назад</button>
        <h2>Редактирование заказа #{orderId}</h2>
      </div>

      {error && <p style={{ color: "red", margin: "0 0 12px" }}>{error}</p>}

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

        <div style={styles.summary}>
          <h3>Итоговая стоимость</h3>
          <h2 style={styles.totalPrice}>{isNaN(total) ? 0 : total} ₽</h2>
        </div>

        <button style={styles.button} onClick={handleSubmit} disabled={saving}>
          {saving ? "Сохранение..." : "Сохранить изменения"}
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
