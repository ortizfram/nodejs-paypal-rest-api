import { Router } from "express";
import controllers from "../controllers/courses.controller.js";

const router = Router();


//------------courseCreate/Update-------------------------
router.get("/course/create", controllers.getCourseCreate);//get
router.post('/course/create',  controllers.postCourseCreate);//post
router.get('/course/:id/update', controllers.getCourseUpdate);//get update
router.post('/course/:id/update',  controllers.postCourseUpdate);// post update
router.get('/course/:id/delete',  controllers.getCourseDelete);// get del
router.post('/course/:id/delete',  controllers.postCourseDelete);// post del
/////---------module-------------------------
router.get("/course/:id/module/create", controllers.getModuleCreate);//get
router.post('/course/:id/module/create', controllers.postModuleCreate);//post
router.get('/course/:id/module/update', controllers.getModuleUpdate);//get update
router.post('/course/:id/module/update', controllers.postModuleUpdate);//post update
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
