import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [forgotMode, setForgotMode] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:8000/api/login', { username: email, password });
      if (res.data.status === 'success' && res.data.user.role === 'admin') {
        const adminUser = {
          name: res.data.user.username,
          email: res.data.user.email
        };
        onLogin(adminUser);
        localStorage.setItem('admin_user', JSON.stringify(adminUser));
      } else {
        setError('Access denied: Admins only.');
      }
    } catch (err) {
      setError('Invalid credentials.');
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axios.post('http://localhost:8000/api/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err) {
      setMessage('Request failed. Please check network.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={{ marginBottom: '10px' }}>NeuraX Admin Core</h1>
        <p style={{ marginBottom: '30px', color: '#666' }}>Authenticate securely to access live municipal tracking</p>
        
        {forgotMode ? (
          <form onSubmit={handleForgot} style={styles.form}>
            <input 
              style={styles.input} 
              type="email" 
              placeholder="Admin Email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
            <button style={styles.button} type="submit">Send Reset Link</button>
            <p style={{color: 'green', marginTop: '10px'}}>{message}</p>
            <a href="#" style={styles.link} onClick={() => {setForgotMode(false); setMessage('');}}>Back to Login</a>
          </form>
        ) : (
          <form onSubmit={handleLogin} style={styles.form}>
            <input 
              style={styles.input} 
              type="text" 
              placeholder="Admin Email (admin@neurax.com)" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
            <input 
              style={styles.input} 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
            {error && <p style={{color: 'red', marginBottom: '10px', fontSize: '14px'}}>{error}</p>}
            <button style={styles.button} type="submit">Login to Dashboard</button>
            <a href="#" style={styles.link} onClick={() => setForgotMode(true)}>Forgot Password?</a>
          </form>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f4f4f4' },
  card: { padding: '40px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center', width: '350px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: { padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px' },
  button: { padding: '10px', backgroundColor: '#4285F4', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' },
  link: { color: '#4285F4', textDecoration: 'none', fontSize: '14px', marginTop: '10px', display: 'inline-block' }
};

export default Login;
