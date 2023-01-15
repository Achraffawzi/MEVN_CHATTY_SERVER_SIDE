const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match:
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    },
    password: {
      type: String,
    },
    picture: {
      publicID: String,
      pictureURL: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    friends: {
      type: [{ type: mongoose.Types.ObjectId, ref: "User" }],
      default: [],
    },
    lastOnline: {
      type: Date,
      default: new Date(),
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function () {
  if (this.isModified("password") && this.password !== "") {
    console.log("password changed");
    this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(10));
  }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
