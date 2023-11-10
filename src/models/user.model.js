import pool from "../db";

const createUserTable = async () => {
    const createUserTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        enrolled_courses INTEGER[]
      );
    `;
  
    try {
      const client = await pool.connect();
      await client.query(createUserTableQuery);
      console.log('User table created successfully');
    } catch (error) {
      console.error('Error creating user table:', error);
    }
  };
  
  createUserTable();