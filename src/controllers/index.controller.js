// controllers/indexController.js
import { pool } from "../db.js";
import sendEmailContactForm from "../utils/sendEmailContactForm.js";

const getPing = async (req, res) => {
  // const [result] = await pool.query('SELECT "PONG" AS result');
  // res.json(result[0]);
  const message = req.query.message; // Retrieve success message from query params authcontroller
  const user= req.session.user || null; 
  
  res.render('navbar2', {user,message});
};

const getHome = async (req, res) => {
  const message = req.query.message; // Retrieve success message from query params authcontroller
  const user = req.session.user || null; // Get the user from the session or set to null if not logged in

  res.render("home", { user, message });
};

const sendEmail = async (req, res) => {
  const { name, email, msg } = req.body;

  //send email
  // 3. SEND TOKEN BACK TO THE USER EMAIL.
  const emailInfo = await sendEmailContactForm(
    email,
    "BuonaVibra 📫 Formulario de Contacto",
    `[${name} | ${email}] te ha escrito : ${msg}`,
    ``
  );
  console.log("\n\nemail sent\n\n");
  let message = "Email sent successfully!";

  // Respond to the client
  res.redirect(`/?message=${message}`);
};

export default {
  getPing,
  getHome,
  sendEmail,
};
