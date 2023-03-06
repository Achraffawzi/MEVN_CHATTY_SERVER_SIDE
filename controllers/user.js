const mongoose = require("mongoose");

const User = require("../models/user.js");
const FriendRequest = require("../models/friendRequest.js");
const Errors = require("../classes/Errors.js");

const cloudinary = require("../config/cloudinary.js");

const relationships = {
  friends: "friends",
  sender: "sender",
  reciever: "reciever",
  none: "none",
  self: "self",
};

// get the corresponding flag between the two users
// it can either be: CANCEL / ACCEPT or REJECT
const getRelationshipFlag = async (currentUserID, otherUser) => {
  const friendRequest = await FriendRequest.findOne({
    from: currentUserID,
    to: otherUser._id,
  });

  if (friendRequest) {
    // this means there is a friend request in DB, and waiting to be either Canceled/Accepted or Rejected

    // this means that the sender of this friend request is the same as the current logged in user
    if (friendRequest.from === mongoose.Types.ObjectId(currentUserID)) {
      return relationships.sender;
    }

    // otherwise
    else {
      return relationships.reciever;
    }
  } else {
    // this means there is no friend request in DB
    // => the friend request was either accepted and deleted or never was sent in the first place

    if (otherUser.friends.includes(currentUserID)) {
      // this means they are friends
      return relationships.friends;
    }

    // otherwise
    else {
      // check if it's the current logged in user
      // that means the current logged in user searched for themselves
      if (mongoose.Types.ObjectId(currentUserID).equals(otherUser._id)) {
        return relationships.self;
      }
      return relationships.none;
    }
  }
};

const getUsersByUsername = async (req, res, next) => {
  try {
    const { usernameQuery } = req.query;
    const currentUserID = req.session.userID;

    const usernameRegex = new RegExp(`^${usernameQuery}`);

    // get all the users from DB that contains the usernameQuery letter(s)
    // const users = await User.find({ $text: { $search: usernameQuery } });
    const users = await User.find({ username: usernameRegex });

    // map through each user and get their relationship with the current logged in user
    // let relationship;
    const result = await Promise.all(
      users.map(async (user) => {
        const {
          password,
          isVerified,
          updatedAt,
          __v,
          email,
          friends,
          lastOnline,
          createdAt,
          ...others
        } = user._doc;

        let relationship = "";

        const data = await getRelationshipFlag(currentUserID, user);
        if (data) {
          relationship = data;
        }

        return {
          ...others,
          relationship,
        };
      })
    );

    console.log(result);
  } catch (error) {
    next(error);
  }
};

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
  getUsersByUsername,
  updateUsername,
  updateProfilePicture,
  unfriend,
};
