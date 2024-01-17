import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// NodeJS endpoint reference
const URI_signup = "http://localhost:8081/api/signup";

function CompSignup() {
  //   declare form fields
  const [values, setValues] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate()

  //procedimiento guardar -----------------------------------
  //....
  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(URI_signup, values)
    .then(res => {
      if(res.data.Status === "Success") {
        navigate('/api/login')
      } else {
        alert("Error")
      }
    })
    .then(err => console.log(err))
  };

  return (
    <div id="signup-page-container">
      <div id="signup-content-container">
        <div class="section-title1">
          <h1 class="text-white">Registrar</h1>
        </div>
        {/* username, name, email, password */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3"></div>
          <label>Username</label>
          <input
            value={username}
            onChange={(e) => setValues({ ...values, username: e.target.value })}
            type="text"
            className="form-control"
          />
          <div className="mb-3"></div>
          <label>Nombre</label>
          <input
            value={name}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
            type="text"
            className="form-control"
          />
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setValues({ ...values, email: e.target.value })}
            type="text"
            className="form-control"
          />
          <label>Contraseña</label>
          <input
            value={password}
            onChange={(e) => setValues({ ...values, password: e.target.value })}
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
}

export default CompSignup;
