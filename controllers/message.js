const mongoose = require("mongoose");
const Errors = require("../classes/Errors.js");
const Message = require("../models/message.js");

const createMessage = async (req, res, next) => {
  try {
    const loggedInUser = req.session.userID;
    const { chatID, content } = req.body;

    if (!chatID || !content) {
      throw Errors.BadRequest("no chat id or content provided");
    }

    const message = new Message({ ...req.body, from: loggedInUser });
    const savedMessage = await message.save();

    return res.json(savedMessage);
  } catch (error) {
    next(error);
  }
};

const getMessagesByChat = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw Errors.BadRequest("no chat id provided");
    }
    const messages = await Message.find({ chatID: id });
    return res.json(messages);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMessage,
  getMessagesByChat,
};
