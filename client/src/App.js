//import router
import { BrowserRouter, Route, Routes } from "react-router-dom";
//a
import { useEffect, useState } from "react";
//import components
import CompBlogList from "./blog/BlogList.js";
import CompBlogCreate from "./blog/BlogCreate.js";
import CompBlogUpdate from "./blog/BlogUpdate.js";
import CompHome from "./index/Home.js";
import CompSignup from "./auth/Signup.js";
import CompLogin from "./auth/Login.js";
import CompCourses from "./courses/Courses";
import CompCourseCreate from "./courses/CourseCreate";
// import css
import homeCSS from "./public/css/home/home.css";
import formCSS from "./public/css/form.css";
import signupCSS from "./public/css/auth/signup.css";
import navbarCSS from "./public/css/layout/navbar.css";
import sectionTitleCSS from "./public/css/sectionTitle.css";
import paginationCSS from "./public/css/pagination.css";
import highlightTextCSS from "./public/css/highlightText.css";
import alertCSS from "./public/css/alert.css";
import courseCreateModuleCSS from "./public/css/course/courseCreateModule.css";
import courseCreateVideoCSS from "./public/css/course/courseCreateVideo.css";
import courseDetailCSS from "./public/css/course/courseDetail.css";
import courseEnrollCSS from "./public/css/course/courseEnroll.css";
import courseUpdateCSS from "./public/css/course/courseUpdate.css";
import coursesCSS from "./public/css/course/courses.css";

function App() {
  const BASE_URL = "http://localhost:5000";

  // Use BASE_URL in your API requests
  fetch(`${BASE_URL}`)
    .then((response) => response.json())
    .then((data) => console.log(data))
    .then(console.log(`\n\n👨🏼‍💻⚛️ React & Express were connected\n\n`))
    .catch((error) => console.error(error));

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* INDEX */}
          <Route path="/" element={<CompHome />} />

          {/* AUTH */}
          <Route path="/api/signup" element={<CompSignup />} />
          <Route path="/api/login" element={<CompLogin />} />
          <Route path="/api/forgot-password" element={<CompSignup />} />

          {/* COURSES */}
          <Route path="/api/courses" element={<CompCourses />} />
          <Route path="/api/course/create" element={<CompCourseCreate />} />

          {/* BLOGS */}
          <Route path="/api/blog" element={<CompBlogList />} />
          <Route path="/api/blog/create" element={<CompBlogCreate />} />
          <Route path="/api/blog/:id/update" element={<CompBlogUpdate />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
