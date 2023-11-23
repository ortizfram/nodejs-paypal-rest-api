// multerSetup.js

//this is to accept all img types on upload to render thumbnails

import multer from 'multer';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/src/uploads'); // Destination directory for storing uploads
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split('/')[1]; // Extracting extension from mimetype
    cb(null, `${file.fieldname}-${Date.now()}.${ext}`); // Renaming the file with proper extension
  }
});

const imageFilter = function (req, file, cb) {
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
    return cb(new Error('Only JPG, JPEG, and PNG files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: imageFilter
});

export default upload;
