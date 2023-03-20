const express = require("express");
const socket = require("socket.io");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const handleErrors = require("./middlewares/errors.js");
const connectDB = require("./config/db.js");

const app = express();
const server = require("http").createServer(app);
const io = socket(server, {
  cors: {
    origin: process.env.CLIENT_URL,
  },
});

io.on("connection", (socket) => {
  console.log("a new socket joined" + socket.id);
});

// Configuration
require("dotenv").config();

const store = new MongoDBStore({
  uri: process.env.MONGO_URI || `mongodb://0.0.0.0:27017/chattyDB`,
  collection: "mySessions",
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

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
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extends: true }));

// Routers
app.use("/api/auth", require("./routes/auth.js"));
app.use("/api/users", require("./routes/user.js"));
app.use("/api/friend-request", require("./routes/friendRequest.js"));
app.use("/api/chats", require("./routes/chat.js"));
app.use("/api/messages", require("./routes/message.js"));

// error middleware
app.use(handleErrors);

const port = process.env.PORT || 5000;

// Starting the server
const startServer = () => {
  connectDB() // returns undefined
    .then((msg) => {
      console.log(msg);
      server.listen(port, () => {
        console.log(`Server running on port ${port}`);
      });
    })
    .catch((error) => console.log(error));
};

startServer();
