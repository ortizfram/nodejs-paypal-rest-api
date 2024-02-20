import cors from "cors";
import axios from "axios";
import express, { response } from "express";
import session from "express-session";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import path from "path";
import mysql from "mysql2";
import bcrypt from "bcrypt";
import sendResetEmail from "./src/utils/sendEmail.js";
import slugify from "slugify";
import { fileURLToPath } from "url";
import morgan from "morgan";
import methodOverride from "method-override";
import multer from "multer";
import moment from "moment";
import {
  getCourseFromIdQuery,
  getCourseFromSlugQuery,
  getUserEnrolledCoursesQuery,
  insertUserCourseQuery,
  tableCheckQuery,
} from "./db/queries/course.queries.js";
import { createUserTableQuery } from "./db/queries/auth.queries.js";
import createTableIfNotExists from "./src/public/js/createTable.js";
import mercadopago, {
  Payment,
  MercadoPagoConfig,
  Preference,
} from "mercadopago";
// shortcuts for files/dirs
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Allow requests from localhost:3000
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

// store sessions
const store = new session.MemoryStore();

// Use sessions
app.use(
  session({
    secret: "secretkk",
    saveUninitialized: false,
    store,
  })
);

// PRINT METHOD NAMES AND SESSION STORE
app.use((req, res, next) => {
  console.log(`\n\n${req.method} - ${req.url}`);
  next();
});

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

const port = 5002;
const HOST = process.env.HOST;
const FRONTEND_URL = isDev ? "http://localhost:3000" : process.env.FRONTEND_URL;
const BACKEND_URL = isDev ? "http://localhost:5002" : process.env.BACKEND_URL;

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
app.get(
  //home
  "/",
  async (req, res) => {
    console.log(req.session.user);
    res.status(200).json({ success: true });
  }
);

// COURSES >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

app.post(
  // course create
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

app.put(
  // course update
  "/api/course/update/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  async (req, res) => {
    console.log(req.body);
    console.log(req.files);

    try {
      const courseId = req.params.id;

      // Fetch existing course from the database
      const [existingCourse] = await db
        .promise()
        .execute(`SELECT * FROM courses WHERE id = ?`, [courseId]);
      const course = existingCourse[0];

      if (!course) {
        return res.status(404).json({ message: "Course not found." });
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

      // Manage discount value
      const discountArs = discount_ars || null;
      const discountUsd = discount_usd || null;

      // Update course details
      const sql = `UPDATE courses SET
        title = ?,
        description = ?,
        text_content = ?,
        ars_price = ?,
        usd_price = ?,
        discount_ars = ?,
        discount_usd = ?
        WHERE id = ?`;
      await db
        .promise()
        .execute(sql, [
          title,
          description,
          text_content,
          ars_price,
          usd_price,
          discountArs,
          discountUsd,
          courseId,
        ]);

      console.log("\nUpdating course...");
      console.log("\nCourse:", course);

      // Redirect after updating the course
      return res.status(200).json({
        message: "Course updated successfully",
        redirectUrl: `/api/courses`,
      });
    } catch (error) {
      console.error("Error updating the course:", error);
      return res.status(500).json({
        message: "Error updating the course",
        error: error.message,
      });
    }
  }
);

// courses list
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
      const [enrolledCoursesRows] = await db
        .promise()
        .query(enrolledSql, [user.id]);
      enrolledCourseIds = enrolledCoursesRows.map((enrolledCourse) =>
        enrolledCourse.id.toString()
      );
    }

    // Filter out enrolled courses
    courses = courses.filter(
      (course) => !enrolledCourseIds.includes(course.id)
    );

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

// courses-owned list
app.get(
  // courses-owned list
  "/api/courses-owned",
  async (req, res) => {
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

      const [coursesRows] = await db.promise().execute(sql);

      let courses = coursesRows.map((course) => {
        return {
          id: course.id,
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
      if (user) {
        const enrolledSql = `
        SELECT 
          course_id
        FROM 
          user_courses 
        JOIN 
          courses ON user_courses.course_id = courses.id
        WHERE 
          user_courses.user_id = ?
      `;
        const [enrolledCoursesRows] = await db
          .promise()
          .execute(enrolledSql, [user.id]);
        const enrolledCourseIds = enrolledCoursesRows.map((row) =>
          row.course_id.toString()
        );

        // Filter out courses not enrolled by the user
        courses = courses.filter((course) =>
          enrolledCourseIds.includes(course.id)
        );
        console.log("\ncourses: ", courses);
      } else {
        // If no user is logged in, return an empty array
        courses = [];
        console.log("\n\nuser not logged in,\ncourses: ", courses);
      }

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
  }
);

app.get(
  //course detail
  "/api/course/:id",
  async (req, res) => {
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
      // console.log(course);
      // console.log("\n\ncourse.video", course.video);
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
      // console.log(author);

      if (!author) {
        return res.status(404).json({ error: "Author details not found" });
      }

      // Extend formattedCourse with author details
      formattedCourse.author = {
        name: author.author_name,
        username: author.author_username,
        avatar: author.author_avatar,
      };
      // console.log(formattedCourse.author);

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
  }
);

app.post(
  //course delete
  "/api/course/delete/:id",
  async (req, res) => {
    try {
      const courseId = req.params.id;

      const result = await db
        .promise()
        .execute("DELETE FROM courses WHERE id = ?", [courseId]);

      // Check if any rows were affected by the deletion
      if (result && result[0].affectedRows !== undefined) {
        const affectedRows = parseInt(result[0].affectedRows);

        // Respond with a success message
        if (affectedRows > 0) {
          return res
            .status(200)
            .json({ message: "Course deleted successfully" });
        } else {
          return res.status(404).json({ message: "Course not found" });
        }
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "Error deleting the course" });
    }
  }
);

// AUTH >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "15s",
    }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, isAdmin: user.isAdmin },
    process.env.JWT_REFRESH_SECRET_KEY
  );
};

let refreshTokens = [];

app.post("/login", async (req, res) => {
  console.log("**login");
  try {
    const { email, password } = req.body;
    console.log(email, password);
    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "error", message: "Email and password are required" });
    }

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
      const role = isAdmin ? "1" : user.isAdmin;

      // Update the user's role in the session and database
      const updateSql = "UPDATE users SET isAdmin = ? WHERE id = ?";
      await db.promise().execute(updateSql, [role, user.id]);
      user.role = role;

      //Generate an access token
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);
      refreshTokens.push(refreshToken);

      // Perform redirect
      res.redirect("/");

    } else {
      return res
        .status(403)
        .json({ status: "error", message: "Wrong password or email" });
    }
  } catch (error) {
    console.error("Error logging in:", error);
    return res
      .status(500)
      .json({ status: "error", message: "An error occurred while logging in" });
  }
});



const verify = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(403).json("Token is not valid!");
      }

      req.user = user;
      next();
    });
  } else {
    res.status(401).json("You are not authenticated!");
  }
};

app.post("/logout", verify, (req, res) => {
  const refreshToken = req.body.token;
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  res.status(200).json("You logged out successfully.");
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
    const role = isAdmin ? "1" : "0";
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
// PAYMENT >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// ## PAYPAL CONSTANTS
const PAYPAL_API_CLIENT = isDev
  ? process.env.SB_PAYPAL_API_CLIENT
  : process.env.PAYPAL_API_CLIENT;
export const PAYPAL_API_SECRET = isDev
  ? process.env.SB_PAYPAL_API_SECRET
  : process.env.PAYPAL_API_SECRET;
export const PAYPAL_API = isDev
  ? process.env.SB_PAYPAL_API
  : process.env.PAYPAL_API;
// console.log(
//   "PAYPAL_API: ",
//   PAYPAL_API,
//   "\nPAYPAL_API_CLIENT: ",
//   PAYPAL_API_CLIENT,
//   "\nPAYPAL_API_SECRET: ",
//   PAYPAL_API_SECRET,
//   "\n\n"
// );
// paypal ************************

app.post("/api/create-order-paypal", async (req, res) => {
  console.log("\n\n*** createOrderPaypal\n\n");

  const courseId = req.body.courseId; // is being passed the courseSlug in the request input
  const userId = req.query.userId;
  try {
    console.log("\n\nSQL Query:", getCourseFromIdQuery);
    console.log("\n\nparams courseId:", courseId);
    // Fetch course details based on the courseSlug using MySQL query
    const [rows] = await db.promise().execute(getCourseFromIdQuery, [courseId]);
    const course = rows[0];

    console.log("\n\nFetched Course Details:", course);

    // calculate discount USD for paypal
    let adjustedDiscount = null;
    let withDiscount = null;
    if (course.discount_usd !== null && course.discount_usd > 0) {
      adjustedDiscount =
        course.usd_price - (course.usd_price * course.discount_usd) / 100;
    }

    // Render the value based on the conditions
    {
      adjustedDiscount !== null ? (withDiscount = adjustedDiscount) : null;
    }

    //create order paypal
    const order = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: adjustedDiscount !== null ? withDiscount : course.usd_price, // Use the course price for the order
          },
        },
      ],

      application_context: {
        brand_name: "Buona Vibra",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: `${BACKEND_URL}/api/capture-order-paypal?courseId=${courseId}&userId=${userId}`, // Include course slug in the return URL
        cancel_url: `${BACKEND_URL}/api/course/enroll/${courseId}`,
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
    let sql = `CREATE TABLE IF NOT EXISTS user_courses (
      user_id INT,
      course_id INT,
      PRIMARY KEY (user_id, course_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (course_id) REFERENCES courses(id)
    )`;

    try {
      await db.promise().execute(sql);
      console.log("user_courses table created successfully");
    } catch (error) {
      console.error("Error creating user_courses table:", error);
      // Handle the error accordingly
    }

    // paypal pay link + courseId
    const courseIdParam = `courseId=${courseId}`;
    const userIdParam = `userId=${userId}`;
    const approveLink = `${response.data.links[1].href}&${courseIdParam}&${userIdParam}`;

    // Redirect the user to the PayPal approval link
    res.redirect(approveLink);
  } catch (error) {
    console.error("Error creating order:", error);
    res
      .status(500)
      .json({ message: "Error creating the order", error: error.message });
  }
});
// app.get("/api/capture-order-paypal") in App.js
app.post("/api/capture-order-paypal", async (req, res) => {
  console.log("\n\n*** captureOrderPaypal\n\n");
  let courseId;
  courseId = req.query.courseId;
  try {
    const userId = req.query.userId;

    // Fetch course details based on the courseSlug using MySQL query
    const [rows] = await db.promise().execute(getCourseFromIdQuery, [courseId]);
    const course = rows[0];
    console.log("\n\nFetched Course:", course);

    if (course && user) {
      // Add the user and course relationship in user_courses table
      const [insertUserCourse] = await db
        .promise()
        .execute(insertUserCourseQuery, [userId, course.id]);
      if (insertUserCourse.affectedRows > 0) {
        console.log(
          `👌🏽 --Inserted into user_courses: User ID: ${userId}, Course ID: ${course.id}`
        );
        // Send success response with status 201 and JSON message
      }
      const message = `Este curso ahora es tuyo, podes encontrarlo dentro de 'Mi Libreria'`;

      return res.redirect(
        `${FRONTEND_URL}/api/course/${courseId}?message=${message}`
      );
    } else {
      return res.status(404).send("Course or user not found");
    }
  } catch (error) {
    console.error("Error capturing order:", error);
    res.status(500).json({ message: "Error capturing the order" });
  }
});
app.get("/api/capture-order-paypal", async (req, res) => {
  console.log("\n\n*** captureOrderPaypal\n\n");
  let courseId;
  courseId = req.query.courseId;
  try {
    const userId = req.query.userId;
    console.log("sessionUSerId:", userId);

    // Fetch course details based on the courseSlug using MySQL query
    const [rows] = await db.promise().execute(getCourseFromIdQuery, [courseId]);
    const course = rows[0];
    console.log("\n\nFetched Course:", course);
    console.log("\n\nCourseId:", course.id);

    if (course && userId) {
      // Add the user and course relationship in user_courses table
      const [insertUserCourse] = await db
        .promise()
        .execute(insertUserCourseQuery, [userId, course.id]);
      if (insertUserCourse.affectedRows > 0) {
        console.log(
          `👌🏽 --Inserted into user_courses: User ID: ${userId}, Course ID: ${course.id}`
        );
        // Send success response with status 201 and JSON message
      }
      const message = `Este curso ahora es tuyo, podes encontrarlo dentro de 'Mi Libreria'`;

      return res.redirect(
        `${FRONTEND_URL}/api/course/${courseId}?message=${message}`
      );
    } else {
      return res.status(404).send("Course or user not found");
    }
  } catch (error) {
    console.error("Error capturing order:", error);
    res.status(500).json({ message: "Error capturing the order" });
  }
});

// MercadoPago ******************
//  ## MP CONSTANTS
const MP_ACCESS_TOKEN = isDev
  ? process.env.MP_SB_ACCESS_TOKEN
  : process.env.MP_ACCESS_TOKEN;
export const MP_NOTIFICATION_URL = isDev
  ? process.env.MP_SB_NOTIFICATION_URL
  : process.env.MP_NOTIFICATION_URL;
export const $init_point = isDev ? "sandbox_init_point" : "init_point";
// console.log(
//   "\nMP_ACCESS_TOKEN: ",
//   MP_ACCESS_TOKEN,
//   "\nMP_NOTIFICATION_URL: ",
//   MP_NOTIFICATION_URL,
//   "\nINIT_POINT: ",
//   $init_point,
//   "\n\n"
// );

app.post("/api/create-order-mp", async (req, res) => {
  console.log("\n*** Creating MP order...\n");

  const courseId = req.query.courseId;
  const userId = req.query.userId;
  // console.log(`\nSQL Query: ${getCourseFromSlugQuery}\n`);
  // console.log(`\ncourseId: ${[courseId]}\n`);
  // console.log(`\nuserId: ${[userId]}\n`);

  // Fetch the course using the query
  const [rows] = await db.promise().execute(getCourseFromIdQuery, [courseId]);
  // Check if the course exists
  const course = rows[0];
  // console.log(`\nFetched Course Details:`);
  // console.log(course);

  // calculate discount ARS for MP
  let adjustedDiscount = null;
  let withDiscount = null;
  if (course.discount_ars !== null && course.discount_ars > 0) {
    adjustedDiscount =
      course.ars_price - (course.ars_price * course.discount_ars) / 100;
  }

  // Render the value based on the conditions
  {
    adjustedDiscount !== null ? (withDiscount = adjustedDiscount) : null;
  }

  // step 1: imports

  // Step 2: Initialize the client object
  const client = new MercadoPagoConfig({
    accessToken: MP_ACCESS_TOKEN,
  });

  // Step 4: Create the request object
  let preference = {
    body: {
      items: [
        {
          title: `curso: ${course.title}`,
          quantity: 1,
          currency_id: "ARS",
          unit_price:
            adjustedDiscount !== null
              ? parseFloat(withDiscount)
              : parseFloat(course.ars_price),
        },
      ],
      back_urls: {
        success: `${FRONTEND_URL}/api/course/${courseId}/`,
        failure: `${FRONTEND_URL}/api/failure-mp`,
        pending: `${FRONTEND_URL}/api/pending-mp`,
      },
      //here we use NGROK till it's deployed :IPN  (Instant Payment Notification)
      // ngrok http $port
      notification_url: `${MP_NOTIFICATION_URL}/api/webhook-mp?courseId=${courseId}&userId=${userId}`,

      // Asocia tu píxel de Facebook
      // tracks: [
      //   {
      //     type: "facebook_ad",
      //     values: {
      //       pixel_id: ABC,
      //     },
      //   },
      //   // Asocia tu píxel de Google_ad
      //   {
      //     type: "google_ad",
      //     values: {
      //       conversion_id: "CONVERSION_ID",
      //       conversion_label: "CONVERSION_LABEL",
      //     },
      //   },
      // ],
    },
  };

  // Step 5: Make the request
  const preferences = new Preference(client);
  const preferenceResult = await preferences
    .create(preference)
    .then((response) => {
      // console.log(response);
      //add course to user_courses
      const init_point = response[$init_point];
      const redirectURL = `${init_point}&courseId=${courseId}`;
      res.redirect(redirectURL);
      console.log(`\n\n--- MP preference created:`);
    })
    .catch((error) => {
      console.error("Error creating MercadoPago preference:", error);
      // Optionally, you can send an error response to the client
      res.status(500).send("Error creating MercadoPago preference");
    });
});
app.post("/api/webhook-mp", async (req, res) => {
  console.log("\n\n*** Webhook MP Received ***\n\n");
  console.log("Request Body:", req.body);

  // try {
  const action = req.body.action;
  const data = req.body.data;
  const courseId = req.query.courseId; // Ensure Mercado Pago sends courseId
  const userId = req.query.userId;
  const paymentId = data.id;
  console.log(`\naction:${action}\n`);
  if (action === "payment.update") {
    console.log("Payment update received for paymentId:", paymentId);
    console.log(
      `\n\npaymentId:${paymentId}\ncourseId:${courseId}\nuserId:${userId}\n\n`
    );
    try {
      // Fetch course details based on the courseSlug using MySQL query
      const [rows] = await db
        .promise()
        .execute(getCourseFromIdQuery, [courseId]);
      const course = rows[0];

      if (course && userId) {
        // Add the user and course relationship in user_courses table
        const [insertUserCourse] = await db
          .promise()
          .execute(insertUserCourseQuery, [userId, course.id]);

        if (insertUserCourse.affectedRows > 0) {
          console.log(
            `\n👌🏽 --Inserted into user_courses: User ID: ${userId}, Course ID: ${course.id}`
          );
          res.status(200).send("OK");
        }
      }
    } catch (error) {
      console.error("Error handling Mercado Pago webhook:", error);
      res.sendStatus(500);
    }
  }
});
app.get("/api/success-mp"),
  async (req, res) => {
    res.json({ message: "*** Success MP..." });
  };
app.get("/api/failure-mp"),
  async (req, res) => {
    res.json({ message: "*** Failure MP..." });
  };
app.get("/api/pending-mp"),
  async (req, res) => {
    res.json({ message: "*** Pending MP..." });
  };

// ==================================== SERVE COMMON FILES CONFIG  *******************************************************************************
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
      return res.status(403).redirect("/login");
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
