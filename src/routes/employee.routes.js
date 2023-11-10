import { Router } from "express";

const router = Router();

router.get("/employees", (req, res) => {
  res.send("Getting employees");
});

router.post("/employees", (req, res) => {
    res.send("Creating employees");
  });

router.put("/employees", (req, res) => {
res.send("Updating employees");
});

router.delete("/employees", (req, res) => {
    res.send("Deleting employees");
});

export default router;