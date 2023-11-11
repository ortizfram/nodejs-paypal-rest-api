// controllers/employeeController.js
import { createEmployeeQuery } from "../../db/queries.js";
import { pool } from "../db.js";

const getEmployees = async (req, res) => {
  console.log("getting employees");
};

const createEmployee = async (req, res) => {
  const { name, salary } = req.body;
  const [rows] = await pool.query(createEmployeeQuery, [name, salary]);
  res.send({ 
    id: rows.insertId,
    name,
    salary
   });
};

const updateEmployee = (req, res) => {
  res.send("Updating employees");
};

const deleteEmployee = (req, res) => {
  res.send("Deleting employees");
};

export default {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
