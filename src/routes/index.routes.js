import { Router } from "express";
import controller from "../controllers/index.controller.js";

const router = Router();

router.get('/ping', controller.getPing );
router.get('/', controller.getHome );

export default router;