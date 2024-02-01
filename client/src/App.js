//import router
import { BrowserRouter, Route, Routes } from "react-router-dom";
//a
import { useEffect, useState } from "react";
//import components
import CompBlogList from "./elements/blog/BlogList.js";
import CompBlogCreate from "./elements/blog/BlogCreate.js";
import CompBlogUpdate from "./elements/blog/BlogUpdate.js";
import CompHome from "./index/Home.js";
import CompSignup from "./auth/Signup.js";
import CompLogin from "./auth/Login.js";
import CompCourses from "./courses/Courses";
import CompCourseCreate from "./courses/CourseCreate";
import ForgotPassword from "./auth/ForgotPass.js";
import EmailSentMessage from "./auth/EmailSent.js";
import ResetPassword from "./auth/ResetPass.js";

// import Hooks
import { UserContextProvider } from "./hooks/UserContext.js";
import CompLogout from "./auth/Logout.js";
import CourseDetailComponent from "./courses/CourseDetail.js";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/")
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message);
        console.log(data.message);
      })
      .catch((err) => console.error(err));
  }, []);

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
            <Route
              path="/reset-password/:id/:token"
              element={<ResetPassword />}
            />

            {/* COURSES */}
            <Route path="/api/courses" element={<CompCourses />} />
            <Route path="/api/course/create" element={<CompCourseCreate />} />
            <Route path="/api/course/:id" element={<CourseDetailComponent />} />
  
            {/* BLOGS */}
            <Route path="/api/blog" element={<CompBlogList />} />
            <Route path="/api/blog/create" element={<CompBlogCreate />} />
            <Route path="/api/blog/:id/update" element={<CompBlogUpdate />} />
         
          </Routes>
        </UserContextProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
