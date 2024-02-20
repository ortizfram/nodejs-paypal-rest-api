import { useContext, useState } from "react";
import { UserContext } from "../hooks/UserContext.js";
import axios from "axios";
import {jwtDecode} from "jwt-decode"; 
import {useNavigate} from 'react-router-dom';

import "../public/css/login.css"; 

const Login = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const [email, setEmail] = useState(""); // Define the email state variable
  const [password, setPassword] = useState("");
  const [backendMessage, setBackendMessage] = useState("");

  const refreshToken = async () => {
    try {
      const res = await axios.post("/refresh", { token: user.refreshToken });
      setUser({
        ...user,
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      });
      return res.data;
    } catch (error) {
      console.log(error);
    }
  };

  const axiosJWT = axios.create();

  // Refresh automatically
  axiosJWT.interceptors.request.use(
    async (config) => {
      let currentDate = new Date();
      if (user && user.accessToken) {
        const decodedToken = jwtDecode(user.accessToken);
        if (decodedToken.exp * 1000 < currentDate.getTime()) {
          try {
            const data = await refreshToken();
            config.headers.authorization = "Bearer " + data.accessToken;
          } catch (error) {
            console.log(error);
          }
        }
      }
      return config;
    },
    (err) => {
      return Promise.reject(err);
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/login", { email, password }); // Use email instead of username
      setUser(res.data);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="login-container flex flex-column">
      <div className="">
        <h1 className="section-title">Ingresar</h1>
      </div>
      <div className="">
        <form onSubmit={handleSubmit} className="login-form">
          {/* Render backend message */}
          {backendMessage && <p className="error-message">{backendMessage}</p>}
          <label>Email</label>
          <input type="text" onChange={(e) => setEmail(e.target.value)} />
          <label>Password</label>
          <input
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
