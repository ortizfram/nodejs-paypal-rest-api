import { listUsers_q, userSearch_q } from "../../../db/queries/admin.queries.js";
import { pool } from "../../db.js";

const userSearch = async (searchQuery) => {
  try {
    let userRows = [];

    if (searchQuery) {
      const searchPattern = `%${searchQuery}%`;//you get this from controller req query
      
      // array that fills with queries
      // (4): [name, username, email, role]
      const queryParams = Array(4).fill(searchPattern);
      
      // list filtered users
      [userRows] = await pool.query(userSearch_q, queryParams);

    } else {
        
      // list all users
      [userRows] = await pool.query(listUsers_q);
      
    }

    return userRows;
  } catch (error) {
    console.error("Error while searching users:", error);
    throw error;
  }
};

export default userSearch;
