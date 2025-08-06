import React, { useState } from 'react';
// Login.js
import '../styles/Login.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    axios.post('http://localhost:5000/api/login', { email, password })
      .then(res => {
        alert(res.data.message);
        // On success, navigate to dashboard/homepage
        navigate('/dashboard'); // or any page you define
      })
      .catch(err => {
        console.error(err);
        alert("Login failed");
      });
  };

  return (
    <div className="login-container">
      <div className="form-box">
        <h2>Login to Your Account</h2>
        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          <button type="submit">Login</button>
        </form>
        <p className="register-text">Don't have an account? <a href="/register">Register</a></p>
      </div>
    </div>
  );
}

export default Login;
