const express = require("express");
const handleErrors = require("./middlewares/errors.js");
const connectDB = require("./config/db.js");

const app = express();
require("dotenv").config();

const cors = require("cors");

// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL,
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
