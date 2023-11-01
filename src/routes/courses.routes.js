import { Router } from "express";
import { courseDetail, coursesList } from "../controllers/courses.controller.js";

const router = Router();

router.get("/courses", coursesList);
router.get("/course/:id", courseDetail);

export default router;