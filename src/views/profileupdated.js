import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/profileupdate.css";

export default function ProfileUpdated() {
  const location = useLocation();
  const [user, setUser] = useState(location.state?.updatedProfile || null);

  useEffect(() => {
    if (!user) {
      async function fetchUser() {
        try {
          const res = await fetch("http://localhost:5000/api/user/me", {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data);
          }
        } catch {
          setUser(null);
        }
      }
      fetchUser();
    }
  }, [user]);

  function formatKey(key) {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, str => str.toUpperCase());
  }

  return (
    <div className="profileupdated-container" style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #23272f 0%, #222a35 100%)"
    }}>
      <div className="profileupdated-card" style={{
        background: "rgba(34, 42, 53, 0.98)",
        borderRadius: "24px",
        boxShadow: "0 8px 32px rgba(25, 118, 210, 0.18)",
        padding: "3em 2em",
        maxWidth: 420,
        width: "100%",
        textAlign: "center",
        position: "absolute",
        top: "10%",
        left: "50%",
        transform: "translate(-50%, 0)",
        color: "#fff"
      }}>
        <h2 className="profileupdated-title" style={{ color: "#90caf9" }}>Profile Updated</h2>
        <p className="profileupdated-success" style={{ color: "#66bb6a" }}>
          Your profile changes have been saved successfully.
        </p>
        {user ? (
          <div className="profileupdated-details" style={{ margin: "1.5em 0", textAlign: "left" }}>
            {Object.entries(user).map(([key, value]) => (
              <div key={key} style={{ marginBottom: "0.8em" }}>
                <strong style={{ color: "#90caf9" }}>{formatKey(key)}:</strong> <span style={{ color: "#fff" }}>{String(value)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#fff" }}>Loading profile details...</p>
        )}
        <a href="/userdash" className="profileupdated-link" style={{
          display: "inline-block",
          marginTop: "1em",
          padding: "0.8em 2em",
          background: "#1976d2",
          color: "#fff",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: 600,
          transition: "background 0.2s"
        }}>
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}


