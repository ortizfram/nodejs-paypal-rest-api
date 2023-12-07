// controllers/indexController.js
import { pool } from "../db.js";

const getPing = async (req, res) => {
  const [result] = await pool.query('SELECT "PONG" AS result');
  res.json(result[0]);
};

const getHome = async (req, res) => {
  const message = req.query.message; // Retrieve success message from query params authcontroller
  const user = req.session.user || null; // Get the user from the session or set to null if not logged in

  res.render("home", {user, message});
};

export default {
  getPing,
  getHome,
};
