import mysql from "mysql2";
import {DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER} from "./config.js"
//import queries
import { createUserTableQuery } from "../db/queries/auth.queries.js";
import { createCourseTableQuery } from "../db/queries/course.queries.js";
import { createBlogTable } from "../db/queries/blog.queries.js";
import { db } from "../server.js";

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