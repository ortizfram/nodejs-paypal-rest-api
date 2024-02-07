import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../hooks/UserContext.js";

const Login = () => {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [backendMessage, setBackendMessage] = useState("");

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

      if (response.ok) {
        setUser(data.user); // Update the user state in the App component
        const next = data.redirectUrl;
        if (data.status === "success") {
          navigate(next);
        } else {
          console.error("Login failed:", data.message);
          if (data.status === "error") {
            setBackendMessage(data.message);
          }
        }
      } else {
        console.error("Login failed:", data.message);
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
      <form onSubmit={handleLogin}>
        {/* Render backend message */}
        {backendMessage && (
          <p style={{ color: "red" }}>{backendMessage}</p>
        )}
        <label>Email</label>
        <input type="text" onChange={(e) => setEmail(e.target.value)} />
        <label>Password</label>
        <input type="password" onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
