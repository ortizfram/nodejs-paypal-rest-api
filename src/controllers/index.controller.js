// controllers/indexController.js
import { pool } from "../db.js";

const getHome = async (req, res) => {
    const [result] = await pool.query('SELECT "PONG" AS result');
    res.json(result[0]);
  };

export default {
    getHome,
}