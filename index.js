const express = require("express");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const handleErrors = require("./middlewares/errors.js");
const connectDB = require("./config/db.js");

const app = express();

// Configuration
require("dotenv").config();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extends: true }));

// Routers
app.use("/api/auth", require("./routes/auth.js"));

// error middleware
app.use(handleErrors);

const port = process.env.PORT || 5000;

// Starting the server
const startServer = () => {
  connectDB() // returns undefined
    .then((msg) => {
      console.log(msg);
      app.listen(port, () => {
        console.log(`Server running on port ${port}`);
      });
    })
    .catch((error) => console.log(error));
};

startServer();
