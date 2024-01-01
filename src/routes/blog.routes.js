import { Router } from "express";
import controller from "../controllers/blog.controller.js";

const router = Router();

//------------list-------------------------
router.get("/blog", controller.getblogList);
//------------create-------------------------
router.get("/blog/create", controller.getblogCreate);
router.post("/blog/create", controller.postblogCreate);
//------------detail-------------------------
router.get("/blog/:id", controller.getBlogDetail);
//------------update-------------------------
router.get("/blog/:id/update", controller.getBlogUpdate);
router.post("/blog/:id/update", controller.postBlogUpdate);


export default router;
