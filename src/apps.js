import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import coursesRoutes from "./routes/courses.routes.js";
import indexRoutes from "./routes/index.routes.js";

const app = express();

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// config templates and EJS
app.set("view engine", "ejs");
app.set("views", [path.join(__dirname, "views", "templates")]);

// config static files
app.use(express.static(path.join(__dirname, "public")));
// config user upload files
app.use("/src/uploads", express.static(path.join(__dirname, "uploads")));

// db use JSON
app.use(express.json());

// Use routes
app.use(indexRoutes);
app.use(authRoutes);
app.use(paymentRoutes);
app.use(coursesRoutes);
app.use("/api", employeeRoutes);

// app middleware for 404
app.use((req, res) => {
  res.status(404).json({
    message: "endpoint Not Found",
  });
});


export default app;