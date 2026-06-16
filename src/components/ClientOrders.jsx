import React, { useMemo } from "react";

export default function ClientOrders({ orders, lastOrder, onCancelOrder, onEditOrder }) {
  const totalSpent = useMemo(() => {
    if (!orders || orders.length === 0) return 0;
    return orders.reduce((sum, order) => sum + (order.totalAmount || order.total || 0), 0);
  }, [orders]);

  const formatDate = (dateString) => {
    if (!dateString) return "Дата не указана";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Дата не указана";
    return date.toLocaleDateString('ru-RU');
  };

  const getOrderItems = (order) => {
    if (order.items && order.items.length > 0) {
      return order.items.map(item => item.name).join(', ');
    }
    return "—";
  };

  if (!orders || orders.length === 0) {
    return (
      <div>
        <div style={styles.header}>
          <h2>Мои заказы</h2>
          <div style={styles.totalBlock}>
            <h3>Общая сумма заказов</h3>
            <h2>0 ₽</h2>
          </div>
        </div>
        <div style={styles.emptyOrders}>
          <p>📭 У вас пока нет заказов</p>
          <p style={{ color: "#1976d2" }}>Перейдите в раздел "Новый заказ"</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {lastOrder && (
        <div style={styles.undoNotification}>
          <span>✅ Заказ №{lastOrder.orderNumber || lastOrder.id} успешно создан!</span>
          <button style={styles.undoButton} onClick={onCancelOrder}>Отменить заказ</button>
        </div>
      )}

      <div style={styles.header}>
        <h2>Мои заказы</h2>
        <div style={styles.totalBlock}>
          <h3>Общая сумма заказов</h3>
          <h2>{totalSpent.toLocaleString()} ₽</h2>
        </div>
      </div>

      <div style={styles.ordersList}>
        {orders.map((order) => (
          <div key={order.id} style={styles.orderCard}>
            <div style={styles.orderHeader}>
              <h3>Заказ №{order.orderNumber || order.id}</h3>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ ...styles.status, background: order.status === "Принят" ? "#1976d2" : order.status === "Выдан" ? "#4caf50" : "#ff9800" }}>
                  {order.status || "Принят"}
                </span>
                {order.status === "Принят" && onEditOrder && (
                  <button style={styles.editButton} onClick={() => onEditOrder(order.id)}>
                    ✏️ Редактировать
                  </button>
                )}
              </div>
            </div>
            <p>📦 {getOrderItems(order)}</p>
            <p>📅 Дата: {formatDate(order.orderDate)}</p>
            {order.isUrgent && <p style={{ color: "#ef4444", fontWeight: "600" }}>⚡ Срочный заказ</p>}
            <h2 style={styles.orderTotal}>{(order.totalAmount || 0).toLocaleString()} ₽</h2>
          </div>
        ))}
      </div>

      <div style={styles.history}>
        <h3>📋 История заказов</h3>
        <table style={styles.table}>
          <thead>
            <tr><th>№</th><th>Дата</th><th>Услуга/Товар</th><th>Статус</th><th>Сумма</th><th>Действия</th></tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.orderNumber || `#${order.id}`}</td>
                <td>{formatDate(order.orderDate)}</td>
                <td>{getOrderItems(order)}</td>
                <td>{order.status || "Принят"}</td>
                <td><h2 style={styles.orderTotal}>{(order.totalAmount || 0).toLocaleString()} ₽</h2></td>
                <td>
                  {order.status === "Принят" && onEditOrder && (
                    <button style={styles.editButtonSmall} onClick={() => onEditOrder(order.id)}>
                      Редактировать
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  undoNotification: {
    background: "#d1fae5",
    padding: "16px 20px",
    borderRadius: "12px",
    marginBottom: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderLeft: "4px solid #10b981",
  },
  undoButton: {
    background: "#f59e0b",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "13px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px",
  },
  totalBlock: {
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    padding: "16px 24px",
    borderRadius: "16px",
    color: "#fff",
    minWidth: "200px",
    textAlign: "center",
  },
  emptyOrders: {
    textAlign: "center",
    padding: "60px",
    background: "#fff",
    borderRadius: "16px",
    color: "#64748b",
  },
  ordersList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginBottom: "32px",
  },
  orderCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    border: "1px solid #e2e8f0",
  },
  orderHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  status: {
    padding: "4px 12px",
    borderRadius: "20px",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "600",
  },
  orderTotal: {
    color: "#3b82f6",
    marginTop: "12px",
    fontSize: "20px",
  },
  editButton: {
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    padding: "6px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
  editButtonSmall: {
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    padding: "5px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
  },
  history: {
    background: "#fff",
    padding: "24px",
    borderRadius: "16px",
    marginTop: "24px",
    border: "1px solid #e2e8f0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "12px",
  },
};
