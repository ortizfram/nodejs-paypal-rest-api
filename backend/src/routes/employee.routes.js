import { Router } from "express";
import controller from "../controllers/employee.controller.js";

const router = Router();

router.get("/employees", controller.getEmployees);

router.get("/employees/:id", controller.getEmployee);

router.post("/employees", controller.createEmployee);
 
// put :updates all field if not -> null
// patch :just 1 field, change it in query
router.patch("/employees/:id", controller.updateEmployee);

router.delete("/employees/:id", controller.deleteEmployee);


export default router;