import bcrypt from "bcrypt";
import { pool } from "../db.js";
import { postSignupQuery, postLoginQuery, createTableUserCourses } from "../../db/queries/auth.queries.js";
import { tableCheckQuery } from "../../db/queries/course.queries.js";
import {config} from 'dotenv';

// load .ENV
config();

//------------login-------------------------
const getLogin = async (req, res) => {
  res.render("login");
};

const postLogin = async (req, res) => {
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

      // Check if the user_courses table exists
      const [tableCheck] = await pool.query(tableCheckQuery, "user_courses");
      const tableExists = tableCheck.length > 0;

      if (!tableExists) {
        // Create user_courses table if it doesn't exist
        await pool.query(createTableUserCourses);
        console.log(`\n--- user_courses table created\n`);
      }

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
  const { username, name, email, password } = req.body;

  // Add validation for required fields
  if (!username || !password) {
    return res.status(400).send("Username and password are required.");
  }

  try {
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // ...SET DEFAULT ROLES 
    let role = 'user'; // Default role is 'user'
    if (req.session.user && process.env.ADMIN) {
      role = 'admin';
    }

    const data = [
      username,
      name,
      email,
      hashedPassword, // Save the hashed passwords
      role
    ];

    // Insert into users db
    const [rows] = await pool.query(postSignupQuery, data);

    // Set the user in the session
    req.session.user = { username, name, email, role }; 

    // message on redirect
    res.redirect("/?message=Signup successful. Logged in automatically.");
    console.log("\n*** Signed ip\n")

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
