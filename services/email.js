const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const sendVerificationEmail = ({ email, _id }) => {
  return new Promise((resolve, reject) => {
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // create token
    const token = jwt.sign({ id: _id }, process.env.TOKEN_SECRET, {
      expiresIn: "1d",
    });

    const url = `${process.env.BASE_URL}/api/auth/verification/${token}`;

    const mailOptions = {
      from: process.env.EMAIL,
      to: `<${email}>`,
      subject: "Account verification",
      html: `Click on the link to verify your account : <a href='${url}'>${url}</a>`,
    };

    // Sending the email
    transport.sendMail(mailOptions, (err, data) => {
      if (err) {
        reject(new nodemailer.SendMailError(err));
      } else {
        console.log("email was sent successfully");
        resolve();
      }
    });
  });
};

module.exports = {
  sendVerificationEmail,
};
