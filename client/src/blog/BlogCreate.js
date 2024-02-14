import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

// NodeJS endpoint reference
const URI = "http://localhost:5005/api/blog/";

const CompBlogCreate = () => {
// 
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate()


  //procedimiento guardar -----------------------------------
  const store = async (e) => {
    try {
        e.preventDefault()
        await axios.post(URI, {title:title, content:content})
        navigate('/')
      } catch (error) {
        console.error("Error creating blog:", error);
      }
  };

  return (
    <div>
        <div className="section-title1">
          <h1 className="text-white">Crear Blog</h1>
        </div>
        <form onSubmit={store}>
            <div className="mb-3"></div>
            <label>Titulo</label>
            <input 
                value={title}
                onChange={ (e)=> setTitle(e.target.value)} 
                type="text"
                className="form-control"/>
            <div className="mb-3"></div>
            <label>Contenido</label>
            <textarea 
                value={content}
                onChange={ (e)=> setContent(e.target.value)} 
                type="text"
                className="form-control"/>
                <button type="submit" className="btn btn-primary">Guardar</button>
        </form>
    </div>
  )
}

export default CompBlogCreate;