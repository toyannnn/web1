import React, { useState } from "react";
import AdminDashboard from "./AdminDashboard";
import EmployeeDashboard from "./EmployeeDashboard";
import ClientDashboard from "./ClientDashboard";
import { addClient, addClientUser, authenticateUser } from "./shared/storage";

function LoginPage({ onLogin, openRegister }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const user = authenticateUser(login, password);
    
    if (!user) {
      setError("Неверный логин или пароль");
      return;
    }
    
    setError("");
    onLogin(user);
  };

  return (
    <div style={styles.authContainer}>
      <div style={styles.authCard}>
        <h1>PHOTO CENTER</h1>
        <h2>Авторизация</h2>
        
        <input
          type="text"
          placeholder="Логин"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          style={styles.input}
        />
        
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        
        {error && <p style={styles.error}>{error}</p>}
        
        <button style={styles.loginButton} onClick={handleSubmit}>
          Войти
        </button>
        
        <button style={styles.registerButton} onClick={openRegister}>
          Регистрация
        </button>
      </div>
    </div>
  );
}

function RegisterPage({ openLogin }) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    login: "",
    email: "",
    password: "",
    phone: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = () => {
    if (!form.fullName || !form.login || !form.password) {
      setError("Заполните обязательные поля (ФИО, Логин, Пароль)");
      return;
    }
    
    if (form.password !== form.confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }
    
    if (form.password.length < 4) {
      setError("Пароль должен содержать минимум 4 символа");
      return;
    }
    
    try {
      const newClient = addClient({
        fullName: form.fullName,
        login: form.login,
        password: form.password,
        phone: form.phone || "",
        email: form.email || "",
      });
      
      addClientUser({
        id: newClient.id,
        login: form.login,
        password: form.password,
        fullName: form.fullName,
        phone: form.phone || "",
        email: form.email || "",
        registrationDate: newClient.registrationDate,
      });
      
      setSuccess(true);
      setError("");
      
      setTimeout(() => {
        openLogin();
      }, 2000);
      
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.authContainer}>
      <div style={styles.authCard}>
        <h1>PHOTO CENTER</h1>
        <h2>Регистрация клиента</h2>
        
        <input
          type="text"
          name="fullName"
          placeholder="ФИО *"
          value={form.fullName}
          onChange={handleChange}
          style={styles.input}
        />
        
        <input
          type="text"
          name="login"
          placeholder="Логин *"
          value={form.login}
          onChange={handleChange}
          style={styles.input}
        />
        
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          style={styles.input}
        />
        
        <input
          type="tel"
          name="phone"
          placeholder="Телефон"
          value={form.phone}
          onChange={handleChange}
          style={styles.input}
        />
        
        <input
          type="password"
          name="password"
          placeholder="Пароль * (мин. 4 символа)"
          value={form.password}
          onChange={handleChange}
          style={styles.input}
        />
        
        <input
          type="password"
          name="confirmPassword"
          placeholder="Подтверждение пароля *"
          value={form.confirmPassword}
          onChange={handleChange}
          style={styles.input}
        />
        
        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>Регистрация успешна! Перенаправление на вход...</p>}
        
        <button style={styles.loginButton} onClick={handleRegister}>
          Зарегистрироваться
        </button>
        
        <button style={styles.registerButton} onClick={openLogin}>
          Назад
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState("login");

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPage("login");
  };

  if (currentUser && currentUser.role === "admin") {
    return <AdminDashboard currentUser={currentUser} onLogout={handleLogout} />;
  }

  if (currentUser && currentUser.role === "employee") {
    return <EmployeeDashboard currentUser={currentUser} onLogout={handleLogout} />;
  }

  if (currentUser && currentUser.role === "client") {
    return <ClientDashboard currentUser={currentUser} onLogout={handleLogout} />;
  }

  return (
    <>
      {page === "login" ? (
        <LoginPage onLogin={handleLogin} openRegister={() => setPage("register")} />
      ) : (
        <RegisterPage openLogin={() => setPage("login")} />
      )}
    </>
  );
}

const styles = {
  authContainer: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #0f2b3d 0%, #1a3a4f 100%)",
  },
  authCard: {
    width: "420px",
    background: "#fff",
    padding: "40px",
    borderRadius: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
  },
  input: {
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    transition: "border 0.2s ease",
  },
  loginButton: {
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    padding: "14px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "16px",
    transition: "background 0.2s ease",
  },
  registerButton: {
    background: "#fff",
    color: "#3b82f6",
    border: "2px solid #3b82f6",
    padding: "14px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "16px",
    transition: "all 0.2s ease",
  },
  error: {
    color: "#dc2626",
    textAlign: "center",
    fontWeight: "500",
    fontSize: "14px",
  },
  success: {
    color: "#10b981",
    textAlign: "center",
    fontWeight: "500",
    fontSize: "14px",
  },
};