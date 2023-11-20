// db/queries/course.queries.js
export const createCourseTableQuery = `CREATE TABLE IF NOT EXISTS courses (
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    ars_price DECIMAL(10, 2) NOT NULL,
    usd_price DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT NULL,
    active BOOLEAN DEFAULT true,
    thumbnail VARCHAR(255) DEFAULT NULL,
    length INT DEFAULT 0,
    PRIMARY KEY(id),
    UNIQUE KEY(slug)
);`


export const createCourseQuery = `
  INSERT INTO courses (title, slug, description, ars_price, usd_price , discount, active, thumbnail, length)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
`;

export const tableCheckQuery = `SELECT 1 FROM information_schema.tables 
WHERE table_name = ? LIMIT 1;`;

export const getCourseFromSlugQuery = `SELECT * FROM courses WHERE slug = ?`;

export const getCourseListQuery = `SELECT * FROM courses`;

// stored as a comma-separated string
export const insertUserCourseQuery = `INSERT INTO user_courses (user_id, course_id) VALUES (?, ?)`;

export const getUserEnrolledCoursesQuery = `
  SELECT course_id 
  FROM user_courses 
  WHERE user_id = ?;
`;
