// controllers/employeeController.js
import {
  createEmployeeQuery,
  getEmployeesQuery,
  getEmployeeQuery,
  delEmployeeQuery,
  putEmployeeQuery,
} from "../../db/queries.js";
import { pool } from "../db.js";

const getEmployees = async (req, res) => {
  const [rows] = await pool.query(getEmployeesQuery);
  try {
    console.log("getting employees");
    res.json(rows);
  } catch (error) {
    res.status(500).json({message:"DB Error: error getting employees"})
  } 
};

const getEmployee = async (req, res) => {
  try {
    const id = await req.params.id;
    const [rows] = await pool.query(getEmployeeQuery, [id]);
    console.log("getting one employee");
  
    if (rows.length <= 0) {
      return res.status(404).json({ message: "Employee Not Found" });
    }
    res.json(rows[0]);

  } catch (error) {
    res.status(505).json({message:"Something went wrong"})
  }
};

const createEmployee = async (req, res) => {
 try {
  const { name, salary } = req.body;
  const [rows] = await pool.query(createEmployeeQuery, [name, salary]);
  console.log("Employee created");
  res.send({
    id: rows.insertId,
    name,
    salary,
  });
 } catch (error) {
  res.status(505).json({message:"Something went wrong"})
 }
};

const updateEmployee = async (req, res) => {
  try {
    // req.params.id -> get data  && req.body-> new data
  const id = await req.params.id;
  const { name, salary } = req.body;

  // pass to update
  const [rows] = await pool.query(putEmployeeQuery, [name, salary, id]);

  if (rows.affectedRows === 0)
    return res.status(404).json({ message: "Employee not found" });

  // query to just see updated
  const [result] = await pool.query(getEmployeeQuery, [id])

  res.json(result[0])
  } catch (error) {
    res.status(505).json({message:"Something went wrong"})
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const id = await req.params.id;
    const [rows] = await pool.query(delEmployeeQuery, [id]);

    if (rows.affectedRows >= 1) {
      // 204 means: 202 but not returning anything
      return res.status(204).json({ message: "Employee Deleted" });
    } else {
      return res.status(404).json({ message: "Employee Not Found" });
    }
  } catch (error) {
    res.status(505).json({message:"Something went wrong"})
  }
};

export default {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
