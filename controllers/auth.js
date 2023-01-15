const User = require("../models/user.js");
const Errors = require("../classes/Errors.js");
const cloudinary = require("../config/cloudinary.js");
const jwt = require("jsonwebtoken");
const { sendVerificationEmail } = require("../services/email.js");

const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    /**
     * TODO: check if all fields are available
     * TODO: check if username or email already exist
     * TODO: hash password
     * TODO: save to DB
     * TODO: send verification token link
     */
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
    return res.json({ message: "Account verified!" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  verifyAccount,
};
