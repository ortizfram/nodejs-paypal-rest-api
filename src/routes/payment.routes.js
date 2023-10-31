import { Router } from "express";

const router = Router();

router.get("/create-order", (req, res) => res.send("Order created"));
// ↓ when payment accepted
router.get("/capture-order", (req, res) => res.send("Capture created"));
router.get("/cancel-order", (req, res) => res.send("Payment cancelled"));

export default router;
