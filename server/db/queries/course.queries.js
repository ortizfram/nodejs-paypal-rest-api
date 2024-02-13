// db/queries/course.queries.js

// ----- Create, Update course Queries-----------------
export const createCourseTableQuery = `
CREATE TABLE IF NOT EXISTS courses (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description VARCHAR(255) DEFAULT NULL,
  text_content TEXT DEFAULT NULL,
  ars_price DECIMAL(10, 2) NOT NULL,
  usd_price DECIMAL(10, 2) NOT NULL,
  discount_ars DECIMAL(10, 2) DEFAULT NULL,
  discount_usd DECIMAL(10, 2) DEFAULT NULL,
  thumbnail VARCHAR(255) DEFAULT NULL,
  video VARCHAR(255) DEFAULT NULL,  /* Modified to include the video field */
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  author_id INT NOT NULL,

  PRIMARY KEY(id),
  UNIQUE KEY(slug)
  /* Add the foreign key constraint in the same query */
  -- ALTER TABLE courses
  -- ADD CONSTRAINT fk_author
  -- FOREIGN KEY (author_id) REFERENCES users(id);
);`;  

const argentinaTimeZone =
  "CONVERT_TZ(NOW(), 'UTC', 'America/Argentina/Buenos_Aires')";

export const createCourseQuery = `
  INSERT INTO courses (title, slug, description, text_content,  ars_price, usd_price, discount, thumbnail, video, created_at, updated_at, author_id)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ${argentinaTimeZone}, ${argentinaTimeZone}, ?);
  `;

export const courseFieldsPlusAuthor_q = `
SELECT 
  courses.*,
  users.id AS author_id,
  users.name AS author_name,
  users.username AS author_username,
  users.avatar AS author_avatar
FROM 
  courses
LEFT JOIN 
  users ON users.id = courses.author_id
LIMIT ?,?
`;

export const updateCourseQuery = `
  UPDATE courses
  SET title = ?, slug = ?, description = ?, text_content = ?,video = ?, ars_price = ?, usd_price = ?, discount = ?, thumbnail = ?, updated_at = ${argentinaTimeZone}
  WHERE id = ?;
`;

export const deleteCourseQuery = `DELETE FROM courses WHERE id = ?;`;
export const deleteUserCourseQuery = `DELETE FROM user_courses WHERE course_id = ?;`;

// -----Get course queries-----------------
export const getCourseFromSlugQuery = `SELECT * FROM courses WHERE slug = ?`;
export const getCourseFromIdQuery = `SELECT 
courses.*,
users.name AS author_name,
users.username AS author_username,
users.avatar AS author_avatar
FROM 
courses
LEFT JOIN 
users ON users.id = courses.author_id
WHERE
courses.id = ?`;

export const getCourseListQuery = `SELECT * FROM courses LIMIT ?, ?`;
export const getCourseListNoPagination_q = `SELECT * FROM courses`;

// export const getUserEnrolledCoursesQuery = `
//   SELECT course_id
//   FROM user_courses
//   WHERE user_id = ?
// `;

export const getCourseAuthorQuery = `
  SELECT 
    id AS author_id,
    name AS author_name,
    username AS author_username,
    avatar AS author_avatar
  FROM 
    users 
  WHERE 
    id = ?;
`;

export const getUserEnrolledCoursesQuery = `
SELECT 
  courses.*,
  users.name AS author_name,
  users.username AS author_username,
  users.avatar AS author_avatar
FROM 
  user_courses 
JOIN 
  courses ON user_courses.course_id = courses.id
JOIN 
  users ON courses.author_id = users.id
WHERE 
  user_courses.user_id = ?
`;

// -----Enroll course queries-----------------
// stored as a comma-separated string
export const insertUserCourseQuery = `INSERT INTO user_courses (user_id, course_id) VALUES (?, ?)`;

// -----Checks queries-----------------
export const tableCheckQuery = `SELECT 1 FROM information_schema.tables 
WHERE table_name = ? LIMIT 1;`;
