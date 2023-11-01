import { Router } from "express";
import { coursesList } from "../controllers/courses.controller.js";

const router = Router();

router.get("/courses", coursesList);

export default router;