import nodemailer from "nodemailer";
import { config } from "dotenv";

// load .ENV
config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL, // Your email address
    pass: process.env.NODEMAILER_PASS // Your email password
  }
});

const sendResetEmail = async (email, resetToken) => {
    console.log("\n\n ...nodemailer sendResetEmail() called");

  const mailOptions = {
    from: process.env.NODEMAILER_EMAIL,
    to: email,
    subject: 'Password Reset',
    text: `Your password reset token is: ${resetToken}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('\n\nError sending email:', error);
    } else {
      console.log('\n\nEmail sent: ' + info.response);
    }
  });
};

export default sendResetEmail;
