// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import AdminDashboard from './AdminDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import ClientDashboard from './ClientDashboard';
import { auth, subscribeToChanges } from './shared/storage';

function LoginPage({ onLogin, openRegister }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await auth.login(login, password);
      onLogin(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.authContainer}>
      <div style={styles.authCard}>
        <h1>PHOTO CENTER</h1>
        <h2>Авторизация</h2>
        <input type="text" placeholder="Логин" value={login} onChange={(e) => setLogin(e.target.value)} style={styles.input} />
        <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} />
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.loginButton} onClick={handleSubmit} disabled={loading}>{loading ? 'Вход...' : 'Войти'}</button>
        <button style={styles.registerButton} onClick={openRegister}>Регистрация</button>
      </div>
    </div>
  );
}

function RegisterPage({ openLogin }) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ fullName: '', login: '', email: '', password: '', phone: '', confirmPassword: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async () => {
    if (!form.fullName || !form.login || !form.password) {
      setError('Заполните обязательные поля (ФИО, Логин, Пароль)');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    if (form.password.length < 4) {
      setError('Пароль должен содержать минимум 4 символа');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await auth.register({
        fullName: form.fullName,
        login: form.login,
        password: form.password,
        phone: form.phone || '',
        email: form.email || '',
      });
      setSuccess(true);
      setTimeout(() => openLogin(), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.authContainer}>
      <div style={styles.authCard}>
        <h1>PHOTO CENTER</h1>
        <h2>Регистрация клиента</h2>
        <input type="text" name="fullName" placeholder="ФИО *" value={form.fullName} onChange={handleChange} style={styles.input} />
        <input type="text" name="login" placeholder="Логин *" value={form.login} onChange={handleChange} style={styles.input} />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} style={styles.input} />
        <input type="tel" name="phone" placeholder="Телефон" value={form.phone} onChange={handleChange} style={styles.input} />
        <input type="password" name="password" placeholder="Пароль * (мин. 4 символа)" value={form.password} onChange={handleChange} style={styles.input} />
        <input type="password" name="confirmPassword" placeholder="Подтверждение пароля *" value={form.confirmPassword} onChange={handleChange} style={styles.input} />
        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>Регистрация успешна! Перенаправление на вход...</p>}
        <button style={styles.loginButton} onClick={handleRegister} disabled={loading}>{loading ? 'Регистрация...' : 'Зарегистрироваться'}</button>
        <button style={styles.registerButton} onClick={openLogin}>Назад</button>
      </div>
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => auth.getCurrentUser());
  const [page, setPage] = useState('login');

  useEffect(() => {
    const unsubscribe = subscribeToChanges((event) => {
      if (event.type === 'unauthorized') handleLogout();
    });
    return unsubscribe;
  }, []);

  const handleLogin = (user) => setCurrentUser(user);
  const handleLogout = () => {
    auth.logout();
    setCurrentUser(null);
    setPage('login');
  };

  if (currentUser?.role === 'admin') return <AdminDashboard currentUser={currentUser} onLogout={handleLogout} />;
  if (currentUser?.role === 'employee') return <EmployeeDashboard currentUser={currentUser} onLogout={handleLogout} />;
  if (currentUser?.role === 'client') return <ClientDashboard currentUser={currentUser} onLogout={handleLogout} />;

  return page === 'login' ? (
    <LoginPage onLogin={handleLogin} openRegister={() => setPage('register')} />
  ) : (
    <RegisterPage openLogin={() => setPage('login')} />
  );
}

const styles = {
  authContainer: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #0f2b3d 0%, #1a3a4f 100%)' },
  authCard: { width: '420px', background: '#fff', padding: '40px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' },
  input: { padding: '14px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px' },
  loginButton: { background: '#3b82f6', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '16px' },
  registerButton: { background: '#fff', color: '#3b82f6', border: '2px solid #3b82f6', padding: '14px', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '16px' },
  error: { color: '#dc2626', textAlign: 'center', fontWeight: '500' },
  success: { color: '#10b981', textAlign: 'center', fontWeight: '500' },
};