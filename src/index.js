  import express from "express";
  import session from "express-session"; // Import the express-session module
  import multer from "multer";
  import authRoutes from "./routes/auth.routes.js";
  import paymentRoutes from "./routes/payment.routes.js";
  import coursesRoutes from "./routes/courses.routes.js";
  import { HOST, PORT } from "./config.js";
  import path from "path";
  import { fileURLToPath } from "url"; // For converting import.meta.url to a file path
  import { User } from "./controllers/auth.controller.js";
  import { courseCreate } from "./controllers/courses.controller.js";
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

  // use mongodb data
  app.use(express.urlencoded({ extended: false }));

  // Configure session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET , // Add a secret key for session management
      resave: false,
      saveUninitialized: true
    })
  );

  // pass user data Home
  app.get("/", (req, res) => {
    const user = req.session.user; // Access user from the session
    const message = req.query.message; // Retrieve success message from query params authcontroller
    res.render("home", { user, message });
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
