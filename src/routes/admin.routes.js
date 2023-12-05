import { Router } from "express";
import  controller  from "../controllers/admin.controller.js";


const router = Router();

router.get("/users", controller.getUsers);
// router.post("/users/change-role", controller....);

export default router;
