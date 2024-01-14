import { Router } from "express";
import  controller  from "../controllers/admin.controller.js";
import { admin_staff_check } from "../../index.js";


const router = Router();

router.get("/users", admin_staff_check,controller.getUsers);
router.post("/users/change-role", admin_staff_check, controller.changeUserRole);

export default router;
