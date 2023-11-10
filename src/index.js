// index.js
import express from "express";
import { pool } from "./db.js";
import session from "express-session";
import authRoutes from "./routes/auth.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import coursesRoutes from "./routes/courses.routes.js";
import { HOST, PORT } from "./config.js";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { getUsersQuery, createUserQuery } from "../db/queries.js";

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// config templates and EJS
app.set("view engine", "ejs");
app.set("views", [path.join(__dirname, "views", "templates")]);

// config static files
app.use(express.static(path.join(__dirname, "public")));
// config user upload files
app.use("/src/uploads", express.static(path.join(__dirname, "uploads")));


app.use(express.json());


// Use routes
app.use(authRoutes);
app.use(paymentRoutes);
app.use(coursesRoutes);
app.use(employeeRoutes);


// RUN
app.listen(PORT);
console.log("Server on port ", PORT);
console.log("Open on browser: ", HOST);
