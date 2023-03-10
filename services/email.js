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

const sendResetPasswordEmail = ({ _id, email }) => {
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

    //   Create the confirmation URL
    const emailToken = jwt.sign(
      { userID: _id, email },
      process.env.TOKEN_SECRET,
      {
        expiresIn: "2d",
      }
    );
    const url = `${process.env.BASE_URL}/api/auth/reset-password/${_id}/${emailToken}`;

    const emailTemplate = `
      <body style="background-color: #e8ebeb; font-size: 19px; width: 600px; max-width: 90vw; margin: 0 auto; padding: 3%;">
        <div style="background-color: #f0f6fb; padding: 10px 15px; text-align: center;">
          <h1 style="text-align: center;   font-family: 'Times New Roman', Times, serif;">Forgot your password?</h1>
          <p style="color: dimgrey;   font-family: 'Times New Roman', Times, serif;">That's okay, it happens! Click on the button below to reset your password.</p>
          <a href="${url}" style="background-color: #1e90ff; border: none; color: white; padding: 15px 32px; text-align: center; margin: 0 auto 20px; text-decoration: none; display: inline-block; font-size: 16px;">Reset Password</a>

          <div>
            <span style="color: dimgrey;font-family: 'Times New Roman', Times, serif; font-size: 13px;">If you did not request a password reset, please ignore this email.</span>
            <br />
            <span style="color: dimgrey;font-family: 'Times New Roman', Times, serif; font-size: 13px;">Thanks,</span>
            <br />
            <span style="color: dimgrey;font-family: 'Times New Roman', Times, serif; font-size: 13px;">The Chatty team</span>
          </div>
        </div>
      </body>
    `;

    const mailOptions = {
      from: process.env.EMAIL,
      to: `<${email}>`,
      subject: "Reset Password",
      html: emailTemplate,
    };

    // Sending the email
    transport.sendMail(mailOptions, (err, data) => {
      if (err) reject(new nodemailer.SendMailError(err));
      else {
        console.log("email was sent successfully");
        resolve();
      }
    });
  });
};

const sendNewEmailVerification = ({ _id, email }) => {
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

    //   Create the confirmation URL
    const emailToken = jwt.sign(
      { userID: _id, email },
      process.env.TOKEN_SECRET,
      {
        expiresIn: "2d",
      }
    );
    const url = `${process.env.BASE_URL}/api/auth/change-email/${_id}/${emailToken}`;

    const emailTemplate = `
      <body style="background-color: #e8ebeb; font-size: 19px; width: 600px; max-width: 90vw; margin: 0 auto; padding: 3%;">
        <div style="background-color: #f0f6fb; padding: 10px 15px; text-align: center;">
          <p style="color: dimgrey;   font-family: 'Times New Roman', Times, serif;">Click on the button below to confirm it was you who wanted to change the email.</p>
          <a href="${url}" style="background-color: #1e90ff; border: none; color: white; padding: 15px 32px; text-align: center; margin: 0 auto 20px; text-decoration: none; display: inline-block; font-size: 16px;">Update Email</a>

          <div>
            <span style="color: dimgrey;font-family: 'Times New Roman', Times, serif; font-size: 13px;">If you did not request a Email update, please ignore this email.</span>
            <br />
            <span style="color: dimgrey;font-family: 'Times New Roman', Times, serif; font-size: 13px;">Thanks,</span>
            <br />
            <span style="color: dimgrey;font-family: 'Times New Roman', Times, serif; font-size: 13px;">The Chatty team</span>
          </div>
        </div>
      </body>
    `;

    const mailOptions = {
      from: process.env.EMAIL,
      to: `<${email}>`,
      subject: "Email Update",
      html: emailTemplate,
    };

    // Sending the email
    transport.sendMail(mailOptions, (err, data) => {
      if (err) reject(new nodemailer.SendMailError(err));
      else {
        console.log("email was sent successfully");
        resolve();
      }
    });
  });
};

module.exports = {
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendNewEmailVerification,
};
