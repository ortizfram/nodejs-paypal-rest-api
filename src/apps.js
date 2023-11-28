import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import coursesRoutes from "./routes/courses.routes.js";
import indexRoutes from "./routes/index.routes.js";
import morgan from "morgan";
import methodOverride from "method-override";

const app = express();

// configure methodOverride
app.use(methodOverride('_method'));

config();// load .ENV

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// config templates and EJS
app.set("view engine", "ejs");
app.set("views", [path.join(__dirname, "views", "templates")]);

// config static files
app.use(express.static(path.join(__dirname, "public")));
// config user upload files
app.use("src/uploads", express.static(path.join(__dirname, "uploads")));


// db use JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

// app middleware :for Logged-in needed
export const LogInNeeded = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/api/login');
  }
};

// Use routes
app.use(indexRoutes);
app.use("/api", authRoutes);
app.use("/api", paymentRoutes);
app.use("/api", coursesRoutes);
app.use("/api", employeeRoutes);

// app middleware for 404
app.use((req, res) => {
  res.status(404).json({
    message: "endpoint Not Found",
  });
});


export default app;