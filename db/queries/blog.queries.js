export const createBlogTable = `
CREATE TABLE IF NOT EXISTS blogs (
    id INT NOT NULL AUTO_INCREMENT,

    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description VARCHAR(255) DEFAULT NULL,
    text_content TEXT DEFAULT NULL,
    thumbnail VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    author_id INT NOT NULL,

    PRIMARY KEY(id),
    UNIQUE KEY(slug),
    FOREIGN KEY (author_id) REFERENCES users(id)
);
`;
// ALTER TABLE blogs MODIFY COLUMN text_content LONGTEXT;

const argentinaTimeZone =
  "CONVERT_TZ(NOW(), 'UTC', 'America/Argentina/Buenos_Aires')";

export const createBlogQuery = `
INSERT INTO blogs (title, slug, description, text_content, thumbnail, created_at, updated_at, author_id)
VALUES (?, ?, ?, ?, ?, ${argentinaTimeZone}, ${argentinaTimeZone}, ?);
`;

export const updateBlogQuery = `
UPDATE blogs
SET title=?, slug=?, description=?, text_content=?, thumbnail=?, updated_at=${argentinaTimeZone}
WHERE id = ?;
`;

export const deleteBlogQuery = `DELETE FROM blogs WHERE id = ?;`;

// limited
export const blogFieldsPlusAuthor_q = ` 
SELECT 
  blogs.*,
  users.id AS author_id,
  users.name AS author_name,
  users.username AS author_username,
  users.avatar AS author_avatar
FROM 
  blogs
LEFT JOIN 
  users ON users.id = blogs.author_id
LIMIT ?,?
`;

// get 1
export const getCourseFromIdQuery = `SELECT 
blogs.*,
users.name AS author_name,
users.username AS author_username,
users.avatar AS author_avatar
FROM 
blogs
LEFT JOIN 
users ON users.id = courses.author_id
WHERE
blogs.id = ?`;
export const getBlogFromSlugQuery = `SELECT * FROM blogs WHERE slug = ?`;
export const getBlogFromIdQuery = `SELECT * FROM blogs WHERE id = ?`;

export const getCourseListQuery = `SELECT * FROM blogs LIMIT ?, ?`;
export const getCourseListNoPagination_q = `SELECT * FROM blogs`;

export const getBlogAuthorQuery = `
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

export const fetchAllBlogs = `SELECT * FROM blogs`;
