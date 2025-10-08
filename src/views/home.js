// import React from 'react';
// import { useNavigate } from 'react-router-dom';

// function Home() {
//   const navigate = useNavigate();

//   return (
//     <div style={{ fontFamily: 'Arial, sans-serif', background: '#f9fafe' }}>
//       {/* Navbar */}
//       <nav style={{
//         backgroundColor: '#1976d2',
//         padding: '1rem 2rem',
//         color: '#fff',
//         boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
//       }}>
//         <h1 style={{ margin: 0 }}>Quick LPG Connect</h1>
//       </nav>

//       {/* Hero Section */}
//       <section
//         style={{
//           position: 'relative',
//           backgroundImage: 'url("https://images.unsplash.com/photo-1581091870632-56e087b3a3e1")',
//           backgroundSize: 'cover',
//           backgroundPosition: 'center',
//           height: '400px',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center'
//         }}
//       >
//         <div
//           style={{
//             position: 'absolute',
//             left: 0,
//             bottom: 0,
//             background: 'rgba(25,118,210,0.90)',
//             color: '#fff',
//             padding: '2rem 2.5rem 1.5rem 2.5rem',
//             borderRadius: '0 0 0 18px',
//             maxWidth: '60%',
//             minWidth: '260px',
//             boxShadow: '0 4px 16px rgba(25,118,210,0.10)',
//             zIndex: 2,
//           }}
//         >
//           <h2 style={{
//             fontSize: '2.1rem',
//             fontWeight: 800,
//             marginBottom: '0.7rem',
//             letterSpacing: '1px',
//             textShadow: '0 2px 8px rgba(25,118,210,0.18)'
//           }}>
//             Smart LPG Monitoring Made Easy
//           </h2>
//           <p style={{
//             fontSize: '1.13rem',
//             marginBottom: '1.2rem',
//             fontWeight: 400,
//             color: '#e3f2fd',
//             textShadow: '0 1px 4px rgba(25,118,210,0.13)'
//           }}>
//             Real-time gas level updates, automatic booking, and secure payments—all in one place.
//           </p>
//           <button
//             onClick={() => navigate('/register')}
//             style={{
//               padding: '0.75rem 2.1rem',
//               borderRadius: '8px',
//               border: 'none',
//               background: 'linear-gradient(90deg, #fff 0%, #e3f2fd 100%)',
//               color: '#1976d2',
//               fontWeight: 700,
//               fontSize: '1.08rem',
//               cursor: 'pointer',
//               boxShadow: '0 2px 8px rgba(33,150,243,0.13)',
//               transition: 'all 0.2s ease-in-out',
//             }}
//             onMouseOver={(e) => {
//               e.currentTarget.style.background = 'linear-gradient(90deg, #1976d2 0%, #2196f3 100%)';
//               e.currentTarget.style.color = '#fff';
//             }}
//             onMouseOut={(e) => {
//               e.currentTarget.style.background = 'linear-gradient(90deg, #fff 0%, #e3f2fd 100%)';
//               e.currentTarget.style.color = '#1976d2';
//             }}
//           >
//             Get Started
//           </button>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section
//         style={{
//           maxWidth: 1200,
//           margin: '0 auto',
//           padding: '2rem 1rem'
//         }}
//       >
//         <h3 style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.8rem', marginBottom: '1.5rem', color: '#1976d2' }}>
//           Key Features
//         </h3>
//         <div
//           style={{
//             display: 'flex',
//             flexWrap: 'wrap',
//             gap: '1.5rem',
//             justifyContent: 'center'
//           }}
//         >
//           {[
//             {
//               title: "Real-Time Monitoring",
//               desc: "Monitor your gas level from anywhere using our dashboard."
//             },
//             {
//               title: "Automatic Booking",
//               desc: "Book your cylinder automatically when gas is low."
//             },
//             {
//               title: "Secure Payments",
//               desc: "Pay seamlessly and securely online for your bookings."
//             }
//           ].map((feature, index) => (
//             <div
//               key={index}
//               style={{
//                 background: '#fff',
//                 borderRadius: '12px',
//                 boxShadow: '0 2px 12px rgba(25,118,210,0.08)',
//                 padding: '1.5rem 1.2rem',
//                 textAlign: 'center',
//                 transition: 'transform 0.15s, box-shadow 0.15s',
//                 fontWeight: 500,
//                 minWidth: '260px',
//                 maxWidth: '320px',
//                 flex: '0 0 300px',
//               }}
//               onMouseOver={e => {
//                 e.currentTarget.style.transform = 'translateY(-6px) scale(1.03)';
//                 e.currentTarget.style.boxShadow = '0 8px 24px rgba(25,118,210,0.13)';
//               }}
//               onMouseOut={e => {
//                 e.currentTarget.style.transform = '';
//                 e.currentTarget.style.boxShadow = '0 2px 12px rgba(25,118,210,0.08)';
//               }}
//             >
//               <h4 style={{ color: '#1976d2', marginBottom: '0.7rem', fontWeight: 700 }}>{feature.title}</h4>
//               <p style={{ color: '#444', fontSize: '1rem' }}>{feature.desc}</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* Footer */}
//       <footer
//         style={{
//           background: '#f1f6fa',
//           color: '#1976d2',
//           textAlign: 'center',
//           padding: '1.2rem 0 0.7rem 0',
//           borderRadius: '18px 18px 0 0',
//           maxWidth: 900,
//           margin: '2.5rem auto 0 auto',
//           fontSize: '1rem',
//           boxShadow: '0 -2px 12px rgba(25,118,210,0.04)',
//         }}
//       >
//         <div style={{ marginBottom: '0.5rem' }}>
//           <a href="https://iot.smartviewtechnology.co.za/documentation/docs/policy.html?utm_source=chatgpt.com" style={{ color: '#1976d2', textDecoration: 'underline', margin: '0 0.5rem' }}>Privacy</a>
//           |
//           <a href="https://iotcommunity.net/terms-of-use/?utm_source=chatgpt.com" style={{ color: '#1976d2', textDecoration: 'underline', margin: '0 0.5rem' }}>Terms</a>
//           |
//           <a href="https://docs.devicewise.com/Content/LegalNotice/Support-Services-Agreement.htm?utm_source=chatgpt.com" style={{ color: '#1976d2', textDecoration: 'underline', margin: '0 0.5rem' }}>Support</a>
//         </div>
//         <p style={{ color: '#444', fontSize: '0.98rem', margin: 0 }}>© 2025 Quick LPG Connect. All rights reserved.</p>
//       </footer>
//     </div>
//   );
// }

// export default Home;










import React from "react";
import { useNavigate, Link } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        background: "#0f172a",
        color: "#fff",
        width: "100vw",
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 2rem",
          background: "#0f172a",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700 }}>
          Gas Safety
        </h1>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <Link
            to="/"
            style={{ color: "#fff", textDecoration: "none", fontWeight: 500 }}
          >
            Home
          </Link>
          <Link
            to="/features"
            style={{ color: "#fff", textDecoration: "none", fontWeight: 500 }}
          >
            Features
          </Link>
          <Link
            to="/contact"
            style={{ color: "#fff", textDecoration: "none", fontWeight: 500 }}
          >
            Contact
          </Link>
          <button
            onClick={() => navigate("/register")}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              border: "none",
              background: "#0284c7",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          position: "relative",
          backgroundImage:
            'url("https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "#fff",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.7)",
          }}
        />
        <div style={{ position: "relative", zIndex: 2, maxWidth: "800px" }}>
          <h2
            style={{
              fontSize: "2.8rem",
              fontWeight: 800,
              marginBottom: "1rem",
              color: "#06090cff",
            }}
          >
            Smart Gas Monitoring for a Safer Tomorrow
          </h2>
          <p
            style={{
              fontSize: "1.2rem",
              maxWidth: "700px",
              margin: "0 auto 2rem auto",
              color: "#e2e8f0",
            }}
          >
            Our IoT-enabled gas monitoring system provides real-time insights and
            alerts to ensure the safety of your environment. Protect your people
            and assets with advanced technology.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ background: "#1e293b", padding: "4rem 2rem" }}>
        <h3
          style={{
            textAlign: "center",
            fontWeight: 700,
            fontSize: "2rem",
            marginBottom: "2rem",
          }}
        >
          Key Features
        </h3>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "2rem",
          }}
        >
          {[
            {
              title: "Real-time Alerts",
              desc: "Receive instant notifications via SMS and email when gas levels exceed safe limits, allowing for immediate action.",
              icon: "🔔",
            },
            {
              title: "Data Analytics",
              desc: "Gain valuable insights into gas usage patterns and potential risks through comprehensive data analysis and reporting.",
              icon: "📊",
            },
            {
              title: "Remote Access",
              desc: "Monitor gas levels and system status from anywhere with our user-friendly web and mobile applications.",
              icon: "🌐",
            },
          ].map((feature, index) => (
            <div
              key={index}
              style={{
                background: "#0f172a",
                borderRadius: "12px",
                padding: "2rem",
                width: "300px",
                textAlign: "center",
                boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>
                {feature.icon}
              </div>
              <h4 style={{ marginBottom: "0.8rem", fontWeight: 700 }}>
                {feature.title}
              </h4>
              <p style={{ color: "#cbd5e1", fontSize: "0.95rem" }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          background: "#0f172a",
          color: "#94a3b8",
          textAlign: "center",
          padding: "1.5rem 0",
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div style={{ marginBottom: "0.8rem" }}>
          <Link to="https://iot.smartviewtechnology.co.za/documentation/docs/policy.html?utm_source=chatgpt.com" style={{ color: "#94a3b8", margin: "0 0.8rem" }}>
            Privacy Policy
          </Link>
          |
          <Link to="https://iotcommunity.net/terms-of-use/?utm_source=chatgpt.com" style={{ color: "#94a3b8", margin: "0 0.8rem" }}>
            Terms of Service
          </Link>
          |
          <Link to="https://docs.devicewise.com/Content/LegalNotice/Support-Services-Agreement.htm?utm_source=chatgpt.com" style={{ color: "#94a3b8", margin: "0 0.8rem" }}>
            Contact Us
          </Link>
        </div>
        <p style={{ margin: 0, fontSize: "0.9rem" }}>
          © 2025 GasGuard. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default Home;
        