const router = require("express").Router();

const {
  createMessage,
  getMessagesByChat,
} = require("../controllers/message.js");
const isAuth = require("../middlewares/isAuth.js");

router.post("/", isAuth, createMessage);
router.get("/:id", isAuth, getMessagesByChat);

module.exports = router;
