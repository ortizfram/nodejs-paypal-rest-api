import { Router } from "express";
import { login, signup } from "../controllers/auth.controller.js";

const router = Router();

router.get("/login", login);
router.get("/signup", signup);

export default router;