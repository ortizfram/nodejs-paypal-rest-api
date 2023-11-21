//src/controllers/payment.controller.js
import {
  HOST,
  PAYPAL_API,
  PAYPAL_API_CLIENT,
  PAYPAL_API_SECRET,
} from "../config.js";
import axios from "axios";
import {
  getCourseFromSlugQuery,
  insertUserCourseQuery,
} from "../../db/queries/course.queries.js";
import { pool } from "../db.js";
import { createTableUserCourses } from "../../db/queries/auth.queries.js";
import mercadopago from "mercadopago";
import { config } from "dotenv";

config(); // load .ENV

// PAYPAL ---------------------------------------------------
export const createOrderPaypal = async (req, res) => {
  console.log("\n*** createOrderPaypal\n");
  try {
    const courseSlug = req.body.courseSlug; // is being passed the courseSlug in the request input

    console.log("SQL Query:", getCourseFromSlugQuery);
    console.log("Parameters:", [courseSlug]);
    // Fetch course details based on the courseSlug using MySQL query
    const [rows] = await pool.query(getCourseFromSlugQuery, courseSlug);
    const course = rows[0];

    console.log("Fetched Course Details:", course);

    //create order paypal
    const order = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: course.usd_price, // Use the course price for the order
          },
        },
      ],
      application_context: {
        brand_name: "Mi tienda",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: `${HOST}/api/capture-order-paypal?courseSlug=${courseSlug}`, // Include course slug in the return URL
        cancel_url: `${HOST}/api/cancel-order-paypal`,
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
    console.log("\n--Created Order:", response.data);

    // create user_courses table
    const [table] = await pool.query(createTableUserCourses);
    if (table.warningStatus === 0) {
      console.log("\n---user_courses table created.\n");
    } else {
      console.log("\n---user_courses table already exists.\n");
    }

    // paypal pay link
    const approveLink = response.data.links[1].href;

    // Redirect the user to the PayPal approval link
    res.redirect(approveLink);
  } catch (error) {
    console.error("Error creating order:", error);
    res
      .status(500)
      .json({ message: "Error creating the order", error: error.message });
  }
};

export const captureOrderPaypal = async (req, res) => {
  console.log("\n*** captureOrderPaypal\n");
  try {
    const { courseSlug } = req.query; //is obtained from the successful payment redirect query
    const user = req.session.user;

    // Fetch course details based on the courseSlug using MySQL query
    const [rows] = await pool.query(getCourseFromSlugQuery, [courseSlug]);
    const course = rows[0];
    console.log("\n--Fetched Course:", course);

    if (course && user) {
      // Add the user and course relationship in user_courses table
      const [insertUserCourse] = await pool.query(insertUserCourseQuery, [
        user.id,
        course.id,
      ]);
      if (insertUserCourse.affectedRows > 0) {
        console.log(
          `👌🏽 --Inserted into user_courses: User ID: ${user.id}, Course ID: ${course.id}`
        );
      }

      return res.redirect(`/api/course/${courseSlug}/modules`);
    } else {
      return res.status(404).send("Course or user not found");
    }
  } catch (error) {
    console.error("Error capturing order:", error);
    res.status(500).json({ message: "Error capturing the order" });
  }
};

export const cancelPaymentPaypal = (req, res) => res.redirect("/");

// Mercado Pago 1.5.16 ---------------------------------------------------
export const createOrderMP = async (req, res) => {
  console.log("\n*** Creating MP order...\n");

  // • get course
  const courseSlug = req.body.courseSlug; // is being passed the courseSlug in the request input
  const userId = req.body.userId; // is being passed the courseSlug in the request input
  console.log(`\nSQL Query: ${getCourseFromSlugQuery}\n`);
  console.log(`\ncourseSlug: ${[courseSlug]}\n`);
  console.log(`\nuserId: ${[userId]}\n`);

  // Fetch the course using the query
  const [rows] = await pool.query(getCourseFromSlugQuery, courseSlug);
  // Check if the course exists
  const course = rows[0];

  console.log(`\nFetched Course Details:`);
  console.log(course);

  // Check the type of course.price
  // console.log(`\nType of course.price: ${typeof course.price}\n`);

  // Convert course.price to a decimal
  const priceAsFloat = parseFloat(course.ars_price);

  //♣

  mercadopago.configure({
    access_token: process.env.MP_SANDBOX_ACCESS_TOKEN,
  });

  var preference = {
    items: [
      {
        title: course.title,
        quantity: 1,
        currency_id: "ARS",
        unit_price: priceAsFloat,
      },
    ],
    back_urls: {
      success: `http://localhost:3000/api/course/${courseSlug}/modules`,
      failure: "http://localhost:3000/api/failure-mp",
      pending: "http://localhost:3000/api/pending-mp",
    },
    //here we use NGROK till it's deployed
    notification_url: `https://b639-190-15-205-177.ngrok.io/api/webhook-mp?courseSlug=${courseSlug}&userId=${userId}`,
  };

  const result = await mercadopago.preferences.create(preference);
  console.log(`\n\n--- MP preference created:`);

  // console.log(result.body);

  // change on deployment
  const initPoint = result.body.sandbox_init_point;
  const redirectURL = `${initPoint}&courseSlug=${courseSlug}`;
  res.redirect(redirectURL);
};

export const webhookMP = async (req, res) => {
  console.log("\n\n*** Webhook MP...\n\n");

  try {
    const paymentType = req.query.type;
    const paymentId = req.query["data.id"];
    const courseSlug = req.query.courseSlug; // Ensure Mercado Pago sends courseSlug
    const userId = req.query.userId;
    console.log("courseSlug:", courseSlug);
    console.log("paymentId:", paymentId);
    console.log("paymentType:", paymentType);
    console.log("userId:", userId);

    if (paymentType === "payment" && paymentId && courseSlug) {

      // Fetch course details based on the courseSlug using MySQL query
      const [rows] = await pool.query(getCourseFromSlugQuery, [courseSlug]);
      const course = rows[0];

      if (course && userId) {
        // Add the user and course relationship in user_courses table
        const [insertUserCourse] = await pool.query(insertUserCourseQuery, [
          userId,
          course.id,
        ]);

        if (insertUserCourse.affectedRows > 0) {
          console.log(
            `\n👌🏽 --Inserted into user_courses: User ID: ${userId}, Course ID: ${course.id}`
          );
        }
      }
    }
    res.sendStatus(204); // OK but none to return
  } catch (error) {
    console.error("Error handling Mercado Pago webhook:", error);
    res.sendStatus(500);
  }
};

export const successMP = async (req, res) => {
  res.send("\n*** Success MP...\n");
};
