import cors from 'cors'
import { config } from 'dotenv';
import express from 'express';
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
import { pool } from "./src/db.js";
import { getUserEnrolledCoursesQuery } from "./db/queries/course.queries.js";
import { Marked, marked } from "marked";
import bodyParser from 'body-parser';
import multer from 'multer';

config();

const port = 5000; 
const HOST = process.env.HOST; 
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'; 
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'; 

// shortcuts for files/dirs
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
console.log({'__filename':__filename, '__dirname':__dirname})


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(cors({ origin: 'http://localhost:3000', credentials: true })); // frontend app can ask data

// MULTER : file uploading config *******************************************************************************
// Multer storage configuration for images
const imageStorage = multer.diskStorage({
  destination: path.join(__dirname, 'src', 'uploads', 'imgs'),
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Multer storage configuration for videos
const videoStorage = multer.diskStorage({
  destination: path.join(__dirname, 'src', 'uploads', 'videos'),
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Multer upload instances
const uploadImage = multer({ storage: imageStorage });
const uploadVideo = multer({ storage: videoStorage });




// CONNECTION ********************************************************************************************************************
app.listen(port, () => {
    console.log(`Server is running on ${BACKEND_URL}`);
  });

// Use sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret', // Change this to a secure secret key
    resave: false,
    saveUninitialized: true,
  })
);


// Use ROUTES app ==========================================================
app.use("/", indexRoutes);
app.use("/api", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", paymentRoutes);
app.use("/api", coursesRoutes);
app.use("/api", employeeRoutes);
app.use("/api", blogRoutes);

// Handling thumbnail upload route
app.post('/upload/image', uploadImage.single('thumbnail'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No thumbnail uploaded.');
  }
  const imageUrl = `/imgs/${req.file.filename}`;
  res.status(200).json({ imageUrl: imageUrl });
});

// Handling video upload route
app.post('/upload/video', uploadVideo.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No video uploaded.');
  }
  const videoUrl = `/videos/${req.file.filename}`;
  res.status(200).json({ videoUrl: videoUrl });
});

// marked test route
app.get('/markdown-to-html', (req, res) => {
  const markdownContent = `# Heading\n\n**Bold text**\n\n*Italic text*`; // Replace with your Markdown content
  const htmlContent = marked(markdownContent);

  res.send(htmlContent);
});

// SERVE FILES *******************************************************************************
// Serve static files from React build directory
app.use(express.static(path.join(__dirname, '../client/build')));

// Catch-all route to serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Serve files from 'public' directory
app.use(express.static(path.join(__dirname, "src","public")));

// Serve static files from the 'uploads' directory
app.use('/imgs', express.static(path.join(__dirname, 'src', 'uploads', 'imgs')));
app.use('/videos', express.static(path.join(__dirname, 'src', 'uploads', 'videos')));
// ===============================================================================

// configure methodOverride
app.use(methodOverride('_method'));

// Set default time zone
Intl.DateTimeFormat = Intl.DateTimeFormat(undefined, { timeZone: 'America/Argentina/Buenos_Aires' });

// Use morgan to see requests in console
app.use(morgan('dev'));

// Use sessions =================================================================================
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret', // Change this to a secure secret key
    resave: false,
    saveUninitialized: true,
  })
);

// MIDDLEWARE ===============================================================================================
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



// middleware for 404
app.use((req, res) => {
  res.status(404).json({
    message: "endpoint Not Found",
  });
});

// middleware for session
const initSession = (req, res, next) => {
  if (!req.session) {
    console.error('Session not initialized!');
  }
  next();
};
app.use(initSession);


// middleware for login user
export function is_loggedin_check (req, res, next) {
  const user = req.session.user
  if(!user) {
    // Redirect the user to the login page
    return res.status(403).redirect('/api/login');
  }
  next();
}


// middleware for admin&staff
export function admin_staff_check (req, res, next) {
  const user = req.session.user
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





