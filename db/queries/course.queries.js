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
  video_link VARCHAR(255) NOT NULL,
  courseId INT NOT NULL,
  PRIMARY KEY(id),
  FOREIGN KEY(courseId) REFERENCES courses(id) ON DELETE CASCADE
);
`;

export const moduleCreateQuery = `
INSERT INTO modules (courseId, title, description, video_link)
VALUES (?, ?, ?, ?);
`;

export const moduleUpdateQuery = `
UPDATE modules
SET title = ?, description = ?, video_link = ?
WHERE id = ?;
`;

export const modulesListQuery = `SELECT * FROM modules WHERE courseId = ?`;

export const getExistingModulesQuery = `SELECT id, title, description, video_link
FROM modules
WHERE courseId = ?
`;
// -----// -----------------

// -----VIdeo Queries ------------------
export const createVideosTableQuery = `
CREATE TABLE IF NOT EXISTS videos (
    id INT NOT NULL AUTO_INCREMENT,
    courseId INT NOT NULL,
    module_id INT NOT NULL,
    video_id VARCHAR(100) NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY(courseId) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
)
`;

export const createVideoQuery = `
INSERT INTO videos (courseId, module_id, video_id)
VALUES (?, ?, ?, ?);
`;

export const listCourseVideosQuery = `SELECT * FROM videos WHERE courseId = ?`;

export const listModuleVideosQuery = `
SELECT * FROM videos WHERE courseId = ? AND moduleId = ?;
`;
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
