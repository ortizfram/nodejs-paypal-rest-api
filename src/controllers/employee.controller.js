// controllers/employeeController.js
const getEmployees = async (req, res) => {
    res.send("Getting employees");
  };
  
  const createEmployee = (req, res) => {
    res.send("Creating employees");
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
  