// db/queries/course.queries.js

// ----- Create, Update course Queries-----------------
export const createCourseTableQuery = `CREATE TABLE IF NOT EXISTS courses (
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description VARCHAR(255) DEFAULT NULL,
    text_content TEXT DEFAULT NULL,
    video_link VARCHAR(255) NOT NULL,
    ars_price DECIMAL(10, 2) NOT NULL,
    usd_price DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT NULL,
    active BOOLEAN DEFAULT true,
    thumbnail VARCHAR(255) DEFAULT NULL,
    length INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    author_id INT NOT NULL,

    PRIMARY KEY(id),
    UNIQUE KEY(slug),
    FOREIGN KEY (author_id) REFERENCES users(id)
);`;

const argentinaTimeZone = "CONVERT_TZ(NOW(), 'UTC', 'America/Argentina/Buenos_Aires')";

export const updateCourseQuery = `
  UPDATE courses
  SET title = ?, slug = ?, description = ?, text_content = ?, video_link = ?, ars_price = ?, usd_price = ?, discount = ?, active = ?, thumbnail = ?, length = ?, updated_at = ${argentinaTimeZone}
  WHERE id = ?;
`;

export const createCourseQuery = `
INSERT INTO courses (title, slug, description, text_content, video_link, ars_price, usd_price, discount, active, thumbnail, length, created_at, updated_at, author_id)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ${argentinaTimeZone}, ${argentinaTimeZone}, ?);
`;

export const courseWithAuthor_q = `SELECT 
users.name AS author_name,
users.username AS author_username,
users.avatar AS author_avatar
FROM 
courses
JOIN 
users ON users.id = courses.author_id;
`;

export const deleteCourseQuery = `DELETE FROM courses WHERE id = ?;`;
export const deleteUserCourseQuery = `DELETE FROM user_courses WHERE course_id = ?;`;

// -----Get course queries-----------------
export const getCourseFromSlugQuery = `SELECT * FROM courses WHERE slug = ?`;
export const getCourseFromIdQuery = `SELECT * FROM courses WHERE id = ?`;

export const getCourseListQuery = `SELECT * FROM courses LIMIT ?, ?`;
export const getCourseListNoPagination_q = `SELECT * FROM courses`;

export const getUserEnrolledCoursesQuery = `
  SELECT course_id 
  FROM user_courses 
  WHERE user_id = ?
`;

// -----Enroll course queries-----------------
// stored as a comma-separated string
export const insertUserCourseQuery = `INSERT INTO user_courses (user_id, course_id) VALUES (?, ?)`;

// -----Checks queries-----------------
export const tableCheckQuery = `SELECT 1 FROM information_schema.tables 
WHERE table_name = ? LIMIT 1;`;
