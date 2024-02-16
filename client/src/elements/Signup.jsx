import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [backendMessage, setBackendMessage] = useState("");
  const navigate = useNavigate();

  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5002/signup", {
        username,
        name,
        email,
        password,
      });
      console.log("\nSign-up successful:", response.data);
      setBackendMessage(response.data.message); // Set backend message
      const next = response.data.redirectUrl
      console.log(next)
      navigate(next);
    } catch (error) {
      console.error("Error Signing up:", error);
      setBackendMessage(
        error.response.data.error || "Error during signup. Please try again."
      ); // Set backend message
    }
  };

  return (
    <div id="signup-page-container">
      <div id="signup-content-container">
        <div className="section-title1">
          <h1 className="text-white">Registrar</h1>
        </div>

        <form onSubmit={handleSignupSubmit}>
          {/* Render backend message */}
          {backendMessage && <p>{backendMessage}</p>}{" "}
          <div className="mb-3">
            <label>Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label>Nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="text"
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label>Contraseña</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="form-control"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Registrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
