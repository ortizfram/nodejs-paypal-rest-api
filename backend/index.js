import cors from 'cors'
import { config } from 'dotenv';
import express from 'express';
import expressEjsLayouts from "express-ejs-layouts";
import session from "express-session";
import path from "path";
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
import jwt from "jsonwebtoken";
import { validationResult, body } from "express-validator";
import { pool } from "./src/db.js";
import { getUserEnrolledCoursesQuery } from "./db/queries/course.queries.js";
import { Marked, marked } from "marked";

config();

const PORT = process.env.PORT || 3000; 
const HOST = process.env.HOST || 'localhost'; 
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://127.0.0.1:5173'; 
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'; 

// call express
const app = express();

app.use(express.json()); // Add this line to parse JSON bodies

// Connection
app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
  });

// Use cors middleware to handle CORS headers
app.use(cors({
    origin: FRONTEND_URL
})); // frontend app can ask data

// Use routes app
app.use(indexRoutes);
app.use("/api", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", paymentRoutes);
app.use("/api", coursesRoutes);
app.use("/api", employeeRoutes);
app.use("/api", blogRoutes);

// configure methodOverride
app.use(methodOverride('_method'));

// Set default time zone
Intl.DateTimeFormat = Intl.DateTimeFormat(undefined, { timeZone: 'America/Argentina/Buenos_Aires' });

// shortcuts for files/dirs
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

//default option
app.use(fileUpload());

//Set up serving static files in Express: [backend]
app.use(express.static(path.join(__dirname, "src","public")));

// set up uploads [backend]
app.use("/uploads", express.static(path.join(__dirname, "src","uploads")));

// config templates layout and EJS
app.use(expressEjsLayouts);
app.set("layout",  path.join(__dirname, "../client/src/layouts/layout.ejs"));
app.set("view engine", "ejs");
app.set("views", [path.join(__dirname, "../client/src/views", "templates")]);

// marked test route
app.get('/markdown-to-html', (req, res) => {
  const markdownContent = `# Heading\n\n**Bold text**\n\n*Italic text*`; // Replace with your Markdown content
  const htmlContent = marked(markdownContent);

  res.send(htmlContent);
});

// db use JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use morgan to see requests in console
app.use(morgan('dev'));

// Use sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Change this to a secure secret key
    resave: false,
    saveUninitialized: true,
  })
);


// Define a function to set MIME types based on file extensions
export const setCustomMimeTypes = (req, res, next) => {
  const extension = req.path.split('.').pop();
  let contentType = '';

  switch (extension) {
    case 'mp4':
    case 'm4v':
    case 'f4v':
    case 'f4p':
      contentType = 'video/mp4';
      break;
    case 'ogv':
      contentType = 'video/ogg';
      break;
    case 'webm':
      contentType = 'video/webm';
      break;
    case 'flv':
      contentType = 'video/x-flv';
      break;
    default:
      contentType = 'application/octet-stream'; // Default MIME type for unknown files
  }

  res.set('Content-Type', contentType);
  next();
};

// Middleware to set MIME types for videos
app.use('/uploads/videos', setCustomMimeTypes, express.static(path.join(__dirname, 'uploads/videos')));


// MIDDLEWARE
// =============================================================
// middleware for 404
app.use((req, res) => {
  res.status(404).json({
    message: "endpoint Not Found",
  });
});

// middleware for login user
export function is_loggedin_check (req, res, next) {
  const user = req.session.user || null;
  if(!user) {
    // Redirect the user to the login page
    return res.status(403).redirect('/api/login');
  }
  next();
}


// middleware for admin&staff
export function admin_staff_check (req, res, next) {
  const user = req.session.user || null;
  if(!user || (user.role !== 'staff' && user.role !== 'admin')){
    return res.status(403).send(`Forbidden`);
  }
  next();
}

// Middleware for checking course enrollment
export async function checkCourseEnrollment(req, res, next) {
  console.log("\n\n*** middleware: checkCourseEnrollment\n\n");
  const courseId = req.params.id;
  console.log("\n\ncourseId: ",courseId);
  const user = req.session.user || null;

  try {
    if (!user) {
      return res.status(403).redirect('/api/login');
    }
//
    const [enrolledRows] = await pool.query(getUserEnrolledCoursesQuery, [user.id]);
    console.log("\n\nenrolledRows: ", enrolledRows);

    // Extracting course IDs from the fetched data (assuming the ID field is 'course_id')
    const enrolledCourses = enrolledRows.map(row => row.id);

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
export async function admin_staff_clicking_course (req, res, next) {
  const user = req.session.user || null;
  if(!user || (user.role !== 'staff' && user.role !== 'admin')){
    // if not staff/admin, send to course enrollment middleware
    await checkCourseEnrollment(req, res, next);
  }

  // if staff/admin render course detail without passing through enrollment middleware
  next();
}



export default app;





