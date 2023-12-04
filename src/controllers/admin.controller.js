import { listUsers_q } from "../../db/queries/admin.queries.js";
import { pool } from "../db.js";

const getUsers = async (req, res) => {
    try {
      // Check if the user is an admin (You need to implement this check based on your authentication)
      const isAdmin = req.session.user && req.session.user.role === 'admin';
  
      if (!isAdmin) {
        return res.status(403).send('Unauthorized');
      }
  
      // Fetch all users from the database
      const [userRows] = await pool.query(listUsers_q);
  
      res.render("admin/usersPanel", { users: userRows });
    } catch (error) {
      console.error("Error while fetching users:", error);
      res.status(500).send("Internal Server Error");
    }
};
 
  
export default {
    getUsers,
};