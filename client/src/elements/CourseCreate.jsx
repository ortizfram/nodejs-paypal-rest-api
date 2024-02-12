import React, { useContext, useRef, useState } from "react";
import { UserContext } from "../hooks/UserContext.js";

const CourseCreate = () => {

  const { user, setUser } = useContext(UserContext);
  const [errorMessage, setErrorMessage] = useState("");

  const renderImage = (formData) => {
    const file = formData.get("image");
    const image = URL.createObjectURL(file);
    $image.current.setAttribute("src", image); //img on get | file on POST
  };

  const $image = useRef(null);
  let $file = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    text_content: "",
    ars_price: 0,
    usd_price: 0,
    thumbnail: null,
    video: null,
    thumbnailUrl: null,
    videoUrl: null,
    discount: 0,
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    // debugger
    // Handle file uploads
  const imageFile = formData.get("image");
  const videoFile = formData.get("video");

  // Handle image file
  if (imageFile) {
    formData.set("image", imageFile, imageFile.name);
  }

  // Handle video file
  if (videoFile) {
    formData.set("video", videoFile, videoFile.name);
  }
    renderImage(formData);
    // Handle form submission logic, e.g., sending data to the server
    await fetch("http://localhost:6003/api/course/create", {
      method: "POST",
      body: formData,
    });
  };

  return (
    <>
      <div id="create-course-container-page">
        <div id="create-course-container" className="mt-8">
          {user && <p className="text-primary">Hello, {user.id}!</p>}

          <h1 className="section-title">Creando Curso</h1>
          <div>
            <form className="form" method="POST" onSubmit={handleSubmit}>
              {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
              <h3>Titulo & contenido:</h3>
              <label htmlFor="title">titulo:</label>
              <br />
              <input
                name="title"
                onChange={handleChange}
                type="text"
                className="form-control"
              />
              <br />
              <label htmlFor="description">Descripcion:</label>
              <br />
              <input
                name="description"
                onChange={handleChange}
                type="text"
                className="form-control"
                />
              <br />
              <label htmlFor="text_content">contenido texto:</label>
              <br />
              <textarea
                name="text_content"
                onChange={handleChange}
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
                onChange={handleChange}
              />
              <br />
              <hr />
              <label htmlFor="image">subir miniatura:</label>
              <br />
              <input
                type="file"
                id="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
              />
              {/* preview */}
              <div className="preview">
                <img id="img" ref={$image} style={{ width: 300 }} />
              </div>
              <br />
              <hr />
              <h3>Configurar precio</h3>
              <label htmlFor="ars_price">ARS Price:</label>
              <br />
              <input
                type="number"
                id="ars_price"
                name="ars_price"
                onChange={handleChange}
              />
              <br />
              <label htmlFor="usd_price">USD Price:</label>
              <br />
              <input
                type="number"
                id="usd_price"
                name="usd_price"
                onChange={handleChange}
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
                onChange={handleChange}
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
