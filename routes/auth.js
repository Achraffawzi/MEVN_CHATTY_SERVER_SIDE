const express = require("express");
const router = express.Router();

const {
  signup,
  verifyAccount,
  login,
  forgotPassword,
} = require("../controllers/auth.js");
const upload = require("../config/multer.js");

router.post("/signup", upload.single("picture"), signup);
router.get("/verification/:token", verifyAccount);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);

module.exports = router;
