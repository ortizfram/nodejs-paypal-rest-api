import { Router } from "express";
import {
  cancelPayment,
  captureOrder,
  createOrder,
} from "../controllers/payment.controller.js";

const router = Router();

router.post("/create-order", createOrder);
router.get("/capture-order", captureOrder); // ← when payment accepted
router.get("/cancel-order", cancelPayment);

export default router;
