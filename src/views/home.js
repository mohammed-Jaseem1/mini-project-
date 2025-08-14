import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
    <div className="container">
      {/* Navbar */}
      <nav className="navbar">
        <h1>Quick LPG Connect</h1>
      </nav>

      {/* Hero Section - Split Layout */}
      <section className="hero">
        <div className="hero-image"></div>
        
        <div className="hero-content">
          <h2>Smart LPG Monitoring Made Easy</h2>
          <p>
            Real-time gas level updates, automatic booking, and secure payments — all in one place.
          </p>
          <button className="get-started" onClick={() => navigate('/register')}>
            Get Started
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h3>Key Features</h3>
        <div className="feature-grid">
          <div className="feature-card">
            <h4>Real-Time Monitoring</h4>
            <p>Monitor your gas level from anywhere using our dashboard.</p>
          </div>
          <div className="feature-card">
            <h4>Automatic Booking</h4>
            <p>Book your cylinder automatically when gas is low.</p>
          </div>
          <div className="feature-card">
            <h4>Secure Payments</h4>
            <p>Pay seamlessly and securely online for your bookings.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* <footer className="footer">
        <div>
          <a href="/privacy">Privacy</a> | <a href="/terms">Terms</a> | <a href="/support">Support</a>
        </div>
        <p>© 2025 Quick LPG Connect. All rights reserved.</p>
      </footer> */}
    </div>
    </div>
  );
}

export default Home;
