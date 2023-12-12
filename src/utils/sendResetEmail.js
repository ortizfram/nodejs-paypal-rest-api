import nodemailer from "nodemailer";
import { config } from "dotenv";

// load .ENV
config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.example.com",
  port: 587,
  secure: false, // use TLS: true for port 465, false for others
  auth: {
    user: process.env.NODEMAILER_EMAIL, //sender email address
    pass: process.env.NODEMAILER_PASS, //app password from Gmail account
  },
});

const sendResetEmail = async (email, resetToken) => {
  console.log("\n\n ...nodemailer sendResetEmail() called");

  const mailOptions = {
    from: {
      name: "nodejs",
      addres: process.env.NODEMAILER_EMAIL,
    }, // sender address
    to: [email], //list of receivers
    subject: "Password Reset", //subject line
    text: `Your password reset token is:`, //plain text body
    html: `<b>${resetToken}</b>`, //html body
    attatchments: [
      {
        filename: "",
        path: "",
        contentType: "",
      },
    ],
  };

  const sendMail = async (transporter, mailOptions) => {
    try {
      await transporter.sendMail(mailOptions);
      console.log("\n\nEmail sent");
    } catch (error) {
      console.log(error);
    }
  };
};

export default sendResetEmail;
