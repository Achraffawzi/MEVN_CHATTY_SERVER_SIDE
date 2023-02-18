const Errors = require("../classes/Errors.js");

module.exports = (req, res, next) => {
  if (req.session.userID) {
    next();
  } else {
    next(Errors.Unauthorized("You're unauthorized"));
  }
};
