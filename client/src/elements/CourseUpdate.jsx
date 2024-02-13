import React, { useContext, useRef, useState } from "react";
import { UserContext } from "../hooks/UserContext.js";

const CourseUpdate = ({ courseId }) => {
  const { user, setUser } = useContext(UserContext);
  const [errorMessage, setErrorMessage] = useState("");

  const renderImage = (formData) => {
    const file = formData.get("image");
    const image = URL.createObjectURL(file);
    $image.current.setAttribute("src", image); 
  };

  const $image = useRef(null);

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
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const imageFile = formData.get("image");
    const videoFile = formData.get("video");

    if (imageFile) {
      formData.set("image", imageFile, imageFile.name);
    }

    if (videoFile) {
      formData.set("video", videoFile, videoFile.name);
    }
    renderImage(formData);

    const response = await fetch(`http://localhost:6004/api/course/update/${courseId}`, {
      method: "PUT",
      body: formData,
    });
    if (response.ok) {
      const data = await response.json();
      window.location.href = data.redirectUrl;
    } else {
      const errorData = await response.json();
      setErrorMessage(errorData.message);
    }
  };

  return (
    <div id="update-course-container-page">
      <div id="update-course-container" className="mt-8 mx-5">
        {user && <p className="text-primary">Hello, {user.id}!</p>}

        <h1 className="section-title">Actualizando Curso</h1>
        <div>
          <form className="form" method="POST" onSubmit={handleSubmit}>
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

            {/* CONTENT */}
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
            <hr />

            {/* UPLOAD */}
            <h3>Subir Archivos:</h3>
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

            <div className="row col-lg-12 items-center">
              <div className="">
                <label htmlFor="video">subir video :</label>
                <input
                  type="file"
                  name="video"
                  accept="video/*"
                  onChange={handleChange}
                />
              </div>
              <br /><br />
              <div className="">
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
                <div className="preview">
                  <img id="img" ref={$image} style={{ width: 300 }} />
                </div>
              </div>
            </div>
            <hr />

            {/* PRICE */}
            <h3>Configurar precio</h3>
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

            <div className="row col-lg-12 items-center">
              <div className="">
                <label htmlFor="ars_price">ARS Price:</label>
                <input
                  type="number"
                  id="ars_price"
                  name="ars_price"
                  onChange={handleChange}
                />
              </div>
              <div className="">
                <label htmlFor="usd_price">USD Price:</label>
                <input
                  type="number"
                  id="usd_price"
                  name="usd_price"
                  onChange={handleChange}
                />
              </div>
            </div>
            <hr />

            {/* DISCOUNT */}
            <h3>Adicionales & descuentos</h3>
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

            <div className="row items-center col-lg-12">
              <div className="">
                <label htmlFor="discount_ars">
                  descuento_ars opcional (numeros enteros):
                </label>
                <br />
                <strong>% ARS{" "}</strong>
                <input
                  type="number"
                  id="discount_ars"
                  name="discount_ars"
                  onChange={handleChange}
                />
              </div>
              <div className="">
                <label htmlFor="discount_usd">
                  descuento_usd opcional (numeros enteros):
                </label>
                <br />
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
            <br /><br />

            {/* submit */}
            <div className="items-center text-center mt-20">
            <button type="submit" className="btn btn-success">Update Course</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CourseUpdate;
