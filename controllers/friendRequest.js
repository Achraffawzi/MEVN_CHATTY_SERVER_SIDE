const FriendRequest = require("../models/friendRequest.js");
const Errors = require("../classes/Errors.js");
const User = require("../models/user.js");

// show details of a specific friend request
const friendRequestByID = async (req, res, next) => {
  try {
    const { id } = req.params;
    const friendRequest = await FriendRequest.findById(id);

    if (!friendRequest) {
      throw Errors.NotFound("Friend request not found");
    }

    // use populate to send exact specific data
    res.status(200).json(friendRequest);
  } catch (error) {
    next(error);
  }
};

// send a new friend request
const createFriendRequest = async (req, res, next) => {
  try {
    const from = req.session.userID;
    const { to } = req.body;

    if (!to || !from) {
      console.log(from);
      console.log(to);
      throw Errors.BadRequest(
        "no information provided about the sender and the reciever"
      );
    }

    const friendRequest = new FriendRequest({
      from,
      to,
    });

    // use sockets to send notification to the reciever
    // ...

    await friendRequest.save();
    res.status(201).json({ message: "Friend request sent" });
  } catch (error) {
    next(error);
  }
};

// Cancel a friend request => delete
const cancelFriendRequest = async (req, res, next) => {
  try {
    const from = req.session.userID;
    const { to } = req.body;

    if (to === undefined || from === undefined) {
      throw Errors.BadRequest(
        "Please provide the friend request sender and reciever"
      );
    }
    const { acknowledged, deletedCount } = await FriendRequest.deleteOne({
      $and: [{ from }, { to }],
    });

    if (deletedCount > 0 && acknowledged) {
      return res.json({ message: "Friend request has been cancel" });
    } else {
      return res.json({ message: "Something bad happened, please try again!" });
    }
  } catch (error) {
    next(error);
  }
};

// reject a friend request => delete
const rejectFriendRequest = async (req, res, next) => {
  try {
    const { from } = req.body;
    const to = req.session.userID;

    if (to === undefined || from === undefined) {
      throw Errors.BadRequest(
        "Please provide the friend request sender and reciever"
      );
    }
    const { acknowledged, deletedCount } = await FriendRequest.deleteOne({
      $and: [{ from }, { to }],
    });

    if (deletedCount > 0 && acknowledged) {
      return res.json({ message: "Friend request has been rejected" });
    } else {
      return res.json({ message: "Something bad happened, please try again!" });
    }
  } catch (error) {
    next(error);
  }
};

// accept
const acceptFriendRequest = async (req, res, next) => {
  try {
    const { from } = req.body;
    const to = req.session.userID;

    if (to === undefined || from === undefined) {
      throw Errors.BadRequest(
        "Please provide the friend request sender and reciever"
      );
    }

    // add friends to friends array
    await User.updateOne(
      {
        _id: to,
      },
      {
        $addToSet: {
          friends: from,
        },
      }
    );

    await User.updateOne(
      {
        _id: from,
      },
      {
        $addToSet: {
          friends: to,
        },
      }
    );

    // delete friend request
    const { acknowledged, deletedCount } = await FriendRequest.deleteOne({
      $and: [{ from }, { to }],
    });

    if (deletedCount > 0 && acknowledged) {
      return res.json({ message: "friend request has been accepted" });
    } else {
      return res.json({ message: "Something bad happened, please try again!" });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  friendRequestByID,
  createFriendRequest,
  cancelFriendRequest,
  rejectFriendRequest,
  acceptFriendRequest,
};
