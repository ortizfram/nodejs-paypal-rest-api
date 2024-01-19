import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const URI_signup = "http://localhost:5000/api/signup";

const CompSignup = () => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(URI_signup, {
        username,
        name,
        email,
        password,
      });
      navigate("/");
    } catch (error) {
      console.error("Error Signing up:", error);
    }
  };

  return (
    <div id="signup-page-container">
      <div id="signup-content-container">
        <div className="section-title1">
          <h1 className="text-white">Registrar</h1>
        </div>

        <form onSubmit={handleSignupSubmit}>
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

export default CompSignup;
