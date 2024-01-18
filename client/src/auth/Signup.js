import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// NodeJS endpoint reference
const URI = "http://localhost:8081/api/signup";

function CompSignup() {
  // declare form fields
  const [values, setValues] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  // procedimiento guardar -----------------------------------
  //....
  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios
      .post(URI, values)
      .then((res) => {
        if (res.data.Status === "Success") {
          console.log("✨👨 =>> NEW USER Signed in");
          navigate('/api/login');
        } else {
          alert("Error");
        }
      })
      .catch((err) => console.log(err));
  };

  const { username, name, email, password } = values; // Destructure values

  return (
    <div id="signup-page-container">
      <div id="signup-content-container">
        <div className="section-title1">
          <h1 className="text-white">Registrar</h1>
        </div>
        {/* username, name, email, password */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3"></div>
          <input
            value={username}
            placeholder="Nombre de usuario"
            onChange={(e) =>
              setValues({ ...values, username: e.target.value })
            }
            type="text"
            className="form-control"
          />
          <div className="mb-3"></div>
          <input
            value={name}
            placeholder="Nombre"
            onChange={(e) => setValues({ ...values, name: e.target.value })}
            type="text"
            className="form-control"
          />
          <input
            value={email}
            placeholder="Email"
            onChange={(e) => setValues({ ...values, email: e.target.value })}
            type="text"
            className="form-control"
            />
          <input
            value={password}
            placeholder="Contraseña"
            onChange={(e) =>
              setValues({ ...values, password: e.target.value })
            }
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

