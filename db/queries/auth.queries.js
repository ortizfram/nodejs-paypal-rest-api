    // db/queries/auth.queries.js
    export const postSignupQuery = `INSERT INTO users (username, name, email, password) VALUES ($1, $2, $3, $4)`;
    export const postLoginQuery= `SELECT * FROM users WHERE username = $1`;