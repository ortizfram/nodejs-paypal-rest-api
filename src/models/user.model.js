import { createUserTableQuery } from "../../db/queries/auth.queries.js";
import pool from "../db.js";


const createUserTable = async () => {
    try {
      await pool.query(createUserTableQuery);
      console.log('User table created successfully');
    } catch (error) {
      console.error('Error creating user table:', error);
    }
  };
  
  createUserTable();