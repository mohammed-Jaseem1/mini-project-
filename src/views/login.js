import React, { useState } from 'react';
import "./login.css";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Define default admin credentials
  const defaultAdmin = {
    email: 'ad@gmail.com',
    password: '123'
  };

  const handleLogin = (e) => {
    e.preventDefault();

    // Check for hardcoded admin login
    if (email === defaultAdmin.email && password === defaultAdmin.password) {
      localStorage.setItem('role', 'admin');
      alert('Welcome Admin!');
      navigate('/admindash');
      return; // skip API call
    }

    // Proceed to authenticate regular users via backend
    axios.post('http://localhost:5000/api/login', { email, password })
      .then(res => {
        alert(res.data.message);

        const role = res.data.role || 'user'; // fallback to 'user'

        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
        localStorage.setItem('role', role);

        if (role === 'admin') {
          navigate('/admindash');
        } else if (role === 'user') {
          navigate('/userdash');
        } else {
          alert('Unknown user role. Please contact support.');
        }
      })
      .catch(err => {
        console.error(err);
        alert("Login failed");
      });
  };

  return (
    <div className="login-container" style={{ backgroundImage: 'url(/login.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="form-box">
        <h2>Login to Your Account</h2>
        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />

          <label>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />

          <button type="submit">Login</button>
        </form>
        <p className="register-text">
          Don't have an account? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
