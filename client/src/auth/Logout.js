import axios from "axios";
import { UserContext } from "../hooks/UserContext.js";
import { useNavigate } from "react-router-dom";

const CompLogout = () => {
  const navigate = useNavigate();
  const { setUserData } = useAuth();

  const handleLogout = async () => {
    try {
      // Make an API request to log the user out on the server
      await axios.post('http://localhost:6004/api/logout');

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

export default CompLogout;
