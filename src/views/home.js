import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/App.css'; // or '../styles/Home.css' if that's where your CSS is

function Home() {
  const navigate = useNavigate();

  return (
    <div className="container">
      {/* Navbar */}
      <nav className="navbar">
        <h1>Quick LPG Connect</h1>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay">
          <h2>Smart LPG Monitoring Made Easy</h2>
          <p>
            Real-time gas level updates, automatic booking, and secure payments—all in one place.
          </p>
          <button className="get-started" onClick={() => navigate('/register')}>
            Get Started
          </button>
        </div>
      </section>

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
      <footer className="footer">
        <div>
          <a href="/privacy">Privacy</a> | <a href="/terms">Terms</a> | <a href="/support">Support</a>
        </div>
        <p>© 2025 Quick LPG Connect. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;
