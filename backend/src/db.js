import { createPool } from "mysql2/promise";
import {DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER} from "../src/config.js"
//import queries
import { createUserTableQuery } from "../db/queries/auth.queries.js";
import { createCourseTableQuery } from "../db/queries/course.queries.js";
import { createBlogTable } from "../db/queries/blog.queries.js";


export const pool = createPool({
  user: DB_USER,
  password: DB_PASSWORD,
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME
})

// Example query to test the connection
async function testConnection() {
  try {
    const [result] = await pool.query('SELECT DATABASE() AS database_name');
    const [tablesResult] = await pool.query('SHOW TABLES');
    console.log('✅ Database connection successful. Result:', result[0]);
    console.log('tables:', [tablesResult]);
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
};

async function tablesCreation() {
  try {
    await pool.query(createUserTableQuery);
    await pool.query(createCourseTableQuery);
    await pool.query(createBlogTable);
    console.log("📋 ALL TABLES WERE CREATED");
  } catch (error) {
    console.error('Error creating tables', error);
  }
}

testConnection();
tablesCreation();