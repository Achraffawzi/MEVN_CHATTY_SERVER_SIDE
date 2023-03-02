const express = require("express");
const router = express.Router();

// Importing files
const isAuth = require("../middlewares/isAuth.js");
const {
  signup,
  verifyAccount,
  login,
  forgotPassword,
  resetPasswordGET,
  resetPasswordPOST,
  logout,
  changePassword,
  changeEmailGET,
  changeEmailPOST,
  changeEmail,
} = require("../controllers/auth.js");
const upload = require("../config/multer.js");

router.post("/signup", upload.single("picture"), signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.delete("/logout", logout);
router.put("/change-password", isAuth, changePassword);
router.post("/change-email", isAuth, changeEmail);
router.get("/verification/:token", verifyAccount);
router.put("/reset-password/:id", resetPasswordPOST);
router.put("/change-email", isAuth, changeEmailPOST);
router.get("/reset-password/:id/:token", resetPasswordGET);
router.get("/change-email/:id/:token", changeEmailGET);

module.exports = router;
