const FriendRequest = require("../models/friendRequest.js");
const Errors = require("../classes/Errors.js");

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

// Cancel/refuse a friend request => delete
const deleteFriendRequest = async (req, res, next) => {
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
      return res.json({ message: "Friend request has been deleted" });
    } else {
      return res.json({ message: "Something bad happened, please try again!" });
    }
  } catch (error) {
    next(error);
  }
};

// cancel an existing friend request or unfriend a user
exports.delete = (req, res) => {
  FriendRequest.findByIdAndDelete(req.params.id, (err, friendRequest) => {
    if (err) {
      res.status(500).send(err);
    } else if (!friendRequest) {
      res.status(404).send("Friend request not found");
    } else {
      res.status(204).send();
    }
  });
};

module.exports = {
  friendRequestByID,
  createFriendRequest,
  deleteFriendRequest,
};
