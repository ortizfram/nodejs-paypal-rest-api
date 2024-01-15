import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
//import components
import CompBlogList from "./blog/BlogList";
import CompBlogCreate from "./blog/BlogCreate";
// 
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={ <CompBlogList />}/>
            <Route path="/api/blog/create" element={ <CompBlogCreate />}/>
          </Routes>
        </BrowserRouter>
      </header>
    </div>
  );
}

export default App;
