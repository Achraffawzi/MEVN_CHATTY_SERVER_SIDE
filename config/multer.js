const multer = require("multer");
const path = require("path");

module.exports = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    console.log(file);
    if (file) {
      let ext = path.extname(file.originalname);
      if (
        ext !== ".jpg" &&
        ext !== ".jpeg" &&
        ext !== ".png" &&
        ext !== ".gif"
      ) {
        cb(new multer.MulterError("Only .png, .jpeg and .jpg are supported!"));
        return;
      }
      cb(null, true);
    }
  },
});
