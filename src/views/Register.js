import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Register.css'; // adjust if needed
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage('❌ Please enter a valid email address.');
      return;
    }

    // Password length check
    if (formData.password.length < 6) {
      setMessage('❌ Password must be at least 6 characters long.');
      return;
    }

    // Password match check
    if (formData.password !== formData.confirmPassword) {
      setMessage('❌ Passwords do not match!');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/register', {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
      });

      setMessage('✅ Registration successful! Redirecting...');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1000);
    } catch (err) {
      if (err.response?.data?.message) {
        setMessage(`❌ ${err.response.data.message}`);
      } else {
        setMessage('❌ Network error. Make sure the backend is running.');
      }
    }
  };

  return (
    <div className="register-container">
      <div className="form-box">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />

          <label>Phone</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />

          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />

          <label>Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />

          <label>Confirm Password</label>
          <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />

          <button type="submit">Register</button>
        </form>

        {message && <p className="message">{message}</p>}

        <div className="signin-text">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
