const jwt = require("jsonwebtoken");
const { serialize } = require("cookie");
const User = require("../models/user.js");
const Errors = require("../classes/Errors.js");
const cloudinary = require("../config/cloudinary.js");
const {
  sendVerificationEmail,
  sendResetPasswordEmail,
} = require("../services/email.js");

const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      throw Errors.BadRequest("Please provide all information");
    }
    let user = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (user) {
      console.log("already exist");
      throw Errors.BadRequest(
        "User with either username or email already exist"
      );
    }

    if (req.file) {
      var cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "users_pictures",
      });
    }

    user = new User({
      username,
      email,
      password,
      picture: req.file
        ? {
            publicID: cloudinaryResult.public_id,
            pictureURL: cloudinaryResult.url,
          }
        : null,
    });
    var result = await user.save();

    // sending confirmation email
    await sendVerificationEmail(result);

    return res.json({
      message: "We've sent you a verification link to your Email",
    });
  } catch (error) {
    if (result) {
      await cloudinary.uploader.destroy(result?.picture.publicID);
    }
    next(error);
  }
};

const verifyAccount = async (req, res, next) => {
  /**
   * TODO: verify token
   * TODO: change verified status to true
   * TODO: send 200 status code
   */
  try {
    const { token } = req.params;
    const payload = jwt.verify(token, process.env.TOKEN_SECRET);
    if (!payload) {
      throw Errors.BadRequest("Verification failed. Try again!");
    }
    await User.findByIdAndUpdate(payload.id, {
      isVerified: true,
    });
    return res.redirect(`${process.env.CLIENT_URL}/auth/login`);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    /**
     * TODO: check the body
     * TODO: check if user exists
     * TODO: check if password correct
     * TODO: check if user is verified
     * TODO: create & send token (presave func)
     */
    const { email, password } = req.body;
    if (!email || !password) {
      throw Errors.BadRequest("Please fill up all required fields");
    }
    let user = await User.findOne({ email });

    if (!user) {
      throw Errors.NotFound("User with this email doesn't exist");
    }

    if (!user.isValidPassword(password)) {
      throw Errors.Unauthorized("Wrong Password");
    }

    if (!user.isVerified) {
      throw Errors.Unauthorized(
        "Please verify your account before getting access"
      );
    }

    const accessToken = user.generateToken(
      user._id,
      process.env.ACCESS_TOKEN_SECRET,
      "7d"
    );
    const refreshToken = user.generateToken(
      user._id,
      process.env.REFRESH_TOKEN_SECRET,
      "1y"
    );

    const serialized = serialize(
      "token",
      { accessToken, refreshToken },
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24,
        path: "/",
      }
    );
    res.setHeader("Set-Cookie", serialized);

    return res.json({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw ApiError.BadRequest("Email is required");
    const user = await User.findOne({ email });
    if (!user) throw ApiError.BadRequest("Email was not found");
    if (!user.isVerified)
      throw ApiError.BadRequest("Please verify your account first!");
    await sendResetPasswordEmail(user);
    res.json({ message: "A reset password link has been sent to your email" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  verifyAccount,
  login,
  forgotPassword,
};
