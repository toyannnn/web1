import React, { useMemo } from "react";

export default function ClientOrders({ orders, lastOrder, onCancelOrder }) {
  const totalSpent = useMemo(() => orders.reduce((sum, order) => sum + order.total, 0), [orders]);

  return (
    <div>
      {lastOrder && (
        <div style={styles.undoNotification}>
          <span>Заказ №{lastOrder.id} успешно создан!</span>
          <button style={styles.undoButton} onClick={onCancelOrder}>Отменить заказ</button>
        </div>
      )}

      <div style={styles.header}>
        <h2>Мои заказы</h2>
        <div style={styles.totalBlock}>
          <h3>Общая сумма заказов</h3>
          <h2>{totalSpent} ₽</h2>
        </div>
      </div>

      {orders.length === 0 ? (
        <div style={styles.emptyOrders}>
          <p> У вас пока нет заказов</p>
          <p style={{ color: "#1976d2" }}>Перейдите в раздел "Новый заказ"</p>
        </div>
      ) : (
        <>
          <div style={styles.ordersList}>
            {orders.map((order) => (
              <div key={order.id} style={styles.orderCard}>
                <div style={styles.orderHeader}>
                  <h3>Заказ №{order.id}</h3>
                  <span style={{ ...styles.status, background: order.status === "Принят" ? "#1976d2" : "#ff9800" }}>
                    {order.status}
                  </span>
                </div>
                <p>{order.type === "service" ? order.service : order.product}</p>
                <p>Дата: {order.date}</p>
                <h2 style={styles.orderTotal}>{order.total} ₽</h2>
              </div>
            ))}
          </div>

          <div style={styles.history}>
            <h3>История заказов</h3>
            <table style={styles.table}>
              <thead>
                <tr><th>№</th><th>Дата</th><th>Услуга/Товар</th><th>Тип</th><th>Статус</th><th>Сумма</th></tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.date}</td>
                    <td>{order.type === "service" ? order.service : order.product}</td>
                    <td>{order.type === "service" ? "Услуга" : "Товар"}</td>
                    <td>{order.status}</td>
                    <td><b>{order.total} ₽</b></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
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