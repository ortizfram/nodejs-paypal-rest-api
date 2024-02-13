import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import CompNavbar from "../template/Nabvar.js";
import CompFooter from "../template/Footer";

// NodeJS endpoint reference
const URI = "http://localhost:6004"; // Update the base URL
const URI_sendEmail = "http://localhost:6004/send-email"; // Update the base URL

const CompHome = () => {
  let user = null;

  const me_about_img_style = {
    maxWidth: "300px",
    height: "auto",
  };

  // mail form data declaration
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();


  useEffect(() => {

  }, []);

  // Fetch Home
  const getHome = async () => {
    try {
      await axios.get(URI); //  endpoint
    } catch (error) {
      console.error("Error fetching Home:", error);
    }
  };

  // send contact Email
  const sendEmail = async (e) => {
    try {
      e.preventDefault();
      const res = await axios.post(URI_sendEmail, {
        name: name,
        email: email,
        msg: msg,
      }); //  endpoint
      console.log("Email sent successfully!", res.data);
      navigate("/");
    } catch (error) {
      console.error("Error sending Email:", error);
    }
  };

  return (
    <>
      <CompNavbar user={user}/>
      <div className="home-page-container">
        {/* <!-- hero --> */}
        <div className="hero-container home-hero">
          <img
            className="hero-logo"
            src="/images/home/white-logo-buonavibra.png"
            alt=""
          />
        </div>

        {/* <!-- about --> */}
        <div className="container about" id="about1">
          <h1 className="section-title">Acerca de.</h1>

          <div className="row">
            <div className="col-md-6 text-center">
              <img
                src="images/home/me-about.jpg"
                style={me_about_img_style}
                className="shadow-2xl rounded-circle w-100"
                alt="Marcela Marzetti Gimenez"
              />
              <h3 className="mt-3 font-weight-bold highlight-txt">
                Marcela Marzetti
              </h3>
            </div>
            <div className="col-md-6 text-center">
              <p className="text-xl">
                <span>
                  ¡Bienvenido/a a mi página web!
                  <br />
                  <br />
                </span>
                Mi nombre es Marcela Marzetti y soy una persona como tú,
                transitando esta experiencia humana aquí en la Tierra. Soy
                licenciada en administración de empresas y he dedicado gran
                parte de mi vida a gestionar negocios. Sin embargo, mi camino me
                llevó al yoga kundalini, una práctica que transformó mi vida y
                me permitió conectar con mi propia sabiduría interna y mi gurú
                interno. En estos tiempos de incertidumbre y cambios constantes,
                el yoga kundalini es una herramienta poderosa para gestionar
                nuestras energías y conectarnos con nuestro corazón y nuestra
                alma. A través de esta práctica, podemos activar nuestra magia
                interna y vivir en un estado de salud, felicidad, dicha, amor,
                gratitud, alegría, abundancia, paz y prosperidad. Mi intención
                es acompañarte en este camino de autodescubrimiento y ayudarte a
                conectar con tu propio gurú interno, esa sabiduría interna que
                te guía y te permite obtener tu auto-maestría. Juntos, podemos
                abrir la puerta al campo ilimitado de infinitas posibilidades y
                concretar todas tus intenciones para vivir en un estado de
                armonía. ¡Te invito a explorar mi página web y descubrir cómo
                puedo ayudarte en este camino de crecimiento personal!
              </p>
            </div>
          </div>
        </div>

        {/* <!-- contact --> */}
        <div
          id="contact"
          className="bg-cover bg-center bg-brightness-50 py-6 h-50vh mt-310px md:m-auto md:mt-50px"
        >
          <div className="">
            <div className="">
              <h1 className="section-title italic font-bold text-white">
                Contacto.
              </h1>

              {/* <!-- Row for contact icons --> */}
              <div className="row mt-4 container">
                <div className="col backdrop-filter p-4 rounded col-md-6 mx-auto d-flex justify-content-between">
                  <div className="list-unstyled d-flex justify-content-between">
                    <a href="https://wa.me/2615996913" target="_blank">
                      <img
                        className="icon"
                        src="images/home/whatsapp-white-icon.png"
                        alt="WhatsApp"
                      />
                    </a>
                    <a
                      href="https://www.instagram.com/buonavibra_?igsh=MWR5NDhiZHd3MjY5MA=="
                      target="_blank"
                    >
                      <img
                        className="icon"
                        src="images/home/instagram-white-icon.png"
                        alt="Instagram"
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* <!-- contact form --> */}
            <div className="row mt-4">
              <div className="col rounded">
                <form onSubmit={sendEmail}>
                  {" "}
                  {/* /send-email */}
                  <h3 className="highlight-txt">Contactar por Email.</h3>
                  <div className="mb-3">
                    <label for="name" className="form-label">
                      Nombre
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label for="email" className="form-label">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label for="message" className="form-label">
                      Mensaje
                    </label>
                    <textarea
                      className="form-control"
                      id="msg"
                      rows="3"
                      value={msg}
                      onChange={(e) => setMsg(e.target.value)}
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Enviar
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CompFooter />
    </>
  );
};

export default CompHome;
