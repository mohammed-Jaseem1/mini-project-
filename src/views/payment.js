import React, { useState, useEffect } from "react";
import "../styles/payment.css";

function generateCustomerId() {
  return "CUST" + Math.floor(100000 + Math.random() * 900000);
}

export default function GasPayment() {
  const [customerId, setCustomerId] = useState("");
  const [amountDue] = useState("500"); // Fixed amount
  const [paymentMethod, setPaymentMethod] = useState("");
  const [pin, setPin] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [gmail, setGmail] = useState(""); // <-- use 'gmail' field
  const [success, setSuccess] = useState(false);
  const [cardError, setCardError] = useState("");
  const [pinError, setPinError] = useState("");
  const [gasLevel, setGasLevel] = useState(null);

  useEffect(() => {
    setCustomerId(generateCustomerId());
    // Autofill gmail from backend (current logged-in user)
    async function fetchGmail() {
      try {
        const res = await fetch('http://localhost:5000/api/user/me', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (res.ok) {
          const data = await res.json();
          setGmail(data.email || "");
        }
      } catch (err) {
        // Optionally handle error
      }
    }
    fetchGmail();

    // Fetch current gas level
    async function fetchGasLevel() {
      try {
        const res = await fetch('http://localhost:5000/api/gas/status', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (res.ok) {
          const data = await res.json();
          setGasLevel(data.gasLevel);
        }
      } catch (err) {
        setGasLevel(null);
      }
    }
    fetchGasLevel();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCardError("");
    setPinError("");
    if ((paymentMethod === "Credit Card" || paymentMethod === "Debit Card")) {
      // Simple validation: card number must be exactly 16 digits
      if (!/^\d{16}$/.test(cardNumber)) {
        setCardError("Please enter a valid 16-digit card number.");
        return;
      }
      // PIN must be exactly 6 digits
      if (!/^\d{6}$/.test(pin)) {
        setPinError("Please enter a valid 6-digit PIN.");
        return;
      }
    }

    // Store payment details in backend
    try {
      await fetch('http://localhost:5000/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          amountPaid: Number(amountDue),
          paymentMethod,
          cardNumber: cardNumber ? cardNumber : undefined,
          gmail // <-- ensure this is 'gmail'
        }),
      });
      setSuccess(true);
      setTimeout(() => window.location.href = '/userdash', 1500); // Redirect after success
    } catch (err) {
      // Optionally handle error
    }
  };

  return (
    <div className="payment-box">
      <div className="payment-card">
        <h2>Gas Connection Payment</h2>
        {/* Gas Level Notification */}
        {gasLevel !== null && gasLevel < 20 && (
          <div style={{
            background: '#fff3e0',
            color: '#d32f2f',
            border: '2px solid #d32f2f',
            borderRadius: '10px',
            padding: '1em',
            fontWeight: 600,
            marginBottom: '1em',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            ⚠️ Gas level is below 20%. Please refill your gas cylinder soon!
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {/* Customer ID */}
          <label>Customer ID</label>
          <input
            type="text"
            value={customerId}
            readOnly
            style={{ background: "#f1f1f1", color: "#333" }}
          />

          {/* Amount Due */}
          <label>Amount Due</label>
          <input
            type="number"
            value={amountDue}
            readOnly
            disabled
            style={{ background: "#f1f1f1", color: "#333" }}
          />

          {/* Payment Method */}
          <label>Select Payment Method</label>
          <div>
            {["Credit Card", "Debit Card"].map((method) => (
              <button
                type="button"
                key={method}
                onClick={() => {
                  setPaymentMethod(method);
                  setPin(""); // reset pin when switching method
                  setCardNumber(""); // reset card number when switching method
                  setCardError("");
                  setPinError("");
                }}
                className={`method-btn ${paymentMethod === method ? "active" : ""}`}
              >
                {method}
              </button>
            ))}
          </div>

          {/* Show Card Number and PIN fields if Credit Card or Debit Card is selected */}
          {(paymentMethod === "Credit Card" || paymentMethod === "Debit Card") && (
            <div style={{ margin: "1em 0" }}>
              <label>
                {paymentMethod} Number
                <input
                  type="text"
                  value={cardNumber}
                  onChange={e => {
                    // Only allow digits, max 16 (standard card length)
                    const val = e.target.value.replace(/\D/g, "").slice(0, 16);
                    setCardNumber(val);
                    setCardError("");
                  }}
                  maxLength={16}
                  minLength={13}
                  pattern="^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$"
                  placeholder="Enter your card number"
                  required
                  style={{ letterSpacing: "0.15em", fontSize: "1.1em", textAlign: "center" }}
                />
              </label>
              {cardError && (
                <span style={{ color: "red", fontSize: "0.95em", display: "block", marginTop: "0.2em" }}>
                  {cardError}
                </span>
              )}
              <label style={{ marginTop: "0.8em" }}>Enter 6-digit PIN</label>
              <input
                type="password"
                value={pin}
                onChange={e => {
                  // Only allow digits, max 6
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setPin(val);
                  setPinError("");
                }}
                maxLength={6}
                pattern="\d{6}"
                placeholder="******"
                required
                style={{ letterSpacing: "0.3em", fontSize: "1.2em", textAlign: "center" }}
              />
              {pinError && (
                <span style={{ color: "red", fontSize: "0.95em", display: "block", marginTop: "0.2em" }}>
                  {pinError}
                </span>
              )}
            </div>
          )}

          {/* Gmail Field */}
          <label>
            Gmail ID*
            <input
              type="email"
              value={gmail}
              onChange={e => setGmail(e.target.value)}
              required
              placeholder="Enter your gmail"
              style={{ marginBottom: "1em" }}
              readOnly // <-- make it readOnly if you don't want user to edit
            />
          </label>

          {/* Payment Summary */}
          <div className="payment-summary">
            <p><strong>Customer ID:</strong> {customerId || "--"}</p>
            <p><strong>Amount Due:</strong> {amountDue ? `${amountDue}` : "--"}</p>
            <p><strong>Payment Method:</strong> {paymentMethod || "--"}</p>
          </div>

          {/* Submit Button */}
          <button type="submit">Submit Payment</button>
          {success && (
            <div style={{
              marginTop: "1.2em",
              color: "#388e3c",
              fontWeight: 600,
              fontSize: "1.1rem",
              textAlign: "center"
            }}>
              Payment Successful! <br />
              You can now access your dashboard.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

