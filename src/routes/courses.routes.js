import { Router } from "express";
import { courseCreate, courseEnroll, courseOverview, coursesList } from "../controllers/courses.controller.js";

const router = Router();

//------------courseCreate-------------------------
// GET request for displaying the form
router.get("/course/create", (req, res) => {
    res.render("courseCreate");
});
// POST request to handle form submission
router.post("/course/create", courseCreate);
//------------  -------------------------
  
router.get("/courses", coursesList);
router.get("/course/:id", courseOverview);
router.get("/course/:id/enroll", courseEnroll);

export default router;