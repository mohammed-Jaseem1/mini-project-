import React from "react";

export default function WaitingApproval() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #e3f2fd 0%, #f7f9fc 100%)"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "18px",
        boxShadow: "0 4px 24px rgba(25, 118, 210, 0.10)",
        padding: "3em 2em",
        maxWidth: 400,
        textAlign: "center"
      }}>
        <h2 style={{ color: "#1976d2", fontWeight: 700 }}>Awaiting Admin Approval</h2>
        <p style={{ margin: "1.5em 0", fontSize: "1.1em" }}>
          Your payment has been received.<br />
          Please wait for admin approval before accessing your dashboard.
        </p>
      </div>
    </div>
  );
}
