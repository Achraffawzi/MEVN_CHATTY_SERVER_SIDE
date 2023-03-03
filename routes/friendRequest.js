const router = require("express").Router();
const isAuth = require("../middlewares/isAuth.js");
const {
  friendRequestByID,
  createFriendRequest,
  deleteFriendRequest,
} = require("../controllers/friendRequest.js");

router.post("/", isAuth, createFriendRequest);
router.get("/:id", isAuth, friendRequestByID); // ??? Probably not needed ???
router.delete("/", isAuth, deleteFriendRequest);

module.exports = router;
