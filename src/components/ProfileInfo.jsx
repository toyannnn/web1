// frontend/src/components/ProfileInfo.jsx
import React, { useState, useEffect, useCallback } from "react";
import { clients, subscribeToChanges } from "../shared/storage";

export default function ProfileInfo({ currentUser, onProfileUpdate }) {
  const [profile, setProfile] = useState({
    fullName: "",
    phone: "",
    email: "",
    status: "Любитель",
    registrationDate: "",
    discountCard: false,
    availableDiscounts: [],
  });
  
  const [editing, setEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка данных клиента из API (обернута в useCallback)
  const loadClientData = useCallback(async () => {
    setIsLoading(true);
    try {
      const clientData = await clients.getById(currentUser.id);
      if (clientData) {
        setProfile({
          fullName: clientData.fullName || currentUser.fullName || "",
          phone: clientData.phone || currentUser.phone || "",
          email: clientData.email || currentUser.email || "",
          status: clientData.role === "professional" ? "Профессионал" : "Любитель",
          registrationDate: clientData.registrationDate || new Date().toISOString().slice(0, 10),
          discountCard: clientData.discountCard || false,
          availableDiscounts: [
            clientData.role === "professional" ? "Скидка профессионала 10%" : null,
            clientData.discountCard ? "Дисконтная карта 25%" : null,
            "Скидка за большой заказ 15%",
          ].filter(Boolean),
        });
      }
    } catch (err) {
      console.error("Ошибка загрузки данных клиента:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser.id, currentUser.fullName, currentUser.phone, currentUser.email]);

  // Загрузка данных при монтировании и изменении currentUser.id
  useEffect(() => {
    loadClientData();
  }, [loadClientData]);

  // Подписка на изменения данных
  useEffect(() => {
    const unsubscribe = subscribeToChanges(() => {
      loadClientData();
    });
    return unsubscribe;
  }, [loadClientData]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const updatedClient = {
      fullName: profile.fullName,
      phone: profile.phone,
      email: profile.email,
      role: profile.status === "Профессионал" ? "professional" : "amateur",
      discountCard: profile.discountCard,
    };
    
    try {
      await clients.update(currentUser.id, updatedClient);
      
      setEditing(false);
      setSaveMessage("Данные успешно сохранены!");
      setTimeout(() => setSaveMessage(""), 3000);
      
      if (onProfileUpdate) {
        onProfileUpdate();
      }
      
      // Обновляем localStorage для синхронизации
      const updatedUser = { ...currentUser, ...updatedClient };
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      
    } catch (err) {
      console.error("Ошибка сохранения данных:", err);
      setSaveMessage("Ошибка сохранения данных!");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  const handleEdit = () => {
    if (editing) {
      handleSave();
    } else {
      setEditing(true);
    }
  };

  const toggleDiscountCard = () => {
    setProfile({ ...profile, discountCard: !profile.discountCard });
  };

  if (isLoading) {
    return <div style={styles.loading}>Загрузка данных...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Личная информация</h2>
        <button style={styles.editButton} onClick={handleEdit}>
          {editing ? "Сохранить" : "Редактировать"}
        </button>
      </div>

      {saveMessage && (
        <div style={{ ...styles.saveMessage, background: saveMessage.includes("Ошибка") ? "#ef4444" : "#10b981" }}>
          {saveMessage}
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.field}>
          <label>ФИО</label>
          <input 
            name="fullName" 
            value={profile.fullName} 
            onChange={handleChange} 
            disabled={!editing} 
            style={editing ? styles.inputEdit : styles.inputView} 
          />
        </div>

        <div style={styles.field}>
          <label>Телефон</label>
          <input 
            name="phone" 
            value={profile.phone} 
            onChange={handleChange} 
            disabled={!editing} 
            style={editing ? styles.inputEdit : styles.inputView} 
          />
        </div>

        <div style={styles.field}>
          <label>Email</label>
          <input 
            name="email" 
            value={profile.email} 
            onChange={handleChange} 
            disabled={!editing} 
            style={editing ? styles.inputEdit : styles.inputView} 
          />
        </div>

        <div style={styles.field}>
          <label>Статус клиента</label>
          {editing ? (
            <select 
              name="status" 
              value={profile.status} 
              onChange={handleChange} 
              style={styles.inputEdit}
            >
              <option value="Любитель">Любитель</option>
              <option value="Профессионал">Профессионал</option>
            </select>
          ) : (
            <input value={profile.status} disabled style={styles.inputView} />
          )}
        </div>

        <div style={styles.field}>
          <label>Дата регистрации</label>
          <input value={profile.registrationDate} disabled style={styles.inputView} />
        </div>

        <div style={styles.field}>
          <label>Дисконтная карта</label>
          {editing ? (
            <button 
              onClick={toggleDiscountCard} 
              style={profile.discountCard ? styles.activeDiscountBtn : styles.discountBtn}
            >
              {profile.discountCard ? "Активна" : "➕ Активировать"}
            </button>
          ) : (
            <input value={profile.discountCard ? "Активна" : "Нет"} disabled style={styles.inputView} />
          )}
        </div>
      </div>

      <div style={styles.discounts}>
        <h3>Доступные скидки</h3>
        {profile.availableDiscounts.length > 0 ? (
          profile.availableDiscounts.map((discount, index) => (
            <div key={index} style={styles.discountItem}>{discount}</div>
          ))
        ) : (
          <div style={styles.discountItem}>Нет доступных скидок</div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editButton: {
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
    transition: "background 0.2s ease",
  },
  saveMessage: {
    color: "#fff",
    padding: "12px",
    borderRadius: "10px",
    textAlign: "center",
    animation: "fadeIn 0.3s ease",
  },
  loading: {
    textAlign: "center",
    padding: "40px",
    fontSize: "16px",
    color: "#64748b",
  },
  card: {
    background: "#fff",
    padding: "24px",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    border: "1px solid #e2e8f0",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  inputEdit: {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid #3b82f6",
    fontSize: "14px",
    backgroundColor: "#fff",
  },
  inputView: {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    fontSize: "14px",
    color: "#334155",
  },
  discountBtn: {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid #3b82f6",
    background: "#fff",
    color: "#3b82f6",
    cursor: "pointer",
    fontWeight: "500",
  },
  activeDiscountBtn: {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "none",
    background: "#10b981",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "500",
  },
  discounts: {
    background: "#fff",
    padding: "24px",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
  },
  discountItem: {
    background: "#f8fafc",
    padding: "12px 16px",
    borderRadius: "10px",
    marginBottom: "8px",
    color: "#334155",
    fontSize: "14px",
  },
};