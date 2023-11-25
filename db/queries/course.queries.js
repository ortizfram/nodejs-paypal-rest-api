// db/queries/course.queries.js

// ----- Create, Update course Queries-----------------
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
);`;
export const updateCourseQuery = `
UPDATE courses
SET title = ?, slug=?, description = ?, ars_price = ?, usd_price = ?, discount = ?, active = ?, thumbnail = ?, length = ?
WHERE id = ?;
`;
export const createCourseQuery = `
INSERT INTO courses (title, slug, description, ars_price, usd_price , discount, active, thumbnail, length)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
`;
// -----// -----------------

// ----- Module Queries ------------------
export const createTableModuleQuery = `
CREATE TABLE IF NOT EXISTS modules (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  courseId INT NOT NULL,
  PRIMARY KEY(id),
  FOREIGN KEY(courseId) REFERENCES courses(id) ON DELETE CASCADE
);
`;

export const moduleCreateQuery = `
INSERT INTO modules (title, description, courseId)
VALUES (?, ?, ?);
`;

export const modulesListQuery = `SELECT * FROM modules WHERE courseId = ?`;
// -----// -----------------

// -----VIdeo Queries ------------------
export const createVideosTableQuery = `
CREATE TABLE IF NOT EXISTS videos (
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    course_id INT NOT NULL,
    serial_number INT NOT NULL,
    video_id VARCHAR(100) NOT NULL,
    is_preview BOOLEAN DEFAULT false,
    PRIMARY KEY(id),
    FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE
  );
`;
export const createVideoQuery = `
  INSERT INTO videos (title, course_id, serial_number, video_id, is_preview)
  VALUES (?, ?, ?, ?, ?);
`;
export const listCourseVideosQuery = `SELECT * FROM videos WHERE courseId = ?`;
// -----// -----------------

// -----Get course queries-----------------
export const getCourseFromSlugQuery = `SELECT * FROM courses WHERE slug = ?`;
export const getCourseFromIdQuery = `SELECT * FROM courses WHERE id = ?`;

export const getCourseListQuery = `SELECT * FROM courses`;

export const getUserEnrolledCoursesQuery = `
  SELECT course_id 
  FROM user_courses 
  WHERE user_id = ?;
`;
// -----// -----------------

// -----Enroll course queries-----------------
// stored as a comma-separated string
export const insertUserCourseQuery = `INSERT INTO user_courses (user_id, course_id) VALUES (?, ?)`;
// -----// -----------------

export const tableCheckQuery = `SELECT 1 FROM information_schema.tables 
WHERE table_name = ? LIMIT 1;`;
