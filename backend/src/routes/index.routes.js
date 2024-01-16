import { Router } from "express";
import controller from "../controllers/index.controller.js";

const router = Router();

router.get('/')
router.get('/ping', controller.getPing );
router.post('/send-email', controller.sendEmail );

export default router;