import axios from "axios";
import { useUserContext } from "../hooks/UserContext";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();
  const { setUserData } = useUserContext();

  const handleLogout = async () => {
    try {
      // Make an API request to log the user out on the server
      await axios.post('/logout');

      // Clear user data from localStorage on logout
      localStorage.removeItem('userData');
      
      // Reset user data in the context
      setUserData(null);

      // Perform other logout actions as needed
      console.log('Logout successful');

      // Redirect the user to the home page after logout
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Logout;