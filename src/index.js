import express from "express";
import authRoutes from "./routes/auth.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import coursesRoutes from "./routes/courses.routes.js";
import { HOST, PORT } from "./config.js";
import path from "path";
import { fileURLToPath } from 'url'; // For converting import.meta.url to a file path

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express(); // declare express

// Set EJS as the view engine:templates config
app.set("view engine", "ejs"); 
app.set('views', path.join(__dirname, 'views/templates')); // Define the directory for views/templates

// imgs config
app.use(express.static(path.join(__dirname, 'public'))); // imgs directory

// use mongodb data
app.use(express.urlencoded({extended:false}));


// use routes
app.use(authRoutes);
app.use(paymentRoutes);
app.use(coursesRoutes);
app.use(express.static(path.resolve('src/public'))); // home path

// PORT HOST
app.listen(PORT);
console.log("Server on port ", PORT);
console.log("Open on browser: ", HOST)
