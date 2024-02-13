import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import CompNavbar from "../template/Nabvar";
import CompFooter from "../template/Footer";

// NodeJS endpoint reference
const URI = `http://localhost:6004/api/courses?page=1&perPage=6`;

const CompCourses = () => {
  // fetch courses procedure -------------------------
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState(""); // Add title state
  const [page, setPage] = useState(1); // Add page state
  const [route, setRoute] = useState("courses"); // Add route state
  const [perPage, setPerPage] = useState(1); // Add perPage state
  const [currentPage, setCurrentPage] = useState(1); // Add currentPage state
  const [totalPages, setTotalPages] = useState(1); // Add totalPages state
  const navigate = useNavigate();
  const [limitedDescription, setLimitedDescription] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); // Define isAdmin state

  useEffect(() => {
    getCoursesList();
  }, []);

  // Fetch Courses
  const getCoursesList = async () => {
    try {
      const res = await axios.post(URI, {
        data: {},
      });
      console.log("Axios Response Data:", res.data);


      if (res.status === 200) {
        const { title, page, route, perPage, currentPage, totalPages } =
          res.data; // Destructure response data
        console.log("Response Data:", res.data);

        setTitle(title);
        setPage(page);
        setRoute(route);
        setPerPage(perPage);
        setCurrentPage(currentPage);
        setTotalPages(totalPages);

        if (Array.isArray(res.data.courses)) {
          const mappedCourses = res.data.courses.map((course) => ({
            ...course,
            limitedDescription: course.description
              .split(" ")
              .slice(0, 50)
              .join(" "),
          }));
          console.log("Mapped Courses:", mappedCourses);

          setCourses(mappedCourses);
        }
      } else {
        console.error(res)
      }
    } catch (error) {
      console.error("Error fetching courses:", error.message);
    }
  };

  return (
    <>
      <CompNavbar />
      <div className="courses-page-container">
        <div className="courses-container">
          <div className="section-title z-index-1">
            <h1 className="text-white">Cursos</h1>
          </div>

          {/* <!-- pagination top --> */}
          <div className="pagination">
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
          </div>

          {/*<!-- courses --> */}
          <div className="courses-grid">
            {courses &&
              courses.length > 0 &&
              courses.map((course, index) => (
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
                  {isAdmin && (
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
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
      <CompFooter />
    </>
  );
};

export default CompCourses;
