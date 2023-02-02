const User = require("../models/user.js");
const Errors = require("../classes/Errors.js");
const { sendNewEmailVerification } = require("../services/email.js");
const cloudinary = require("../config/cloudinary.js");

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

const updateProfilePicture = async (req, res, next) => {
  try {
    /**
     * TODO: check the body for image file
     * TODO: update image
     * TODO: delete image from cloudinary & add the new one
     */

    const { id } = req.params;

    if (!req.file) {
      throw Errors.BadRequest("please provide a profile picture");
    }

    const user = await User.findById(id);

    if (!user) {
      throw Errors.NotFound("the user not found");
    }

    // deleting the old asset
    const { result } = await cloudinary.uploader.destroy(user.picture.publicID);
    if (result === "not found")
      throw Errors.BadRequest("Please provide correct public_id");
    if (result !== "ok") throw Errors.BadRequest("Try again later.");

    // uploading new picture
    var cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "users_pictures",
    });

    await User.findByIdAndUpdate(id, {
      picture: {
        publicID: cloudinaryResult.public_id,
        pictureURL: cloudinaryResult.url,
      },
    });

    return res.json({ message: "profile picture has been updated" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateUser,
  updateProfilePicture,
};
