import { Router } from "express";
import multer from 'multer';
import controllers from "../controllers/courses.controller.js";

const router = Router();

// Multer setup for handling image uploads
const upload = multer({
    dest: "src/uploads/", // Set the destination folder where the uploaded images will be stored
});

//------------courseCreate-------------------------
router.get("/course/create", controllers.getCourseCreate);
router.post('/course/create', upload.single('thumbnail'), controllers.postCourseCreate);
//------------courseUpdate  -------------------------
router.get('/course/:id/update', controllers.getCourseUpdate);
router.post('/course/:id/update', upload.single('thumbnail'), controllers.patchCourseUpdate);
//------------courseDetail  -------------------------
router.get("/course/:id", controllers.courseOverview);
router.get("/course/:id/enroll", controllers.courseEnroll);
router.get("/course/:id/modules", controllers.courseDetail); // This route should fetch course detail

//------------coursesList-------------------------
router.get("/courses", controllers.coursesList);
router.get("/courses-owned", controllers.coursesListOwned);

export default router;
