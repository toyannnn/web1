import React, { useState, useEffect, useMemo } from "react";
import { 
  getClients, 
  getClientOrders,
  getOrders,
  updateOrderStatus,
  subscribeToChanges,
  getBranches, addBranch, updateBranch, deleteBranch,
  getEmployees, addEmployee, updateEmployee, deleteEmployee,
  getUsers, addUser, updateUser, deleteUser
} from "./shared/storage";

function Badge({ text, color }) {
  return (
    <span
      style={{
        background: color,
        color: "#fff",
        padding: "5px 12px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "bold",
        display: "inline-block",
      }}
    >
      {text}
    </span>
  );
}

function Sidebar({ selected, onSelect }) {
  const menu = ["Точки сети", "Сотрудники", "Пользователи", "Клиенты", "Журнал заказов"];

  return (
    <div style={styles.sidebar}>
      <h2 style={{ color: "#fff", marginBottom: "20px", fontSize: "20px" }}>PHOTO CRM</h2>
      {menu.map((item) => (
        <button
          key={item}
          onClick={() => onSelect(item)}
          style={{
            ...styles.menuButton,
            background: selected === item ? "#1976d2" : "transparent",
            borderLeft: selected === item ? "4px solid #1976d2" : "4px solid transparent",
          }}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function ClientsManagement() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [clientOrders, setClientOrders] = useState([]);

  useEffect(() => {
    loadClients();
    const handleStorageChange = () => {
      loadClients();
      setRefreshTrigger(prev => prev + 1);
    };
    subscribeToChanges(handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (selectedClient) {
      const orders = getClientOrders(selectedClient.id);
      setClientOrders(orders);
    }
  }, [selectedClient, refreshTrigger]);

  const loadClients = () => {
    setClients(getClients());
  };

  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;
    const term = searchTerm.toLowerCase();
    return clients.filter(c => 
      c.fullName?.toLowerCase().includes(term) || 
      c.login?.toLowerCase().includes(term) ||
      c.phone?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term)
    );
  }, [clients, searchTerm]);

  const getStatusColor = (status) => {
    switch(status) {
      case "Принят": return "#1976d2";
      case "В работе": return "#ff9800";
      case "Готов к выдаче": return "#9c27b0";
      case "Выдан": return "#4caf50";
      default: return "#757575";
    }
  };

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div>
      <div style={styles.pageHeader}>
        <h2>Клиенты сети фотоцентров</h2>
        <div style={styles.headerControls}>
          <input
            type="text"
            placeholder="Поиск по имени, логину, телефону..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ ...styles.searchInput, width: "300px" }}
          />
        </div>
      </div>

      <div style={styles.clientsContainer}>
        <div style={styles.clientList}>
          <h3 style={{ marginBottom: "15px", color: "#333" }}>Все клиенты ({filteredClients.length})</h3>
          {filteredClients.length === 0 ? (
            <div style={styles.emptyList}>Нет зарегистрированных клиентов</div>
          ) : (
            filteredClients.map((client) => (
              <div
                key={client.id}
                style={{
                  ...styles.clientCard,
                  background: selectedClient?.id === client.id ? "#e3f2fd" : "#fff",
                  borderLeft: selectedClient?.id === client.id ? "4px solid #1976d2" : "4px solid transparent",
                }}
                onClick={() => setSelectedClient(client)}
              >
                <div style={{ fontWeight: "bold", marginBottom: "5px" }}>{client.fullName}</div>
                <div style={{ fontSize: "12px", color: "#666" }}>Логин: {client.login}</div>
                <div style={{ fontSize: "12px", color: "#666" }}>{client.phone || "Нет телефона"}</div>
                <div style={{ fontSize: "12px", color: "#1976d2", marginTop: "5px" }}>
                  📅 Регистрация: {client.registrationDate}
                </div>
                <div style={{ marginTop: "5px" }}>
                  <Badge text={client.role === "professional" ? "Профессионал" : "Любитель"} color={client.role === "professional" ? "#ff9800" : "#4caf50"} />
                </div>
              </div>
            ))
          )}
        </div>

        <div style={styles.clientDetails}>
          {selectedClient ? (
            <>
              <div style={styles.clientHeader}>
                <div>
                  <h2>{selectedClient.fullName}</h2>
                  <p style={{ color: "#666" }}>
                    Логин: {selectedClient.login} | Телефон: {selectedClient.phone || "-"} | Email: {selectedClient.email || "-"}
                  </p>
                  <p style={{ color: "#1976d2", fontSize: "14px" }}>
                    Клиент с {selectedClient.registrationDate} | Статус: {selectedClient.role === "professional" ? "Профессионал" : "Любитель"}
                  </p>
                  <p style={{ color: "#4caf50", fontSize: "14px" }}>
                    Всего заказов: {clientOrders.length} | Общая сумма: {clientOrders.reduce((sum, o) => sum + o.total, 0)} ₽
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Badge text="Клиент" color="#4caf50" />
                  <Badge text={selectedClient.discountCard ? "Дисконтная карта" : "Нет дисконта"} color={selectedClient.discountCard ? "#ff9800" : "#757575"} />
                </div>
              </div>

              <h3 style={{ marginTop: "25px", marginBottom: "15px" }}>История заказов клиента</h3>
              
              {clientOrders.length === 0 ? (
                <div style={styles.emptyBlock}>
                  <div style={{ fontSize: "48px", marginBottom: "10px" }}></div>
                  <div>У клиента пока нет заказов</div>
                  <div style={{ fontSize: "14px", marginTop: "10px", color: "#666" }}>
                    Заказы будут появляться здесь после оформления через панель клиента
                  </div>
                </div>
              ) : (
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeader}>
                        <th style={styles.th}>№ заказа</th>
                        <th style={styles.th}>Дата</th>
                        <th style={styles.th}>Услуга/Товар</th>
                        <th style={styles.th}>Тип</th>
                        <th style={styles.th}>Статус</th>
                        <th style={styles.th}>Сумма</th>
                        <th style={styles.th}>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientOrders.map((order) => (
                        <tr key={order.id} style={styles.tableRow}>
                          <td style={styles.td}>#{order.id}</td>
                          <td style={styles.td}>{order.date}</td>
                          <td style={styles.td}>{order.service || order.product}</td>
                          <td style={styles.td}>
                            <Badge text={order.type === "service" ? "Услуга" : "Товар"} color={order.type === "service" ? "#1976d2" : "#2e7d32"} />
                          </td>
                          <td style={styles.td}>
                            <Badge text={order.status} color={getStatusColor(order.status)} />
                          </td>
                          <td style={styles.td}><b>{order.total} ₽</b></td>
                          <td style={styles.td}>
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              style={styles.statusSelect}
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
              )}
            </>
          ) : (
            <div style={styles.emptyBlock}>
              <div style={{ fontSize: "48px", marginBottom: "10px" }}></div>
              <div>Выберите клиента для просмотра его заказов</div>
              <div style={{ fontSize: "14px", marginTop: "10px", color: "#666" }}>
                Все зарегистрированные клиенты отображаются в списке слева
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


function UsersManagement({ onUsersUpdate }) {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("Все");
  const [showAddForm, setShowAddForm] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    login: "",
    password: "",
    fullName: "",
    role: "employee",
    phone: "",
    email: "",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = getUsers();
    const filteredForManagement = allUsers.filter(u => u.role === "admin" || u.role === "employee");
    setUsers(filteredForManagement);
    if (onUsersUpdate) onUsersUpdate();
  };

  const showMessage = (msg, isError = false) => {
    setSaveMessage({ text: msg, isError });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const filteredUsers = useMemo(() => {
    if (roleFilter === "Все") return users;
    return users.filter(u => u.role === roleFilter);
  }, [roleFilter, users]);

  const handleAddUser = () => {
    if (!newUser.login || !newUser.password || !newUser.fullName) {
      showMessage("Заполните логин, пароль и ФИО", true);
      return;
    }
    try {
      addUser(newUser);
      loadUsers();
      setShowAddForm(false);
      setNewUser({ login: "", password: "", fullName: "", role: "employee", phone: "", email: "" });
      showMessage(`Пользователь "${newUser.fullName}" успешно добавлен`);
    } catch (error) {
      showMessage(error.message, true);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({ ...user });
  };

  const handleSaveEdit = () => {
    updateUser(editingUser.id, editingUser);
    loadUsers();
    setEditingUser(null);
    showMessage("Данные пользователя сохранены");
  };

  const handleDeleteUser = (userId, userName) => {
    if (window.confirm(`Вы уверены, что хотите удалить пользователя "${userName}"?`)) {
      deleteUser(userId);
      loadUsers();
      showMessage(`Пользователь "${userName}" удален`);
    }
  };

  const handleResetPassword = (userId) => {
    const newPassword = prompt("Введите новый пароль для пользователя:");
    if (newPassword && newPassword.length >= 4) {
      updateUser(userId, { password: newPassword });
      loadUsers();
      showMessage("Пароль успешно изменен");
    } else if (newPassword) {
      showMessage("Пароль должен содержать минимум 4 символа", true);
    }
  };

  const getRoleLabel = (role) => {
    return role === "admin" ? "Администратор" : "Сотрудник";
  };

  const getRoleColor = (role) => {
    return role === "admin" ? "#9c27b0" : "#1976d2";
  };

  return (
    <div>
      {saveMessage && (
        <div style={{ ...styles.saveMessage, background: saveMessage.isError ? "#f44336" : "#4caf50" }}>
          {saveMessage.text}
        </div>
      )}
      
      <div style={styles.pageHeader}>
        <h2>Управление пользователями (Сотрудники и Администраторы)</h2>
        <div style={styles.headerControls}>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={styles.select}>
            <option>Все</option>
            <option value="admin">Администраторы</option>
            <option value="employee">Сотрудники</option>
          </select>
          <button style={styles.addButton} onClick={() => setShowAddForm(true)}>
            + Добавить пользователя
          </button>
        </div>
      </div>

      <div style={styles.infoCard}>
        <p>Здесь вы можете создавать учетные записи для <strong>сотрудников</strong> и <strong>администраторов</strong>.</p>
      </div>

      {showAddForm && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={{ marginBottom: "15px" }}>Добавление нового пользователя</h3>
            
            <div style={styles.formGroup}>
              <label>Роль *</label>
              <select 
                value={newUser.role} 
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} 
                style={styles.modalInput}
              >
                <option value="employee">Сотрудник</option>
                <option value="admin">Администратор</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label>ФИО *</label>
              <input 
                placeholder="Введите полное имя" 
                value={newUser.fullName} 
                onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })} 
                style={styles.modalInput}
              />
            </div>

            <div style={styles.formGroup}>
              <label>Логин *</label>
              <input 
                placeholder="Введите логин" 
                value={newUser.login} 
                onChange={(e) => setNewUser({ ...newUser, login: e.target.value })} 
                style={styles.modalInput}
              />
            </div>

            <div style={styles.formGroup}>
              <label>Пароль *</label>
              <input 
                type="password"
                placeholder="Введите пароль (мин. 4 символа)" 
                value={newUser.password} 
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} 
                style={styles.modalInput}
              />
            </div>

            <div style={styles.formGroup}>
              <label>Телефон</label>
              <input 
                placeholder="+7 (XXX) XXX-XX-XX" 
                value={newUser.phone} 
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} 
                style={styles.modalInput}
              />
            </div>

            <div style={styles.formGroup}>
              <label>Email</label>
              <input 
                type="email"
                placeholder="email@example.com" 
                value={newUser.email} 
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} 
                style={styles.modalInput}
              />
            </div>

            <div style={styles.modalButtons}>
              <button style={styles.saveButton} onClick={handleAddUser}>➕ Добавить</button>
              <button style={styles.cancelButton} onClick={() => setShowAddForm(false)}>✖ Отмена</button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>ФИО</th>
              <th style={styles.th}>Логин</th>
              <th style={styles.th}>Роль</th>
              <th style={styles.th}>Телефон</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Дата создания</th>
              <th style={styles.th}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                  📭 Нет пользователей для отображения
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} style={styles.tableRow}>
                  <td style={styles.td}>
                    {editingUser?.id === user.id ? (
                      <input 
                        value={editingUser.fullName} 
                        onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })} 
                        style={styles.editInput} 
                      />
                    ) : user.fullName}
                  </td>
                  <td style={styles.td}>
                    {editingUser?.id === user.id ? (
                      <input 
                        value={editingUser.login} 
                        onChange={(e) => setEditingUser({ ...editingUser, login: e.target.value })} 
                        style={styles.editInput} 
                      />
                    ) : user.login}
                  </td>
                  <td style={styles.td}>
                    {editingUser?.id === user.id ? (
                      <select 
                        value={editingUser.role} 
                        onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })} 
                        style={styles.editSelect}
                      >
                        <option value="employee">Сотрудник</option>
                        <option value="admin">Администратор</option>
                      </select>
                    ) : (
                      <Badge text={getRoleLabel(user.role)} color={getRoleColor(user.role)} />
                    )}
                  </td>
                  <td style={styles.td}>
                    {editingUser?.id === user.id ? (
                      <input 
                        value={editingUser.phone || ""} 
                        onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })} 
                        style={styles.editInput} 
                      />
                    ) : user.phone || "-"}
                  </td>
                  <td style={styles.td}>
                    {editingUser?.id === user.id ? (
                      <input 
                        value={editingUser.email || ""} 
                        onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} 
                        style={styles.editInput} 
                      />
                    ) : user.email || "-"}
                  </td>
                  <td style={styles.td}>{user.createdAt || "-"}</td>
                  <td style={styles.td}>
                    {editingUser?.id === user.id ? (
                      <div style={styles.actionButtons}>
                        <button style={styles.saveButton} onClick={handleSaveEdit}>💾</button>
                        <button style={styles.cancelButton} onClick={() => setEditingUser(null)}>✖</button>
                      </div>
                    ) : (
                      <div style={styles.actionButtons}>
                        <button style={styles.smallButton} onClick={() => handleEditUser(user)} title="Редактировать">
                          ✏️
                        </button>
                        <button style={styles.smallButton} onClick={() => handleResetPassword(user.id)} title="Сбросить пароль">
                          🔑
                        </button>
                        {user.login !== "admin" && (
                          <button style={styles.deleteButton} onClick={() => handleDeleteUser(user.id, user.fullName)} title="Удалить">
                            🗑️
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BranchesPage() {
  const [branches, setBranches] = useState([]);
  const [typeFilter, setTypeFilter] = useState("Все");
  const [editingBranch, setEditingBranch] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [newBranch, setNewBranch] = useState({
    name: "",
    type: "Филиал",
    address: "",
    phone: "",
    email: "",
    workingHours: "",
  });

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = () => {
    setBranches(getBranches());
  };

  const showMessage = (msg, isError = false) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const filtered = useMemo(() => {
    if (typeFilter === "Все") return branches;
    return branches.filter((b) => b.type === typeFilter);
  }, [typeFilter, branches]);

  const handleEdit = (branch) => {
    setEditingBranch({ ...branch });
  };

  const handleSaveEdit = () => {
    updateBranch(editingBranch.id, editingBranch);
    loadBranches();
    setEditingBranch(null);
    showMessage("Данные точки сохранены");
  };

  const handleArchive = (branchId) => {
    const branch = branches.find(b => b.id === branchId);
    const newStatus = branch.status === "Активна" ? "Архив" : "Активна";
    updateBranch(branchId, { status: newStatus });
    loadBranches();
    showMessage(newStatus === "Архив" ? "Точка отправлена в архив" : "Точка восстановлена из архива");
  };

  const handleDelete = (branchId) => {
    if (window.confirm("Вы уверены, что хотите удалить эту точку? Это действие нельзя отменить.")) {
      deleteBranch(branchId);
      loadBranches();
      showMessage("Точка удалена");
    }
  };

  const handleAddBranch = () => {
    if (!newBranch.name || !newBranch.address) {
      showMessage("Заполните название и адрес", true);
      return;
    }
    addBranch(newBranch);
    loadBranches();
    setShowAddForm(false);
    setNewBranch({ name: "", type: "Филиал", address: "", phone: "", email: "", workingHours: "" });
    showMessage("Новая точка добавлена");
  };

  return (
    <div>
      {saveMessage && <div style={styles.saveMessage}>{saveMessage}</div>}
      
      <div style={styles.pageHeader}>
        <h2>Управление точками сети</h2>
        <div style={styles.headerControls}>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={styles.select}>
            <option>Все</option>
            <option>Филиал</option>
            <option>Киоск</option>
            <option>Магазин</option>
          </select>
          <button style={styles.addButton} onClick={() => setShowAddForm(true)}>
            + Добавить точку
          </button>
        </div>
      </div>

      {showAddForm && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={{ marginBottom: "15px" }}>Добавление новой точки</h3>
            <input 
              placeholder="Название*" 
              value={newBranch.name} 
              onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })} 
              style={styles.modalInput}
            />
            <select 
              value={newBranch.type} 
              onChange={(e) => setNewBranch({ ...newBranch, type: e.target.value })} 
              style={styles.modalInput}
            >
              <option>Филиал</option>
              <option>Киоск</option>
              <option>Магазин</option>
            </select>
            <input 
              placeholder="Адрес*" 
              value={newBranch.address} 
              onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })} 
              style={styles.modalInput}
            />
            <input 
              placeholder="Телефон" 
              value={newBranch.phone} 
              onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })} 
              style={styles.modalInput}
            />
            <input 
              placeholder="Email" 
              value={newBranch.email} 
              onChange={(e) => setNewBranch({ ...newBranch, email: e.target.value })} 
              style={styles.modalInput}
            />
            <input 
              placeholder="Часы работы (например: 09:00 - 21:00)" 
              value={newBranch.workingHours} 
              onChange={(e) => setNewBranch({ ...newBranch, workingHours: e.target.value })} 
              style={styles.modalInput}
            />
            <div style={styles.modalButtons}>
              <button style={styles.saveButton} onClick={handleAddBranch}>Сохранить</button>
              <button style={styles.cancelButton} onClick={() => setShowAddForm(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Название</th>
              <th style={styles.th}>Тип</th>
              <th style={styles.th}>Адрес</th>
              <th style={styles.th}>Телефон</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Режим работы</th>
              <th style={styles.th}>Филиал-обработчик</th>
              <th style={styles.th}>Статус</th>
              <th style={styles.th}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((branch) => (
              <tr key={branch.id} style={styles.tableRow}>
                <td style={styles.td}>
                  {editingBranch?.id === branch.id ? (
                    <input 
                      value={editingBranch.name} 
                      onChange={(e) => setEditingBranch({ ...editingBranch, name: e.target.value })} 
                      style={styles.editInput} 
                    />
                  ) : branch.name}
                </td>
                <td style={styles.td}>
                  {editingBranch?.id === branch.id ? (
                    <select 
                      value={editingBranch.type} 
                      onChange={(e) => setEditingBranch({ ...editingBranch, type: e.target.value })} 
                      style={styles.editSelect}
                    >
                      <option>Филиал</option>
                      <option>Киоск</option>
                      <option>Магазин</option>
                    </select>
                  ) : branch.type}
                </td>
                <td style={styles.td}>
                  {editingBranch?.id === branch.id ? (
                    <input 
                      value={editingBranch.address} 
                      onChange={(e) => setEditingBranch({ ...editingBranch, address: e.target.value })} 
                      style={styles.editInput} 
                    />
                  ) : branch.address}
                </td>
                <td style={styles.td}>
                  {editingBranch?.id === branch.id ? (
                    <input 
                      value={editingBranch.phone || ""} 
                      onChange={(e) => setEditingBranch({ ...editingBranch, phone: e.target.value })} 
                      style={styles.editInput} 
                    />
                  ) : branch.phone || "-"}
                </td>
                <td style={styles.td}>
                  {editingBranch?.id === branch.id ? (
                    <input 
                      value={editingBranch.email || ""} 
                      onChange={(e) => setEditingBranch({ ...editingBranch, email: e.target.value })} 
                      style={styles.editInput} 
                    />
                  ) : branch.email || "-"}
                </td>
                <td style={styles.td}>
                  {editingBranch?.id === branch.id ? (
                    <input 
                      value={editingBranch.workingHours || ""} 
                      onChange={(e) => setEditingBranch({ ...editingBranch, workingHours: e.target.value })} 
                      style={styles.editInput} 
                    />
                  ) : branch.workingHours || "-"}
                </td>
                <td style={styles.td}>{branch.processor || "-"}</td>
                <td style={styles.td}>
                  <Badge text={branch.status} color={branch.status === "Активна" ? "#4caf50" : "#757575"} />
                </td>
                <td style={styles.td}>
                  {editingBranch?.id === branch.id ? (
                    <div style={styles.actionButtons}>
                      <button style={styles.saveButton} onClick={handleSaveEdit}>💾</button>
                      <button style={styles.cancelButton} onClick={() => setEditingBranch(null)}>✖</button>
                    </div>
                  ) : (
                    <div style={styles.actionButtons}>
                      <button 
                        style={styles.smallButton} 
                        onClick={() => handleEdit(branch)} 
                        disabled={branch.status === "Архив"}
                        title="Редактировать"
                      >
                        ✏️
                      </button>
                      <button 
                        style={styles.archiveButton} 
                        onClick={() => handleArchive(branch.id)}
                        title={branch.status === "Активна" ? "Архивировать" : "Восстановить"}
                      >
                        {branch.status === "Активна" ? "📦" : "🔄"}
                      </button>
                      <button 
                        style={styles.deleteButton} 
                        onClick={() => handleDelete(branch.id)}
                        title="Удалить"
                      >
                        🗑️
                      </button>
                    </div>
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

function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [roleFilter, setRoleFilter] = useState("Все");
  const [showAddForm, setShowAddForm] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    login: "",
    role: "Сотрудник точки",
    phone: "",
    email: "",
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = () => {
    setEmployees(getEmployees());
  };

  const showMessage = (msg) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const filtered = useMemo(() => {
    if (roleFilter === "Все") return employees;
    return employees.filter((e) => e.role === roleFilter);
  }, [roleFilter, employees]);

  const handleChangeRole = (id, newRole) => {
    updateEmployee(id, { role: newRole });
    loadEmployees();
    showMessage("Роль сотрудника изменена");
  };

  const handleFire = (id) => {
    if (window.confirm("Вы уверены, что хотите уволить сотрудника?")) {
      updateEmployee(id, { status: "Уволен" });
      loadEmployees();
      showMessage("Сотрудник уволен");
    }
  };

  const handleBlock = (id) => {
    const employee = employees.find(e => e.id === id);
    const newStatus = employee.status === "Активен" ? "Заблокирован" : "Активен";
    updateEmployee(id, { status: newStatus });
    loadEmployees();
    showMessage(newStatus === "Активен" ? "Сотрудник разблокирован" : "Сотрудник заблокирован");
  };

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.login) {
      showMessage("Заполните ФИО и логин");
      return;
    }
    addEmployee(newEmployee);
    loadEmployees();
    setShowAddForm(false);
    setNewEmployee({ name: "", login: "", role: "Сотрудник точки", phone: "", email: "" });
    showMessage("Новый сотрудник добавлен");
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Активен": return "#4caf50";
      case "Заблокирован": return "#ff9800";
      case "Уволен": return "#f44336";
      default: return "#757575";
    }
  };

  return (
    <div>
      {saveMessage && <div style={styles.saveMessage}>{saveMessage}</div>}
      
      <div style={styles.pageHeader}>
        <h2>Управление сотрудниками</h2>
        <div style={styles.headerControls}>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={styles.select}>
            <option>Все</option>
            <option>Администратор</option>
            <option>Управляющий</option>
            <option>Сотрудник точки</option>
          </select>
          <button style={styles.addButton} onClick={() => setShowAddForm(true)}>
            + Добавить сотрудника
          </button>
        </div>
      </div>

      {showAddForm && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={{ marginBottom: "15px" }}>Добавление нового сотрудника</h3>
            <input 
              placeholder="ФИО*" 
              value={newEmployee.name} 
              onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })} 
              style={styles.modalInput}
            />
            <input 
              placeholder="Логин*" 
              value={newEmployee.login} 
              onChange={(e) => setNewEmployee({ ...newEmployee, login: e.target.value })} 
              style={styles.modalInput}
            />
            <input 
              placeholder="Телефон" 
              value={newEmployee.phone} 
              onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })} 
              style={styles.modalInput}
            />
            <input 
              placeholder="Email" 
              value={newEmployee.email} 
              onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} 
              style={styles.modalInput}
            />
            <select 
              value={newEmployee.role} 
              onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })} 
              style={styles.modalInput}
            >
              <option>Администратор</option>
              <option>Управляющий</option>
              <option>Сотрудник точки</option>
            </select>
            <div style={styles.modalButtons}>
              <button style={styles.saveButton} onClick={handleAddEmployee}>Добавить</button>
              <button style={styles.cancelButton} onClick={() => setShowAddForm(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>ФИО</th>
              <th style={styles.th}>Логин</th>
              <th style={styles.th}>Роль</th>
              <th style={styles.th}>Телефон</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Дата найма</th>
              <th style={styles.th}>Статус</th>
              <th style={styles.th}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((employee) => (
              <tr key={employee.id} style={styles.tableRow}>
                <td style={styles.td}>{employee.name}</td>
                <td style={styles.td}>{employee.login}</td>
                <td style={styles.td}>
                  <select 
                    value={employee.role} 
                    onChange={(e) => handleChangeRole(employee.id, e.target.value)} 
                    style={styles.roleSelect}
                    disabled={employee.status === "Уволен"}
                  >
                    <option>Администратор</option>
                    <option>Управляющий</option>
                    <option>Сотрудник точки</option>
                  </select>
                </td>
                <td style={styles.td}>{employee.phone || "-"}</td>
                <td style={styles.td}>{employee.email || "-"}</td>
                <td style={styles.td}>{employee.hireDate || "-"}</td>
                <td style={styles.td}>
                  <Badge text={employee.status} color={getStatusColor(employee.status)} />
                </td>
                <td style={styles.td}>
                  <div style={styles.actionButtons}>
                    {employee.status !== "Уволен" && (
                      <>
                        <button 
                          style={styles.smallButton} 
                          onClick={() => handleBlock(employee.id)}
                          title={employee.status === "Активен" ? "Заблокировать" : "Разблокировать"}
                        >
                          {employee.status === "Активен" ? "🔒" : "🔓"}
                        </button>
                        <button 
                          style={styles.deleteButton} 
                          onClick={() => handleFire(employee.id)}
                          title="Уволить"
                        >
                          ❌
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ClientsPage() {
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientsData, setClientsData] = useState([]);
  const orders = getOrders();

  useEffect(() => {
    const clientMap = new Map();
    orders.forEach(order => {
      const clientName = order.client || "Клиент";
      if (!clientMap.has(clientName)) {
        clientMap.set(clientName, { name: clientName, orders: [], total: 0 });
      }
      clientMap.get(clientName).orders.push(order);
      clientMap.get(clientName).total += order.total;
    });
    setClientsData(Array.from(clientMap.values()));
  }, [orders]);

  const getStatusColor = (status) => {
    switch(status) {
      case "Принят": return "#1976d2";
      case "В работе": return "#ff9800";
      case "Готов к выдаче": return "#9c27b0";
      case "Выдан": return "#4caf50";
      default: return "#757575";
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: "20px" }}>Клиенты</h2>
      <div style={styles.clientsContainer}>
        <div style={styles.clientList}>
          {clientsData.length === 0 ? (
            <div style={styles.emptyList}>Нет данных о клиентах</div>
          ) : (
            clientsData.map((client, idx) => (
              <div 
                key={idx} 
                style={{...styles.clientCard, background: selectedClient?.name === client.name ? "#e3f2fd" : "#fff"}} 
                onClick={() => setSelectedClient(client)}
              >
                <h3 style={{ marginBottom: "5px" }}>{client.name}</h3>
                <p style={{ margin: "5px 0", color: "#666" }}>Заказов: {client.orders.length}</p>
                <p style={{ margin: "5px 0", color: "#1976d2", fontWeight: "bold" }}>Общая сумма {client.total} ₽</p>
              </div>
            ))
          )}
        </div>
        <div style={styles.clientDetails}>
          {selectedClient ? (
            <>
              <div style={styles.clientHeader}>
                <h2>{selectedClient.name}</h2>
                <Badge text={`${selectedClient.orders.length} заказов`} color="#1976d2" />
              </div>
              <div style={styles.clientStats}>
                <div style={styles.statCard}>
                  <div style={{ fontSize: "24px", fontWeight: "bold" }}>{selectedClient.orders.length}</div>
                  <div style={{ color: "#666" }}>Всего заказов</div>
                </div>
                <div style={styles.statCard}>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: "#1976d2" }}>{selectedClient.total} ₽</div>
                  <div style={{ color: "#666" }}>Общая сумма</div>
                </div>
              </div>
              <h3 style={{ marginTop: "20px", marginBottom: "15px" }}>История заказов</h3>
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeader}>
                      <th style={styles.th}>№ заказа</th>
                      <th style={styles.th}>Дата</th>
                      <th style={styles.th}>Услуга/Товар</th>
                      <th style={styles.th}>Тип</th>
                      <th style={styles.th}>Статус</th>
                      <th style={styles.th}>Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedClient.orders.map((order) => (
                      <tr key={order.id} style={styles.tableRow}>
                        <td style={styles.td}>{order.id}</td>
                        <td style={styles.td}>{order.date}</td>
                        <td style={styles.td}>{order.service || order.product}</td>
                        <td style={styles.td}>{order.type === "service" ? "Услуга" : "Товар"}</td>
                        <td style={styles.td}>
                          <Badge text={order.status} color={getStatusColor(order.status)} />
                        </td>
                        <td style={styles.td}><b>{order.total} ₽</b></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div style={styles.emptyBlock}>
              <div style={{ fontSize: "48px", marginBottom: "10px" }}>👥</div>
              <div>Выберите клиента для просмотра заказов</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Все");
  const [clientFilter, setClientFilter] = useState("");

  useEffect(() => {
    setOrders(getOrders());
    const handleStorageChange = () => setOrders(getOrders());
    subscribeToChanges(handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
    setOrders(getOrders());
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const statusMatch = statusFilter === "Все" || order.status === statusFilter;
      const clientMatch = (order.client || "").toLowerCase().includes(clientFilter.toLowerCase());
      return statusMatch && clientMatch;
    });
  }, [orders, statusFilter, clientFilter]);

  const getStatusColor = (status) => {
    switch(status) {
      case "Принят": return "#1976d2";
      case "В работе": return "#ff9800";
      case "Готов к выдаче": return "#9c27b0";
      case "Выдан": return "#4caf50";
      default: return "#757575";
    }
  };

  const getTotalSum = () => {
    return filteredOrders.reduce((sum, order) => sum + order.total, 0);
  };

  return (
    <div>
      <div style={styles.pageHeader}>
        <h2>Журнал заказов</h2>
        <div style={styles.headerControls}>
          <div style={styles.totalSumCard}>
            📊 Общая сумма: <b>{getTotalSum()} ₽</b>
          </div>
        </div>
      </div>

      <div style={styles.filtersBar}>
        <input 
          type="text" 
          placeholder="🔍 Поиск по клиенту..." 
          value={clientFilter} 
          onChange={(e) => setClientFilter(e.target.value)} 
          style={styles.searchInput}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.select}>
          <option>Все</option>
          <option>Принят</option>
          <option>В работе</option>
          <option>Готов к выдаче</option>
          <option>Выдан</option>
        </select>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>№ заказа</th>
              <th style={styles.th}>Дата</th>
              <th style={styles.th}>Клиент</th>
              <th style={styles.th}>Услуга/Товар</th>
              <th style={styles.th}>Тип</th>
              <th style={styles.th}>Статус</th>
              <th style={styles.th}>Сумма</th>
              <th style={styles.th}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                  📭 Нет заказов, соответствующих фильтрам
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} style={styles.tableRow}>
                  <td style={styles.td}>#{order.id}</td>
                  <td style={styles.td}>{order.date}</td>
                  <td style={styles.td}><b>{order.client || "Клиент"}</b></td>
                  <td style={styles.td}>{order.service || order.product}</td>
                  <td style={styles.td}>
                    <Badge 
                      text={order.type === "service" ? "Услуга" : "Товар"} 
                      color={order.type === "service" ? "#1976d2" : "#2e7d32"} 
                    />
                  </td>
                  <td style={styles.td}>
                    <Badge text={order.status} color={getStatusColor(order.status)} />
                  </td>
                  <td style={styles.td}><b style={{ color: "#1976d2" }}>{order.total} ₽</b></td>
                  <td style={styles.td}>
                    <select 
                      value={order.status} 
                      onChange={(e) => handleStatusChange(order.id, e.target.value)} 
                      style={styles.statusSelect}
                    >
                      <option>Принят</option>
                      <option>В работе</option>
                      <option>Готов к выдаче</option>
                      <option>Выдан</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminDashboard({ onLogout, currentUser }) {
  const [selectedPage, setSelectedPage] = useState("Точки сети");

  const renderPage = () => {
    switch (selectedPage) {
      case "Точки сети":
        return <BranchesPage />;
      case "Сотрудники":
        return <EmployeesPage />;
      case "Пользователи":
        return <UsersManagement />;
      case "Клиенты":
        return <ClientsManagement />;
      case "Журнал заказов":
        return <OrdersPage />;
      default:
        return <BranchesPage />;
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar selected={selectedPage} onSelect={setSelectedPage} />
      <div style={styles.content}>
        <header style={styles.header}>
          <div>
            <h1 style={{ fontSize: "24px", marginBottom: "5px" }}>Административная панель сети фотоцентров</h1>
            <p style={{ color: "#666", margin: 0 }}>Управление точками, сотрудниками, пользователями, клиентами и заказами</p>
          </div>
          <div style={styles.headerRight}>
            {currentUser && <span style={styles.userInfo}>{currentUser.fullName}</span>}
            <button style={styles.logoutButton} onClick={onLogout}>Выйти</button>
          </div>
        </header>
        {renderPage()}
      </div>
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
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    boxShadow: "2px 0 12px rgba(0,0,0,0.08)",
  },
  menuButton: {
    padding: "12px 16px",
    border: "none",
    borderRadius: "10px",
    color: "#e2e8f0",
    cursor: "pointer",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.3s ease",
    background: "transparent",
  },
  content: {
    flex: 1,
    padding: "24px",
    overflowX: "auto",
  },
  header: {
    background: "#ffffff",
    padding: "20px 24px",
    borderRadius: "16px",
    marginBottom: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  userInfo: {
    padding: "8px 16px",
    background: "#eef2ff",
    borderRadius: "20px",
    fontSize: "14px",
    color: "#1e40af",
    fontWeight: "500",
  },
  logoutButton: {
    padding: "8px 20px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
    transition: "background 0.2s ease",
  },
  
  saveMessage: {
    background: "#10b981",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: "10px",
    marginBottom: "16px",
    textAlign: "center",
    animation: "fadeIn 0.3s ease",
  },
  
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "12px",
  },
  headerControls: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  
  tableContainer: {
    background: "#fff",
    borderRadius: "16px",
    overflow: "auto",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "800px",
  },
  tableHeader: {
    background: "#f8fafc",
    borderBottom: "2px solid #e2e8f0",
  },
  th: {
    padding: "14px 12px",
    textAlign: "left",
    fontWeight: "600",
    color: "#1e293b",
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #e2e8f0",
    fontSize: "14px",
    color: "#334155",
  },
  tableRow: {
    transition: "background 0.2s ease",
  },
  
  select: {
    padding: "8px 12px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    cursor: "pointer",
    fontSize: "14px",
    color: "#334155",
  },
  searchInput: {
    padding: "10px 14px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    width: "260px",
    fontSize: "14px",
    backgroundColor: "#fff",
    transition: "all 0.2s ease",
  },
  filtersBar: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  statusSelect: {
    padding: "6px 10px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    cursor: "pointer",
    fontSize: "13px",
    color: "#334155",
  },
  roleSelect: {
    padding: "6px 10px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    cursor: "pointer",
    fontSize: "13px",
    color: "#334155",
  },
  editInput: {
    padding: "6px 8px",
    borderRadius: "6px",
    border: "1px solid #3b82f6",
    width: "100%",
    fontSize: "13px",
    backgroundColor: "#fff",
  },
  editSelect: {
    padding: "6px 8px",
    borderRadius: "6px",
    border: "1px solid #3b82f6",
    background: "#fff",
    fontSize: "13px",
    color: "#334155",
  },
  
  actionButtons: {
    display: "flex",
    gap: "6px",
  },
  smallButton: {
    padding: "6px 10px",
    background: "#eff6ff",
    color: "#3b82f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s ease",
  },
  archiveButton: {
    padding: "6px 10px",
    background: "#fef3c7",
    color: "#d97706",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s ease",
  },
  deleteButton: {
    padding: "6px 10px",
    background: "#fee2e2",
    color: "#dc2626",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s ease",
  },
  addButton: {
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.2s ease",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  saveButton: {
    background: "#10b981",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
  cancelButton: {
    background: "#94a3b8",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
  
  totalSumCard: {
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "500",
  },
  
  clientsContainer: {
    display: "flex",
    gap: "24px",
    flexWrap: "wrap",
  },
  clientList: {
    width: "320px",
    maxHeight: "600px",
    overflowY: "auto",
    borderRadius: "16px",
  },
  clientCard: {
    padding: "16px",
    borderRadius: "12px",
    marginBottom: "12px",
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    transition: "all 0.3s ease",
    border: "1px solid #e2e8f0",
  },
  clientDetails: {
    flex: 1,
    background: "#fff",
    padding: "24px",
    borderRadius: "16px",
    minWidth: "500px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  clientHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    paddingBottom: "16px",
    borderBottom: "2px solid #e2e8f0",
  },
  clientStats: {
    display: "flex",
    gap: "16px",
    marginBottom: "20px",
  },
  statCard: {
    background: "#f8fafc",
    padding: "16px",
    borderRadius: "12px",
    flex: 1,
    textAlign: "center",
    border: "1px solid #e2e8f0",
  },
  emptyBlock: {
    height: "400px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#94a3b8",
    fontSize: "16px",
  },
  emptyList: {
    textAlign: "center",
    padding: "40px",
    color: "#94a3b8",
    background: "#fff",
    borderRadius: "16px",
  },
  
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    animation: "fadeIn 0.3s ease",
  },
  modalContent: {
    background: "#fff",
    padding: "28px",
    borderRadius: "20px",
    width: "500px",
    maxWidth: "90%",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
  },
  modalInput: {
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    transition: "border 0.2s ease",
  },
  modalButtons: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
    marginTop: "12px",
  },
  infoCard: {
    background: "#eff6ff",
    padding: "16px 20px",
    borderRadius: "12px",
    marginBottom: "20px",
    borderLeft: "4px solid #3b82f6",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    marginBottom: "12px",
  },
};