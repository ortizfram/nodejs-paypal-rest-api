import React, { useState } from 'react';
import axios from 'axios';


const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [backendMessage, setBackendMessage] = useState(null);
  
    const handleForgotPasswordSubmit = async (e) => {
      e.preventDefault();
  
      try {
        const response = await axios.post("http://localhost:5001/api/forgot-password", { email }, { headers: { "Content-Type": "application/json" } });
  
        if (response.data.message) {
          setBackendMessage(response.data.message);
          // Handle success, e.g., redirect or show a success message
        } else if (response.data.error) {
          setBackendMessage(response.data.error);
        } else {
          setBackendMessage('Unexpected response format. Please try again.');
          console.error('Unexpected response format:', response);
        }
      } catch (error) {
        setBackendMessage('An error occurred while processing the request. Please try again.');
        console.error('Error:', error);
      }
    };
  
    return (
      <div id="forgot-password-container" style={{ margin: '6.2rem auto' }}>
        <h1 className="section-title">Forgot Password</h1>
        <form onSubmit={handleForgotPasswordSubmit} encType="multipart/form-data">
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            type="text"
            id="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          /><br />
          <button type="submit">Recuperar</button>
        </form>
        {backendMessage && <p>{backendMessage}</p>}
      </div>
    );
  };
  
  export default ForgotPassword;
