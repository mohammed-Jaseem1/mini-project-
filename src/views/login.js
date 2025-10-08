// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import '../styles/Login.css';

// function Login() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   // The separate checkPaymentAndRedirect function is no longer needed.

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError('');

//     try {
//       // 1. Make a single API call to log in
//       const res = await axios.post('http://localhost:5000/api/login',
//         { email, password },
//         { withCredentials: true }
//       );

//       // 2. Get role and hasPaid status directly from the response
//       const { role, hasPaid } = res.data;
//       localStorage.setItem('role', role);

//       if (role === 'admin') {
//         navigate('/admin');
//       } else if (role === 'user') {
//         // 3. Use the hasPaid flag to decide where to navigate
//         if (hasPaid) {
//           navigate('/userdash'); // User has paid, go to dashboard
//         } else {
//           navigate('/kyc'); // User has not paid, go to the connection/payment page
//         }
//       } else {
//         setError('Unknown user role');
//       }
//     } catch (err) {
//       if (err.response?.data?.message) {
//         setError(err.response.data.message);
//       } else {
//         setError('Login failed. Please try again.');
//       }
//     }
//   };

//   return (
//     <div className="login-container">
//       <div className="form-box">
//         <h2>Login to Your Account</h2>
//         <form onSubmit={handleLogin}>
//           <label>Email</label>
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value.toLowerCase())}
//             required
//           />

//           <label>Password</label>
//           <input
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />

//           {error && <div className="error">{error}</div>}

//           <button type="submit">Login</button>
//         </form>
//         <p>
//           Don't have an account? <a href="/register">Register</a>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Login;







import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/login',
        { email, password },
        { withCredentials: true }
      );

      const { role, hasPaid } = res.data;
      localStorage.setItem('role', role);

      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'user') {
        if (hasPaid) {
          navigate('/userdash');
        } else {
          navigate('/kyc');
        }
      } else {
        setError('Unknown user role');
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="login-wrapper" style={{ width: "100vw", minHeight: "100vh" }}>
      <div className="login-box">
        {/* Left: Form */}
        <div className="login-form">
          <h2>Welcome Back</h2>
          <p className="subtitle">Login to access your gas monitoring dashboard.</p>
          <form onSubmit={handleLogin}>
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
              required
              autoComplete="off" // <-- disables browser autofill for email
            />

            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="off" // <-- disables browser autofill for password
            />

            {error && <div className="error">{error}</div>}

            <div className="forgot-password">
              <a href="/forgot">Forgot Password?</a>
            </div>

            <button type="submit" className="login-btn">Login to your account</button>
          </form>
          <p className="register-text">
            Don’t have an account yet? <a href="/register">Register</a>
          </p>
        </div>

        {/* Right: Image */}
        <div className="login-image">
          <img src="https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=900&q=80" alt="Login" />
        </div>
      </div>
    </div>
  );
}

export default Login;
