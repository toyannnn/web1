// frontend/src/components/OrdersPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { orders, subscribeToChanges } from '../shared/storage';

function Badge({ text, color }) {
  return (
    <span style={{
      background: color,
      color: '#fff',
      padding: '5px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 'bold',
    }}>
      {text}
    </span>
  );
}

export default function OrdersPage() {
  const [ordersList, setOrdersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('Все');
  const [searchTerm, setSearchTerm] = useState('');

  // Загрузка заказов
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orders.getAll();
      setOrdersList(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Первоначальная загрузка
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Подписка на изменения (синхронизация между вкладками)
  useEffect(() => {
    const unsubscribe = subscribeToChanges(() => {
      loadOrders();
    });
    return unsubscribe;
  }, [loadOrders]);

  // Изменение статуса заказа
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orders.updateStatus(orderId, newStatus);
      await loadOrders(); // Перезагружаем список
    } catch (err) {
      console.error('Ошибка обновления статуса:', err);
      alert('Не удалось обновить статус заказа');
    }
  };

  // Фильтрация заказов
  const filteredOrders = ordersList.filter(order => {
    const statusMatch = statusFilter === 'Все' || order.status === statusFilter;
    const searchMatch = searchTerm === '' || 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.clientName?.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Принят': return '#1976d2';
      case 'В работе': return '#ff9800';
      case 'Готов к выдаче': return '#9c27b0';
      case 'Выдан': return '#4caf50';
      default: return '#757575';
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Загрузка заказов...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>Ошибка: {error}</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h2>Журнал заказов</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="🔍 Поиск по номеру или клиенту"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc', width: '250px' }}
          />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc' }}
          >
            <option>Все</option>
            <option>Принят</option>
            <option>В работе</option>
            <option>Готов к выдаче</option>
            <option>Выдан</option>
          </select>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', overflow: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '14px 12px', textAlign: 'left' }}>№ заказа</th>
              <th style={{ padding: '14px 12px', textAlign: 'left' }}>Дата</th>
              <th style={{ padding: '14px 12px', textAlign: 'left' }}>Клиент</th>
              <th style={{ padding: '14px 12px', textAlign: 'left' }}>Услуга/Товар</th>
              <th style={{ padding: '14px 12px', textAlign: 'left' }}>Статус</th>
              <th style={{ padding: '14px 12px', textAlign: 'left' }}>Сумма</th>
              <th style={{ padding: '14px 12px', textAlign: 'left' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px' }}>{order.orderNumber}</td>
                <td style={{ padding: '12px' }}>{new Date(order.orderDate).toLocaleDateString()}</td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{order.clientName}</td>
                <td style={{ padding: '12px' }}>
                  {order.items?.map(item => item.name).join(', ') || '-'}
                </td>
                <td style={{ padding: '12px' }}>
                  <Badge text={order.status} color={getStatusColor(order.status)} />
                </td>
                <td style={{ padding: '12px', fontWeight: 'bold', color: '#1976d2' }}>
                  {order.totalAmount} ₽
                </td>
                <td style={{ padding: '12px' }}>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #ccc' }}
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
    </div>
  );
}