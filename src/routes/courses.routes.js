import { Router } from "express";
import controllers from "../controllers/courses.controller.js";
import { admin_staff_check, admin_staff_clicking_course, checkCourseEnrollment, is_loggedin_check } from "../../apps.js";

const router = Router();


//------------courseCreate/Update-------------------------
router.get("/course/create", admin_staff_check, controllers.getCourseCreate);//get
router.post('/course/create',  admin_staff_check, controllers.postCourseCreate);//post
router.get('/course/:id/update', admin_staff_check, controllers.getCourseUpdate);//get update
router.post('/course/:id/update',  admin_staff_check, controllers.postCourseUpdate);// post update
router.get('/course/:id/delete',  admin_staff_check, controllers.getCourseDelete);// get del
router.post('/course/:id/delete',  admin_staff_check, controllers.postCourseDelete);// post del

//------------courseDetail  -------------------------
router.get("/course/:id/overview", is_loggedin_check, controllers.courseOverview);
router.get("/course/:id/enroll", is_loggedin_check, controllers.courseEnroll);
router.get("/course/:id/", is_loggedin_check, admin_staff_clicking_course, controllers.courseDetail); // This route should fetch course detail
//------------coursesList-------------------------
router.get("/courses", controllers.coursesList);
router.get("/courses-owned", is_loggedin_check, controllers.coursesListOwned);

export default router;
