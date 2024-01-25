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
import ForgotPassword from "./auth/ForgotPass.js";
import EmailSentMessage from "./auth/EmailSent.js";
import ResetPassword from "./auth/ResetPass.js";
// import css
import homeCSS from "./public/css/home/home.css";
import formCSS from "./public/css/form.css";
import signupCSS from "./public/css/auth/signup.css";
import navbarCSS from "./public/css/layout/navbar.css";
import sectionTitleCSS from "./public/css/sectionTitle.css";
import paginationCSS from "./public/css/pagination.css";
import highlightTextCSS from "./public/css/highlightText.css";
import alertCSS from "./public/css/alert.css";
import courseDetailCSS from "./public/css/course/courseDetail.css";
import courseEnrollCSS from "./public/css/course/courseEnroll.css";
import courseUpdateCSS from "./public/css/course/courseUpdate.css";
import coursesCSS from "./public/css/course/courses.css";
// import Hooks
import { UserContextProvider } from "./hooks/UserContext.js";
import CompLogout from "./auth/Logout.js";


function App() {
  const BASE_URL = "http://localhost:5000";

  // Use BASE_URL in your API requests
  fetch(`${BASE_URL}`)
    .then((response) => response.text())
    .then((data) => {
      console.log(data);
      console.log(`\n\n👨🏼‍💻⚛️ React & Express were connected\n\n`)
    })
    .catch((error) => console.error(error));

  return (
    <div className="App">
      <BrowserRouter>
      <UserContextProvider>
        <Routes>
          {/* INDEX */}
          <Route path="/" element={<CompHome />} />


          {/* AADMIN */}
          {/* router.post("/users/change-role", admin_staff_check, controller.changeUserRole); */}
          {/* router.post("/users", admin_staff_check,controller.getUsers); */}


          {/* AUTH */}
          <Route path="/api/signup" element={<CompSignup />} />
          <Route path="/api/login" element={<CompLogin />} />
          <Route path="/api/logout" element={<CompLogout />} />
          <Route path="/api/forgot-password" element={<ForgotPassword />} />
          <Route path="/api/email-sent" element={<EmailSentMessage />} />
          <Route path="/reset-password/:id/:token" element={<ResetPassword />} /> {/* correct errors missing creds*/}
          {/* // ------------userUpdate-------------------------
          router.post("/user-update/:id", controller.postsendEmailToken)
          router.post("/user-update/:id/:token", controller.postUserUpdate) */}


          {/* COURSES */}
          <Route path="/api/courses" element={<CompCourses />} />
          <Route path="/api/course/create" element={<CompCourseCreate />} />
          {/* router.post('/course/create',  admin_staff_check, controllers.postCourseCreate);//post
          router.post('/course/:id/update',  admin_staff_check, controllers.postCourseUpdate);// post update
          router.post('/course/:id/delete',  admin_staff_check, controllers.postCourseDelete);// post del
          //------------courseDetail  -------------------------
          router.post("/course/:id/overview", is_loggedin_check, controllers.courseOverview);
          router.post("/course/:id/enroll", is_loggedin_check, controllers.courseEnroll);
          router.post("/course/:id/", is_loggedin_check, admin_staff_clicking_course, controllers.courseDetail); // This route should fetch course detail
          //------------coursesList-------------------------
          router.post("/courses", controllers.coursesList);
          router.post("/courses-owned", is_loggedin_check, controllers.coursesListOwned);  */}


          {/* BLOGS */}
          <Route path="/api/blog" element={<CompBlogList />} />
          <Route path="/api/blog/create" element={<CompBlogCreate />} />
          <Route path="/api/blog/:id/update" element={<CompBlogUpdate />} />
          {/* //------------detail-------------------------
          router.get("/blog/:id", controller.getBlogDetail);
          router.post("/blog/:id/delete", admin_staff_check, controller.postBlogDelete); */}


          {/* PAYMENT PAYPAL */}
          {/* router.post("/create-order-paypal", createOrderPaypal);
          router.post("/capture-order-paypal", captureOrderPaypal); */}


          {/* PAYMENT MERCADO */}
          {/* router.post("/create-order-mp", createOrderMP)
          router.get("/success-mp", successMP)
          router.get("/pending-mp", (req, res)=>res.send("pending"))
          router.get("/failure-mp", (req, res)=>res.send("failure"))
          router.post("/webhook-mp", webhookMP */}
        </Routes>
        </UserContextProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
