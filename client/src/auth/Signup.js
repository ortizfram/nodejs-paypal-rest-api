import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// NodeJS endpoint reference
const URI_signup = "http://localhost:3000/api/signup";

const CompSignup = () => {

//   declare form fields
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  //procedimiento guardar -----------------------------------
  const register = async (e) => {
    try {
      e.preventDefault();
      await axios.post(URI_signup, {
        username: username,
        name: name,
        email: email,
        password: password,
      });
      navigate("/");
    } catch (error) {
      console.error("Error Signing up:", error);
    }
  };

  return (
    <div id="signup-page-container">
      <div id="signup-content-container">
        <div class="section-title1">
          <h1 class="text-white">Registrar</h1>
        </div>
        {/* username, name, email, password */}
        <form onSubmit={register}>
          <div className="mb-3"></div>
          <label>Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            className="form-control"
          />
          <div className="mb-3"></div>
          <label>Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            className="form-control"
          />
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="text"
            className="form-control"
          />
          <label>Contraseña</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="form-control"
          />
          <button type="submit" className="btn btn-primary">
            Registrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompSignup;
