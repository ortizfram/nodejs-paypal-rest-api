import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// NodeJS endpoint reference
const URI = "http://localhost:3000/";  // Update the base URL

const CompHome = () => {
  const [home, setHome] = useState([]);

  useEffect(() => {
    getHome();
  }, []);

  // Fetch Home
  const getHome = async () => {
    try {
      const res = await axios.get(URI);  //  endpoint
      setHome(res.data);
    } catch (error) {
      console.error("Error fetching Home:", error);
    }
  };


  return (
    <div className="home-page-container">
        {/* <!-- hero --> */}
        <div class="hero-container home-hero">
            <img class="hero-logo" src={home/white-logo-buonavibra.png} alt="" />
        </div>
    </div>
  );
};

export default CompHome;
