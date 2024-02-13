import React from 'react';
import { useParams } from 'react-router-dom';

function CourseDeleteConfirmation() {
  const { id } = useParams(); // Get the course ID from the URL params

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/course/delete/${id}`, {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data.message); // Log success message
        // Redirect to a success page or any other appropriate action
        window.location.href = "/api/courses"
    } else {
        // Handle error response
        const errorData = await response.json();
        console.error(errorData.message);
        // Redirect to an error page or any other appropriate action
        window.location.href = "/"
    }
    } catch (error) {
      console.error('Error deleting course:', error);
      // Redirect to an error page or any other appropriate action
    window.location.href = "/"
}
  };
  
  const handleCancel = () => {
      // Redirect back to the course details page or any other appropriate action
      window.location.href = "/api/courses"
  };

  return (
    <div>
      <h2>Confirm Deletion</h2>
      <p>Are you sure you want to delete this course?</p>
      <button onClick={handleDelete}>Yes, Delete</button>
      <button onClick={handleCancel}>Cancel</button>
    </div>
  );
}

export default CourseDeleteConfirmation;
