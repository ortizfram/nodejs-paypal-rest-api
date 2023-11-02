import { Router } from "express";
import { login, signup } from "../controllers/auth.controller.js";

const router = Router();

router.get("/login", login);

// GET request for displaying the signup form
router.get("/signup", (req, res) => {
  res.render("signup"); // Ensure the correct path to the signup.ejs file
});

// POST request to handle form submission
router.post("/signup", signup); // Point to the controller function

export default router;
