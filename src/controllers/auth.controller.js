import bcrypt from "bcrypt";
import { pool } from "../db.js";
import { postSignupQuery, postLoginQuery } from "../../db/queries/auth.queries.js";

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
      res.redirect("/?message=Login successful");
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
  const { username, name, email, password } = req.body;

  // Add validation for required fields
  if (!username || !password) {
    return res.status(400).send("Username and password are required.");
  }

  try {
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    const data = [
      username,
      name,
      email,
      hashedPassword, // Save the hashed passwords
    ];

    // Insert into users db
    const [rows] = await pool.query(postSignupQuery, data);

    // Set the user in the session
    req.session.user = { username, name, email }; 

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
