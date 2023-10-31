import express from "express";
import paymentRoutes from "./routes/payment.routes.js";
import { HOST, PORT } from "./config.js";
import path from "path";

const app = express(); // declare express

app.use(paymentRoutes);
app.use(express.static(path.resolve('src/public'))); // home path

app.listen(PORT);
console.log("Server on port ", PORT);
console.log("Open on browser: ", HOST)
