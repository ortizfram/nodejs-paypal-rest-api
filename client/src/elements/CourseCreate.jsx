import axios from "axios";
import { useNavigate } from "react-router-dom";

import React, { useContext, useState } from "react";
import { UserContext } from "../hooks/UserContext.js";

const CourseCreate = () => {

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [text_content, setTextContent] = useState("");
  const [ars_price, setARSPrice] = useState("");
  const [usd_price, setUSDPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [video, setVideo] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const {user, setUser} = useContext(UserContext)

  const handleThumbnailChange = (e) => {
    setThumbnail(e.target.files[0]);
    setThumbnailUrl(null); // Clear previous image when a new file is selected
  };

  const handleVideoChange = (e) => {
    setVideo(e.target.files[0]);
    setVideoUrl(null); // Clear previous video when a new file is selected
  };

  const handleThumbnailUpload = async () => {
    try {
      const formData = new FormData();
      formData.append("image", thumbnail);

      const response = await axios.post(
        "http://localhost:6002/upload/image",
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
        "http://localhost:6002/upload/video",
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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      // Check if user ID exists in session
      // if (!userData || !userData.id) {
      //   throw new Error("User ID not found in the session");
      // }
  
      // Upload thumbnail if it exists
      if (thumbnail) {
        const thumbnailFormData = new FormData();
        thumbnailFormData.append("image", thumbnail);
  
        const thumbnailResponse = await axios.post(
          "http://localhost:6002/upload/image",
          thumbnailFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
  
        // Set thumbnail URL after successful upload
        setThumbnailUrl(thumbnailResponse.data.imageUrl);
      }
  
      // Upload video if it exists
      if (video) {
        const videoFormData = new FormData();
        videoFormData.append("video", video);
  
        const videoResponse = await axios.post(
          "http://localhost:6002/upload/video",
          videoFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
  
        // Set video URL after successful upload
        setVideoUrl(videoResponse.data.videoUrl);
      }
  
      // Handle success
      alert("Files uploaded successfully");
  
      // Create the course with updated form data
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("text_content", text_content);
      formData.append("ars_price", ars_price);
      formData.append("usd_price", usd_price);
      formData.append("discount", discount);
      formData.append("thumbnail", thumbnailUrl); // Use the uploaded thumbnail URL
      formData.append("video", videoUrl); // Use the uploaded video URL
      formData.append("author_id", user.id.toString());
      console.log("user for course", user.toString())
  
      try {
        const courseResponse = await axios.post(
          "http://localhost:6002/api/course/create",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              "Authorization": `Bearer ${process.env.JWT_SECRET}`
            },
          }
        );
  
        if (courseResponse.status === 201) {
          alert("Course created successfully!");
          console.log("redirectUrl: ", courseResponse.data.redirectUrl);
          navigate(courseResponse.data.redirectUrl);
        } else {
          console.error(
            "Error creating course. Server response:",
            courseResponse
          );
          alert("Some error occurred while creating the course.");
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          // Handle 401 Unauthorized error
          console.error("Unauthorized request:", error.message);
          alert("Unauthorized request. Please login again.");
          navigate("/login")
          // Redirect user to login page or perform any other action
        } else {
          console.error("Error creating course:", error.message);
          alert(`${error.message}`);
        }
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
        {user && <p className="text-primary">Hello, {user.id}!</p>}

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
              <button
                type="button"
                className="btn btn-primary btn-xs btn-sm"
                onClick={handleVideoUpload}
              >
                Upload Video
              </button>
              {videoUrl && (
                <div>
                  <h3>Uploaded Video:</h3>
                  <video controls width="30%">
                    <source
                      src={`http://localhost:6002${videoUrl}`}
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
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
              <button
                type="button"
                className="btn btn-primary btn-xs btn-sm"
                onClick={handleThumbnailUpload}
              >
                Upload Image
              </button>
              {thumbnailUrl && (
                <div>
                  <img
                    src={`http://localhost:6002${thumbnailUrl}`}
                    alt="Uploaded"
                    style={{ maxWidth: "30%" }}
                  />
                </div>
              )}
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
              <input type="hidden" name="author" value={JSON.stringify(user)} />
              <button type="submit">Create Course</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseCreate;
