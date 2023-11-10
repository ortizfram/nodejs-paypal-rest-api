import { Router } from "express";
import controller from "../controllers/index.controller.js";

const router = Router();

router.get('/ping', controller.getHome );

export default router;