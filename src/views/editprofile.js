import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/editprofile.css'; // Import the new CSS file

function EditProfile() {
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
  });

  const [success, setSuccess] = useState(false);
  const [dobError, setDobError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [mobileError, setMobileError] = useState('');
  const navigate = useNavigate();
  const salutations = ['Mr.', 'Mrs.'];

    useEffect(() => {
    async function fetchProfile() {
      console.log("1. Starting to fetch profile data...");
      try {
        const userRes = await fetch('http://localhost:5000/api/user/me', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        console.log("2. Fetched /api/user/me. Status:", userRes.status);

        if (userRes.ok) {
          const userData = await userRes.json();
          console.log("3. User data received:", userData);
          const userEmail = userData.email;

          if (userEmail) {
            console.log("4. Fetching KYC data for:", userEmail);
            const kycRes = await fetch(`http://localhost:5000/api/kyc/user/me?email=${encodeURIComponent(userEmail)}`);
            console.log("5. Fetched /api/kyc/user/me. Status:", kycRes.status);

            if (kycRes.ok) {
              const kycData = await kycRes.json();
              console.log("6. KYC data received:", kycData);

              // *** SAFER CODE HERE ***
              if (kycData) { // Check if kycData is not null
                if (kycData.dob) {
                  kycData.dob = new Date(kycData.dob).toISOString().split('T')[0];
                }
                setFormData(kycData);
                console.log("7. Form state has been set.");
              } else {
                 console.error("KYC Data is null or undefined. This user may not have submitted a new connection form.");
                 alert("Could not find a profile for this user. Please complete the 'New Connection' form first.");
                 navigate('/kyc'); // Redirect to the form
              }
            } else if (kycRes.status === 404) {
                console.error("KYC data not found for this user on the server.");
                alert("Could not find your profile details. Please complete the 'New Connection' form first.");
                navigate('/kyc'); // Redirect to the form
            }
          }
        } else {
            console.error("Could not verify user. Are you logged in?");
            navigate('/login'); // Redirect to login if not authenticated
        }
      } catch (err) {
        console.error("A critical error occurred during fetchProfile:", err);
      }
    }
    fetchProfile();
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate DOB: must be at least 18 years old
    setDobError("");
    if (!formData.dob) {
      setDobError('Date of Birth is required.');
      return;
    }
    const today = new Date();
    const birthDate = new Date(formData.dob);
    birthDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      setDobError('You must be at least 18 years old.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/kyc/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/profileupdated', { state: { updatedProfile: formData } }); // Pass updated profile
        }, 2000);
      } else {
        const err = await res.json();
        alert(err.message || 'Update failed');
      }
    } catch (error) {
      console.error(error);
      alert('Server error. Please try again later.');
    }
  };


  return (
    // Use the new class names from EditProfile.css
    <form className="edit-profile-container" onSubmit={handleSubmit}>
      <h2>Edit Profile</h2>
      <fieldset className="edit-profile-section">
        <legend>1) Personal Details</legend>
        <label>
          Salutation:
          <select name="salutation" value={formData.salutation} onChange={handleChange}>
            <option value="">--Select--</option>
            {salutations.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>

        <div className="edit-profile-row">
          <label>
            First Name:
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} />
          </label>
          <label>
            Last Name:
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} />
          </label>
        </div>

        <label>
          Date of Birth:
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
          />
          {dobError && <span style={{ color: 'red' }}>{dobError}</span>}
        </label>

        <fieldset>
          <legend>Close Relative (Fill at least one)</legend>
          <label>
            Father's Name:
            <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} />
          </label>
          <label>
            Mother's Name:
            <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} />
          </label>
          <label>
            Spouse Name:
            <input type="text" name="spouseName" value={formData.spouseName} onChange={handleChange} />
          </label>
        </fieldset>
      </fieldset>

      {/* Address Section */}
      <fieldset className="edit-profile-section">
        <legend>2) Address for LPG connection / Contact Information</legend>
        <label>
          House / Flat #, Name*:
          <input type="text" name="houseName" value={formData.houseName} onChange={handleChange} required />
        </label>
        <label>
          Floor No:
          <input type="text" name="floorNo" value={formData.floorNo} onChange={handleChange} />
        </label>
        <label>
          Housing Complex/Building:
          <input type="text" name="housingComplex" value={formData.housingComplex} onChange={handleChange} />
        </label>
        <label>
          Street/Road Name:
          <input type="text" name="streetName" value={formData.streetName} onChange={handleChange} />
        </label>
        <label>
          Landmark*:
          <input type="text" name="landmark" value={formData.landmark} onChange={handleChange} required />
        </label>
        <label>
          City/Town/Village:
          <input type="text" name="city" value={formData.city} onChange={handleChange} />
        </label>
        <label>
          State*:
          <input type="text" name="state" value={formData.state} onChange={handleChange} required />
        </label>
        <label>
          District*:
          <input type="text" name="district" value={formData.district} onChange={handleChange} required />
        </label>
        <label>
          Pin Code:
          <input
            type="text"
            name="pinCode"
            value={formData.pinCode}
            onChange={handleChange}
            required
            maxLength={6}
          />
        </label>
        <label>
          Mobile Number*:
          <input
            type="tel"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleChange}
            required
            pattern="[987]\d{9}"
            title="Enter a valid 10-digit mobile number starting with 9, 8, or 7"
            maxLength={10}
          />
          {mobileError && <span style={{ color: 'red' }}>{mobileError}</span>}
        </label>
        <label>
          Email ID*:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            readOnly // Keep email as read-only
            title="Email cannot be changed."
          />
          {emailError && <span style={{ color: 'red' }}>{emailError}</span>}
        </label>
      </fieldset>

      <div className="edit-profile-submit">
        <button type="submit">Update Profile</button>
      </div>
      {success && (
        <div style={{ marginTop: '1.5rem', color: '#388e3c', fontWeight: 600 }}>
          Profile updated successfully!
        </div>
      )}
    </form>
  );
}

export default EditProfile;