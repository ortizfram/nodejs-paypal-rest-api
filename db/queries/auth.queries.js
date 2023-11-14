    // db/queries/auth.queries.js
    export const createUserTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        enrolled_courses INTEGER[]
      );
    `;
    export const postSignupQuery = `INSERT INTO users (username, name, email, password) VALUES (?, ?, ?, ?)`;
    export const postLoginQuery= `SELECT * FROM users WHERE username = ?`;