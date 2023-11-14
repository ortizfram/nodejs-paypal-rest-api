    // db/queries/auth.queries.js
    export const postSignupQuery = `INSERT INTO users (username, name, email, password) VALUES (?, ?, ?, ?)`;
    export const postLoginQuery= `SELECT * FROM users WHERE username = ?`;