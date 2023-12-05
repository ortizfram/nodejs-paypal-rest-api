import bcrypt from "bcrypt";
import { pool } from "../db.js";
import { postSignupQuery, postLoginQuery, createTableUserCourses, createUserTableQuery } from "../../db/queries/auth.queries.js";
import { tableCheckQuery } from "../../db/queries/course.queries.js";
import createTableIfNotExists from "../public/js/createTable.js"
import {config} from 'dotenv';

// load .ENV
config();

//------------login-------------------------
const getLogin = async (req, res) => {
  res.render("login");
};

const postLogin = async (req, res) => {
  //create users table if not exists
  //...
  createTableIfNotExists(pool, tableCheckQuery, createUserTableQuery, "users");

  try {
    const { username, password } = req.body;

    // Find user in the database that matches the username from the login form
    const [rows] = await pool.query(postLoginQuery, [
      username,
    ]);
    const user = rows[0];

    // If the user exists and the passwords match
    if (user && (await bcrypt.compare(password, user.password))) {
      req.session.user = user; // Store the user in the session
      const userId = user.id;
      res.redirect(`/?message=Login successful, user.id:${userId}`);
      console.log("\n*** Logged in\n")

      

    } else {
      res.send("Wrong password or username");
    }
  } catch (error) {
    res.send("An error occurred while logging in");
  }
};
//------------signup-------------------------
const getSignup = async (req, res) => {
  res.render("signup");
};

const postSignup = async (req, res) => {
  console.log("\n\n*** postSignUp\n\n");

  const { username, name, email, password } = req.body;

  // Add validation for required fields
  if (!username || !password) {
    return res.status(400).send("Username and password are required.");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    let role = 'user';
    if (req.session.user && process.env.ADMIN) {
      role = 'admin';
    }

    const data = [
      username,
      name,
      email,
      hashedPassword,
      role
    ];

    console.log("\n\n*** Before checking users table\n\n");
    const checkTable_users = await createTableIfNotExists(pool, tableCheckQuery, createUserTableQuery, "users");
    console.log("\n\n*** After checking users table, before checking user_courses table\n\n");
    const checkTable_user_courses = await createTableIfNotExists(pool, tableCheckQuery, createTableUserCourses, "user_courses");
    console.log("\n\n*** After checking user_courses table\n\n");

    const [rows] = await pool.query(postSignupQuery, data);
    req.session.user = { username, name, email, role }; 

    res.redirect("/?message=Signup successful. Logged in automatically.");
    console.log("\n*** Signed up\n");
  } catch (error) {
    console.error("Error while saving user:", error);
    res.redirect("/?message=Error during signup or login");
  }
};

//------------logout-------------------------
const logout = (req, res) => {
  // Clear the user session by destroying it
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }
    // Redirect the user to the home page after logout
    res.redirect("/?message=Logged out successfully");
    console.log("\n*** Logged out\n")
  });
};

export default {
  getLogin,
  postLogin,
  getSignup,
  postSignup,
  logout,
};
