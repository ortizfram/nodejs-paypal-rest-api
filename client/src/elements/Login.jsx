import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../hooks/UserContext.js";

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
      const response = await fetch("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log("\n\nDATA", data)

      if (response.ok) {
        setUser(data.user); // Update the user state in the App component
        localStorage.setItem("user", JSON.stringify(data.user)); // Save user data to local storage
        const next = data.redirectUrl;
        if (data.status === "success") {
          alert("Login successful");
          console.log("Login successful");
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
