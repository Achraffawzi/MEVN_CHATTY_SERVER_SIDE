const express = require("express");
const router = express.Router();

const { signup, verifyAccount } = require("../controllers/auth.js");
const upload = require("../config/multer.js");

router.post("/signup", upload.single("picture"), signup);
router.post("/verification/:token", verifyAccount);

module.exports = router;
