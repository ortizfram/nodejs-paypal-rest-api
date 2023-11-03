import { Router } from "express";
import { login, logout, signup } from "../controllers/auth.controller.js";

const router = Router();

//------------login-------------------------
// GET request for displaying the login form
router.get("/login", (req, res) => {
  res.render("login");
});
// POST request to handle login form submission
router.post("/login", login);


//------------signup-------------------------
// GET request for displaying the signup form
router.get("/signup", (req, res) => {
  res.render("signup"); // Ensure the correct path to the signup.ejs file
});

// POST request to handle signup form submission
router.post("/signup", signup); // Point to the controller function

//------------logout-------------------------
router.get("/logout", logout);

export default router;
