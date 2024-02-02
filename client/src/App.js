//import router
import { BrowserRouter, Route, Routes } from "react-router-dom";
//a
import { useEffect, useState } from "react";
//import components
import CompBlogList from "./blog/BlogList.js";
import CompBlogCreate from "./blog/BlogCreate.js";
import CompBlogUpdate from "./blog/BlogUpdate.js";
import CompHome from "./index/Home.js";
import Signup from "./elements/Signup";
import Login from "./elements/Login";
import Logout from "./elements/Logout";
import Courses from "./elements/Courses";
import CompCourseCreate from "./courses/CourseCreate";
import ForgotPassword from "./auth/ForgotPass.js";
import EmailSentMessage from "./auth/EmailSent.js";
import ResetPassword from "./auth/ResetPass.js";

// import Hooks
import { UserContextProvider } from "./hooks/UserContext.js";
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
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/api/forgot-password" element={<ForgotPassword />} />
            <Route path="/api/email-sent" element={<EmailSentMessage />} />
            <Route
              path="/reset-password/:id/:token"
              element={<ResetPassword />}
            />

            {/* COURSES */}
            <Route path="/api/courses" element={<Courses />} />
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
