import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// NodeJS endpoint reference
const URI = "http://localhost:5001/api/blog/";

const CompBlogList = () => {
// 
  const [blogs, setBlogs] = useState([]);
  useEffect(() => {
    getBlogs();
  }, []);

  // mostrar blogs -----------------------------------
  const getBlogs = async () => {
    try {
        const res = await axios.get(`${URI}`);  // Updated route
        setBlogs(res.data);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
  };

  // eliminar blog -----------------------------------
  const deleteBlog = async (id) => {
    try {
        await axios.delete(`${URI}${id}/delete`);
        getBlogs();
    } catch (error) {
        console.error("Error deleting blog:", error);
    }
  };

  // update blog -----------------------------------
  const updateBlog = async (id) => {
    try {
        await axios.delete(`${URI}${id}/update`);
        getBlogs();
    } catch (error) {
        console.error("Error updating blog:", error);
    }
  };

  return (
    <div className="blogs-page-container">
      <div className="blogs-container">
        <div className="section-title1">
          <h1 className="text-white">Blogs and Latest News</h1>
        </div>

        <Link to={`${URI}create`}>CrearBlog</Link>
        <ul>
          {blogs.map((blog) => (
            <li key={blog.id}>
              <Link to={`/blog/${blog.id}`}>{blog.title}</Link>
              <button onClick={() => deleteBlog(blog.id)}>Delete</button>
              <button onClick={() => updateBlog(blog.id)}>Edit</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CompBlogList;
