import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import CompNavbar from "../template/Nabvar";
import CompFooter from "../template/Footer";

// NodeJS endpoint reference
const URI = `http://localhost:5000/api/course/create`;

const CompCourseCreate = () => {
  const [errorMessage, setErrorMessage] = useState(""); // Define errorMessage state
   // course form data declaration
   const [title, setTitle] = useState("");
   const [description, setDescription] = useState("");
   const [text_content, setTextContent] = useState("");
   const [video, setVideo] = useState("");
   const [thumbnail, setThumbnail] = useState("");
   const [ars_price, setARSPrice] = useState("");
   const [usd_price, setUSDPrice] = useState("");
   const [discount, setDiscount] = useState("");
   const navigate = useNavigate();

  // createCourse procedure ------------------------
  const handleFormSubmit = async (e) => {
    try {
      e.preventDefault();
      await axios.post(URI, {
        title: title,
        description: description,
        text_content: text_content,
        video: video,
        thumbnail: thumbnail,
        ars_price: ars_price,
        usd_price: usd_price,
        discount: discount,
      });
      navigate("/");
    } catch (error) {
      console.error("Error Signing up:", error);
    }
  };


  return (
    <>
      <CompNavbar />
      <div id="create-course-container">
        <h1 className="section-title">Create New Course</h1>
        <div>
          <form
            id="courseForm"
            action="/api/course/create"
            method="POST"
            encType="multipart/form-data"
            onSubmit={handleFormSubmit}
          >
            {/* Form action should match the route for creating a course */}
            <h3>Course description</h3>
            <label htmlFor="title">titulo:</label>
            <br />
            <input 
            value = {title}
            name="title"
            onChange={(e) => setTitle(e.target.value)}
            type="text"
            className="form-control" />
            <br />
            <label htmlFor="description">Descripcion:</label>
            <br />
            <input 
            value = {description}
            name="description"
            onChange={(e) => setDescription(e.target.value)}
            type="text"
            className="form-control" />
            <br />
            <label htmlFor="text_content">contenido texto:</label>
            <br />
            <textarea 
            value = {text_content}
            onChange={(e) => setTextContent(e.target.value)}
            type="text"
            className="form-control"></textarea>
            <br />
            <label htmlFor="video">subir video:</label>
            <br />
            <input type="file" name="video" value = {video} accept="video/*"  onChange={(e) => setVideo(e.target.value)}/>
            <br />
            <hr />
            <label htmlFor="thumbnail">subir miniatura:</label>
            <br />
            <input type="file" name="thumbnail" value={thumbnail} accept="image/*" onChange={(e) => setThumbnail(e.target.value)}/>
            <br />
            <hr />
            <h3>Configurar precio</h3>
            <label htmlFor="ars_price">ARS Price:</label>
            <br />
            <input type="number" id="ars_price" value={ars_price} name="ars_price" onChange={(e) => setARSPrice(e.target.value)}/>
            <br />
            <label htmlFor="usd_price">USD Price:</label>
            <br />
            <input type="number" id="usd_price" value={usd_price} name="usd_price" onChange={(e) => setUSDPrice(e.target.value)}/>
            <br />
            <h3>Aditional configs</h3>
            <label htmlFor="discount">descuento:</label>
            <br />
            % <input type="number" id="discount" name="discount" value={discount} onChange={(e) => setDiscount(e.target.value)}/>
            <br />
            <input type="hidden" name="author" />
            <button type="submit">Create Course</button>
            {/* Display error message */}
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
          </form>
        </div>
      </div>
      <CompFooter />
    </>
  );
};

export default CompCourseCreate;
