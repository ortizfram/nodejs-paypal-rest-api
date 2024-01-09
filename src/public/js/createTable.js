// createTable.js
import { tableCheckQuery } from "../../../db/queries/course.queries.js";
import { pool } from "../../db.js";

const createTableIfNotExists = async (pool, tableCheckQuery, createTableQuery, tableName) => {
    try {
      const [tableCheck] = await pool.query(tableCheckQuery, tableName);
      const tableExists = tableCheck.length > 0;
  
      if (!tableExists) {
        await pool.query(createTableQuery);
        console.log(`\n--- ${tableName} table created\n`);
      }
    } catch (error) {
      console.error(`Error checking or creating ${tableName} table:`, error);
      // Handle the error accordingly
    }
  };
  
 export default createTableIfNotExists;
  