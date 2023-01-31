const express = require("express");
const router = express.Router();

const { updateUser } = require("../controllers/user.js");
// const upload = require("../config/multer.js");

router.put("/update/:id", updateUser);

module.exports = router;
