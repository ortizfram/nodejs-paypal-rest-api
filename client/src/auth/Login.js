import axios from "axios";
import { useState } from "react";
import { useUserContext } from "../hooks/UserContext";
import { useNavigate } from "react-router-dom";


const CompLogin = () => {
  
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUserData } = useUserContext();


  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        email,
        password
      });

      // Assuming your server responds with user data upon successful login
      const userData = response.data.user;
      const next = response.data.redirectUrl;
      console.log(next)

      // Set the user data in the context
      setUserData(userData);
      // Set user data in localStorage
      localStorage.setItem('userData', JSON.stringify(userData));

      // Do something with the user data (e.g., redirect to Home)
      console.log('Login successful:', userData);
      navigate(next)
      
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
