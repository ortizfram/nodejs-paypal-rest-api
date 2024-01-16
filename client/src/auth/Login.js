import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// NodeJS endpoint reference
const URI = "http://localhost:3000/api/login";

const CompLogin = () => {

    //   declare form fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {

  }, []);

  //procedimiento guardar -----------------------------------
  const loginUser = async (e) => {
    try {
      e.preventDefault();
      await axios.post(URI, {
        username: username,
        password: password,
      });
      navigate("/");
    } catch (error) {
      console.error("Error loginin:", error);
    }
  };

return (
<>
<div id="login-page-container">
  <div id="login-page-content">
    <div class="section-title">
      <h1 class="text-white">Ingresa</h1>
    </div>

    <form onSubmit={loginUser}  class="vertical-form">
      <input type="text" value={username} name="username" placeholder="Nombre de Usuario" onChange={(e) => setUsername(e.target.value)}/>
      <input type="password" value={password} name="password" placeholder="contraseña" onChange={(e) => setPassword(e.target.value)}/>
      <input type="submit" value="Login" />
    </form>
    <div class="links-container">
      <p><a class="text-white" href="/api/signup">No tengo cuenta aún.</a></p>
      <p>
        <a class="text-white" href="/api/forgot-password"
          >Olvidaste tu contraseña ?</a
        >
      </p>
    </div>
  </div>
</div>
</>
)
}

export default CompLogin;