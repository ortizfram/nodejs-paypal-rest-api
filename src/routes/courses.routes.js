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
router.get('/course/:slug/update', controllers.getCourseUpdate);
router.patch('/course/:slug/update', controllers.patchCourseUpdate);
//------------  -------------------------
  
router.get("/courses", controllers.coursesList);
router.get("/courses-owned", controllers.coursesListOwned);
router.get("/course/:slug", controllers.courseOverview);
router.get("/course/:slug/enroll", controllers.courseEnroll);
router.get("/course/:slug/modules", controllers.courseDetail);

export default router;
