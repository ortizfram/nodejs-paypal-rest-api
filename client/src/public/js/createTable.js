// createTable.js
import { tableCheckQuery } from "../../../db/queries/course.queries.js";
import { db } from "../../db.js";

const createTableIfNotExists = async (db, tableCheckQuery, createTableQuery, tableName) => {
    try {
      const [tableCheck] = await db.promise().execute(tableCheckQuery, tableName);
      const tableExists = tableCheck.length > 0;
  
      if (!tableExists) {
        await db.promise().execute(createTableQuery);
        console.log(`\n--- ${tableName} table created\n`);
      }
    } catch (error) {
      console.error(`Error checking or creating ${tableName} table:`, error);
      // Handle the error accordingly
    }
  };
  
 export default createTableIfNotExists;
  