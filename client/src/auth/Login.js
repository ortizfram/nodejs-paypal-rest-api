import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const URI = "http://localhost:5000/api/login";

const CompLogin = () => {

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e) =>{
    e.preventDefault()
    console.log({'username':username,'password':password})
  }

  return (
     <div>
      <form>
        <label>Username</label>
        <input type="text" onChange={(e)=>{setUsername(e.target.value)}}/>
        <label>Password</label>
        <input type="password"  onChange={(e)=>{setPassword(e.target.value)}}/>
        <button onClick={handleLogin}>Login</button>
      </form>
     </div>
  );
};

export default CompLogin;
