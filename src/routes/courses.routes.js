import { Router } from "express";
import controllers from "../controllers/courses.controller.js";
import upload from "../public/js/multerSetup.js";

const router = Router();


//------------courseCreate-------------------------
router.get("/course/create", controllers.getCourseCreate);
router.post('/course/create', upload.single('thumbnail'), controllers.postCourseCreate);
/////---------moduleCreate-------------------------
router.get("/course/:id/module/create", controllers.getModuleCreate);
router.post('/course/:id/module/create', controllers.postModuleCreate);
/////---------videoCreate-------------------------
router.get("/course/:id/video/create", controllers.getVideoCreate);
router.post('/course/:id/video/create', controllers.postVideoCreate);

//------------courseUpdate  -------------------------
router.get('/course/:id/update', controllers.getCourseUpdate);
router.post('/course/:id/update', upload.single('thumbnail'), controllers.postCourseUpdate);

//------------courseDetail  -------------------------
router.get("/course/:id", controllers.courseOverview);
router.get("/course/:id/enroll", controllers.courseEnroll);
router.get("/course/:id/modules", controllers.courseDetail); // This route should fetch course detail

//------------coursesList-------------------------
router.get("/courses", controllers.coursesList);
router.get("/courses-owned", controllers.coursesListOwned);

export default router;
