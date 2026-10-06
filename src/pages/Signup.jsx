import React, { useState } from 'react';
import Navbar from '../components/Navbar';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',         
    accountType: 'buyer'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('http://localhost:3000/api/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create an account');
      }

      setSuccess(true);
      setLoading(false);
      console.log('Account created successfully:', data);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <Navbar />
      <div className="auth-container">
        <h2>Create a New Account</h2>
        
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {success && <p style={{ color: 'green' }}>Account created successfully! You can now login.</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              name="name"
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              name="email"
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="tel" 
              name="phone"
              value={formData.phone} 
              onChange={handleChange} 
              placeholder="e.g., +973XXXXXXXX"
            />
          </div>

          <div className="form-group">
            <label>Account Type</label>
            <select 
              name="accountType" 
              value={formData.accountType} 
              onChange={handleChange}
            >
              <option value="buyer">Customer / Buyer</option>
              <option value="store_owner">Store Owner</option>
            </select>
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <p>Already have an account? <a href="/login">Login</a></p>
      </div>
    </div>
  );
}