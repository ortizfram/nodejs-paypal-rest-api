import { Router } from "express";
import controllers from "../controllers/courses.controller.js";
import upload from "../public/js/multerSetup.js";

const router = Router();


//------------courseCreate/Update-------------------------
router.get("/course/create", controllers.getCourseCreate);//get
router.post('/course/create', upload.single('thumbnail'), controllers.postCourseCreate);//post
router.get('/course/:id/update', controllers.getCourseUpdate);//get update
router.post('/course/:id/update', upload.single('thumbnail'), controllers.postCourseUpdate);// post update
/////---------module-------------------------
router.get("/course/:id/module/create", controllers.getModuleCreate);//get
router.post('/course/:id/module/create', upload.single('thumbnail'), controllers.postModuleCreate);//post
router.get('/course/:id/module/update', controllers.getModuleUpdate);//get update
router.post('/course/:id/module/update', upload.single('thumbnail'), controllers.postModuleUpdate);//post update
// /////---------video-------------------------
// router.get("/course/:id/video/create", controllers.getVideoCreate);
// router.post('/course/:id/video/create', controllers.postVideoCreate);
//------------courseDetail  -------------------------
router.get("/course/:id", controllers.courseOverview);
router.get("/course/:id/enroll", controllers.courseEnroll);
router.get("/course/:id/modules", controllers.courseDetail); // This route should fetch course detail
//------------coursesList-------------------------
router.get("/courses", controllers.coursesList);
router.get("/courses-owned", controllers.coursesListOwned);

export default router;
