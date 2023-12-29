import { Router } from "express";
import controller from "../controllers/blog.controller.js";

const router = Router();

//------------login-------------------------
router.get("/blog", controller.getblogList);

export default router;
