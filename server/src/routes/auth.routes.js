    import { Router } from "express";
    import  controller  from "../controllers/auth.controller.js";

    const router = Router();

    // ------------userUpdate-------------------------
    router.get("/user-update/:id/confirm", controller.getsendEmailToken)
    router.post("/user-update/:id", controller.postsendEmailToken)
    router.get("/user-update/:id", controller.getUserUpdate)
    router.post("/user-update/:id/:token", controller.postUserUpdate)
    export default router;
