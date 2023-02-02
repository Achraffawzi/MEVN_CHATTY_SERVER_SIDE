const express = require("express");
const upload = require("../config/multer.js");
const router = express.Router();

const { updateUser, updateProfilePicture } = require("../controllers/user.js");

router.put("/update/:id", updateUser);
router.put(
  "/update-profile-picture/:id",
  upload.single("picture"),
  updateProfilePicture
);

module.exports = router;
