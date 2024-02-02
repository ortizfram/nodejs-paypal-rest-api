import cors from "cors";
import { config } from "dotenv";
import express from "express";
import session from "express-session";
import path from "path";
import mysql from "mysql2";
import bcrypt from "bcrypt"
import { fileURLToPath } from "url";
import authRoutes from "./src/routes/auth.routes.js";
import blogRoutes from "./src/routes/blog.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";
import paymentRoutes from "./src/routes/payment.routes.js";
import employeeRoutes from "./src/routes/employee.routes.js";
import coursesRoutes from "./src/routes/courses.routes.js";
import indexRoutes from "./src/routes/index.routes.js";
import morgan from "morgan";
import methodOverride from "method-override";
import fileUpload from "express-fileupload";
import { getUserEnrolledCoursesQuery } from "./db/queries/course.queries.js";
import { Marked, marked } from "marked";
import bodyParser from "body-parser";
import multer from "multer";
config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(cors());
const port = 5000;

const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "melonmelon",
  database: "conn",
  port: 3307,
});
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

const HOST = process.env.HOST;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

// shortcuts for files/dirs
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

// MULTER : file uploading config *******************************************************************************
// Multer storage configuration for images
const imageStorage = multer.diskStorage({
  destination: path.join(__dirname, "src", "uploads", "imgs"),
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// Multer storage configuration for videos
const videoStorage = multer.diskStorage({
  destination: path.join(__dirname, "src", "uploads", "videos"),
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// Multer upload instances
const uploadImage = multer({ storage: imageStorage });
const uploadVideo = multer({ storage: videoStorage });

// Use sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret", // Change this to a secure secret key
    resave: false,
    saveUninitialized: true,
  })
);

// ENDPOINTS   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
app.post("/login", async (req,res)=>{
  try {
    const { email, password } = req.body;

    // Find user in the database that matches the email from the login form
    const sql="SELECT * FROM users WHERE email = ?"
    const [rows] = await db.promise().execute(sql, [email]);
    const user = rows[0];

    // If the user exists and the passwords match
    if (user && (await bcrypt.compare(password, user.password))) {
      // Check if the user's email is in the list of admin emails
      const isAdmin = ['ortizfranco48@gmail.com','mg.marcela@hotmail.com','buonavibraclub@gmail.com','marzettimarcela@gmail.com'].includes(email);

      // Determine the role based on email
      const role = isAdmin ? 'admin' : user.role;

      // Update the user's role in the session and database
      const sql= "UPDATE users SET role = ? WHERE id = ?"
      await db.promise().execute(sql, [role, user.id]);
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
})

app.post('/signup', async(req,res)=>{
  const { username, name, email, password } = req.body;

  // Add validation for required fields
  if (!username || !password || !email) {
    return res.status(400).json({ error: "Username, password & email are required." });
  }

  try {
    // Check if the email already exists in the database
    let sql= `SELECT * FROM users WHERE email = ?`
    const [existingEmail] = await db.promise().execute(sql, [email]);

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

    // Insert data into the users table
    sql = "INSERT INTO users (username, name, email, password, role) VALUES (?, ?, ?, ?, ?)"
    const [rows] = await db.promise().execute(sql, data);

    const userId = String(rows.insertId);

    // Set session data for the newly signed-up user
    req.session.user = { id: userId, username, name, email, role };

    // Respond with success message
    res.status(200).json({ message: "Signup successful. Now go Login.", user: req.session.user, redirectUrl:'/login' });
    console.log("\n\n*** Signed up successfully\n\n");
  } catch (error) {
    console.error("Error while saving user:", error);
    res.status(500).json({ error: "Error during signup or login" });
  }
})

app.post("/logout", (req,res)=>{
  req.session.destroy((err) => {
    if (err) {
        console.error("Error destroying session:", err);
        res.status(500).json({ error: "An error occurred during logout" });
    } else {
        console.log("\n*** Logout successful\n");
        res.status(204).json({ message: "Logged out successfully", redirectUrl:'/' });
    }
});
})

app.get("/api/courses", async (req, res) => {
  try {
    const message = req.query.message;
    let user = req.session.user;
    const isAdmin = user && user.role === "admin";

    const page = parseInt(req.query.page) || 1;
    let perPage = parseInt(req.query.perPage) || 1;

    // count courses
    let sql = "SELECT COUNT(*) AS count FROM courses";
    const [totalCourses] = await db.promise().query(sql);
    const totalItems = totalCourses[0].count;

    // fetch all courses aand join users on id
    sql = `SELECT 
  courses.*,
  users.id AS author_id,
  users.name AS author_name,
  users.username AS author_username,
  users.avatar AS author_avatar
FROM 
  courses
LEFT JOIN 
  users ON users.id = courses.author_id
LIMIT ?,?`;
    const [coursesRows] = await db.promise().query(sql, [0, totalItems]);
    console.log("coursesRows: ", coursesRows);

    // map courses to add fields
    let courses = coursesRows.map((course) => {
      return {
        title: course.title,
        slug: course.slug,
        description: course.description,
        ars_price: course.ars_price,
        usd_price: course.usd_price,
        thumbnail: course.thumbnail,
        id: course.id.toString(),
        thumbnailPath: `/uploads/${course.thumbnail}`,
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

    let enrolledCourseIds = [];

    if (user) {
      const sql = `
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
      const [enrolledCoursesRows] = await db.promise().query(sql, [user.id]);
      enrolledCourseIds = enrolledCoursesRows.map((enrolledCourse) =>
        enrolledCourse.id.toString()
      );
    }

    courses = courses.filter(
      (course) => !enrolledCourseIds.includes(course.id)
    );

    const totalFilteredItems = courses.length;
    const totalPages = Math.ceil(totalFilteredItems / perPage) || 1;

    // Adjust perPage if there are fewer items than perPage value
    if (totalFilteredItems < perPage) {
      perPage = totalFilteredItems;
    }

    const offset = (page - 1) * perPage;
    const coursesForPage = courses.slice(offset, offset + perPage);

    // JSON response
    res.status(200).json({
      route: "courses",
      title: "Cursos",
      courses: coursesForPage,
      totalItems: totalFilteredItems,
      user,
      message,
      isAdmin,
      perPage,
      page,
      offset,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.log("Error fetching courses:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&


// Handling thumbnail upload route
app.post("/upload/image", uploadImage.single("thumbnail"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No thumbnail uploaded.");
  }
  const imageUrl = `/imgs/${req.file.filename}`;
  res.status(200).json({ imageUrl: imageUrl });
});

// Handling video upload route
app.post("/upload/video", uploadVideo.single("video"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No video uploaded.");
  }
  const videoUrl = `/videos/${req.file.filename}`;
  res.status(200).json({ videoUrl: videoUrl });
});

// marked test route
app.get("/markdown-to-html", (req, res) => {
  const markdownContent = `# Heading\n\n**Bold text**\n\n*Italic text*`; // Replace with your Markdown content
  const htmlContent = marked(markdownContent);

  res.send(htmlContent);
});

// SERVE FILES *******************************************************************************
// Serve static files from React build directory
app.use(express.static(path.join(__dirname, "../client/build")));

// Catch-all route to serve the React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

// Serve files from 'public' directory
app.use(express.static(path.join(__dirname, "src", "public")));

// Serve static files from the 'uploads' directory
app.use(
  "/imgs",
  express.static(path.join(__dirname, "src", "uploads", "imgs"))
);
app.use(
  "/videos",
  express.static(path.join(__dirname, "src", "uploads", "videos"))
);
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

// middleware for login user
export function is_loggedin_check(req, res, next) {
  const user = req.session.user;
  if (!user) {
    // Redirect the user to the login page
    return res.status(403).redirect("/api/login");
  }
  next();
}

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
    const [enrolledRows] = await pool.query(getUserEnrolledCoursesQuery, [
      user.id,
    ]);
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
