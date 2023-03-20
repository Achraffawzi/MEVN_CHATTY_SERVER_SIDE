const mongoose = require("mongoose");
const Errors = require("../classes/Errors.js");
const Chat = require("../models/chat.js");

const getChatsByUser = async (req, res, next) => {
  try {
    const currentUserID = req.session.userID;

    const chats = await Chat.find({
      $and: [
        {
          participants: {
            $in: [currentUserID],
          },
        },
        {
          lastMessage: {
            $exists: true,
          },
        },
      ],
    })
      .populate({
        path: "participants",
        select: "picture username",
        options: {
          skip: 0,
          limit: 1,
        },
      })
      .select("_id participants lastMessage lastMessageDate createdAt");

    return res.json(chats);
  } catch (error) {
    next(error);
  }
};
// 63f200d2cec06ec154e7448b   6400fd351720e3dc744a114e
const createChat = async (req, res, next) => {
  try {
    const currentUserID = req.session.userID;
    const { to } = req.body;

    if (!to) {
      throw Errors.BadRequest("Provide recipient");
    }

    if (mongoose.Types.ObjectId(to).equals(currentUserID)) {
      throw Errors.BadRequest("cannot create chat with the same user");
    }

    const chat = new Chat({
      participants: [currentUserID, to],
    });

    const newChat = await chat.save();

    return res.json(newChat);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getChatsByUser,
  createChat,
};
