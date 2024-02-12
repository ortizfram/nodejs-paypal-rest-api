import axios from "axios";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { UserContext } from "../hooks/UserContext.js";
import "../public/css/layout/navbar.css"

// NodeJS endpoint reference
const URI = "http://localhost:6003"; // Update the base URL

const CompNavbar = () => {
    const { userData } = useContext(UserContext);
    let user = userData;
    
    return (
        <>
          <header className="header shadow-lg">
            <a href="/" className="logo"><img src="/images/home/white-logo-buonavibra.png" alt="" /></a>
      
            <input type="checkbox" id="check" />
            <label htmlFor="check" className="icons">
              <i className='bx bx-menu' id="menu-icon"></i>
              <i className='bx bx-x' id="close-icon"></i>
            </label>
      
            <nav className="navbar">
              {/* Basic links */}
              <a href="/" style={{ "--i": 0 }}>Inicio</a>
              <a href="/#contact" style={{ "--i": 1 }}>Contacto</a>
              <a href="/#about1" style={{ "--i": 2 }}>Acerca</a>
      
              {/* Dropdown for Courses and Blogs */}
              <div className="dropdown">
                <a href="#" className="dropdown-toggle" role="button">
                  Cursos y Blogs
                </a>
                <div className="dropdown-menu">
                  <a href="/api/courses?page=1&perPage=6" style={{ "--i": 3 }}>Cursos</a>
                  <a href="/api/blog?page=1&perPage=6" style={{ "--i": 4 }}>Blogs</a>
                </div>
              </div>
      
              {/* Loggedin Links */}
              {user && user.name &&
                <>
                  <a href="/api/courses-owned?page=1&perPage=6" style={{ "--i": 5 }}>Mis Cursos</a>
      
                  {/* Admin Dropdown */}
                  {user.role === "admin" &&
                    <div className="dropdown">
                      <a href="#" className="dropdown-toggle" role="button">
                        Admin
                      </a>
                      <div className="dropdown-menu">
                        <a href="/api/course/create" style={{ "--i": 6 }}>Crear curso</a>
                        <a href="/api/blog/create" style={{ "--i": 7 }}>Crear Blog</a>
                        <a href="/api/admin/users" style={{ "--i": 8 }}>Panel de Usuarios</a>
                      </div>
                    </div>
                  }
      
                  {/* Edit Profile and Logout */}
                  {user.avatar ?
                    <a href={`/api/user-update/${user.id}/confirm`} style={{ "--i": 9 }}>
                      <img src={user.avatar} alt="User Avatar" className="avatar" />Editar Perfil
                    </a>
                    :
                    <a href={`/api/user-update/${user.id}/confirm`} style={{ "--i": 10 }}>
                      <img src="/images/user.png" alt="Placeholder Avatar" className="avatar" />Editar Perfil
                    </a>
                  }
                  <a href="/api/logout" style={{ "--i": 11, border: '2px solid white', borderRadius: '10%', padding: '8px' }}>Salir</a>
                </>
              }
      
              {/* Links for non-loggedin users */}
              {!user &&
                <>
                  <a href="/api/login" style={{ "--i": 12, border: '2px solid white', borderRadius: '10%', padding: '8px' }}>Ingresar</a>
                  <a href="/api/signup" style={{ "--i": 13, border: '2px solid white', borderRadius: '10%', padding: '8px' }}>Registrar</a>
                </>
              }
            </nav>
          </header>
        </>
      );
      
}

export default CompNavbar;