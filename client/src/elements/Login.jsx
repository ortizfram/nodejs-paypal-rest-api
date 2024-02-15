import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../hooks/UserContext.js";
import "../public/css/login.css"; // Import your custom CSS file

const Login = () => {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [backendMessage, setBackendMessage] = useState("");

  useEffect(() => {
    // Check if user data exists in session
    const userFromSession = JSON.parse(localStorage.getItem("user"));
    if (userFromSession) {
      setUser(userFromSession);
    }
  }, [setUser]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5001/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (response.ok) {
        setUser(data.user); // Update the user state in the App component
        localStorage.setItem("user", JSON.stringify(data.user)); // Save user data to local storage
        const next = data.redirectUrl;
        if (data.status === "success") {
          alert("Login successful");
          navigate(next);
        } else {
          setBackendMessage(data.message);
        }
      } else {
        setBackendMessage(data.message);
      }
    } catch (error) {
      setBackendMessage(
        "An error occurred during login. Please check your credentials."
      );
    }
  };

  useEffect(() => {
    // Check if user data exists in session
    const userFromSession = JSON.parse(localStorage.getItem("user"));
    if (userFromSession) {
      setUser(userFromSession);
    }
  }, [setUser]);

  return (
    <div className="login-container flex flex-column">
      <div className="">

      <h1 className="section-title">Ingresar</h1>
      </div>
      <div className="">

      <form onSubmit={handleLogin} className="login-form">
        {/* Render backend message */}
        {backendMessage && (
          <p className="error-message">{backendMessage}</p>
        )}
        <label>Email</label>
        <input type="text" onChange={(e) => setEmail(e.target.value)} />
        <label>Password</label>
        <input type="password" onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" className="login-button">Login</button>
      </form>
      </div>

    </div>
  );
};

export default Login;
