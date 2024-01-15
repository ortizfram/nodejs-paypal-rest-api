import logo from "./logo.svg";
import "./App.css";
//import router
import { BrowserRouter, Route, Routes } from "react-router-dom";
//import components
import CompBlogList from "./blog/BlogList";
import CompBlogCreate from "./blog/BlogCreate";
import CompBlogUpdate from "./blog/BlogUpdate";
import CompHome from "./index/Home";
// import css
import homeCSS from './public/css/home/home.css'

function App() {
  return (
    <div className="App">
        <BrowserRouter>
          <Routes>
            {/* INDEX */}
            <Route path="/" element={ <CompHome />}/>

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
