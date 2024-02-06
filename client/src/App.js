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

// import Hooks
import { UserContextProvider,useUserContext  } from "./hooks/UserContext.js";

function App() {
  const [message, setMessage] = useState("");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:6001")
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message);
        console.log(data.message);
        setUserData(data.userData, JSON.stringify(data.userData));
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <UserContextProvider>
          <Routes>
            {/* INDEX */}
            <Route path="/" element={<Home userData={userData}/>} />
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
            <Route path="/api/courses" element={<Courses userData={userData} />} />
            <Route path="/api/course/create" element={<CourseCreate userData={userData} />} />
            <Route path="/api/course/:id" element={<CourseDetail userData={userData} />} />
            <Route path="/api/course/update/:id" element={<CourseUpdate userData={userData}/>} />
  
            {/* BLOGS */}
            <Route path="/api/blog" element={<CompBlogList userData={userData} />} />
            <Route path="/api/blog/create" element={<CompBlogCreate userData={userData} />} />
            <Route path="/api/blog/:id/update" element={<CompBlogUpdate userData={userData} />} />
         
          </Routes>
        </UserContextProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
