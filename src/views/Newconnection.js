import React, { useState } from 'react';
import '../styles/Newconnection.css'; // Fix the import path case


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
    poaCategory: '',
    poaDetail: '',
    houseName: '',
    floorNo: '',
    housingComplex: '',
    streetName: '',
    landmark: '',
    city: '',
    state: '',
    district: '',
    distributor: '',
    pinCode: '',
    mobileNumber: '',
    telephoneNumber: '',
    email: '',
  });

  const salutations = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.'];
  const poaCategories = [
    'Electricity Bill',
    'Water Bill',
    'Passport',
    'Aadhar Card',
    'Voter ID',
    'Driving License',
  ];
  const pinCodes = ['123456', '654321', '112233', '445566']; // example options

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Handle form submission logic here
    console.log('Form Data:', formData);
    alert('Form submitted successfully!');
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '900px', margin: 'auto', padding: '20px', fontFamily: 'Arial, sans-serif', background: '#fff', borderRadius: '6px', boxShadow: '0 0 12px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center' }}>Know Your Customer (KYC) Form</h2>
      <p style={{ textAlign: 'center', color: 'red' }}>*Mandatory Fields</p>
      <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#444' }}>
        Only A-Z, a-z, 0-9, Comma (,), Hyphen (-) and Slash (/) are allowed. No other special character is allowed in any entry field.
      </p>
      <p style={{ textAlign: 'center', color: '#1a73e8', cursor: 'pointer', marginBottom: '20px' }}>Request For New Connection</p>

      {/* 1) Personal Details */}
      <fieldset style={{ marginBottom: '30px', border: 'none' }}>
        <legend style={{ backgroundColor: '#1a237e', color: '#fff', padding: '10px', fontWeight: 'bold', fontSize: '1.1rem' }}>
          1) Personal Details
        </legend>

        <label>
          Salutation*:
          <select name="salutation" value={formData.salutation} onChange={handleChange} required>
            <option value="">--Select--</option>
            {salutations.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <label style={{ flex: 1 }}>
            First Name*:
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
          </label>
          <label style={{ flex: 1 }}>
            Middle Name:
            <input type="text" name="middleName" value={formData.middleName} onChange={handleChange} />
          </label>
          <label style={{ flex: 1 }}>
            Last Name*:
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
          </label>
        </div>

        <label style={{ marginTop: '10px', display: 'block' }}>
          Date of Birth*:
          <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
        </label>

        <fieldset style={{ border: '1px solid #ccc', padding: '10px', marginTop: '15px' }}>
          <legend style={{ fontWeight: 'bold' }}>Close Relative</legend>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label style={{ flex: 1 }}>
              Father's Name*:
              <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} required />
            </label>
            <span>OR</span>
            <label style={{ flex: 1 }}>
              Spouse Name*:
              <input type="text" name="spouseName" value={formData.spouseName} onChange={handleChange} required />
            </label>
          </div>
          <label style={{ marginTop: '10px', display: 'block' }}>
            Mother's Name*:
            <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} required />
          </label>
        </fieldset>
      </fieldset>

      {/* 2) Address */}
      <fieldset style={{ marginBottom: '30px', border: 'none' }}>
        <legend style={{ backgroundColor: '#1a237e', color: '#fff', padding: '10px', fontWeight: 'bold', fontSize: '1.1rem' }}>
          2) Address for LPG connection / Contact Information
        </legend>

        <p>
          Proof of Address (POA) <a href="/some-valid-path" style={{ color: '#1a73e8', textDecoration: 'none' }}>click here to know list of accepted documents</a>
        </p>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <label style={{ flex: '1 1 300px' }}>
            POA Category*:
            <select name="poaCategory" value={formData.poaCategory} onChange={handleChange} required>
              <option value="">--Select--</option>
              {poaCategories.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>

          <label style={{ flex: '2 1 300px' }}>
            POA Detail*:
            <input type="text" name="poaDetail" value={formData.poaDetail} onChange={handleChange} required />
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
          <label style={{ flex: '1 1 300px' }}>
            House / Flat #, Name*:
            <input type="text" name="houseName" value={formData.houseName} onChange={handleChange} required />
          </label>

          <label style={{ flex: '1 1 150px' }}>
            Floor No*:
            <input type="text" name="floorNo" value={formData.floorNo} onChange={handleChange} />
          </label>

          <label style={{ flex: '1 1 300px' }}>
            Housing Complex/Building*:
            <input type="text" name="housingComplex" value={formData.housingComplex} onChange={handleChange} required />
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
          <label style={{ flex: '1 1 300px' }}>
            Street/Road Name*:
            <input type="text" name="streetName" value={formData.streetName} onChange={handleChange} required />
          </label>

          <label style={{ flex: '1 1 300px' }}>
            Land Mark*:
            <input type="text" name="landmark" value={formData.landmark} onChange={handleChange} required />
          </label>

          <label style={{ flex: '1 1 300px' }}>
            City/Town/Village*:
            <input type="text" name="city" value={formData.city} onChange={handleChange} required />
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
          <label style={{ flex: '1 1 300px' }}>
            State*:
            <input type="text" name="state" value={formData.state} onChange={handleChange} required />
          </label>

          <label style={{ flex: '1 1 300px' }}>
            District*:
            <input type="text" name="district" value={formData.district} onChange={handleChange} required />
          </label>

          <label style={{ flex: '1 1 300px' }}>
            Distributor:
            <input type="text" name="distributor" value={formData.distributor} onChange={handleChange} />
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
          <label style={{ flex: '1 1 300px' }}>
            Pin Code*:
            <select name="pinCode" value={formData.pinCode} onChange={handleChange} required>
              <option value="">--Select--</option>
              {pinCodes.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>

          <label style={{ flex: '1 1 300px' }}>
            Mobile Number*:
            <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} required />
          </label>

          <label style={{ flex: '1 1 300px' }}>
            Telephone Number:
            <input type="tel" name="telephoneNumber" value={formData.telephoneNumber} onChange={handleChange} />
            <small>(With STD Code without prefixing '0')</small>
          </label>
        </div>

        <label style={{ display: 'block', marginTop: '10px' }}>
          Email ID*:
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </label>
      </fieldset>

      {/* 3) Other Relevant Details */}
      <fieldset style={{ border: 'none' }}>
        <legend style={{ backgroundColor: '#1a237e', color: '#fff', padding: '10px', fontWeight: 'bold', fontSize: '1.1rem' }}>
          3) Other Relevant Details
        </legend>

        {/* You can add other relevant details inputs here */}
      </fieldset>

      <p style={{ textAlign: 'center', marginTop: '20px', color: '#1a73e8', cursor: 'pointer' }}>
        Already have a connection? <a href="/some-valid-path">Click here</a>
      </p>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button type="submit" style={{ padding: '10px 30px', backgroundColor: '#1a237e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Submit
        </button>
      </div>
    </form>
  );
}

export default KYCForm;
