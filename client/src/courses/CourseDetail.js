import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CompNavbar from '../template/Nabvar';
import CompFooter from '../template/Footer';
import { useUserContext } from '../hooks/UserContext';
import '../public/css/course/courseDetail.css';

const URI = "/api/course/:id";

const CourseDetailComponent = () => {
  const { userData } = useUserContext();
  const [course, setCourse] = useState(null);
  const user = userData;
  const { id } = useParams();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(URI.replace(":id", id), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });

        if (response.ok) {
          const data = await response.json();
          setCourse(data.course);
        } else {
          console.error("Failed to fetch course data");
        }
      } catch (error) {
        console.error("Error fetching course data:", error);
      }
    };

    fetchCourse();
  }, [id]);

  if (!course) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <CompNavbar user={user}/>
      <div className="bg-course-detail">
        <div className="background-blur"></div>
        <div className="container" style={{ margin: "6.2rem auto" }}>
          <div className="row">
            <div className="col-lg-12 text-center">
              <div className="video-container mb-1">
                <video id="course-video" controls className="img-fluid shadow-lg">
                  <source src={course.video} type="video/mp4" />
                  <source src={course.video} type="video/webm" />
                  <source src={course.video} type="video/ogg" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-12 text-center">
              <div>
                <p>
                  {course.updated_at}
                  <span>
                    <img
                      className="avatar ms-4 me-2"
                      src={course.author.avatar}
                      alt="author_avatar"
                    />
                  </span>
                  <span className="fw-bold">{course.author.username}</span> •
                  <span>{course.author.name}</span>
                  {user && user.role === "admin" && (
                    <span className="course-admin-options opacity-50">
                      <button className="btn">
                        <p>
                          <a
                            className="text-muted"
                            href={`/api/course/${course.id}/update?courseId=${course.id}`}
                          >
                            <i className="fas fa-edit me-2 text-white"></i>
                          </a>
                        </p>
                      </button>
                      <button className="btn">
                        <p>
                          <a
                            className="text-muted"
                            href={`/api/course/${course.id}/delete?courseId=${course.id}`}
                          >
                            <i className="fas fa-trash-alt me-2 text-white"></i>
                          </a>
                        </p>
                      </button>
                    </span>
                  )}
                </p>
                <h2>{course.title}</h2>
                <h6>{course.description}</h6>
              </div>
              <p>{course.text_content}</p>
            </div>
          </div>
        </div>
      </div>
      <CompFooter />
    </>
  );
};

export default CourseDetailComponent;
