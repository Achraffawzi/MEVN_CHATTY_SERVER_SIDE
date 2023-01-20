const express = require("express");
const router = express.Router();

const { signup, verifyAccount, login } = require("../controllers/auth.js");
const upload = require("../config/multer.js");

router.post("/signup", upload.single("picture"), signup);
router.get("/verification/:token", verifyAccount);
router.post("/login", login);

module.exports = router;
