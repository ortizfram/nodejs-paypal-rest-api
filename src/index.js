// index.js
import express from "express";
import { pool } from "./db.js";
import session from "express-session";
import authRoutes from "./routes/auth.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
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

app.set("view engine", "ejs");
app.set("views", [path.join(__dirname, "views", "templates")]);

app.use(express.static(path.join(__dirname, "public")));
app.use("/src/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.json());

app.get("/ping", async (req, res) => {
  try {
    const [rows] = await pool.query(getUsersQuery);
    res.json({ users: [rows] });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/create", async (req, res) => {
  try {
    const result = await pool.query(createUserQuery);
    res.json({ message: "User created successfully", result });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.use(authRoutes);
app.use(paymentRoutes);
app.use(coursesRoutes);

app.listen(PORT);
console.log("Server on port ", PORT);
console.log("Open on browser: ", HOST);
