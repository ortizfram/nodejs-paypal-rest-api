import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import CompNavbar from "../template/Nabvar";
import CompFooter from "../template/Footer";
import { UserContext } from "../hooks/UserContext.js";
import "../public/css/course/courseEnroll.css";

const CourseEnroll = () => {
  const { user } = useContext(UserContext);
  const [course, setCourse] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`http://localhost:5005/api/course/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCourse(data.course);
        } else {
          console.error("Failed to fetch course data");
        }
      } catch (error) {
        console.error("Error fetching course data:", error);
      }
    };

    fetchCourse();
  }, [id]);

  if (!course) {
    return <div>Loading...</div>;
  }

  const renderPrice = () => {
    if (course.discount_usd >0  ) {
      return (
        <>
          <del className="text-success">antes USD {course.usd_price}</del>
          <p><span className="text-success">USD {course.usd_price - (course.usd_price * course.discount_usd / 100)}</span> | ARS {course.ars_price}</p>
        </>
      );
    } else if (course.discount_ars > 0) {
      return (
      <>
          USD {course.usd_price} | <del>ARS {course.ars_price}</del>
          <p>USD {course.usd_price } | ARS {course.ars_price - (course.ars_price * course.discount_ars / 100)}</p>
        </>
      )
    } else {
      return (
        <>
          USD {course.usd_price} | ARS {course.ars_price}
        </>
      );
    }
    }
  


  return (
    <>
      <div className="page-container">
      <div className="course-overview">
        <div className="section-title2 mt-4 mb-4">
          <h1>Payment Details</h1>
        </div>
        {/* Payment Details */}
        <img className="mb-4" src={course.thumbnail} alt={`${course.title} Image`} />
        <h2>{course.title}</h2>
        <p>{course.description}</p>
        <div className="">
          <div className="row align-items-center">
            instructor:
            <div className="col-auto">
              <img
                src={course.author.avatar}
                alt="User Avatar"
                className="rounded-circle me-2"
                style={{ width: "25px", height: "25px", objectFit: "cover" }}
                />
              <span>{course.author.username} • {course.author.name}</span>
            </div>
          </div>
        </div>
        

        <p className="price-text border border-success rounded p-1">
        {renderPrice()}
        </p>
      </div>

      <div className="payment-options">
        {/* course enroll */}
        {/* The form to trigger the payment */}
        <form action={`/api/create-order-paypal?courseId=${course.id}`} method="POST">
          {/* Hidden input to pass the course slug to the server */}
          <input type="hidden" name="courseId" value={course.id} />
          {/* You should replace the value of userId with the actual userId */}
          <input type="hidden" name="userId" value="<%= userId %>" />
          <button type="submit">
            <img src="/images/paypal.png" alt="paypal-icon" />
            <p>Continue with Paypal</p>
          </button>
        </form>
        <form action={`/api/create-order-mp?courseId=${course.id}`} method="POST">
          {/* Hidden input to pass the course slug to the server */}
          <input type="hidden" name="courseId" value={course.id} />
          {/* You should replace the value of userId with the actual userId */}
          <input type="hidden" name="userId" value="<%= userId %>" />
          <input type="hidden" name="courseId" value="<%= id %>" />
          <button type="submit">
            <img src="/images/mercado-pago.png" alt="mercado-pago-icon" />
            <p>Continue with Mercado Pago</p>
          </button>
        </form>
      </div>
    </div>
    </>
  );
};

export default CourseEnroll;
