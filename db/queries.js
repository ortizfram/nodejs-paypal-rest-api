// queries.js
export const getEmployeesQuery = `SELECT * FROM employee`;
export const createEmployeeQuery = `INSERT INTO employee(name, salary) VALUES (?, ?)`;
