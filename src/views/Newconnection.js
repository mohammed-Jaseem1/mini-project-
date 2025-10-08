import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/KYCForm.css';

function KYCForm() {
  const [formData, setFormData] = useState({
    salutation: '',
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '',
    fatherName: '',
    spouseName: '',
    motherName: '',
    houseName: '',
    floorNo: '',
    housingComplex: '',
    streetName: '',
    landmark: '',
    city: '',
    state: '',
    district: '',
    pinCode: '',
    mobileNumber: '',
    email: '',
    connectionType: 'Residential',
  });

  const [success, setSuccess] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [dobError, setDobError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const salutations = ['Mr.', 'Mrs.'];

  useEffect(() => {
    async function fetchUserDetails() {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:5000/api/user/me', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (res.ok) {
          const data = await res.json();
          setFormData((prev) => ({
            ...prev,
            mobileNumber: (data?.phone || data?.mobileNumber || '').toString(),
            email: (data?.email || '').toLowerCase(),
          }));
        }
      } catch {}
      setLoading(false);
    }
    fetchUserDetails();
  }, []);

  useEffect(() => {
    async function checkKYCStatusAndAction() {
      let userEmail = "";
      try {
        const userRes = await fetch('http://localhost:5000/api/user/me', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          userEmail = userData.email;
        }
      } catch {}
      if (!userEmail) return;
      try {
        const res = await fetch(`http://localhost:5000/api/kyc/status-and-action?email=${encodeURIComponent(userEmail)}`,
          {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          });
        if (res.ok) {
          const data = await res.json();
          if (data.redirectToPayment) {
            navigate('/payment');
          } else if (data.showRejectMessage) {
            setRejected(true);
          }
        }
      } catch {}
    }
    checkKYCStatusAndAction();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'pinCode') {
      let val = value.replace(/\D/g, '').slice(0, 6);
      setFormData((prev) => ({ ...prev, [name]: val }));
    } else if (name === 'mobileNumber') {
      setMobileError('');
      let val = value.replace(/\D/g, '').slice(0, 10);
      if (val.length > 0 && !/^[987]/.test(val)) val = '';
      setFormData((prev) => ({ ...prev, [name]: val }));
    } else if (name === 'email') {
      setEmailError('');
      setFormData((prev) => ({ ...prev, [name]: value.toLowerCase().trim() }));
    } else if (name === 'dob') {
      setDobError('');
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const isValidKeralaPinCode = (pin) => /^\d{6}$/.test(pin);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDobError('');
    setEmailError('');
    setMobileError('');
    setLoading(true);

    // Validate DOB
    if (!formData.dob) {
      setDobError('Date of Birth is required.');
      setLoading(false);
      return;
    }
    const today = new Date();
    const birthDate = new Date(formData.dob);
    birthDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    if (birthDate > today) {
      setDobError('Date of Birth cannot be in the future.');
      setLoading(false);
      return;
    }
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      setDobError('You must be at least 18 years old.');
      setLoading(false);
      return;
    }

    // Required fields
    const requiredFields = ['houseName', 'landmark', 'state', 'district', 'pinCode', 'mobileNumber', 'email'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        alert('Please fill all required fields.');
        setLoading(false);
        return;
      }
    }
    if (!isValidKeralaPinCode(formData.pinCode)) {
      alert('Please enter a valid 6-digit Pin Code.');
      setLoading(false);
      return;
    }
    if (!formData.fatherName && !formData.motherName) {
      alert("Please fill either Father's Name or Mother's Name.");
      setLoading(false);
      return;
    }

    // Check for duplicate email/mobileNumber
    try {
      const checkRes = await fetch('http://localhost:5000/api/kyc/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          mobileNumber: formData.mobileNumber
        }),
      });
      if (!checkRes.ok) {
        const errors = await checkRes.json();
        if (errors.email) setEmailError(errors.email);
        if (errors.mobileNumber) setMobileError(errors.mobileNumber);
        setLoading(false);
        return;
      }
    } catch (err) {
      setEmailError('❌ the gmail is already exist');
      setMobileError('❌ the mobile number is already exist');
      setLoading(false);
      return;
    }

    // Final verification against backend user
    let backendUser = null;
    try {
      const res = await fetch('http://localhost:5000/api/user/me', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        backendUser = await res.json();
      } else {
        setEmailError('Unable to verify user details. Please login again.');
        setMobileError('Unable to verify user details. Please login again.');
        setLoading(false);
        return;
      }
    } catch (err) {
      setEmailError('Unable to verify user details. Please try again.');
      setMobileError('Unable to verify user details. Please try again.');
      setLoading(false);
      return;
    }

    const enteredEmail = formData.email.trim().toLowerCase();
    const backendEmail = (backendUser.email || '').trim().toLowerCase();
    const enteredMobile = formData.mobileNumber.replace(/\D/g, '').slice(-10);
    const backendMobile = (backendUser.phone || backendUser.mobileNumber || '').replace(/\D/g, '').slice(-10);

    if (enteredEmail !== backendEmail) {
      setEmailError('The email must match your registered/login email.');
      setLoading(false);
      return;
    }
    if (enteredMobile !== backendMobile) {
      setMobileError('The mobile number must match your registered phone number.');
      setLoading(false);
      return;
    }

    // Submit KYC
    try {
      const res = await fetch('http://localhost:5000/api/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        const err = await res.json();
        alert(err.message || 'Submission failed');
      }
    } catch (error) {
      alert('Server error. Please try again later.');
    }
    setLoading(false);
  };

  if (rejected) {
    return (
      <div className="kyc-form-container" style={{ width: "100vw", minHeight: "100vh" }}>
        <h2>Know Your Customer (KYC) Form</h2>
        <div style={{ marginTop: '1.5rem', color: 'red', fontWeight: 600 }}>
          Sorry, your request has been rejected by the admin.
        </div>
      </div>
    );
  }

  return (
    <form className="kyc-form-container" style={{ width: "100vw", minHeight: "100vh" }} onSubmit={handleSubmit} autoComplete="off">
      <h2>Know Your Customer (KYC) Form</h2>
      <p className="blue-link">Request For New Connection</p>

      {/* Personal Details */}
      <fieldset className="kyc-form-section">
        <legend>Personal Details</legend>
        <div className="form-group">
          <label>
            Salutation:
            <select name="salutation" value={formData.salutation} onChange={handleChange} required>
              <option value="">--Select--</option>
              {salutations.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>
        <div className="form-group">
          <label>
            First Name:
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required autoComplete="off" />
          </label>
        </div>
        <div className="form-group">
          <label>
            Middle Name:
            <input type="text" name="middleName" value={formData.middleName} onChange={handleChange} autoComplete="off" />
          </label>
        </div>
        <div className="form-group">
          <label>
            Last Name:
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required autoComplete="off" />
          </label>
        </div>
        <div className="form-group">
          <label>
            Date of Birth:
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              required
              autoComplete="off"
            />
          </label>
        </div>
        {/* Show DOB error and age error below the DOB field */}
        {(dobError && dobError !== 'Date of Birth is required.') && (
          <div style={{ color: 'red', fontSize: '0.95rem', marginTop: '0.5rem' }}>
            {dobError}
          </div>
        )}
        <fieldset className="form-group">
          <legend>Close Relative (Fill at least one)</legend>
          <label>
            Father's Name:
            <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} autoComplete="off" />
          </label>
          <label>
            Mother's Name:
            <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} autoComplete="off" />
          </label>
          <label>
            Spouse Name:
            <input type="text" name="spouseName" value={formData.spouseName} onChange={handleChange} autoComplete="off" />
          </label>
        </fieldset>
      </fieldset>

      {/* Address Section */}
      <fieldset className="kyc-form-section">
        <legend>Address & Contact Information</legend>
        <div className="form-group">
          <label>
            House / Flat #, Name <span style={{color:"red"}}>*</span>:
            <input type="text" name="houseName" value={formData.houseName} onChange={handleChange} required autoComplete="off" />
          </label>
        </div>
        <div className="form-group">
          <label>
            Floor No:
            <input type="text" name="floorNo" value={formData.floorNo} onChange={handleChange} autoComplete="off" />
          </label>
        </div>
        <div className="form-group">
          <label>
            Housing Complex/Building:
            <input type="text" name="housingComplex" value={formData.housingComplex} onChange={handleChange} autoComplete="off" />
          </label>
        </div>
        <div className="form-group">
          <label>
            Street/Road Name:
            <input type="text" name="streetName" value={formData.streetName} onChange={handleChange} autoComplete="off" />
          </label>
        </div>
        <div className="form-group">
          <label>
            Landmark <span style={{color:"red"}}>*</span>:
            <input type="text" name="landmark" value={formData.landmark} onChange={handleChange} required autoComplete="off" />
          </label>
        </div>
        <div className="form-group">
          <label>
            City/Town/Village:
            <input type="text" name="city" value={formData.city} onChange={handleChange} autoComplete="off" />
          </label>
        </div>
        <div className="form-group">
          <label>
            State <span style={{color:"red"}}>*</span>:
            <input type="text" name="state" value={formData.state} onChange={handleChange} required autoComplete="off" />
          </label>
        </div>
        <div className="form-group">
          <label>
            District <span style={{color:"red"}}>*</span>:
            <input type="text" name="district" value={formData.district} onChange={handleChange} required autoComplete="off" />
          </label>
        </div>
        <div className="form-group">
          <label>
            Pin Code <span style={{color:"red"}}>*</span>:
            <input
              type="text"
              name="pinCode"
              value={formData.pinCode}
              onChange={handleChange}
              required
              maxLength={6}
              autoComplete="off"
            />
          </label>
        </div>
        <div className="form-group">
          <label>
            Mobile Number <span style={{color:"red"}}>*</span>:
            <input
              type="tel"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              required
              pattern="[987]\d{9}"
              title="Enter a valid 10-digit mobile number starting with 9, 8, or 7"
              maxLength={10}
              autoComplete="off"
            />
            {mobileError && <span style={{ color: 'red', fontSize: '0.95rem' }}>{mobileError}</span>}
          </label>
        </div>
        <div className="form-group">
          <label>
            Email ID <span style={{color:"red"}}>*</span>:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              title="Enter a valid email address"
              autoComplete="off"
            />
            {emailError && <span style={{ color: 'red', fontSize: '0.95rem' }}>{emailError}</span>}
          </label>
        </div>
        <div className="form-group">
          <label>
            Type of Gas Connection:
            <select name="connectionType" value={formData.connectionType} onChange={handleChange}>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
            </select>
          </label>
        </div>
      </fieldset>

      <div className="submit-button-container">
        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </div>
      {/* Show DOB/age error at the bottom if present */}
      {dobError && (
        <div style={{ color: 'red', fontSize: '1rem', marginTop: '1rem', textAlign: 'center' }}>
          {dobError}
        </div>
      )}
      {success && (
        <div style={{ marginTop: '1.5rem', color: '#388e3c', fontWeight: 600, textAlign: 'center' }}>
          Request submitted! Please wait for admin approval.<br />
          You will be redirected to payment page after approval.
        </div>
      )}
    </form>
  );
}

export default KYCForm;



