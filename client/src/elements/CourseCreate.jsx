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

    // Validate input for discount fields to ensure positive integers
  if (name === "discount_ars" || name === "discount_usd") {
    const intValue = parseInt(value);
    if (!Number.isInteger(intValue) || intValue <= 0) {
      setErrorMessage(`The field '${name}' must be a positive integer.`);
      return;
    }
  }

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
    const response =  await fetch("http://localhost:5005/api/course/create", {
      method: "POST",
      body: formData,
    });
    if (response.ok) {
      const data = await response.json();
      // Redirect to the specified URL
      window.location.href = data.redirectUrl;
    } else {
      // Handle error response
      const errorData = await response.json();
      setErrorMessage(errorData.message);
    }
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
            <div className="row">
              <div className="col-lg-6">
                <label htmlFor="title">titulo:</label>
                <input
                  name="title"
                  onChange={handleChange}
                  type="text"
                  className="form-control"
                />
              </div>
              <div className="col-lg-6">
                <label htmlFor="description">Descripcion:</label>
                <input
                  name="description"
                  onChange={handleChange}
                  type="text"
                  className="form-control"
                />
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <label htmlFor="text_content">contenido texto:</label>
                <textarea
                  name="text_content"
                  onChange={handleChange}
                  type="text"
                  className="form-control"
                ></textarea>
              </div>
            </div>
            <h3>Subir Archivos:</h3>
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            <div className="row">
              <div className="col-lg-6">
                <label htmlFor="video">subir video:</label>
                <input
                  type="file"
                  name="video"
                  accept="video/*"
                  onChange={handleChange}
                />
              </div>
              <div className="col-lg-6">
                <label htmlFor="image">subir miniatura:</label>
                <input
                  type="file"
                  id="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                {/* preview */}
                <div className="preview">
                  <img id="img" ref={$image} style={{ width: 300 }} />
                </div>
              </div>
            </div>
            <h3>Configurar precio</h3>
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            <div className="row">
              <div className="col-lg-6">
                <label htmlFor="ars_price">ARS Price:</label>
                <input
                  type="number"
                  id="ars_price"
                  name="ars_price"
                  onChange={handleChange}
                />
              </div>
              <div className="col-lg-6">
                <label htmlFor="usd_price">USD Price:</label>
                <input
                  type="number"
                  id="usd_price"
                  name="usd_price"
                  onChange={handleChange}
                />
              </div>
            </div>
            <h3>Adicionales & descuentos</h3>
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            <div className="row">
              <div className="col-lg-6">
                <label htmlFor="discount_ars">
                  descuento_ars opcional (numeros enteros):
                </label>
                <strong>% ARS{" "}</strong>
                <input
                  type="number"
                  id="discount_ars"
                  name="discount_ars"
                  onChange={handleChange}
                />
              </div>
              <div className="col-lg-6">
                <label htmlFor="discount_usd">
                  descuento_usd opcional (numeros enteros):
                </label>
                <strong>% USD{" "}</strong>
                <input
                  type="number"
                  id="discount_usd"
                  name="discount_usd"
                  onChange={handleChange}
                />
              </div>
            </div>
            <input type="hidden" name="author" value={user?.id || ''} />
            <button type="submit">Create Course</button>
          </form>
        </div>
      </div>
    </div>
  </>
  );
};

export default CourseCreate;
