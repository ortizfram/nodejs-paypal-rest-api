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

// load .ENV
config();

// call express
const app = express();

// configure methodOverride
app.use(methodOverride('_method'));

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
app.set("view engine", "ejs");
app.set("views", [path.join(__dirname, "views", "templates")]);

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

// Use routes app
app.use(indexRoutes);
app.use("/api", authRoutes);
app.use("/api/admin", adminRoutes);
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