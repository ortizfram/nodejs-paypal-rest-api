import { Router } from "express";
import  controller  from "../controllers/admin.controller.js";


const router = Router();

router.get("/users", controller.getUsers);

export default router;
