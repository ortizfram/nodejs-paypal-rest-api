import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// NodeJS endpoint reference
const URI = "http://localhost:8081/api/login";

const CompLogin = () => {
  // declare form fields
  const [values, setValues] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  // submit form -----------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios
      .post(URI, values)
      .then((res) => {
        if (res.data.Status === "Success") {
          console.log("👨 =>> Logged in");
          navigate("/");
        } else {
          alert("Error");
        }
      })
      .catch((err) => console.log(err));
  };

  const { email, password } = values; // Destructure values

  return (
    <>
      <div id="login-page-container">
        <div id="login-page-content">
          <div class="section-title">
            <h1 class="text-white">Ingresa</h1>
          </div>

          <form onSubmit={handleSubmit} class="vertical-form">
            <input
              type="text"
              value={email}
              name="email"
              placeholder="Email"
              onChange={(e) => setValues({ ...values, email: e.target.value })}
              className="form-control"
              />
            <input
              type="password"
              value={password}
              name="password"
              placeholder="Contraseña"
              onChange={(e) => setValues({ ...values, password: e.target.value })}
              className="form-control"
            />
            <input type="submit" value="Login" />
          </form>
          <div class="links-container">
            <p>
              <a class="text-white" href="/api/signup">
                No tengo cuenta aún.
              </a>
            </p>
            <p>
              <a class="text-white" href="/api/forgot-password">
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
