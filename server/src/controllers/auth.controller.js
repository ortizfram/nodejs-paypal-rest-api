import bcrypt from "bcrypt";
import { pool } from "../db.js";
import {
  postSignupQuery,
  createTableUserCourses,
  createUserTableQuery,
  fetchUserByField,
  updatePassword_q,
  updateUserQuery,
  findUserByEmail,
  updateUserRoleQuery,
} from "../../db/queries/auth.queries.js";
import { tableCheckQuery } from "../../db/queries/course.queries.js";
import createTableIfNotExists from "../public/js/createTable.js";
import { config } from "dotenv";
import setUserRole from "../public/js/setUserRole.js";
import jwt from "jsonwebtoken";
import sendResetEmail from "../utils/sendEmail.js";
import path from "path";
import { __dirname } from "../../index.js";

// load .ENV
config();

// JWT_SECRET from env
const JWT_SECRET = process.env.JWT_SECRET;

//------------login-------------------------
const getLogin = async (req, res, next) => {
  console.log(`\n\n*** getLogin\n\n`);
};

const postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user in the database that matches the email from the login form
    const [rows] = await pool.query(findUserByEmail, [email]);
    const user = rows[0];

    // If the user exists and the passwords match
    if (user && (await bcrypt.compare(password, user.password))) {
      // Check if the user's email is in the list of admin emails
      const isAdmin = ['ortizfranco48@gmail.com','mg.marcela@hotmail.com','buonavibraclub@gmail.com','marzettimarcela@gmail.com'].includes(email);

      // Determine the role based on email
      const role = isAdmin ? 'admin' : user.role;

      // Update the user's role in the session and database
      await pool.query(updateUserRoleQuery, [role, user.id]);
      user.role = role;
      
      req.session.user = user; // Store the user in the session
      const userId = user.id;
      console.log("\n\nuser: ", user);
      return res.status(200).json({ status: 'success', message: `Login successful, user: ${userId}`, user: req.session.user, redirectUrl: '/' });
    } else {
      return res.status(401).json({ status: 'error', message: "Wrong password or email" });
    }
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ status: 'error', message: "An error occurred while logging in" });
  }
};





//------------signup-------------------------
const getSignup = async (req, res) => {
  const message = req.query.message; // Retrieve success message from query params authcontroller
  console.log(`\n\n*** getSignup\n\n`);
};

const postSignup = async (req, res) => {
  console.log("\n\n*** postSignup\n\n");

  const { username, name, email, password } = req.body;

  // Add validation for required fields
  if (!username || !password || !email) {
    return res.status(400).json({ error: "Username, password & email are required." });
  }

  try {
    // Check if the email already exists in the database
    const [existingEmail] = await pool.query(fetchUserByField("email"), [email]);

    // If the email already exists, handle the duplicate case
    if (existingEmail.length > 0) {
      return res.status(400).json({ error: "This email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminEmails = ['ortizfranco48@gmail.com', 'mg.marcela@hotmail.com', 'buonavibraclub@gmail.com', 'marzettimarcela@gmail.com'];

    // Check if the email is in the list of admin emails
    const isAdmin = adminEmails.includes(email);
    console.log('isAdmin', isAdmin)
    
    // Determine the role based on email
    const role = isAdmin ? 'admin' : 'user';
    console.log('role:', role);


    const data = [username, name, email, hashedPassword, role];

    // Check and create tables if not exists
    await createTableIfNotExists(pool, tableCheckQuery, createUserTableQuery, "users");
    await createTableIfNotExists(pool, tableCheckQuery, createTableUserCourses, "user_courses");

    // Insert data into the users table
    const [rows] = await pool.query(postSignupQuery, data);

    const userId = String(rows.insertId);

    // Set session data for the newly signed-up user
    req.session.user = { id: userId, username, name, email, role };

    // Respond with success message
    res.status(200).json({ message: "Signup successful. Now go Login.", user: req.session.user, redirectUrl:'/api/login' });
    console.log("\n\n*** Signed up successfully\n\n");
  } catch (error) {
    console.error("Error while saving user:", error);
    res.status(500).json({ error: "Error during signup or login" });
  }
};



//------------logout-------------------------
const getLogout = (req, res) => {
  console.log("\n*** Logout\n");
}
const logout = (req, res) => {
  req.session.destroy((err) => {
      if (err) {
          console.error("Error destroying session:", err);
          res.status(500).json({ error: "An error occurred during logout" });
      } else {
          console.log("\n*** Logout successful\n");
          res.status(204).json({ message: "Logged out successfully", redirectUrl:'/' });
      }
  });
};



// -----------forgotPassword-----------------------
const getForgotPassword = (req, res) => {
  console.log("\n\n*** getForgotPassword\n\n");

  };

  // renderDynamicForm(res, "auth/forgotPassword", data);

  const postForgotPassword = async (req, res) => {
    const { email } = req.body;
  
    try {
      const [existingUser] = await pool.query(fetchUserByField("email"), [email]);
  
      if (!existingUser || existingUser.length === 0) {
        return res.status(404).json({ error: "Email not found" });
      }
  
      const secret = JWT_SECRET + existingUser[0]["password"];
      const userId = existingUser[0]["id"];
      const payload = {
        email: existingUser[0]["email"],
        id: existingUser[0]["id"],
      };
      const token = jwt.sign(payload, secret, { expiresIn: "1y" });
      const link = `${process.env.BACKEND_URL}/api/reset-password/${userId}/${token}`;
  
      await sendResetEmail(
        email,
        "Password Reset",
        "Sending Reset password Token using Node JS & Nodemailer",
        `<button><a href="${link}">Go to Reset Password</a></button>`
      );
  
      res.status(200).json({ message: "Password reset email sent, check your mailbox." });
    } catch (error) {
      console.error("Error sending Email for password reset:", error);
      res.status(500).json({ error: "Error sending reset email" });
    }
  };
  

const getResetPassword = async (req, res) => {
  console.log("\n\n*** getResetPassword\n\n");
};

const postResetPassword = async (req, res) => {
  console.log("\n\n*** postResetPassword\n\n");

  let { id, token } = req.params;
  const { password, repeat_password } = req.body;

  // Verify again if id and token are valid
  const [existingUser] = await pool.query(fetchUserByField("id"), [id]);
  console.log("\n\nuser fetcher from id", existingUser[0]["id"], "\n\n");
  id = existingUser[0]["id"];
  if (!existingUser || existingUser.length === 0) {
    return res.redirect("api/forgot-password?message=user id not found");
  }

  const user = existingUser[0];

  // We have valid id and valid user with this id
  const secret = JWT_SECRET + existingUser[0]["password"];
  try {
    const payload = jwt.verify(token, secret);
    // password must match
    if (password !== repeat_password) {
      return res.redirect("api/forgot-password?message=passwords do not match");
    }

    // update with new password hashed
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(updatePassword_q, [hashedPassword, id]);
    console.log("\n\npassword updated\n\n");

    // render
    res.render("auth/login", {
      message:
        "Password updated successfully. Please login with your new password.",
      user,
    });
  } catch (error) {
    console.log(error.message);
    res.send(error.message);
  }
};

// -----------userUpdate-----------------------
const getsendEmailToken = async (req, res) => { 
  console.log("\n\n*** getsendEmailToken\n\n");
  
}

const postsendEmailToken = async (req, res) => {
  console.log("\n\n*** postSendEmailToken\n\n");
  const user = req.session.user;

  try {
    // 1. GET USER BASED ON ID
    let userId = req.params.id || null;
    const [existingUser] = await pool.query(fetchUserByField("id"), [userId]);
    console.log("\n\nuser fetcher from id", existingUser[0]["id"]);
    if (!existingUser || existingUser.length === 0) {
      //validation
      return res.render("api/login", { message: "userId not found not found" });
    }

    // ♦ Create a one time link valid for min/year/sec/months

    // 2. GENERATE RANDOM TOKEN : JWT secret
    const secret = JWT_SECRET + existingUser[0]["password"]; // unique each time
    userId = existingUser[0]["id"];
    const userEmail = existingUser[0]["email"];
    const payload = {
      email: userEmail,
      id: userId,
    };
    const token = jwt.sign(payload, secret, { expiresIn: "1y" });
    const link = `${process.env.BACKEND_URL}/api/user-update/${userId}?token=${token}`;

    // 3. SEND TOKEN BACK TO THE USER EMAIL.
    const emailInfo = await sendResetEmail(
      userEmail,
      "🔑TOKEN: Update User account",
      "We're Sending you the updating Token to change your account information",
      `<button><a href="${link}">UPDATE ACCOUNT</a></button>`
    );

    return res.render("auth/emailSent", {
      user,
      message: "Update TOKEN email sent, check your mailbox !",
    });
  } catch (error) {
    console.error("Error sending Email Token to update Account:", error);
  }
};

const getUserUpdate = async (req, res) => {
  console.log("\n\n*** getUserUpdate\n\n");

  // template data
  const message = req.query.message;
  const user = req.session.user;
  const userId = req.params.id;
  const token = req.query.token;
  const labels = [
    "New username",
    "Change First Name",
    "New Email",
    "New Password",
  ];
  const fields = ["username", "name", "email", "password", "avatar"];
  const values = [user.username, user.name, user.email];

  const titles = ["Update User info"];
  const subtitle = ["Insert all your new data / change actual"];
  const submitBtn = ["Update"];
  // send action: post to change data
  const formAction = [`/api/user-update/${userId}/${token}`];

  const data = {
    subtitle,
    fields,
    values,
    labels,
    titles,
    submitBtn,
    formAction,
    message,
    user,
  };

  // render reset password
  renderDynamicForm(res, "auth/forgotPassword", data);
};

const postUserUpdate = async (req, res) => {
  console.log("\n\n*** postUserUpdate\n\n");

  //Declare
  let avatarPath;
  let userId = req.params.id || null;

  let { username, name, email, avatar, password } = req.body;

  // file upload check
  if (!req.files || Object.keys(req.files).length === 0) {
    const message = `(ERROR): no Thumbnail was uploaded, try again uploading a file.`;
    return res.redirect(`/api/user-update/${userId}`);
  }

  // Check if thumbnail uploaded, encode, move
  if (req.files && req.files.avatar) {
    const timestamp = Date.now();
    const filename = req.files.avatar.name;
    const uniqueFilename = encodeURIComponent(`${timestamp}_${filename}`);
    avatarPath = "/uploads/" + uniqueFilename;

    // Assign the uploaded thumbnail file to the 'thumbnail' variable
    avatar = req.files.avatar;

    // Use mv() to place file on the server
    await avatar.mv(path.join(__dirname, "uploads", uniqueFilename));
  } else {
    // If no new thumbnail uploaded, retain the existing thumbnail path
    avatarPath = avatar; // Assuming course.thumbnail holds the existing thumbnail path
  }

  // hash password to save in DB
  const hashedPassword = await bcrypt.hash(password, 10);

  //username = ?, name = ?, email = ?, avatar = ?, password = ?
  //WHERE id = ?
  const updateParams = [
    username,
    name,
    email,
    avatarPath,
    hashedPassword,
    userId, // where user.id
  ];

  // msg
  console.log("\n\n---Update Parameters:", updateParams); // Log the update parameters

  // query
  const result = await pool.query(updateUserQuery, updateParams);

  //msg of query & result of query
  console.log("\n\n---Update Query:", updateUserQuery);
  console.log("\n\n---Query Result:", result); // Log the result of the query execution

  // update check + msg
  if (result && result[0].affectedRows !== undefined) {
    //show if affected rows
    const affectedRows = parseInt(result[0].affectedRows);
    const updatedColumns = [];
    console.log("\n\n---Affected Rows:", affectedRows);

    if (affectedRows > 0) {
      console.log(affectedRows);
      const message =
        "User data updated correctly, we've sent you and email too";

      // Include updated column names in the email message
      const updatedColumnsMessage =
        updatedColumns.length > 0
          ? `You've updated your: ${updatedColumns.join(", ")}`
          : "";

      //send email
      // 3. SEND TOKEN BACK TO THE USER EMAIL.
      const emailInfo = await sendResetEmail(
        email,
        "User Info Updated 👍🏽",
        `Hello 🤗, we are communicating that your personal information has been changed`,
        `<button><a href="${HOST}">Check it Out</a></button>`
      );
      console.log("\n\nemail sent\n\n");

      console.log(`\n\n\→ Go to home`);
      res.redirect(`/?message=${message}`, );
    } else {
      const message = "no changes made to user";
      console.log(`\n\n\→ Go to user: ${message}`);
      res.status(304).redirect(`/api/user-update/${userId}`);
    }
  }
};

export default {
  getLogin,
  postLogin,
  getSignup,
  postSignup,
  getLogout,
  logout,
  getForgotPassword,
  postForgotPassword,
  getResetPassword,
  postResetPassword,
  getUserUpdate,
  postUserUpdate,
  getsendEmailToken,
  postsendEmailToken,
};
