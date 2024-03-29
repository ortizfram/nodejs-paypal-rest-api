import { Router } from "express";
import controllers from "../controllers/courses.controller.js";
import { admin_staff_check, admin_staff_clicking_course, checkCourseEnrollment, is_loggedin_check } from "../../server.js";


const router = Router();


//------------courseCreate/Update-------------------------
router.get('/course/:id/delete',  admin_staff_check, controllers.getCourseDelete);// get del
router.post('/course/:id/delete',  admin_staff_check, controllers.postCourseDelete);// post del

//------------courseDetail  -------------------------
router.get("/course/:id/overview", is_loggedin_check, controllers.courseOverview);
router.get("/course/:id/enroll", is_loggedin_check, controllers.courseEnroll);
router.get("/courses-owned", is_loggedin_check, controllers.coursesListOwned);

export default router;
