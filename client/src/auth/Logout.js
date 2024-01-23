import axios from "axios";
import { useState } from "react";
import { useUserContext } from "../hooks/UserContext";
import { useNavigate } from "react-router-dom";

const CompLogout = () => {
  const navigate = useNavigate();
  const { setUserData } = useUserContext();

  const handleLogout = async () => {
    try {
      // Clear user data from localStorage on logout
      localStorage.removeItem('userData');
      
      // Reset user data in the context
      setUserData(null);

      // Make an API request to log the user out on the server
      const response = await axios.post('http://localhost:5000/api/logout');

      // Perform other logout actions as needed
      console.log('Logout successful');

      // Redirect the user to the home page after logout
      const next = response.data.redirectUrl
      console.log(next)
      navigate(next);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

//   return (
//     <div>
//       <form>
//         {/* If needed, you can include a password field for additional security */}
//         <label>Password</label>
//         <input type="password" onChange={(e) => setPassword(e.target.value)} />
        
//         {/* Button triggers the logout function */}
//         <button onClick={handleLogout}>Logout</button>
//       </form>
//     </div>
//   );
};

export default CompLogout;
