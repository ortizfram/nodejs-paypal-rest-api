import express from "express";
import expressEjsLayouts from "express-ejs-layouts";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import coursesRoutes from "./routes/courses.routes.js";
import indexRoutes from "./routes/index.routes.js";
import morgan from "morgan";
import methodOverride from "method-override";
import fileUpload from "express-fileupload";
import jwt from "jsonwebtoken";
import { validationResult, body } from "express-validator";
import { pool } from "./db.js";
import { getUserEnrolledCoursesQuery } from "../db/queries/course.queries.js";

// load .ENV
config();

// call express
const app = express();

// configure methodOverride
app.use(methodOverride('_method'));

// Set default time zone
Intl.DateTimeFormat = Intl.DateTimeFormat(undefined, { timeZone: 'America/Argentina/Buenos_Aires' });

// shortcuts for files/dirs
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

//default option
app.use(fileUpload());

//Set up serving static files in Express:
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// config templates and EJS
app.use(expressEjsLayouts);
app.set("layout", "../layouts/layout");
app.set("view engine", "ejs");
app.set("views", [path.join(__dirname, "views", "templates")]);

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

// Use routes app
app.use(indexRoutes);
app.use("/api", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", paymentRoutes);
app.use("/api", coursesRoutes);
app.use("/api", employeeRoutes);

// MIDDLEWARE
// =============================================================
// middleware for 404
app.use((req, res) => {
  res.status(404).json({
    message: "endpoint Not Found",
  });
});

// middleware for admin&staff
export function admin_staff_check (req, res, next) {
  const user = req.session.user || null;
  if(!user || (user.role !== 'staff' && user.role !== 'admin')){
    return res.status(403).send(`Forbidden`);
  }
  next();
}

// middleware for login user
export function is_loggedin_check (req, res, next) {
  const user = req.session.user || null;
  if(!user) {
    // Redirect the user to the login page
    return res.status(403).redirect('/api/login');
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
      return res.redirect(`/api/course/${courseId}/overview`);
    }
  } catch (error) {
    console.error("Error checking user enrollment:", error);
    return res.status(500).send("Error checking user enrollment");
  }
}


export default app;