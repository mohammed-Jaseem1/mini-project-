// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
// import "../styles/Register.css";

// export default function Registration() {
//   const [formData, setFormData] = useState({
//     fullName: "",
//     phone: "+91",
//     email: "",
//     password: "",
//     confirmPassword: "",
//   });

//   const [message, setMessage] = useState("");
//   const [messageType, setMessageType] = useState("");
//   const [emailError, setEmailError] = useState(""); // For real-time email check

//   const navigate = useNavigate();

//   // Field validation
//   const validateField = (name, value) => {
//     let errorMessage = "";

//     if (name === "fullName") {
//       if (!value.trim()) {
//         errorMessage = "Full name is required.";
//       } else if (!/^[A-Za-z\s]+$/.test(value)) {
//         errorMessage = "Full name can only contain letters and spaces.";
//       }
//     }

//     if (name === "phone") {
//       const digitsOnly = value.slice(3);
//       if (!digitsOnly.trim()) {
//         errorMessage = "Phone number is required.";
//       } else if (!/^[987]/.test(digitsOnly)) {
//         errorMessage = "Phone must start with 9, 8, or 7.";
//       } else if (digitsOnly.length !== 10) {
//         errorMessage = "Phone must be exactly 10 digits.";
//       }
//     }

//     if (name === "email") {
//       if (!value.trim()) {
//         errorMessage = "Email is required.";
//       } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
//         errorMessage = "Please enter a valid email.";
//       }
//     }

//     if (name === "password") {
//       const strongPasswordRegex =
//         /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
//       if (!strongPasswordRegex.test(value)) {
//         errorMessage =
//           "Password must have 8+ chars, uppercase, lowercase, number, special char.";
//       }
//     }

//     if (name === "confirmPassword") {
//       if (value !== formData.password) {
//         errorMessage = "Passwords do not match.";
//       }
//     }

//     return errorMessage;
//   };

//   // Handle input change
//   const handleChange = (e) => {
//     let value = e.target.value;

//     if (e.target.name === "fullName") {
//       value = value.replace(/[^A-Za-z\s]/g, "");
//     }

//     if (e.target.name === "phone") {
//       if (!value.startsWith("+91")) {
//         value = "+91";
//       }
//       const prefix = "+91";
//       let digits = value.slice(prefix.length).replace(/\D/g, "");
//       if (digits.length > 10) digits = digits.slice(0, 10);
//       value = prefix + digits;
//     }

//     // Ensure email is always lowercase
//     if (e.target.name === "email") {
//       value = value.toLowerCase();
//     }

//     setFormData((prev) => ({
//       ...prev,
//       [e.target.name]: value,
//     }));

//     const error = validateField(e.target.name, value);
//     e.target.setCustomValidity(error);
//     e.target.reportValidity();

//     if (e.target.name === "email") {
//       setEmailError(""); // Reset email check when typing
//     }
//   };

//   // Real-time email existence check (on blur)
//   const handleEmailBlur = async () => {
//     if (!formData.email) return;

//     try {
//       const res = await axios.post("http://localhost:5000/api/check-email", {
//         email: formData.email,
//       });

//       if (res.data.exists) {
//         setEmailError("This email is already registered.");
//       } else {
//         setEmailError("");
//       }
//     } catch (err) {
//       console.error("Email check failed", err);
//     }
//   };

//   // Handle submit
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Final validation
//     for (const [key, value] of Object.entries(formData)) {
//       const error = validateField(key, value);
//       const input = e.target.elements[key];
//       if (input) {
//         input.setCustomValidity(error);
//         if (error) {
//           input.reportValidity();
//           return;
//         }
//       }
//     }

//     if (emailError) {
//       setMessage(emailError);
//       setMessageType("error");
//       return;
//     }

//     try {
//       const res = await axios.post(
//         "http://localhost:5000/api/register",
//         formData
//       );

//       if (res.data.success) {
//         setMessage("Registration successful. Redirecting to login...");
//         setMessageType("success");
//         setTimeout(() => navigate("/login"), 1500);
//       } else {
//         setMessage(res.data.message || "Registration failed.");
//         setMessageType("error");
//       }
//     } catch (error) {
  
//   console.error("Registration error:", error.response?.data || error.message);

//   const backendMessage = error.response?.data?.message || "";
//   const errMsg = backendMessage.toLowerCase();

//   if (errMsg.includes("email")) {
//   setMessage("This email is already registered. Please use a different one.");
// } else if (errMsg.includes("phone")) {
//   setMessage("This phone number is already registered. Please use a different one.");
// } else if (errMsg.includes("password")) {
//   setMessage("This password is already in use. Please choose a different one.");
// } else if (errMsg.includes("name")) {
//   setMessage("This name is already taken. Please choose another.");
// } else {
//   setMessage("An unexpected error occurred. Please try again.");
// }

//   setMessageType("error");
// }

//   };

//   return (
//     <div className="register-container">
//       <div className="left-panel">
//         <img
//           src="/register.png"
//           alt="Register Illustration"
//           className="panel-image"
//         />
//       </div>

//       <div className="right-panel">
//         <div className="form-box">
//           <h2>Create your Account</h2>

//           <form onSubmit={handleSubmit}>
//             <input
//               type="text"
//               name="fullName"
//               placeholder="Full Name"
//               value={formData.fullName}
//               onChange={handleChange}
//               required
//             />

//             <input
//               type="text"
//               name="phone"
//               placeholder="+91XXXXXXXXXX"
//               value={formData.phone}
//               onChange={handleChange}
//               required
//             />

//             <input
//               type="email"
//               name="email"
//               placeholder="Email"
//               value={formData.email}
//               onChange={handleChange}
//               onBlur={handleEmailBlur}
//               required
//             />
//             {emailError && (
//               <p style={{ color: "red", fontSize: "0.9rem" }}>{emailError}</p>
//             )}

//             <input
//               type="password"
//               name="password"
//               placeholder="Password"
//               value={formData.password}
//               onChange={handleChange}
//               required
//             />

//             <input
//               type="password"
//               name="confirmPassword"
//               placeholder="Confirm Password"
//               value={formData.confirmPassword}
//               onChange={handleChange}
//               required
//             />

//             <button type="submit">Register</button>
//           </form>

//           {message && (
//             <p
//               style={{
//                 color: messageType === "success" ? "green" : "red",
//                 textAlign: "center",
//                 fontWeight: "bold",
//               }}
//             >
//               {message}
//             </p>
//           )}

//           <p style={{ textAlign: "center" }}>
//             Already have an account? <Link to="/login">Login</Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }









import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Register.css";

export default function Registration() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "+91",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [emailError, setEmailError] = useState(""); 
  const navigate = useNavigate();

  // ✅ Validation logic
  const validateField = (name, value) => {
    let errorMessage = "";

    if (name === "fullName") {
      if (!value.trim()) {
        errorMessage = "Full name is required.";
      } else if (!/^[A-Za-z\s]+$/.test(value)) {
        errorMessage = "Full name can only contain letters and spaces.";
      }
    }

    if (name === "phone") {
      const digitsOnly = value.slice(3);
      if (!digitsOnly.trim()) {
        errorMessage = "Phone number is required.";
      } else if (!/^[987]/.test(digitsOnly)) {
        errorMessage = "Phone must start with 9, 8, or 7.";
      } else if (digitsOnly.length !== 10) {
        errorMessage = "Phone must be exactly 10 digits.";
      }
    }

    if (name === "email") {
      if (!value.trim()) {
        errorMessage = "Email is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errorMessage = "Please enter a valid email.";
      }
    }

    if (name === "password") {
      const strongPasswordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
      if (!strongPasswordRegex.test(value)) {
        errorMessage =
          "Password must have 8+ chars, uppercase, lowercase, number, special char.";
      }
    }

    if (name === "confirmPassword") {
      if (value !== formData.password) {
        errorMessage = "Passwords do not match.";
      }
    }

    return errorMessage;
  };

  // ✅ Handle input change
  const handleChange = (e) => {
    let value = e.target.value;

    if (e.target.name === "fullName") {
      value = value.replace(/[^A-Za-z\s]/g, "");
    }

    if (e.target.name === "phone") {
      if (!value.startsWith("+91")) {
        value = "+91";
      }
      const prefix = "+91";
      let digits = value.slice(prefix.length).replace(/\D/g, "");
      if (digits.length > 10) digits = digits.slice(0, 10);
      value = prefix + digits;
    }

    if (e.target.name === "email") {
      value = value.toLowerCase();
    }

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: value,
    }));

    const error = validateField(e.target.name, value);
    e.target.setCustomValidity(error);
    e.target.reportValidity();

    if (e.target.name === "email") {
      setEmailError("");
    }
  };

  // ✅ Email existence check
  const handleEmailBlur = async () => {
    if (!formData.email) return;
    try {
      const res = await axios.post("http://localhost:5000/api/check-email", {
        email: formData.email,
      });
      if (res.data.exists) {
        setEmailError("This email is already registered.");
      } else {
        setEmailError("");
      }
    } catch (err) {
      console.error("Email check failed", err);
    }
  };

  // ✅ Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    for (const [key, value] of Object.entries(formData)) {
      const error = validateField(key, value);
      const input = e.target.elements[key];
      if (input) {
        input.setCustomValidity(error);
        if (error) {
          input.reportValidity();
          return;
        }
      }
    }

    if (emailError) {
      setMessage(emailError);
      setMessageType("error");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/register",
        formData
      );

      if (res.data.success) {
        setMessage("Registration successful. Redirecting to login...");
        setMessageType("success");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMessage(res.data.message || "Registration failed.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Registration error:", error.response?.data || error.message);

      const backendMessage = error.response?.data?.message || "";
      const errMsg = backendMessage.toLowerCase();

      if (errMsg.includes("email")) {
        setMessage("This email is already registered. Please use a different one.");
      } else if (errMsg.includes("phone")) {
        setMessage("This phone number is already registered. Please use a different one.");
      } else if (errMsg.includes("password")) {
        setMessage("This password is already in use. Please choose a different one.");
      } else if (errMsg.includes("name")) {
        setMessage("This name is already taken. Please choose another.");
      } else {
        setMessage("An unexpected error occurred. Please try again.");
      }
      setMessageType("error");
    }
  };

  // ✅ Styled layout (new design)
  return (
    <div className="register-wrapper" style={{ width: "100vw", minHeight: "100vh" }}>
      <div className="register-card">
        <div className="register-left">
          <h1 className="brand">GasWatch</h1>
          <h2>Create Your Account</h2>
          <p className="subtitle">
            Your partner in ensuring a safe environment.
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="phone"
              placeholder="+91XXXXXXXXXX"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleEmailBlur}
              required
            />
            {emailError && (
              <p className="error-text">{emailError}</p>
            )}

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <button type="submit" className="register-btn">Register</button>
          </form>

          {message && (
            <p className={messageType === "success" ? "success-text" : "error-text"}>
              {message}
            </p>
          )}

          <p className="login-link">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>

        <div className="register-right">
          <img src="/register.png" alt="Gas IoT" />
        </div>
      </div>
    </div>
  );
}
