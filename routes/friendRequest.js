const router = require("express").Router();
const isAuth = require("../middlewares/isAuth.js");
const {
  friendRequestByID,
  createFriendRequest,
  cancelFriendRequest,
  rejectFriendRequest,
  acceptFriendRequest,
} = require("../controllers/friendRequest.js");

router.post("/", isAuth, createFriendRequest);
router.delete("/cancel", isAuth, cancelFriendRequest);
router.delete("/reject", isAuth, rejectFriendRequest);
router.delete("/accept", isAuth, acceptFriendRequest);
router.get("/:id", isAuth, friendRequestByID); // ??? Probably not needed ???

module.exports = router;
