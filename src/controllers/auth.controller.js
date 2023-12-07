import bcrypt from "bcrypt";
import { pool } from "../db.js";
import { postSignupQuery, postLoginQuery, createTableUserCourses, createUserTableQuery, fetchUserByField } from "../../db/queries/auth.queries.js";
import { tableCheckQuery } from "../../db/queries/course.queries.js";
import createTableIfNotExists from "../public/js/createTable.js";
import {config} from 'dotenv';
import setUserRole from "../public/js/setUserRole.js";

// load .ENV
config();

//------------login-------------------------
const getLogin = async (req, res) => {
  const user = req.session.user || null; // Get the user from the session or set to null if not logged in
  const message = req.query.message; // Retrieve success message from query params authcontroller
  res.render("auth/login", {user,message});
};

const postLogin = async (req, res, next) => {
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
      next();

      

    } else {
      res.send("Wrong password or username");
    }
  } catch (error) {
    res.send("An error occurred while logging in");
  }
};
//------------signup-------------------------
const getSignup = async (req, res) => {
  const user = req.session.user || null; // Get the user from the session or set to null if not logged in
  const message = req.query.message; // Retrieve success message from query params authcontroller
  res.render("auth/signup", {user, message});
};

const postSignup = async (req, res) => {
  console.log("\n\n*** postSignUp\n\n");
  
  let role = 'user'; //default role: user
  const user = req.session.user || null; 

  const { username, name, email, password } = req.body;

  // Add validation for required fields
  if (!username || !password || !email) {
    return res.status(400).send("Username, password & email are required.");
  }

  try {
    // Check if the email already exists in the database
    const fetchUser_q = fetchUserByField('email');
    const [existingEmail] = await pool.query(fetchUser_q, [email]);
    const [existingUsername] = await pool.query(fetchUser_q, [username]);

    // If the email already exists, handle the duplicate case
    if (existingEmail.length > 0) {
      return res.status(400).render("auth/signup", {user,message:"This email is already registered."});
    } 
    // If the username already exists, handle the duplicate case
    if (existingUsername.length > 0) {
      return res.status(400).render("auth/signup", {user,message:"This username is already registered."});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const data = [
      username,
      name,
      email,
      hashedPassword,
      role
    ];

    // table check
    const checkTable_users = await createTableIfNotExists(pool, tableCheckQuery, createUserTableQuery, "users");
    const checkTable_user_courses = await createTableIfNotExists(pool, tableCheckQuery, createTableUserCourses, "user_courses");

    // insert to table: user
    const [rows] = await pool.query(postSignupQuery, data);
    // get inserted user's id 
    const id = String(rows.insertId);


    //signup user & singin
    req.session.user = { id, username, name, email, role }; 

    //set up role
    const emailCheck = req.session.user.email === process.env.ADMIN_EMAIL
    if (emailCheck) {
      setUserRole('admin', req.session.user.email);// Use the retrieved ID here
    } 

    //redirect
    res.redirect("/?message=Signup successful. Logged in automatically.");
    console.log("\n\n*** Signed up successfully\n\n");
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

// -----------forgotPassword-----------------------
const renderDynamicForm = (res, template, data) => {
  res.render(template, data);
}

const getForgotPassword = (req, res) => {
  const message = req.query.message;
  const user = req.session.user || null;

  const fields = ['email'];
  const titles = ['Forgot Password'];
  const submitBtn = ['Reset password'];

  const data = {
    fields,
    titles,
    submitBtn,
    message,
    user
  }

  renderDynamicForm(res, "auth/forgotPassword", data);
};

const postForgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email exists in the database
    const [existingUser] = await pool.query(fetchUserByField('email'), [email]);

    if (!existingUser || existingUser.length === 0) {
      return res.render("auth/forgot-password", { message: "Email not found" });
    }

    // Generate a reset token (you may use a library like 'crypto' to create a random token)
    const resetToken = generateResetToken(); // Implement this function

    // Store the reset token in the database for the user
    await storeResetToken(email, resetToken); // Implement this function

    // Send an email to the user with the reset link containing the token
    sendResetEmail(email, resetToken); // Implement this function

    res.render("auth/forgot-password", { message: "Password reset email sent" });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    res.render("auth/forgot-password", { message: "Error sending reset email" });
  }
};
const getResetPassword = (req, res) => {
  const { token } = req.params;
  res.render("auth/reset-password", { token });
};

const postResetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Verify the token from the request
    const email = await verifyResetToken(token); // Implement this function

    // If the token is valid, update the user's password
    if (email) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await updatePassword(email, hashedPassword); // Implement this function
      res.render("auth/reset-password", { message: "Password reset successful" });
    } else {
      res.render("auth/reset-password", { message: "Invalid or expired token" });
    }
  } catch (error) {
    console.error("Error resetting password:", error);
    res.render("auth/reset-password", { message: "Error resetting password" });
  }
};


export default {
  getLogin,
  postLogin,
  getSignup,
  postSignup,
  logout,
  getForgotPassword,
  postForgotPassword,
  getResetPassword,
  postResetPassword,
};
