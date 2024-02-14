import React, { useEffect, useState } from "react";
import "../public/css/course/courses.css";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5005/api/courses")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }
        return response.json();
      })
      .then((data) => {
        const { courses, isAdmin } = data;
        setCourses(courses);
        setIsAdmin(isAdmin);
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
        setErrorMessage("Failed to fetch courses");
      });
  }, []);

  return (
    <div className="courses-page-container">
       {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      <div className="courses-container ">
        <div className="section-title z-index-1">
          <h1 className="text-white">Cursos</h1>
        </div>

        <div className="courses-grid">
          {courses.map((course, index) => (
            <div key={index}className="course-item position-relative backdrop-filter shadow-lg">
                  {/* DISCOUNT for ARS only */}
                  {course.discount_ars >= 1 && course.discount_usd < 1 && (
                    <p className="position-absolute start-40 top-10 translate-middle-x  translate-middle-y text-white text-center fw-lighter text-xs bg-success p-[0.1] rounded">
                      ARS {course.discount_ars}%OFF
                    </p>
                  )}
                  {/* DISCOUNT for USD only */}
                  {course.discount_usd >= 1 && course.discount_ars < 1 && (
                    <p  className="position-absolute start-40 top-10 translate-middle-x translate-middle-y text-white text-center fw-lighter text-xs bg-success p-[0.1] rounded">
                      USD ${course.discount_usd}%OFF
                    </p>
                  )}
                  
              <a href={`/api/course/${course.id}`}>

                {/* COURSE DATA */}
                <img src={course.thumbnail} alt={`thumbnail-${course.slug}`} />
                <p className="timestamp text-white">{course.updated_at}</p>

                {/* AUTHOR */}
                <div className="author">
                  {course.author && course.author.avatar && (
                    <img
                      src={course.author.avatar}
                      alt="User Avatar"
                      className="avatar"
                    />
                  )}
                  {course.author && (
                    <p className="author-info text-white">
                      <strong>{course.author.username}</strong> •{" "}
                      {course.author.name}
                    </p>
                  )}
                </div>
                <h2 className="text-white">{course.title}</h2>

                {/* PRICE */}
                {course.usd_price || course.usd_price ? (
                  <p className="text-white">
                    USD {course.usd_price} | ARS {course.ars_price}
                  </p>
                ) : null}


                {/* DESCRIPTION */}
                {course.description && (
                  <p className="text-white">{course.description}</p>
                )}
              </a>

              {/* ADMIN OPTIONS*/}
              {isAdmin && (
                <div className="course-actions">
                  {/* UPDATE */}
                  <p className="text-white">
                    <a
                      className="text-muted"
                      href={`/api/course/update/${course.id}`}
                    >
                      <i className="fas fa-edit me-2"></i>
                    </a>
                    <input type="hidden" name="author" value={course.author} />
                  </p>
                  {/* DEL */}
                  <p>
                    <a
                      className="text-muted"
                      href={`/api/course/delete/${course.id}`}
                    >
                      <i className="fas fa-trash-alt me-2"></i>
                    </a>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Courses;
