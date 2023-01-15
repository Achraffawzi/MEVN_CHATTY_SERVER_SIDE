const mongoose = require("mongoose");
const DATABASE_NAME = "chattyDB";

module.exports = connectDB = () => {
  mongoose.set("strictQuery", false);
  return new Promise((resolve, reject) => {
    mongoose
      .connect(
        process.env.MONGO_URI || `mongodb://localhost:27017/${DATABASE_NAME}`,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }
      )
      .then(() => {
        resolve(`Connected to MongoDB!`);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
