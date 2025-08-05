import React, { useState } from 'react';
import axios from 'axios';
import './Register.css';
import { useNavigate } from 'react-router-dom';

function Register() {
  
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const userData = {
      fullName,
      phone,
      email,
      password
    };
    console.log("📤 Sending userData to backend:", userData);


    axios.post('http://localhost:5000/api/register', userData)
      .then(res => {
        navigate('/login');
        alert(res.data.message);
        // Optionally clear form
        setFullName('');
        setPhone('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      })
      .catch(err => {
        console.error('❌ Registration failed:', err);
        alert("Registration failed.");
      });
  };

  return (
    <div className="register-container">
      <div className="form-box">
        <h2>Create Your Account</h2>

        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <label>Phone Number</label>
          <input
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit">Register</button>
        </form>

        <p className="signin-text">
          Already have an account? <a href="#">Sign in</a>
        </p>
      </div>
    </div>
  );
}

export default Register;
