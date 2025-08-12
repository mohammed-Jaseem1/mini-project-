import React, { useState } from 'react';
import '../styles/Login.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        email: email.trim(),
        password: password
      });

      console.log('Server response:', response.data);

      if (response.data.success) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', response.data.role);
        localStorage.setItem('userEmail', response.data.email);

        if (response.data.role === 'admin') {
          console.log('Redirecting to admin dashboard...');
          navigate('/admin-dashboard');
        } else {
          console.log('Redirecting to new connection...');
          navigate('/new-connection');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="form-box">
        <h2>Login to Your Account</h2>
        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Enter your email"
            required 
          />

          <label>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Enter your password"
            required 
          />

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        {errorMsg && <p className="error-message">{errorMsg}</p>}
        <p className="register-text">
          Don't have an account? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
}

export default Login;



