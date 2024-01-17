import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// NodeJS endpoint reference
const URI = "http://localhost:3000/api/login";

const CompLogin = () => {
  // declare form fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {}, []);

    // login procedure -----------------------------------
  const loginUser = async (username, password) => {
    try {
      const response = await axios.post(URI, {
        username: username,
        password: password,
      });

      if (response.data.error) {
        console.error("Error logging in:", response.data.error);
      } else {
        setUser(response.data.user);
        console.log("Login successful:", response.data.message);
        navigate("/");
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  // submit form -----------------------------------
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    // Get username and password from the form
    const username = e.target.username.value;
    const password = e.target.password.value;
    // Call the login function
    loginUser(username, password);
  };

return (
<>
<div id="login-page-container">
  <div id="login-page-content">
    <div class="section-title">
      <h1 class="text-white">Ingresa</h1>
    </div>

    <form onSubmit={handleLoginSubmit}  class="vertical-form">
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