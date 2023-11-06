import {
  HOST,
  PAYPAL_API,
  PAYPAL_API_CLIENT,
  PAYPAL_API_SECRET,
} from "../config.js";
import axios from "axios";
import { User } from "./auth.controller.js";
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
        return_url: `${HOST}/capture-order`,
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
    const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders`, order, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    // Log the created order
    console.log("Created Order:", response.data);

    return res.json(response.data);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Error creating the order" });
  }
};

export const captureOrder = async (req, res) => {
  try {
    // They accepted payment so save it
    const { token } = req.query; // take token and resend it -> confirm
    const courseSlug = req.body.courseSlug; // Assuming courseSlug is available in the request body

    const response = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders/${token}/capture`,
      {}, // send nothing to back
      {
        auth: {
          username: PAYPAL_API_CLIENT,
          password: PAYPAL_API_SECRET,
        },
      }
    );

    console.log("Captured Order:", response.data);

   // Check if the user is logged in
   if (req.user) {
    const user = req.user;
    const course = await Course.findOne({ slug: courseSlug });

    if (course) {
      user.enrolledCourses.push(course._id);
      await user.save();
      // Return the rendered view with enrolled course details
      return res.render("courseDetail", { course });
    } else {
      console.error("Course information not found.");
      return res.status(404).send("Course not found");
    }
  } else {
    // If the user is not logged in, provide guidance for logging in
    return res
    .status(401).send("Please log in to enroll in the course.");
  }
} catch (error) {
  console.error("Error capturing order:", error);
  res.status(500).json({ message: "Error capturing the order" });
}
};

export const cancelPayment = (req, res) => res.redirect('/');
