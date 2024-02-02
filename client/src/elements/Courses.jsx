import React, { useEffect, useState } from "react";
import axios from "axios";

function Courses() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get("/courses")
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="courses-page-container">
      <div className="courses-container">
        <div className="section-title z-index-1">
          <h1 className="text-white">Cursos</h1>
        </div>

        {/* <!-- pagination top --> */}
        {/* <div className="pagination">
          {page && page > 1 && (
            <a href={`/api/${route}?page=${page - 1}&perPage=${perPage}`}>
              Previous
            </a>
          )}
          {[...Array(totalPages)].map(
            (_, i) =>
              !(i === totalPages - 1 && courses.length === 0) && (
                <a
                  key={i}
                  href={`/api/${route}?page=${i + 1}&perPage=${perPage}`}
                  className={currentPage === i + 1 ? "active" : ""}
                >
                  {i + 1}
                </a>
              )
          )}
          {page && page < totalPages && (
            <a href={`/api/${route}?page=${page + 1}&perPage=${perPage}`}>
              Next
            </a>
          )}
        </div> */}

        {/*<!-- courses --> */}
        <div className="courses-grid">
          {data &&
            data.length > 0 &&
            data.map((course, index) => (
              <div
                key={index}
                className="course-item backdrop-filter shadow-lg"
              >
                <a href={course.next}>
                  <img
                    src={course.thumbnail}
                    alt={`thumbnail-${course.slug}`}
                  />
                  <p className="timestamp text-white">{course.updated_at}</p>
                  <div className="author">
                    <img
                      src={course.author.avatar}
                      alt="User Avatar"
                      className="avatar"
                    />
                    <p className="author-info text-white">
                      <strong>{course.author.username}</strong> •{" "}
                      {course.author.name}
                    </p>
                  </div>
                  <h2 className="text-white">{course.title}</h2>
                  {course.usd_price || course.usd_price ? (
                    <p className="text-white">
                      USD {course.usd_price} | ARS {course.ars_price}
                    </p>
                  ) : null}
                  {/* <!-- limit description 50 words --> */}
                  {course.description && (
                    <p className="text-white">{course.limitedDescription}</p>
                  )}
                </a>
                {/* {isAdmin && (
                  <div className="course-actions">
                    <p className="text-white">
                      <a
                        className="text-muted"
                        href={`/api/course/${course.id}/update`}
                      >
                        <i className="fas fa-edit me-2"></i>
                      </a>
                      <input
                        type="hidden"
                        name="author"
                        value={course.author}
                      />
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
                )} */}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default Courses;
