import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
//import components
import CompBlogList from "./blog/BlogList";
import CompBlogCreate from "./blog/BlogCreate";
import CompBlogUpdate from "./blog/BlogUpdate";
import CompHome from "./index/Home";
// 
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
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
      </header>
    </div>
  );
}

export default App;
