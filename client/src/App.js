import logo from "./logo.svg";
import "./App.css";
//import router
import { BrowserRouter, Route, Routes } from "react-router-dom";
//import components
import CompBlogList from "./blog/BlogList.js";
import CompBlogCreate from "./blog/BlogCreate.js";
import CompBlogUpdate from "./blog/BlogUpdate.js";
import CompHome from "./index/Home.js";
import CompSignup from "./auth/Signup.js";
// import css
import homeCSS from './public/css/home/home.css'
import formCSS from './public/css/form.css'
import signupCSS from './public/css/auth/signup.css'

function App() {
  return (
    <div className="App">
        <BrowserRouter>
          <Routes>
            {/* INDEX */}
            <Route path="/" element={ <CompHome />}/>
            
            {/* AUTH */}
            <Route path="/api/signup" element={ <CompSignup />}/>
            <Route path="/api/login" element={ <CompSignup />}/>
            <Route path="/api/forgot-password" element={ <CompSignup />}/>

            {/* BLOGS */}
            <Route path="/api/blog" element={ <CompBlogList />}/>
            <Route path="/api/blog/create" element={ <CompBlogCreate />}/>
            <Route path="/api/blog/:id/update" element={ <CompBlogUpdate />}/>
          </Routes>
        </BrowserRouter>
    </div>
  );
}

export default App;
