import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../hooks/UserContext";
// import css
import "../public/css/course/courseCreate.css";
import { createRef } from "react";

const CourseCreate = () => {
  // pass context user
  const { userData } = useUserContext();
  const navigate = useNavigate();
  let user = userData;

  // form data declaration
  const [video, setVideo] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [text_content, setTextContent] = useState("");
  const [ars_price, setARSPrice] = useState("");
  const [usd_price, setUSDPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Define errorMessage state

  // createCourse procedure ------------------------------------------------
  const handleFormSubmit = async (e) => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("text_content", text_content);
    formData.append("ars_price", ars_price);
    formData.append("usd_price", usd_price);
    formData.append("discount", discount);

    try {
      e.preventDefault();
      const response = await fetch('/api/course/create', { method: "POST", body: formData });
      // Handle successful response
      const parsedRes = await response.json();

      if (response.status === 200) {
        alert("File uploaded!!");
      } else {
        console.error("Error uploading file. Server response:", response);

        // Parse the error response if it's JSON
        try {
          const errorData = await response.json();
          console.error("Error data:", errorData);

          alert("Some error occurred on uploading");
        } catch (error) {
          console.error("Error parsing error response:", error.message);
        }

        setErrorMessage(""); // Reset error message
        const next = parsedRes.redirectUrl;
        navigate(next);
      }
    } catch (error) {
      console.error("Error creating course:", error.message);

      // Handle different types of errors
      setErrorMessage(
        error.response?.data ||
          "An unexpected error occurred while creating the course."
      );
    }
  };

  // hadle video and thumbnail onChange ------------------------------------
  const handleThumbnailChange = (e) => {
    setThumbnail(e.target.files[0]);
    setThumbnailUrl(null); // Clear previous image when a new file is selected
  };

  const handleVideoChange = (e) => {
    setVideo(e.target.files[0]);
    setVideoUrl(null); // Clear previous video when a new file is selected
  };

  // hadle video and thumbnail Upload -------------------------------------
  const handleThumbnailUpload = async () => {
    try {
      const formData = new FormData();
      formData.append("thumbnail", thumbnail);

      const response = await axios.post(
        "/upload/image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setThumbnailUrl(response.data.imageUrl);
      alert("Image uploaded successfully.");
    } catch (error) {
      console.error("Error uploading image:", error.message);
      alert("Error uploading image.");
    }
  };

  const handleVideoUpload = async () => {
    try {
      const formData = new FormData();
      formData.append("video", video);

      const response = await axios.post(
        "/upload/video",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setVideoUrl(response.data.videoUrl);
      alert("Video uploaded successfully.");
    } catch (error) {
      console.error("Error uploading video:", error.message);
      alert("Error uploading video.");
    }
  };

  return (
    <>
      <div id="create-course-container-page">
        <div id="create-course-container" className="mt-8">
          <h1 className="section-title">Creando Curso</h1>
          <div>
            <form
              id="courseForm"
              encType="multipart/form-data"
              onSubmit={handleFormSubmit}
            >
              {/* Form action should match the route for creating a course */}
              {/* Display error message */}
              {errorMessage && (
                <p style={{ color: "red" }}>
                  {typeof errorMessage === "string"
                    ? errorMessage
                    : errorMessage.message || "An unexpected error occurred."}
                </p>
              )}
              <h3>Titulo & contenido:</h3>
              <label htmlFor="title">titulo:</label>
              <br />
              <input
                value={title}
                name="title"
                onChange={(e) => setTitle(e.target.value)}
                type="text"
                className="form-control"
              />
              <br />
              <label htmlFor="description">Descripcion:</label>
              <br />
              <input
                value={description}
                name="description"
                onChange={(e) => setDescription(e.target.value)}
                type="text"
                className="form-control"
              />
              <br />
              <label htmlFor="text_content">contenido texto:</label>
              <br />
              <textarea
                value={text_content}
                onChange={(e) => setTextContent(e.target.value)}
                type="text"
                className="form-control"
              ></textarea>
              <br />
              <h3>Subir Archivos:</h3>
              <label htmlFor="video">subir video:</label>
              <br />
              <input
                type="file"
                name="video"
                accept="video/*"
                onChange={handleVideoChange}
              />
              <button onClick={handleVideoUpload}>Guardar Video</button>
              <br />
              <hr />
              <label htmlFor="thumbnail">subir miniatura:</label>
              <br />
              <input
                type="file"
                name="thumbnail"
                accept="image/*"
                onChange={handleThumbnailChange}
              />
              <button onClick={handleThumbnailUpload}>Guardar Miniatura</button>
              <br />
              <hr />
              <h3>Configurar precio</h3>
              <label htmlFor="ars_price">ARS Price:</label>
              <br />
              <input
                type="number"
                id="ars_price"
                value={ars_price}
                name="ars_price"
                onChange={(e) => setARSPrice(e.target.value)}
              />
              <br />
              <label htmlFor="usd_price">USD Price:</label>
              <br />
              <input
                type="number"
                id="usd_price"
                value={usd_price}
                name="usd_price"
                onChange={(e) => setUSDPrice(e.target.value)}
              />
              <br />
              <h3>Adicionales</h3>
              <label htmlFor="discount">descuento opcional (numeros enteros):</label>
              <br />%{" "}
              <input
                type="number"
                id="discount"
                name="discount"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
              <br />
              <input type="hidden" name="author" value={user} />
              <button type="submit">Create Course</button>
              {/* Display error message */}
              {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseCreate;
