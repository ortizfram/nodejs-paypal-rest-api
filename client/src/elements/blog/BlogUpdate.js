import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const URI = "http://localhost:5000/api/blog/";

const CompBlogUpdate = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();

  // Procedure to fetch blog by ID
  const getBlogById = async () => {
    try {
      const res = await axios.get(`${URI}${id}`);
      setTitle(res.data.title);
      setContent(res.data.content);
    } catch (error) {
      console.error("Error fetching blog by ID:", error);
    }
  };

  // Fetch blog data on component mount or when ID changes
  useEffect(() => {
    getBlogById();
  }, [id]); // Add id as a dependency

  // Procedure to update blog
  const update = async (e) => {
    try {
      e.preventDefault();
      await axios.put(`${URI}${id}`, { title: title, content: content });
      navigate("/");
    } catch (error) {
      console.error("Error updating blog:", error);
    }
  };

  return (
    <div>
      <div className="section-title1">
        <h1 className="text-white">Editar Blog</h1>
      </div>
      <form onSubmit={update}>
        <div className="mb-3"></div>
        <label>Titulo</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          type="text"
          className="form-control"
        />
        <div className="mb-3"></div>
        <label>Contenido</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          type="text"
          className="form-control"
        />
        <button type="submit" className="btn btn-primary">
          Editar
        </button>
      </form>
    </div>
  );
};

export default CompBlogUpdate;
