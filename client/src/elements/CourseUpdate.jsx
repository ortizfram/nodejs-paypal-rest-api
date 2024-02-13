import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "../hooks/UserContext.js";
import axios from "axios";
import "../public/css/course/courseUpdate.css";

const CourseUpdate = () => {
  const { userData } = useContext(useContext);
  const user = userData;
  const { id } = useParams();
  const navigate = useNavigate();

  const [video, setVideo] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
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

  const handleThumbnailChange = (e) => {
    setThumbnail(e.target.files[0]);
    setThumbnailUrl(null); // Clear previous image when a new file is selected
  };

  const handleVideoChange = (e) => {
    setVideo(e.target.files[0]);
    setVideoUrl(null); // Clear previous video when a new file is selected
  };

  const handleThumbnailUpload = async () => {
    try {
      const formData = new FormData();
      formData.append("thumbnail", thumbnail);

      const response = await axios.post(
        `http://localhost:6004/upload/image`, // Update with the appropriate endpoint for updating thumbnails
        formData
      );

      setThumbnailUrl(response.data.imageUrl);
      alert("Thumbnail updated successfully.");
    } catch (error) {
      console.error("Error updating thumbnail:", error.message);
      alert("Error updating thumbnail.");
    }
  };

  const handleVideoUpload = async () => {
    try {
      const formData = new FormData();
      formData.append("video", video);

      const response = await axios.post(
        `http://localhost:6004/upload/video`, // Update with the appropriate endpoint for updating videos
        formData
      );

      setVideoUrl(response.data.videoUrl);
      // Update the course state with the new videoUrl
      setCourse((prevCourse) => ({
        ...prevCourse,
        videoUrl: response.data.videoUrl,
      }));
      alert("Video updated successfully.");
    } catch (error) {
      console.error("Error updating video:", error.message);
      alert("Error updating video.");
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      const updatedCourse = { ...course, videoUrl, thumbnailUrl };
      const response = await axios.post(
        `http://localhost:6004/api/course/update/${id}`,
        updatedCourse
      );
      if (response.status === 200) {
        alert("Course updated successfully!");
        navigate(`/course/${id}`);
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
      <form onSubmit={handleUpdateCourse} encType="multipart/form-data">
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
        <br />
        <h3>Update Video</h3>
        <label htmlFor="video">Upload new video:</label>
        <br />
        <input
          type="file"
          name="video"
          accept="video/*"
          onChange={handleVideoChange}
        />
        <button onClick={handleVideoUpload}>Update Video</button>
        <br />
        <hr />
        <h3>Update Thumbnail</h3>
        <label htmlFor="thumbnail">Upload new thumbnail:</label>
        <br />
        <input
          type="file"
          name="thumbnail"
          accept="image/*"
          onChange={handleThumbnailChange}
        />
        <button onClick={handleThumbnailUpload}>Update Thumbnail</button>
        <br />
        <hr />
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
