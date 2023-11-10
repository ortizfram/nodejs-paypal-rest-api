import { Pool } from 'pg'; //postgresql driver
import { config } from "dotenv";

config();// Loads the .env file into process.env

// Declare and connect postgre to Nodejs
const pool = new Pool({
  connectionString: process.env.DB_URL,
});

pool.on('connect', () => {
  console.log('PostgreSQL connected');
});

export default pool;