import mysql from "mysql2";
import {DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER} from "./config.js"
//import queries
import { createUserTableQuery } from "../db/queries/auth.queries.js";
import { createCourseTableQuery } from "../db/queries/course.queries.js";
import { createBlogTable } from "../db/queries/blog.queries.js";

const isDev = process.env.NODE_ENV === 'development';
export const db = mysql.createConnection({
  host: isDev ? "127.0.0.1" : process.env.DB_HOST,
  user: isDev ? "root" : process.env.DB_USER,
  password: isDev ? "melonmelon" : process.env.DB_PASSWORD,
  database: isDev ? "conn" : process.env.DB_NAME,
  port: isDev ? 3307 : process.env.DB_PORT,
});
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err);
    return;
  }
  console.log("Connected to MySQL database");

});

// Example query to test the connection
async function testConnection() {
  try {
    let sql = "SELECT DATABASE() AS database_name"
    const [result] = await db.promise().execute(sql);
    sql = "SHOW TABLES"
    const [tablesResult] = await db.promise().execute(sql);
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
};

async function tablesCreation() {
  try {
    await db.promise().execute(createUserTableQuery);
    await db.promise().execute(createCourseTableQuery);
    await db.promise().execute(createBlogTable);
  } catch (error) {
    console.error('Error creating tables', error);
  }
}

testConnection();
tablesCreation();