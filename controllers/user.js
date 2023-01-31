const User = require("../models/user.js");
const Errors = require("../classes/Errors.js");
const { sendNewEmailVerification } = require("../services/email.js");

const updateUser = async (req, res, next) => {
  /**
   * TODO: check the body
   * TODO: check if username (or email) already exists
   * TODO: update username (in case of email, send a verification link and on click, update the email)
   * TODO: send 200 response
   */

  try {
    const { username, email } = req.body;
    const { id } = req.params;

    if (!username && !email) {
      throw Errors.BadRequest(
        "Please provide the information you want to update"
      );
    }

    let user = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (user) {
      throw Errors.Forbidden(
        "A user with the provided information already exists"
      );
    }

    user = await User.findByIdAndUpdate(id, { username });

    if (!user) {
      throw Errors.NotFound("The user is not found");
    }

    if (email) {
      await sendNewEmailVerification(user);
    }

    return res.json({
      message:
        "username updated! We've sent you a verification link to your Email",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateUser,
};
