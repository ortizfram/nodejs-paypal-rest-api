import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserContext } from "../hooks/UserContext";
import axios from "axios";
import "../public/css/course/courseUpdate.css"

const CourseUpdate = () => {
  const { userData } = useUserContext();
  const user = userData;
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState({
    title: "",
    description: "",
    text_content: "",
    ars_price: 0,
    usd_price: 0,
    discount: 0,
  });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`/api/course/${id}`);
        const data = response.data.course;
        setCourse(data);
      } catch (error) {
        console.error("Error fetching course data:", error);
      }
    };

    fetchCourse();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourse((prevCourse) => ({
      ...prevCourse,
      [name]: value,
    }));
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`/api/course/${id}/update`, course);
      if (response.status === 200) {
        alert("Course updated successfully!");
        navigate.push(`/api/course/${id}`);
      } else {
        console.error("Error updating course. Server response:", response);
        alert("Some error occurred while updating the course.");
      }
    } catch (error) {
      console.error("Error updating course:", error.message);
      alert("Error updating course.");
    }
  };

  return (
    <div>
      <h1>Update Course</h1>
      <form onSubmit={handleUpdateCourse}>
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          name="title"
          value={course.title}
          onChange={handleInputChange}
        />

        <label htmlFor="description">Description:</label>
        <input
          type="text"
          name="description"
          value={course.description}
          onChange={handleInputChange}
        />

        <label htmlFor="text_content">Text Content:</label>
        <textarea
          name="text_content"
          value={course.text_content}
          onChange={handleInputChange}
        ></textarea>

        <label htmlFor="ars_price">ARS Price:</label>
        <input
          type="number"
          name="ars_price"
          value={course.ars_price}
          onChange={handleInputChange}
        />

        <label htmlFor="usd_price">USD Price:</label>
        <input
          type="number"
          name="usd_price"
          value={course.usd_price}
          onChange={handleInputChange}
        />

        <label htmlFor="discount">Discount (%):</label>
        <input
          type="number"
          name="discount"
          value={course.discount}
          onChange={handleInputChange}
        />

        <button type="submit">Update Course</button>
      </form>
    </div>
  );
};

export default CourseUpdate;
