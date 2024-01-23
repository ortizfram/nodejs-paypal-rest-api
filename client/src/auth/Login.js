import axios from "axios";
import { useState } from "react";

const CompLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        email,
        password
      });

      // Assuming your server responds with user data upon successful login
      const userData = response.data.user;

      // Do something with the user data (e.g., redirect to a dashboard)
      console.log('Login successful:', userData);
    } catch (error) {
      console.error('Login failed:', error.response.data.error);
    }
  };

  return (
    <div>
      <form>
        <label>Email</label>
        <input type="text" onChange={(e) => setEmail(e.target.value)} />
        <label>Password</label>
        <input type="password" onChange={(e) => setPassword(e.target.value)} />
        <button onClick={handleLogin}>Login</button>
      </form>
    </div>
  );
};

export default CompLogin;
