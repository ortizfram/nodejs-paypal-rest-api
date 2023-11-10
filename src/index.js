  import express from "express";
  import { pool } from "./db.js";
  import session from "express-session"; // Import the express-session module
  import authRoutes from "./routes/auth.routes.js";
  import paymentRoutes from "./routes/payment.routes.js";
  import coursesRoutes from "./routes/courses.routes.js";
  import { HOST, PORT } from "./config.js";
  import path from "path";
  import { fileURLToPath } from "url"; // For converting import.meta.url to a file path
  import { config } from "dotenv";

  config();// Loads the .env file into process.env

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const app = express(); // declare express

  // Set EJS as the view engine:templates config
  app.set("view engine", "ejs");
  app.set("views", [
    path.join(__dirname, "views", "templates"), // For serving EJS files from 'src/views/templates'
  ]);

  // imgs config / static path
  app.use(express.static(path.join(__dirname, "public"))); // imgs directory
  app.use('/src/uploads', express.static(path.join(__dirname, 'uploads')));

  // MIDDLEWARE : parse JSON in your application:
  app.use(express.json());

  // consulta a sql to retrieve
  app.get("/ping", async (req, res) => {
    const [rows] = await pool.query(`SELECT * FROM users`);
    res.json([rows])
  });

  app.get("/create", async (req, res) => {
    const result = await pool.query(`INSERT INTO users(name) VALUES ("John")`)
    res.json(result)
  });

  // use routes
  app.use(authRoutes);
  app.use(paymentRoutes);
  app.use(coursesRoutes);
  // app.use(express.static(path.resolve('src/public'))); // home path

  // PORT HOST
  app.listen(PORT);
  console.log("Server on port ", PORT);
  console.log("Open on browser: ", HOST);
