    import { Router } from "express";
    import  controller  from "../controllers/auth.controller.js";

    const router = Router();

    //------------login-------------------------
    router.get("/login", controller.getLogin);
    router.post("/login", controller.postLogin);

    //------------signup-------------------------
    router.get("/signup", controller.getSignup);
    router.post("/signup", controller.postSignup);

    //------------logout-------------------------
    router.get("/logout", controller.logout);

    // ------------forgotPassword-------------------------
    router.get("/forgot-password", controller.getForgotPassword)
    router.post("/forgot-password", controller.postForgotPassword)
    router.get("/reset-password/:id/:token", controller.getResetPassword)
    router.post("/reset-password/:id/:token",  controller.postResetPassword)

    // ------------userUpdate-------------------------
    router.get("/user-update/:id/confirm", controller.getsendEmailToken)
    router.post("/user-update/:id", controller.postsendEmailToken)
    router.get("/user-update/:id", controller.getUserUpdate)
    router.post("/user-update/:id/:token", controller.postUserUpdate)
    export default router;
