import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../hooks/UserContext";

const CourseCreate = () => {
  const { userData } = useUserContext();
  const navigate = useNavigate();
  const [user] = useState(userData);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [text_content, setTextContent] = useState("");
  const [ars_price, setARSPrice] = useState("");
  const [usd_price, setUSDPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [video, setVideo] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleThumbnailChange = (e) => {
    setThumbnail(e.target.files[0]);
  };

  const handleVideoChange = (e) => {
    setVideo(e.target.files[0]);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("text_content", text_content);
      formData.append("ars_price", ars_price);
      formData.append("usd_price", usd_price);
      formData.append("discount", discount);
      formData.append("thumbnail", thumbnail);
      formData.append("video", video);

      // Upload thumbnail
      const thumbnailResponse = await axios.post("/upload/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Upload video
      const videoResponse = await axios.post("/upload/video", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Handle success
      alert("Files uploaded successfully");

      // Update form data with uploaded thumbnail and video URLs
      formData.set("thumbnail", thumbnailResponse.data.imageUrl);
      formData.set("video", videoResponse.data.videoUrl);

      // Create the course
      const courseResponse = await axios.post("/api/course/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (courseResponse.status === 201) {
        alert("Course created successfully!");
        navigate(courseResponse.data.redirectUrl);
      } else {
        console.error("Error creating course. Server response:", courseResponse);
        alert("Some error occurred while creating the course.");
      }
    } catch (error) {
      console.error("Error creating course:", error.message);
      setErrorMessage(
        error.response?.data ||
        "An unexpected error occurred while creating the course."
      );
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
              {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
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
              <label htmlFor="discount">
                descuento opcional (numeros enteros):
              </label>
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
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseCreate;
