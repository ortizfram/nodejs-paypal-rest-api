import { Router } from "express";
import multer from 'multer';
import { courseCreate, courseEnroll, courseOverview, coursesList } from "../controllers/courses.controller.js";

const router = Router();

// Multer setup for handling image uploads
const upload = multer({
    dest: "src/uploads/", // Set the destination folder where the uploaded images will be stored
});

//------------courseCreate-------------------------
// GET request for displaying the form
router.get("/course/create", (req, res) => {
    res.render("courseCreate");
});
// POST request to handle form submission
router.post('/course/create', upload.single('thumbnail'), courseCreate);
//------------  -------------------------
  
router.get("/courses", coursesList);
router.get("/course/:id", courseOverview);
router.get("/course/:id/enroll", courseEnroll);

export default router;