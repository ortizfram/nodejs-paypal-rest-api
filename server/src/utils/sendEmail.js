import nodemailer from "nodemailer";

const sendResetEmail = async (recipient, subject, text, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASS,
      },
    });

    // Add SameSite attribute to cookies
transporter.on('token', token => {
  token.options.sameSite = 'None';
});

    const mailOptions = {
      from: process.env.NODEMAILER_EMAIL,
      to: recipient,
      subject: subject,
      text: text,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("\n\nEmail sent\n\n");
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export default sendResetEmail;
