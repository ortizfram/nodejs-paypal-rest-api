import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ResetPassword = () => {
    const { id, token } = useParams();
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [message, setMessage] = useState(null);

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();


    try {
      const response = await axios.post(
        `http://localhost:5000/api/reset-password/${id}/${token}`,
        { password, repeat_password: repeatPassword }
      );

      if (response.data.message) {
        setMessage(response.data.message);
        // Handle success, e.g., redirect or show a success message
      } else {
        setMessage(response.data.error || 'Unexpected response format. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred while processing the request. Please try again.');
      console.error('Error:', error);
    }
  };

  return (
    <div id="reset-password-container" style={{ margin: '6.2rem auto' }}>
      <h1 className="section-title">Reset Password</h1>
      <form onSubmit={handleResetPasswordSubmit} encType="multipart/form-data">
        <label htmlFor="password" className="label">
          New Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br />
        <label htmlFor="repeat-password" className="label">
          Repeat Password
        </label>
        <input
          type="password"
          id="repeat-password"
          name="repeat-password"
          placeholder="Repeat Password"
          value={repeatPassword}
          onChange={(e) => setRepeatPassword(e.target.value)}
        /><br />
        <button type="submit">Reset Password</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ResetPassword;
