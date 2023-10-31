import express from "express";
import paymentRoutes from "./routes/payment.routes.js";
import { HOST, PORT } from "./config.js";

const app = express(); // declare express

app.use(paymentRoutes);

app.listen(PORT);
console.log("Server on port ", PORT);
