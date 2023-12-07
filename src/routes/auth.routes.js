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
    router.get("/reset-password", controller.getResetPassword)

    export default router;
