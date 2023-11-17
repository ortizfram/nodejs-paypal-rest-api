import { Router } from "express";
import {
  cancelPaymentPaypal,
  captureOrderPaypal,
  createOrderMP,
  createOrderPaypal,
  successMP,
  webhookMP,
} from "../controllers/payment.controller.js";

const router = Router();

// paypal
router.post("/create-order-paypal", createOrderPaypal);
router.get("/create-order-paypal", createOrderPaypal);
router.get("/capture-order-paypal", captureOrderPaypal); // ← when payment accepted
router.post("/capture-order-paypal", captureOrderPaypal);
router.get("/cancel-order-paypal", cancelPaymentPaypal);

// mercado pago
router.post("/create-order-mp", createOrderMP)
router.get("/success-mp", successMP)
router.get("/webhook-mp", webhookMP)

export default router;
