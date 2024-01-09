// queries.js
export const getEmployeesQuery = `SELECT * FROM employee`;
export const getEmployeeQuery = `SELECT * FROM employee WHERE id = ?`;
export const delEmployeeQuery = `DELETE FROM employee WHERE id = ?`;
export const putEmployeeQuery = `UPDATE employee SET name = IFNULL(?, name), salary = IFNULL(?, salary) WHERE id =?`;
export const createEmployeeQuery = `INSERT INTO employee(name, salary) VALUES (?, ?)`;
