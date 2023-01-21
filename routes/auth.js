const express = require("express");
const router = express.Router();

const {
  signup,
  verifyAccount,
  login,
  forgotPassword,
  resetPasswordGET,
  resetPasswordPOST,
  logout,
  changePassword,
} = require("../controllers/auth.js");
const upload = require("../config/multer.js");

router.post("/signup", upload.single("picture"), signup);
router.get("/verification/:token", verifyAccount);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.get("/reset-password/:id/:token", resetPasswordGET);
router.put("/reset-password/:id", resetPasswordPOST);
router.delete("/logout", logout);
router.put("/change-password", changePassword);

module.exports = router;
