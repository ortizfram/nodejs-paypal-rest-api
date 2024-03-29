import bcrypt from "bcrypt";
import {
  fetchUserByField,
  updateUserQuery,
} from "../../db/queries/auth.queries.js";
import setUserRole from "../public/js/setUserRole.js";
import jwt from "jsonwebtoken";
import sendResetEmail from "../utils/sendEmail.js";
import path from "path";
import { __dirname, db } from "../../server.js";


// JWT_SECRET from env
const JWT_SECRET = process.env.JWT_SECRET;


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
  getUserUpdate,
  postUserUpdate,
  getsendEmailToken,
  postsendEmailToken,
};
