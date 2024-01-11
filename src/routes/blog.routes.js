import { Router } from "express";
import controller from "../controllers/blog.controller.js";
import { admin_staff_check } from "../../apps.js";


const router = Router();

//------------list-------------------------
router.get("/blog", controller.getblogList);
//------------create-------------------------
router.get("/blog/create", admin_staff_check, controller.getblogCreate);
router.post("/blog/create", admin_staff_check, controller.postblogCreate);
//------------detail-------------------------
router.get("/blog/:id", controller.getBlogDetail);
//------------update-------------------------
router.get("/blog/:id/update", admin_staff_check, controller.getBlogUpdate);
router.post("/blog/:id/update", admin_staff_check, controller.postBlogUpdate);
//------------delete-------------------------
router.get("/blog/:id/delete", admin_staff_check, controller.getBlogDelete);
router.post("/blog/:id/delete", admin_staff_check, controller.postBlogDelete);


export default router;
