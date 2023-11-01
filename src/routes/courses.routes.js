import { Router } from "express";
import { courseEnroll, courseOverview, coursesList } from "../controllers/courses.controller.js";

const router = Router();

router.get("/courses", coursesList);
router.get("/course/:id", courseOverview);
router.get("/course/:id/enroll", courseEnroll);

export default router;