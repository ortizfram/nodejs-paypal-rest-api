// controllers/employeeController.js
import { createEmployeeQuery, getEmployeesQuery, getEmployeeQuery, delEmployeeQuery } from "../../db/queries.js";
import { pool } from "../db.js";

const getEmployees = async (req, res) => {
  const [rows] = await pool.query(getEmployeesQuery);
  console.log("getting employees");
  res.json(rows);
};

const getEmployee = async (req, res) => {
  const id = await req.params.id
  const [rows] = await pool.query(getEmployeeQuery, [id]);
  console.log("getting one employee");

  if (rows.length <= 0 ) {
    return res.status(404).json({message: "Employee Not Found"})
  }
  res.json(rows[0]);
};

const createEmployee = async (req, res) => {
  const { name, salary } = req.body;
  const [rows] = await pool.query(createEmployeeQuery, [name, salary]);
  console.log("Employee created")
  res.send({ 
    id: rows.insertId,
    name,
    salary
   });
};

const updateEmployee = (req, res) => {
  res.send("Updating employees");
};

const deleteEmployee = async(req, res) => {
  const id = await req.params.id
  const [rows] = await pool.query(delEmployeeQuery, [id]);
  
  if (rows.affectedRows >= 1 ) {
    // 204 means: 202 but not returning anything
    return res.status(204).json({message: "Employee Deleted"})
  } else {
    return res.status(404).json({message: "Employee Not Found"})
  }
};

export default {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
