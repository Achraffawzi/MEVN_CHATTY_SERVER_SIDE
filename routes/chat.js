const express = require("express");
const router = express.Router();

const { getChatsByUser, createChat } = require("../controllers/chat.js");
const isAuth = require("../middlewares/isAuth.js");

router.get("/", isAuth, getChatsByUser);
router.post("/", isAuth, createChat);

module.exports = router;
