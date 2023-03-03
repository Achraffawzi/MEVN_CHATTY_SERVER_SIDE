const mongoose = require("mongoose");

const User = require("../models/user.js");
const Errors = require("../classes/Errors.js");

const cloudinary = require("../config/cloudinary.js");

const updateUsername = async (req, res, next) => {
  /**
   * TODO: check the body
   * TODO: check if username (or email) already exists
   * TODO: update username (in case of email, send a verification link and on click, update the email)
   * TODO: send 200 response
   */

  try {
    const { username } = req.body;
    // const { id } = req.params;
    const id = req.session.userID;

    if (!username) {
      throw Errors.BadRequest("Please provide the new username");
    }

    let user = await User.findOne({
      username,
    });

    if (user) {
      throw Errors.Forbidden("A user with this username already exists");
    }

    user = await User.findByIdAndUpdate(id, { username });

    return res.json({
      message: "username updated.",
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

    // const { id } = req.params;
    const id = req.session.userID;

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

const unfriend = async (req, res, next) => {
  try {
    const currentUser = req.session.userID;
    const otherUser = req.params;

    if (currentUser === undefined || otherUser === undefined) {
      throw Errors.BadRequest("Please provide both users to unfriend");
    }

    if (currentUser.toString() === otherUser.toString()) {
      throw Error.BadRequest("users must be different");
    }

    // remove each user from the other user's friends array
    const { modifiedCount: modifiedCountOne } = await User.updateOne(
      { _id: mongoose.Types.ObjectId(currentUser) },
      {
        $pull: {
          friends: mongoose.Types.ObjectId(otherUser),
        },
      }
    );

    const { modifiedCount: modifiedCountTwo } = await User.updateOne(
      { _id: mongoose.Types.ObjectId(otherUser) },
      {
        $pull: {
          friends: mongoose.Types.ObjectId(currentUser),
        },
      }
    );

    if (modifiedCountOne === 1 && modifiedCountTwo === 1) {
      return res.json({ message: "users have been unfriended" });
    } else {
      throw Errors.InternalServerError(
        "something bad happened, please try again!"
      );
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateUsername,
  updateProfilePicture,
  unfriend,
};
