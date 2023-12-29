import { Router } from "express";
import controller from "../controllers/blog.controller.js";

const router = Router();

//------------login-------------------------
router.get("/blog", controller.getblogList);
router.get("/blog/create", controller.getblogCreate);

export default router;
