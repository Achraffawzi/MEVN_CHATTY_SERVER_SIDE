const mongoose = require("mongoose");
const Chat = require("./chats");

const messageSchema = new mongoose.Schema(
  {
    chatID: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

// set this message to lastMessage in chat model after save
MessageSchema.post("save", async function () {
  const chat = await Chat.findById(this.chatID);
  chat.lastMessage = this.text;
  await chat.save();
});

module.exports = mongoose.model("Message", messageSchema);
