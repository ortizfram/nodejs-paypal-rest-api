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

    export const createTableUserCourses =`CREATE TABLE IF NOT EXISTS user_courses (
      user_id INT,
      course_id INT,
      PRIMARY KEY (user_id, course_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (course_id) REFERENCES courses(id)
    )`;
  
    export const postSignupQuery = `INSERT INTO users (username, name, email, password) VALUES (?, ?, ?, ?)`;
    export const postLoginQuery= `SELECT * FROM users WHERE username = ?`;