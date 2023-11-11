// queries.js
export const getUsersQuery = `SELECT * FROM users`;
export const createEmployeeQuery = `INSERT INTO employee(name, salary) VALUES (?, ?)`;
