import React, { useEffect, useState } from "react";
import axios from "axios";

import "../public/css/course/courses.css";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    axios
      .get("/api/courses")
      .then((res) => {
        const { courses, isAdmin } = res.data;
        setCourses(courses);
        setIsAdmin(isAdmin);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="courses-page-container">
      <div className="courses-container">
        <div className="section-title z-index-1">
          <h1 className="text-white">Cursos</h1>
        </div>

        <div className="courses-grid">
          {courses.map((course, index) => (
            <div key={index} className="course-item backdrop-filter shadow-lg">
              <a href={`/api/course/${course.id}`}>

                {/* COURSE DATA */}
                <img src={course.thumbnail} alt={`thumbnail-${course.slug}`} />
                <p className="timestamp text-white">{course.updated_at}</p>

                  {/* AUTHOR */}
                <div className="author">
                  {course.author && course.author.avatar && (
                    <img src={course.author.avatar} alt="User Avatar" className="avatar" />
                  )}
                  {course.author && (
                    <p className="author-info text-white">
                      <strong>{course.author.username}</strong> • {course.author.name}
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
                
                {/* DISCOUNT */}
                {course.discount_ars || course.discount_usd ? (
                  <p className="text-white fw-bolder text-xs bg-success p-1 rounded ">
                    USD {course.discount_usd}%OFF | ARS {course.discount_ars}%OFF
                  </p>
                ) : null}

                {/* DESCRIPTION */}
                {course.description && (
                  <p className="text-white">{course.description}</p>
                )}
              </a>

              {/* ADMIN */}
              {isAdmin && (
                <div className="course-actions">
                  <p className="text-white">
                    <a className="text-muted" href={`/api/course/${course.id}/update`}>
                      <i className="fas fa-edit me-2"></i>
                    </a>
                    <input type="hidden" name="author" value={course.author} />
                  </p>
                  <p>
                    <a
                      className="text-muted"
                      href={`/api/course/${course.id}/delete?courseId=${course.id}`}
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
