import React, { useState, useEffect } from "react";
import "../styles/payment.css";
import { useNavigate } from "react-router-dom"; // Add this import

function generateCustomerId() {
  return "CUST" + Math.floor(100000 + Math.random() * 900000);
}

export default function GasPayment() {
  const navigate = useNavigate(); // Add this hook
  const [customerId, setCustomerId] = useState("");
  const [amountDue] = useState(500); // Fixed amount
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState(""); // pincode
  const [gmail, setGmail] = useState(""); // autofilled
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Instead of generating a new ID every time, fetch it from backend or localStorage
    async function fetchCustomerId() {
      // Try to get from localStorage first
      let storedId = localStorage.getItem("customerId");
      if (storedId) {
        setCustomerId(storedId);
        return;
      }
      // Otherwise, generate and store it
      const newId = generateCustomerId();
      setCustomerId(newId);
      localStorage.setItem("customerId", newId);
    }
    fetchCustomerId();

    // Fetch logged-in user email and KYC details
    async function fetchGmailAndKYC() {
      try {
        const res = await fetch("http://localhost:5000/api/user/me", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          setGmail(data.email || "");

          // Fetch KYC details using email
          if (data.email) {
            const kycRes = await fetch(
              `http://localhost:5000/api/kyc/user/me?email=${encodeURIComponent(
                data.email
              )}`,
              {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
              }
            );
            if (kycRes.ok) {
              const kyc = await kycRes.json();
              setAddress(kyc.houseName || "");
              setCity(kyc.city || "");
              setState(kyc.state || "");
              setZip(kyc.pinCode || "");
            }
          }
        }
      } catch (err) {
        console.error("Error fetching Gmail/KYC", err);
      }
    }
    fetchGmailAndKYC();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // ✅ Client-side validation for card expiry
    if (expiry && (paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card')) {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      
      const expiryParts = expiry.split('/');
      if (expiryParts.length === 2) {
        const expiryMonth = parseInt(expiryParts[0], 10);
        const expiryYear = parseInt('20' + expiryParts[1], 10);
        
        if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
          setError('Card has expired. Please use a valid card.');
          return;
        }
      } else {
        setError('Invalid expiry date format. Please use MM/YY format.');
        return;
      }
    }

    try {
      const res = await fetch("http://localhost:5000/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          amountPaid: amountDue,
          paymentMethod,
          cardLast4Digits: cardNumber.slice(-4),
          expiry,
          cvv,
          billingAddress: { address, city, state, pincode: zip }, // <-- change zip to pincode
          gmail,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => (window.location.href = "/userdash"), 2000);
      } else {
        const data = await res.json();
        setError(data.message || "Payment failed. Try again.");
      }
    } catch (err) {
      setError("Server error. Please try later.");
    }
  };

  // ✅ Format expiry date input
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    
    setExpiry(value);
  };

  const handleBack = () => {
    navigate(-1); // This will go back to the previous page
  };

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <button
            onClick={handleBack}
            style={{
              padding: "8px 15px",
              backgroundColor: "#666",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginRight: "20px",
            }}
          >
            ← Back
          </button>
          <h2>Secure Payment</h2>
        </div>
        <p>Please enter your payment details below.</p>

        {/* Payment Method Tabs */}
        <div className="method-tabs">
          {["Credit Card", "Debit Card", "Net Banking"].map((method) => (
            <button
              key={method}
              type="button"
              className={`tab-btn ${
                paymentMethod === method ? "active" : ""
              }`}
              onClick={() => setPaymentMethod(method)}
            >
              {method}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Card Details */}
          {(paymentMethod === "Credit Card" || paymentMethod === "Debit Card") && (
            <>
              <label>Card Number</label>
              <input
                type="text"
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                onChange={(e) =>
                  setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))
                }
                required
              />

              <div className="row">
                <div>
                  <label>Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={handleExpiryChange}
                    maxLength={5}
                    required
                  />
                </div>
                <div>
                  <label>CVV</label>
                  <input
                    type="password"
                    placeholder="•••"
                    value={cvv}
                    onChange={(e) =>
                      setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))
                    }
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Billing Address */}
          <label>Address</label>
          <input
            type="text"
            placeholder="123 Main St"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />

          <div className="row">
            <div>
              <label>City</label>
              <input
                type="text"
                placeholder="Anytown"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
            <div>
              <label>State</label>
              <input
                type="text"
                placeholder="CA"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Pin Code</label>
              <input
                type="text"
                placeholder="123456"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Gmail */}
          <label>Gmail ID</label>
          <input type="email" value={gmail} readOnly required />

          {/* Payment Summary */}
          <div className="summary-box">
            <p>
              <strong>Customer ID:</strong> {customerId}
            </p>
            <p>
              <strong>Amount Due:</strong> ₹{amountDue}
            </p>
            <p>
              <strong>Method:</strong> {paymentMethod}
            </p>
          </div>

          {/* Submit */}
          <button type="submit" className="pay-btn">
            Pay Now
          </button>

          {/* Messages */}
          {success && (
            <p
              style={{
                color: "#22c55e",
                marginTop: "10px",
                textAlign: "center",
              }}
            >
              ✅ Payment Successful! Redirecting...
            </p>
          )}
          {error && (
            <p
              style={{
                color: "red",
                marginTop: "10px",
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

