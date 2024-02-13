import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "../public/css/navigation.css"

// NodeJS endpoint reference
const URI = "http://localhost:6004"; // Update the base URL

const CompFooter = () => {
  return (
    <>
      <footer className="bg-dark text-white py-5" id="footer">
        <div>
          <div className="row">
            <div className="col-md-4">
              <img
                className="footer-icon"
                src="/images/white-logo-buonavibra.png"
                alt=""
              />
              <h5>Acerca</h5>
              <p>
                Bienvenidos a mi espacio de bienestar! quiero que recorramos
                juntos el camino del Kundalini Yoga.
              </p>
            </div>
            <div className="col-md-4">
              <h5>Links</h5>
              <ul className="list-unstyled">
                <li>
                  <a href="/">Home</a>
                </li>
                <li>
                  <a href="/#about">Acerca</a>
                </li>
                <li>
                  <a href="api/courses?page=1&perPage=6">courses</a>
                </li>
                <li>
                  <a href="api/blog?page=1&perPage=6">blog</a>
                </li>
                <li>
                  <a href="/#contact">Contact</a>
                </li>
              </ul>
            </div>
            <div className="col-md-4">
              <h5>Contacto</h5>
              <p>
                Email: buonavibraclub@gmail.com
                <br />
                Phone: +549 2615 996913
              </p>
            </div>
          </div>
          <hr className="my-4" />
          <p className="text-center">© 2024 buonavibra. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default CompFooter;
