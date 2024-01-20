import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const URI = "http://localhost:5000/api/login";

const CompLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [backendMessage, setBackendMessage] = useState("");

  const loginUser = async (email, password) => {
    try {
      const response = await axios.post(URI, {
        email: email,
        password: password,
      });

      if (response.data.error) {
        setBackendMessage(response.data.error);
        console.error("Error logging in:", response.data.error);
      } else if (response.data.user) {
        setBackendMessage(response.data.message);
        console.log("Login successful:", response.data.message);
        navigate("/");
      } else {
        setBackendMessage("Unexpected response format. Please try again.");
        console.error("Unexpected response format:", response.data);
      }
    } catch (error) {
      setBackendMessage("An error occurred while logging in. Please try again.");
      console.error("Error logging in:", error);
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    loginUser(email, password);
  };


  return (
    <>
      <div id="login-page-container">
        <div id="login-page-content">

        
          <div className="section-title">
            <h1 className="text-white">Ingresa</h1>
          </div>

          <form onSubmit={handleLoginSubmit} className="vertical-form">

        {backendMessage && <p>{backendMessage}</p>}
        
            <input
              type="text"
              value={email}
              name="email"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              value={password}
              name="password"
              placeholder="contraseña"
              onChange={(e) => setPassword(e.target.value)}
            />
            <input type="submit" value="Login" />
          </form>
          <div className="links-container">
            <p>
              <a className="text-white" href="/api/signup">
                No tengo cuenta aún.
              </a>
            </p>
            <p>
              <a className="text-white" href="/api/forgot-password">
                Olvidaste tu contraseña ?
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompLogin;
