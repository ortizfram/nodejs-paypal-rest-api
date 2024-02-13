import cors from "cors";
import express from "express";
import session from "express-session";
import path from "path";
import mysql from "mysql2";
import bcrypt from "bcrypt";
import sendResetEmail from "./src/utils/sendEmail.js";
import jwt from "jsonwebtoken";
import slugify from "slugify";
import { fileURLToPath } from "url";
import morgan from "morgan";
import methodOverride from "method-override";
import { getUserEnrolledCoursesQuery } from "./db/queries/course.queries.js";
import multer from "multer";
import moment from "moment";
// shortcuts for files/dirs
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// Use sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret", // Change this to a secure secret key
    resave: false,
    saveUninitialized: true,
  })
);

// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  DB CONFIG and BASE UR  L^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
console.log(`\n\n${process.env.NODE_ENV}\n\n`);
const isDev = process.env.NODE_ENV === "development";
export const db = mysql.createConnection({
  host: isDev ? "127.0.0.1" : process.env.DB_HOST,
  user: isDev ? "root" : process.env.DB_USER,
  password: isDev ? "melonmelon" : process.env.DB_PASSWORD,
  database: isDev ? "conn" : process.env.DB_NAME,
  port: isDev ? 3307 : process.env.DB_PORT,
});
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

const port = 6004;
const HOST = process.env.HOST;
const FRONTEND_URL = isDev ? "http://localhost:3000" : process.env.FRONTEND_URL;
const BACKEND_URL = isDev ? "http://localhost:6004" : process.env.BACKEND_URL;

// %%%%%%%%%%%%%%%%%%%%%%%%%%% UPLOAD FILES & HANDLINGUPLOAD ENDPOINTS %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// Multer storage configuration for both images and videos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = file.mimetype.startsWith("video") ? "videos" : "imgs";
    cb(null, path.join(__dirname, "src", "uploads", uploadPath));
  },
  filename: function (req, file, cb) {
    const prefix = file.mimetype.startsWith("video") ? "video" : "image";
    cb(null, prefix + "-" + Date.now() + path.extname(file.originalname));
  },
});

// Create multer upload instance
const upload = multer({ storage: storage });

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "src", "uploads")));

// Handling image and video upload route
// app.post('/upload', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), async(req, res) => {
//   const imageUrl = req.files['image'] ? '/uploads/' + req.files['image'][0].filename : null;
//   const videoUrl = req.files['video'] ? '/uploads/' + req.files['video'][0].filename : null;

//   if (!imageUrl && !videoUrl) {
//     return res.status(400).send('No files uploaded.');
//   }

//   res.status(200).json({ imageUrl: imageUrl, videoUrl: videoUrl });
// });

// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& MIDDLEWARE ENDPOINTS %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// Define the route to retrieve userData
app.get("/userData", async (req, res) => {
  try {
    // Check if the user is authenticated and their ID is available in the session
    if (!req.session || !req.session.user || !req.session.user.id) {
      return res
        .status(401)
        .json({ message: "User ID not found in the session" });
    }

    // Retrieve userData based on the user ID from your database or any other source
    const userId = req.session.user.id;

    // Example: Retrieve userData from a database
    // Replace this with your actual code to fetch userData
    let sql = "SELECT * FROM users WHERE id = ?";
    const userData = await db.promise().execute(sql, [userId]);

    // Send the userData in the response
    res.status(200).json({ userData });
  } catch (error) {
    console.error("Error retrieving userData:", error);
    res.status(500).json({ message: "Error retrieving userData" });
  }
});

// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^   ENDPOINTS   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
app.get("/", async (req, res) => {});

// course create
app.post(
  "/api/course/create",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  async (req, res) => {
    console.log(req.body);
    console.log(req.files);

    try {
      const imageUrl =
        req.files && req.files["image"]
          ? "/uploads/" + req.files["image"][0].filename
          : null;
      const videoUrl =
        req.files && req.files["video"]
          ? "/uploads/" + req.files["video"][0].filename
          : null;

      if (!imageUrl && !videoUrl) {
        return res.status(400).send("No files uploaded.");
      }

      // Extract necessary data from request body
      const {
        title,
        description,
        text_content,
        ars_price,
        usd_price,
        discount_ars,
        discount_usd,
        author: authorId,
      } = req.body;

      // Validate required fields
      const requiredFields = [
        "title",
        "description",
        "text_content",
        "ars_price",
        "usd_price",
      ];
      for (const field of requiredFields) {
        if (!req.body[field]) {
          return res
            .status(400)
            .json({ message: `The field '${field}' is required.` });
        }
      }

      // Ensure title is a string
      let courseTitle = title;
      if (typeof title !== "string") {
        courseTitle = String(title);
      }

      // Generate course slug
      const courseSlug = slugify(courseTitle, { lower: true, strict: true });

      // Manage discount value
      const discountArs = discount_ars || null;
      const discountUsd = discount_usd || null;

      // Generate unique filename for thumbnail
      const timestamp = Date.now();
      const thumbnailFilename = req.files["image"][0].filename;
      const thumbnailPath = req.files["image"]
        ? "/uploads/imgs/" + req.files["image"][0].filename
        : null;

      // Generate unique filename for video
      const videoFilename = req.files["video"][0].filename;
      const videoPath = req.files["video"]
        ? "/uploads/videos/" + req.files["video"][0].filename
        : null;

      // Get current timestamp
      const currentDate = new Date();
      const currentTimestamp = moment().format("YYYY-MM-DD HH:mm:ss");

      // Prepare course data
      const courseData = [
        courseTitle,
        courseSlug,
        description,
        text_content,
        ars_price,
        usd_price,
        discountArs,
        discountUsd,
        thumbnailPath,
        videoPath,
        currentTimestamp,
        currentTimestamp,
        authorId,
      ];

      // Insert course data into the database
      const sql = `INSERT INTO courses (title, slug, description, text_content, ars_price, usd_price, discount_ars, discount_usd, thumbnail, video, created_at, updated_at, author_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      await db.promise().execute(sql, courseData);

      // Fetch the created course
      const [fetchedCourse] = await db
        .promise()
        .execute(`SELECT * FROM courses WHERE slug = ?`, [courseSlug]);
      const course = fetchedCourse[0];

      console.log("\nCreating course...");
      console.log("\nCourse:", course);

      // Redirect after creating the course
      return res.status(201).json({
        message: "Course created successfully",
        redirectUrl: `/api/courses`,
      });
    } catch (error) {
      console.error("Error creating the course:", error);
      return res.status(500).json({
        message: "Error creating the course",
        error: error.message,
      });
    }
  }
);

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user in the database that matches the email from the login form
    const sql = "SELECT * FROM users WHERE email = ?";
    const [rows] = await db.promise().execute(sql, [email]);
    const user = rows[0];

    // If the user exists and the passwords match
    if (user && (await bcrypt.compare(password, user.password))) {
      // Check if the user's email is in the list of admin emails
      const isAdmin = [
        "ortizfranco48@gmail.com",
        "mg.marcela@hotmail.com",
        "buonavibraclub@gmail.com",
        "marzettimarcela@gmail.com",
      ].includes(email);

      // Determine the role based on email
      const role = isAdmin ? "admin" : user.role;

      // Update the user's role in the session and database
      const sql = "UPDATE users SET role = ? WHERE id = ?";
      await db.promise().execute(sql, [role, user.id]);
      user.role = role;

      req.session.user = user; // Store the user in the session
      const userId = user.id;
      console.log("\n\nuser: ", user);
      return res.status(200).json({
        status: "success",
        message: `Login successful, user: ${userId}`,
        user: req.session.user,
        redirectUrl: "/",
      });
    } else {
      return res
        .status(401)
        .json({ status: "error", message: "Wrong password or email" });
    }
  } catch (error) {
    console.error("Error logging in:", error);
    return res
      .status(500)
      .json({ status: "error", message: "An error occurred while logging in" });
  }
});

app.post("/signup", async (req, res) => {
  const { username, name, email, password } = req.body;

  // Add validation for required fields
  if (!username || !password || !email) {
    return res
      .status(400)
      .json({ error: "Username, password & email are required." });
  }

  try {
    // Check if the email already exists in the database
    let sql = `SELECT * FROM users WHERE email = ?`;
    const [existingEmail] = await db.promise().execute(sql, [email]);

    // If the email already exists, handle the duplicate case
    if (existingEmail.length > 0) {
      return res
        .status(400)
        .json({ error: "This email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminEmails = [
      "ortizfranco48@gmail.com",
      "mg.marcela@hotmail.com",
      "buonavibraclub@gmail.com",
      "marzettimarcela@gmail.com",
    ];

    // Check if the email is in the list of admin emails
    const isAdmin = adminEmails.includes(email);
    console.log("isAdmin", isAdmin);

    // Determine the role based on email
    const role = isAdmin ? "admin" : "user";
    console.log("role:", role);

    const data = [username, name, email, hashedPassword, role];

    // Insert data into the users table
    sql =
      "INSERT INTO users (username, name, email, password, role) VALUES (?, ?, ?, ?, ?)";
    const [rows] = await db.promise().execute(sql, data);

    const userId = String(rows.insertId);

    // Set session data for the newly signed-up user
    req.session.user = { id: userId, username, name, email, role };

    // Respond with success message
    res.status(200).json({
      message: "Signup successful. Now go Login.",
      user: req.session.user,
      redirectUrl: "/login",
    });
    console.log("\n\n*** Signed up successfully\n\n");
  } catch (error) {
    console.error("Error while saving user:", error);
    res.status(500).json({ error: "Error during signup or login" });
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      res.status(500).json({ error: "An error occurred during logout" });
    } else {
      console.log("\n*** Logout successful\n");
      res
        .status(204)
        .json({ message: "Logged out successfully", redirectUrl: "/" });
    }
  });
});

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    let sql = `SELECT * FROM users WHERE email = ?`;
    const [existingUser] = await db.promise().execute(sql, [email]);

    if (!existingUser || existingUser.length === 0) {
      return res.status(404).json({ error: "Email not found" });
    }

    const secret = process.env.JWT_SECRET + existingUser[0]["password"];
    const userId = existingUser[0]["id"];
    const payload = {
      email: existingUser[0]["email"],
      id: existingUser[0]["id"],
    };
    const token = jwt.sign(payload, secret, { expiresIn: "1y" });
    const link = `${FRONTEND_URL}/reset-password/${userId}/${token}`;

    await sendResetEmail(
      email,
      "Password Reset",
      "Sending Reset password Token using Node JS & Nodemailer",
      `<button><a href="${link}">Go to Reset Password</a></button>`
    );

    res
      .status(200)
      .json({ message: "Password reset email sent, check your mailbox." });
  } catch (error) {
    console.error("Error sending Email for password reset:", error);
    res.status(500).json({ error: "Error sending reset email" });
  }
});

app.post("/reset-password/:id/:token", async (req, res) => {
  let { id, token } = req.params;
  console.log(`id${id},token${token}`);
  const { password, repeat_password } = req.body;

  // Verify again if id and token are valid
  let sql = `SELECT * FROM users WHERE id = ?`;
  const [existingUser] = await db
    .promise()
    .execute(sql, [id], (err, result) => {
      if (err) {
        console.log("Error ", err);
      }
    });
  console.log("\n\nuser fetcher from id", existingUser[0]["id"], "\n\n");
  id = existingUser[0]["id"];
  if (!existingUser || existingUser.length === 0) {
    return res.status(400).json({ message: "User id not found" });
  }

  const user = existingUser[0];

  // We have valid id and valid user with this id
  const secret = process.env.JWT_SECRET + existingUser[0]["password"];
  try {
    const payload = jwt.verify(token, secret);
    // password must match
    if (password !== repeat_password) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // update with a new password hashed
    const hashedPassword = await bcrypt.hash(password, 10);
    sql = "UPDATE users SET password = ? WHERE id = ?";
    await db.promise().execute(sql, [hashedPassword, id]);
    console.log("\n\nPassword updated\n\n");

    // Send JSON response
    res.status(200).json({
      message:
        "Password updated successfully. Please login with your new password.",
      user,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/courses", async (req, res) => {
  try {
    const message = req.query.message;
    let user = req.session.user;
    const isAdmin = user && user.role === "admin";

    // Fetch all courses ordered by updated_at descending
    let sql = `
      SELECT 
        courses.*,
        users.id AS author_id,
        users.name AS author_name,
        users.username AS author_username,
        users.avatar AS author_avatar
      FROM 
        courses
      LEFT JOIN 
        users ON users.id = courses.author_id
      ORDER BY 
        courses.updated_at DESC
    `;

    const [coursesRows] = await db.promise().query(sql);
    console.log("coursesRows: ", coursesRows);

    let courses = coursesRows.map((course) => {
      return {
        title: course.title,
        slug: course.slug,
        description: course.description,
        ars_price: course.ars_price,
        usd_price: course.usd_price,
        discount_ars: course.discount_ars,
        discount_usd: course.discount_usd,
        thumbnail: course.thumbnail,
        id: course.id.toString(),
        thumbnailPath: course.thumbnail,
        created_at: new Date(course.created_at).toLocaleString(),
        updated_at: new Date(course.updated_at).toLocaleString(),
        author: {
          name: course.author_name,
          username: course.author_username,
          avatar: course.author_avatar,
        },
        next: `/api/course/${course.id}`, // Dynamic course link
      };
    });

    // Filter courses for enrolled user
    let enrolledCourseIds = [];
    if (user) {
      const enrolledSql = `
        SELECT 
          courses.*,
          users.name AS author_name,
          users.username AS author_username,
          users.avatar AS author_avatar
        FROM 
          user_courses 
        JOIN 
          courses ON user_courses.course_id = courses.id
        JOIN 
          users ON courses.author_id = users.id
        WHERE 
          user_courses.user_id = ?
      `;
      const [enrolledCoursesRows] = await db.promise().query(enrolledSql, [user.id]);
      enrolledCourseIds = enrolledCoursesRows.map((enrolledCourse) => enrolledCourse.id.toString());
    }

    // Filter out enrolled courses
    courses = courses.filter((course) => !enrolledCourseIds.includes(course.id));

    // Send courses response
    res.status(200).json({
      route: "courses",
      title: "Cursos",
      courses,
      totalItems: courses.length,
      user,
      message,
      isAdmin,
    });
  } catch (error) {
    console.log("Error fetching courses:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/course/:id", async (req, res) => {
  let courseId = req.params.id;
  const user = req.session.user || null;
  const message = req.query.message;

  try {
    console.log("\nCourseId:", courseId);
    let sql = `
        SELECT 
          courses.*,
          users.id AS author_id,
          users.name AS author_name,
          users.username AS author_username,
          users.avatar AS author_avatar
        FROM 
          courses
        LEFT JOIN 
          users ON users.id = courses.author_id
        WHERE 
          courses.id = ?;
      `;
    const [courseRows] = await db.promise().execute(sql, [courseId]);

    if (!courseRows || courseRows.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    const course = courseRows[0];
    console.log(course);
    console.log("\n\ncourse.video", course.video);
    courseId = course.id;

    // Format course timestamps and video_link
    const formattedCourse = {
      ...course,
      created_at: new Date(course.created_at).toLocaleString(),
      updated_at: new Date(course.updated_at).toLocaleString(),
    };

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Fetching author details
    sql = `
        SELECT 
          id AS author_id,
          name AS author_name,
          username AS author_username,
          avatar AS author_avatar
        FROM 
          users 
        WHERE 
          id = ?;
      `;
    const [authorRows] = await db.promise().execute(sql, [course.author_id]);
    const author = authorRows[0];
    console.log(author);

    if (!author) {
      return res.status(404).json({ error: "Author details not found" });
    }

    // Extend formattedCourse with author details
    formattedCourse.author = {
      name: author.author_name,
      username: author.author_username,
      avatar: author.author_avatar,
    };
    console.log(formattedCourse.author);

    // Fill array with query result
    let enrolledCourses = [];
    sql = `
        SELECT 
          courses.*,
          users.name AS author_name,
          users.username AS author_username,
          users.avatar AS author_avatar
        FROM 
          user_courses 
        JOIN 
          courses ON user_courses.course_id = courses.id
        JOIN 
          users ON courses.author_id = users.id
        WHERE 
          user_courses.user_id = ?;
      `;
    if (user) {
      const [enrolledRows] = await db.promise().execute(sql, [user.id]);
      enrolledCourses = enrolledRows[0]?.enrolled_courses || [];
    }

    // Send JSON response with the fetched data
    res.json({
      course: formattedCourse,
      message,
      user,
      enrolledCourses,
    });
  } catch (error) {
    console.error("Error fetching the course:", error);
    res.status(500).json({ error: "Error fetching the course" });
  }
});

app.post("/api/course/delete/:id", async (req, res) => {
  try {
    const courseId = req.params.id;

    const result = await db.promise().execute("DELETE FROM courses WHERE id = ?", [courseId]);

    // Check if any rows were affected by the deletion
    if (result && result[0].affectedRows !== undefined) {
      const affectedRows = parseInt(result[0].affectedRows);

      // Respond with a success message
      if (affectedRows > 0) {
        return res.status(200).json({ message: "Course deleted successfully" });
      } else {
        return res.status(404).json({ message: "Course not found" });
      }
    }
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ message: "Error deleting the course" });
  }
});



app.post("/api/course/update/:id", async (req, res) => {
  // get courseId
  let courseId = req.params.id; // Assuming the ID is coming from the request params
  let sql = `
      UPDATE courses
      SET title = ?,
          slug = ?,
          description = ?,
          text_content = ?,
          video = ?,
          ars_price = ?,
          usd_price = ?,
          discount = ?,
          thumbnail = ?,
          updated_at = CONVERT_TZ(NOW(), 'UTC', 'America/Argentina/Buenos_Aires')
      WHERE id = ?;
    `;

  const timestamp = Date.now();

  try {
    // Destructure req.body for easier use
    const { title, description, text_content, ars_price, usd_price, discount } =
      req.body;

    // Autogenerate slug from title
    const courseSlug = slugify(title, { lower: true, strict: true });

    // !if discount: null
    const discountValue = discount !== "" ? discount : null;

    // Check if thumbnail uploaded, encode, move
    let thumbnailPath;
    if (req.files && req.files.thumbnail) {
      const filename = req.files.thumbnail.name;
      const uniqueFilename = encodeURIComponent(`${timestamp}_${filename}`);
      thumbnailPath = "/uploads/" + uniqueFilename;

      // Assign the uploaded thumbnail file to the 'thumbnail' variable
      const thumbnail = req.files.thumbnail;

      // Use mv() to place file on the server
      await thumbnail.mv(path.join(__dirname, "uploads", uniqueFilename));
    } else {
      // If no new thumbnail uploaded, retain the existing thumbnail path
      const [existingThumbnailRows] = await db
        .promise()
        .execute("SELECT thumbnail FROM courses WHERE id = ?", [courseId]);
      thumbnailPath = existingThumbnailRows[0]?.thumbnail || "";
    }

    // Generate unique filename for video
    const videoFile = req.files.video;
    const videoFilename = videoFile.name.split(" ")[0];
    const uniqueVideoFilename = encodeURIComponent(
      `${timestamp}_${videoFilename}`
    );
    const videoPath = "/uploads/videos/" + uniqueVideoFilename;

    // video file upload handling
    await videoFile.mv(
      path.join(__dirname, "uploads/videos", uniqueVideoFilename),
      async (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error uploading the video file");
        }
      }
    );

    const updateParams = [
      title,
      courseSlug,
      description,
      text_content,
      videoPath,
      ars_price,
      usd_price,
      discountValue,
      thumbnailPath,
      courseId,
    ];

    // Execute update query
    const result = await db.promise().execute(sql, updateParams);

    // Log the result of the query execution
    console.log("\n\n---Update Query Result:", result);

    // Update check msg
    if (result && result[0].affectedRows !== undefined) {
      // Show if affected rows
      const affectedRows = parseInt(result[0].affectedRows);
      console.log("\n\n---Affected Rows:", affectedRows);

      if (affectedRows > 0) {
        const message = "Course updated correctly";
        console.log(`\n\n\→ Go to courseModules: ${message}`);

        // Set MIME type for the uploaded video
        setCustomMimeTypes(
          {
            path: `/uploads/videos/${uniqueVideoFilename}`,
          },
          res,
          () => {} // Empty callback as it's not required in this context
        );

        res.redirect(`/api/course/${courseId}`);
      } else {
        const message = "No changes made to the course";
        console.log(`\n\n\→ Go to courseModules: ${message}`);
        res.status(201).redirect(`/api/course/${courseId}`);
      }
    }
  } catch (error) {
    console.error("Error updating course:", error);
    console.error("Database Error:", error.sqlMessage);
    res.status(500).json({ message: "Error updating the course" });
  }
});

// *************************************  SERVE COMMON FILES CONFIG  *******************************************************************************
// Serve static files from React build directory
app.use(express.static(path.join(__dirname, "../client/build")));

// Catch-all route to serve the React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

// Serve files from 'public' directory
app.use(express.static(path.join(__dirname, "src", "public")));

// ===============================================================================

// configure methodOverride
app.use(methodOverride("_method"));

// Set default time zone
Intl.DateTimeFormat = Intl.DateTimeFormat(undefined, {
  timeZone: "America/Argentina/Buenos_Aires",
});

// Use morgan to see requests in console
app.use(morgan("dev"));

// Use sessions =================================================================================
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret", // Change this to a secure secret key
    resave: false,
    saveUninitialized: true,
  })
);

// MIDDLEWARE ===============================================================================================
// Define a function to set MIME types based on file extensions
export const setCustomMimeTypes = (req, res, next) => {
  const extension = req.path.split(".").pop();
  let contentType = "";

  switch (extension) {
    case "mp4":
    case "m4v":
    case "f4v":
    case "f4p":
      contentType = "video/mp4";
      break;
    case "ogv":
      contentType = "video/ogg";
      break;
    case "webm":
      contentType = "video/webm";
      break;
    case "flv":
      contentType = "video/x-flv";
      break;
    default:
      contentType = "application/octet-stream"; // Default MIME type for unknown files
  }

  res.set("Content-Type", contentType);
  next();
};

// Middleware to set MIME types for videos
app.use(
  "/uploads/videos",
  setCustomMimeTypes,
  express.static(path.join(__dirname, "uploads/videos"))
);

// middleware for 404
app.use((req, res) => {
  res.status(404).json({
    message: "endpoint Not Found",
  });
});

// middleware for session
const initSession = (req, res, next) => {
  if (!req.session) {
    console.error("Session not initialized!");
  }
  next();
};
app.use(initSession);

// middleware for admin&staff
export function admin_staff_check(req, res, next) {
  const user = req.session.user;
  if (!user || (user.role !== "staff" && user.role !== "admin")) {
    return res.status(403).send(`Forbidden`);
  }
  next();
}

// Middleware for checking course enrollment
export async function checkCourseEnrollment(req, res, next) {
  console.log("\n\n*** middleware: checkCourseEnrollment\n\n");
  const courseId = req.params.id;
  console.log("\n\ncourseId: ", courseId);
  const user = req.session.user || null;

  try {
    if (!user) {
      return res.status(403).redirect("/api/login");
    }
    //
    const [enrolledRows] = await db
      .promise()
      .execute(getUserEnrolledCoursesQuery, [user.id]);
    console.log("\n\nenrolledRows: ", enrolledRows);

    // Extracting course IDs from the fetched data (assuming the ID field is 'course_id')
    const enrolledCourses = enrolledRows.map((row) => row.id);

    if (enrolledCourses.includes(parseInt(courseId))) {
      // User is enrolled in the course, proceed to render the courseDetail
      return next();
    } else {
      // You are not enrolled in this course
      // Redirect the user to the course overview URL
      return res.redirect(`/api/course/${courseId}/enroll`);
    }
  } catch (error) {
    console.error("Error checking user enrollment:", error);
    return res.status(500).send("Error checking user enrollment");
  }
}

// middleware for admin&staff clinking a course
export async function admin_staff_clicking_course(req, res, next) {
  const user = req.session.user || null;
  if (!user || (user.role !== "staff" && user.role !== "admin")) {
    // if not staff/admin, send to course enrollment middleware
    await checkCourseEnrollment(req, res, next);
  }

  // if staff/admin render course detail without passing through enrollment middleware
  next();
}

// CONNECTION ********************************************************************************************************************
app.listen(port, () => {
  console.log(`Listening ${BACKEND_URL}`);
});

export default app;
