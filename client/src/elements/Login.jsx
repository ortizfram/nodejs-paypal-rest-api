import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../hooks/UserContext";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [backendMessage, setBackendMessage] = useState("");
  const { setUserData,userData } = useUserContext();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      // fetch backendMessage
      setBackendMessage(data.message); // Use data.message from the response

      if (response.ok) {
        setUserData(data.user);
        console.log("setUserData:",userData)
        console.log("Login successful:", data.user);
        const next = data.redirectUrl; // Use data.redirectUrl from the response
        if (data.status === "success") {
          navigate(next);
        } else {
          console.error("Login failed:", data.message);
          if (data.status === "error") {
            setBackendMessage(data.message);
          }
        }
      } else {
        console.error("Login failed:", data.message); // Log the error message
        setBackendMessage(data.message);
      }
    } catch (error) {
      console.error("An error occurred during login:", error);
      setBackendMessage(
        "An error occurred during login. Please check your credentials."
      );
    }
  };

  return (
    <div>
      <form>
        {/* Render backend message */}
        {backendMessage && (
          <p style={{ color: "red" }}>{backendMessage}</p>
        )}
        <label>Email</label>
        <input type="text" onChange={(e) => setEmail(e.target.value)} />
        <label>Password</label>
        <input type="password" onChange={(e) => setPassword(e.target.value)} />
        <button onClick={handleLogin}>Login</button>
      </form>
    </div>
  );
};

export default Login;
