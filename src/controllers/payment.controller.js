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

  // params for auth
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials"); //i pass it credentials

  //ask for token on auth
  const {
    data: { access_token },
  } = await axios.post(`${PAYPAL_API}/v1/oauth2/token`, params, {
    auth: {
      username: PAYPAL_API_CLIENT,
      password: PAYPAL_API_SECRET,
    },
  });

  //create order with order obj
  const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders`, order, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  return res.json(response.data);
};

export const captureOrder = async (req, res) => {
  // They accepted payment so save it
  const { token } = req.query; // take token and resend it -> confirm

  const user = User;

  // token can be save in DB if you want...

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

  console.log(response.data);

  return res.send("Payed");
};

export const cancelPayment = (req, res) => res.redirect('/');
