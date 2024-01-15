import axios from 'axios'
import {useState, useEffect} from 'react'
import {Link} from 'react-router-dom'

// NodeJS endpoint reference
const URI = 'http://localhost:3000/'

const CompBlogList = () => {
    const [blogs, setBlog] = useState([])
    useEffect( () => {
        getBlogs()
    }, [])

    // mostrar blog
    const getBlogs = async ()=> {
        const res = await axios.get(`${URI}api/blog}`) 
        setBlog(res.data)
    }

    // eliminar blog
    const deleteBlog = async (id)=> {
        const res = await axios.delete(`${URI}${id}/delete`) 
        getBlogs()
    }

    return(
        <div>

        </div>
    )
}

export default CompBlogList