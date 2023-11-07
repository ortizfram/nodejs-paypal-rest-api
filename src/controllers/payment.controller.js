import {
  HOST,
  PAYPAL_API,
  PAYPAL_API_CLIENT,
  PAYPAL_API_SECRET,
} from "../config.js";
import axios from "axios";
import { Course } from "../models/course.model.js";

export const createOrder = async (req, res) => {
  try {
    // You can receive the courseSlug from the request body or as a parameter
    const courseSlug = req.body.courseSlug; // is being passed the courseSlug in the request input

    // Fetch course details based on the courseSlug
    const course = await Course.findOne({ slug: courseSlug });

    const order = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: course.price, // Use the course price for the order
          },
        },
      ],
      application_context: {
        brand_name: "Mi tienda",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: `${HOST}/course/${courseSlug}/modules`,// Include course slug in the return URL
        cancel_url: `${HOST}/cancel-order`,
      },
    };

    // Params for auth
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials"); //i pass it credentials

    // Ask for token on auth
    const {
      data: { access_token },
    } = await axios.post(`${PAYPAL_API}/v1/oauth2/token`, params, {
      auth: {
        username: PAYPAL_API_CLIENT,
        password: PAYPAL_API_SECRET,
      },
    });

    // Create order with order obj
    const response = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders`,
      order,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    // Log the created order
    console.log("Created Order:", response.data);

    const approveLink = response.data.links[1].href; // paypal pay link
    
    // Redirect the user to the PayPal approval link
    res.redirect(approveLink);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Error creating the order" });
  }
};

export const captureOrder = async (req, res) => {
  try {
    const { token, courseSlug } = req.query;

    if (!req.session.user) {
      // If the user is not logged in, redirect to the login page
      return res.redirect(
        "/login?message=Please log in to enroll in the course"
      );
    }

    const user = req.session.user; // Retrieve user information from the session
    const course = await Course.findOne({ slug: courseSlug });

    if (course) {
      // Enroll the user in the course
      user.enrolledCourses.push(course._id);
      await user.save();

      // Redirect to the course details page for the enrolled course
      return res.redirect(`/course/${courseSlug}`);
    } else {
      console.error("Course information not found.");
      return res.status(404).send("Course not found");
    }
  } catch (error) {
    console.error("Error capturing order:", error);
    res.status(500).json({ message: "Error capturing the order" });
  }
};

export const cancelPayment = (req, res) => res.redirect("/");
