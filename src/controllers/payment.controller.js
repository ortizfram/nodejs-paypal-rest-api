  //src/controllers/payment.controller.js
  import {
    HOST,
    PAYPAL_API,
    PAYPAL_API_CLIENT,
    PAYPAL_API_SECRET,
  } from "../config.js";
  import axios from "axios";
  import {
    getCourseFromIdQuery,
    getCourseFromSlugQuery,
    insertUserCourseQuery,
    tableCheckQuery,
  } from "../../db/queries/course.queries.js";
  import { pool } from "../db.js";
  import { createTableUserCourses, createUserTableQuery } from "../../db/queries/auth.queries.js";
  import mercadopago from "mercadopago";
  import { config } from "dotenv";
import createTableIfNotExists from "../public/js/createTable.js";

  config(); // load .ENV

  // PAYPAL ---------------------------------------------------
  export const createOrderPaypal = async (req, res) => {
    console.log("\n*** createOrderPaypal\n");

    const courseId = req.body.courseId; // is being passed the courseSlug in the request input
    try {
      console.log("\n\nSQL Query:", getCourseFromIdQuery);
      console.log("\n\nparams courseId:", courseId);
      // Fetch course details based on the courseSlug using MySQL query
      const [rows] = await pool.query(getCourseFromIdQuery, courseId);
      const course = rows[0];

      console.log("\n\nFetched Course Details:", course);

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
          return_url: `${HOST}/api/capture-order-paypal?courseId=${courseId}`, // Include course slug in the return URL
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
      console.log("\n\nCreated Order:", response.data);

      // check user_courses table
      const checkTable_users = await createTableIfNotExists(pool, tableCheckQuery, createUserTableQuery, "users");

      // paypal pay link + courseId
      const courseIdParam = `courseId=${courseId}`;
      const approveLink = `${response.data.links[1].href}&${courseIdParam}`;

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
    let courseId;
    courseId = req.query.courseId;
    try {
      const user = req.session.user;

      // Fetch course details based on the courseSlug using MySQL query
      const [rows] = await pool.query(getCourseFromIdQuery, [courseId]);
      const course = rows[0];
      console.log("\n\nFetched Course:", course);

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

        return res.redirect(`/api/course/${courseId}`);
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
    const courseId = req.body.courseId; // is being passed the courseSlug in the request input
    const userId = req.body.userId; // is being passed the courseSlug in the request input
    console.log(`\nSQL Query: ${getCourseFromSlugQuery}\n`);
    console.log(`\ncourseId: ${[courseId]}\n`);
    console.log(`\nuserId: ${[userId]}\n`);

    // Fetch the course using the query
    const [rows] = await pool.query(getCourseFromIdQuery, courseId);
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
        success: `http://localhost:3000/api/course/${courseId}/`,
        failure: "http://localhost:3000/api/failure-mp",
        pending: "http://localhost:3000/api/pending-mp",
      },
      //here we use NGROK till it's deployed
      notification_url: `${process.env.MP_NOTIFICATION_URL}/api/webhook-mp?courseId=${courseId}&userId=${userId}`,
    };

    const result = await mercadopago.preferences.create(preference);
    console.log(`\n\n--- MP preference created:`);

    // console.log(result.body);

    // change on deployment
    const initPoint = result.body.sandbox_init_point;
    const redirectURL = `${initPoint}&courseId=${courseId}`;
    res.redirect(redirectURL);
  };

  export const webhookMP = async (req, res) => {
    console.log("\n\n*** Webhook MP...\n\n");

    try {
      const paymentType = req.query.type;
      const paymentId = req.query["data.id"];
      const courseId = req.query.courseId; // Ensure Mercado Pago sends courseSlug
      const userId = req.query.userId;
      console.log("courseId:", courseId);
      console.log("paymentId:", paymentId);
      console.log("paymentType:", paymentType);
      console.log("userId:", userId);

      if (paymentType === "payment" && paymentId && courseId) {

        // Fetch course details based on the courseSlug using MySQL query
        const [rows] = await pool.query(getCourseFromIdQuery, [courseId]);
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
