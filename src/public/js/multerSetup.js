// multerSetup.js

//this is to accept all img types on upload to render thumbnails

import multer from 'multer';
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/uploads'); // Destination directory for storing uploads
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split('/')[1]; // Extracting extension from mimetype
    cb(null, Date.now() +  path.extname(file.originalname)); // Renaming the file with proper extension
  }
});

const upload = multer({
  storage: storage,
});

export default upload;
