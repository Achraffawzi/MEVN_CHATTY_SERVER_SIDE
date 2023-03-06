const express = require("express");
const upload = require("../config/multer.js");
const router = express.Router();

const {
  getUsersByUsername,
  updateUsername,
  updateProfilePicture,
  unfriend,
} = require("../controllers/user.js");
const isAuth = require("../middlewares/isAuth.js");

router.get("/", isAuth, getUsersByUsername);
router.put("/update", isAuth, updateUsername);
router.put(
  "/update-profile-picture/:id",
  isAuth,
  upload.single("picture"),
  updateProfilePicture
);
router.delete("/unfriend/:id", isAuth, unfriend);

module.exports = router;
