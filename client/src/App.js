//import router
import { BrowserRouter, Route, Routes } from "react-router-dom";
//a
import { useEffect, useState } from "react";
//import components
import CompBlogList from "./blog/BlogList.js";
import CompBlogCreate from "./blog/BlogCreate.js";
import CompBlogUpdate from "./blog/BlogUpdate.js";
import Home from "./elements/Home";
import Signup from "./elements/Signup";
import Login from "./elements/Login";
import Logout from "./elements/Logout";
import ForgotPassword from "./elements/ForgotPassword";
import ResetPassword from "./elements/ResetPassword";
import Courses from "./elements/Courses";
import CourseCreate from "./elements/CourseCreate";
import CourseDetail from "./elements/CourseDetail";
import CourseUpdate from "./elements/CourseUpdate";
import EmailSentMessage from "./auth/EmailSent.js";
// hooks
import {UserContext} from "./hooks/UserContext.js"


function App() {
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("http://localhost:6002")
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
      <UserContext.Provider value={{user, setUser}}>
          <Routes>
            {/* INDEX */}
            <Route path="/" element={<Home/>} />
            {/* AADMIN */}
            {/* router.post("/users/change-role", admin_staff_check, controller.changeUserRole); */}
            {/* router.post("/users", admin_staff_check,controller.getUsers); */}
            {/* AUTH */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/reset-password/:id/:token"
              element={<ResetPassword />}
            />
            <Route path="/email-sent" element={<EmailSentMessage />} />

            {/* COURSES */}
            <Route path="/api/courses" element={<Courses/>} />
            <Route path="/api/course/create" element={<CourseCreate />} />
            <Route path="/api/course/:id" element={<CourseDetail/>} />
            <Route path="/api/course/update/:id" element={<CourseUpdate />} />
  
            {/* BLOGS */}
            <Route path="/api/blog" element={<CompBlogList />} />
            <Route path="/api/blog/create" element={<CompBlogCreate />} />
            <Route path="/api/blog/:id/update" element={<CompBlogUpdate />} />
         
          </Routes>
          </UserContext.Provider>
      </BrowserRouter>
    </div>
  );
}

export default App;
