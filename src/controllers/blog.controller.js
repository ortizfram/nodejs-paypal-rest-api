import {
  createBlogQuery,
  createBlogTable,
  fetchAllBlogs,
  getBlogFromIdQuery,
  getBlogFromSlugQuery,
} from "../../db/queries/blog.queries.js";
import slugify from "slugify";
import { pool } from "../db.js";
import path from "path";
import { __dirname } from "../apps.js";
import { tableCheckQuery } from "../../db/queries/course.queries.js";
import createTableIfNotExists from "../public/js/createTable.js";

const getblogCreate = async (req, res, next) => {
  console.log("\n\n*** getblogCreate\n\n");
  const message = req.query.message;
  const user = req.session.user || null;
  //   const userId = user.id || null;
  const userId = null;
  const errorMessage = "";

  res.render(`blog/blogCreate`, { user, userId, message, errorMessage });
};
const postblogCreate = async (req, res, next) => {
  console.log("\n\n*** postblogCreate\n\n");
  const message = req.query.message;
  const user = req.session.user || null;
  // const userId = user.id || null;
  const userId = null;

  try {
    // Ensure user ID exists in the session
    if (!req.session || !req.session.user || !req.session.user.id) {
      return res
        .status(401)
        .json({ message: "User ID not found in the session" });
    }

    const authorId = req.session.user.id;

    // File upload check
    if (!req.files || !req.files.thumbnail) {
      return res.status(400).send("No thumbnail file uploaded");
    }

    // Extract necessary data from request body
    let { title, description, text_content } = req.body;

    // Ensure title is a string
    if (typeof title !== "string") {
      title = String(title);
    }

    // Generate blog slug
    const blogSlug = slugify(title, { lower: true, strict: true });

    // Generate unique filename for the thumbnail
    const timestamp = Date.now();
    const filename = req.files.thumbnail.name;
    const uniqueFilename = encodeURIComponent(`${timestamp}_${filename}`);
    const relativePath = "/uploads/" + uniqueFilename;

    // Move uploaded thumbnail to the server
    req.files.thumbnail.mv(
      path.join(__dirname, "uploads", uniqueFilename),
      async (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error uploading the file");
        }

        try {
          // Get current timestamp
          const currentDate = new Date();
          const currentTimestamp = `${currentDate
            .getDate()
            .toString()
            .padStart(2, "0")}-${(currentDate.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${currentDate
            .getFullYear()
            .toString()} ${currentDate
            .getHours()
            .toString()
            .padStart(2, "0")}:${currentDate
            .getMinutes()
            .toString()
            .padStart(2, "0")}:${currentDate
            .getSeconds()
            .toString()
            .padStart(2, "0")}`;

          // Prepare blog data
          const blogData = [
            title,
            blogSlug,
            description,
            text_content,
            relativePath,
            authorId,
          ];

          console.log("\n\nblogData: ", blogData);

          // Create blogs table
          const checkTable_blogs = createTableIfNotExists(
            pool,
            tableCheckQuery,
            createBlogTable,
            "blogs"
          );

          // Create the new blog using the SQL query
          const [blogRow] = await pool.query(createBlogQuery, blogData);

          // Fetch the created blog & JOIN with user as author
          const [fetchedBlog] = await pool.query(
            getBlogFromSlugQuery,
            blogSlug
          );
          const blog = fetchedBlog[0];
          const blogId = blog.id;

          console.log("\n\n◘ Creating blog...");
          console.log("\n\nblog :", blog);

          // Redirect after creating the blog
          res.redirect(`/api/blog/${blogId}`);
        } catch (error) {
          console.error("Error creating the blog:", error);
          if (error.code === "ER_DUP_ENTRY") {
            // Duplicate entry error for blog slug
            const errorMessage =
              "This blog title already exists. Please choose a different title.";
            // Send the error message along with redirect
            return res.redirect(
              `/api/blog/create?message=${encodeURIComponent(errorMessage)}`
            );
          } else {
            // Other errors
            return res
              .status(500)
              .json({
                message: "Error creating the blog",
                error: error.message,
              });
          }
        }
      }
    );
  } catch (error) {
    console.error("General error:", error);
    if (error.code === "ER_DUP_ENTRY") {
      // Duplicate entry error for blog slug
      const errorMessage =
        "This blog title already exists. Please choose a different title.";
      return res.render("blog/blogCreate", { errorMessage, user, userId });
    } else {
      // Other errors
      return res
        .status(500)
        .json({ message: "Error creating the blog", error: error.message });
    }
  }
};

const getBlogDetail = async (req, res, next) => {
  console.log("\n\n*** getBlogDetail\n\n");
  try {
    const message = req.query.message;
    const user = req.session.user || null;
    // const userId = user.id || null;
    const userId = null;
    const blogId = req.params.id;

    const [blogRows] = await pool.query(getBlogFromIdQuery, blogId);
    const blog = blogRows[0];

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Render the blog details as JSON
    res.json(blog);
  } catch (error) {
    console.error("Error fetching blog details:", error);
    res
      .status(500)
      .json({ message: "Error fetching blog details", error: error.message });
  }
};

const getblogList = async (req, res, next) => {
  console.log("\n\n*** getblogList\n\n");
  const message = req.query.message;
  const user = req.session.user || null;
  //   const userId = user.id || null;
  const userId = null;

  const [blogRows] = await pool.query(fetchAllBlogs);
  const blogs = blogRows[0];

  // res.render(`blog/blogList`, { message, user, userId, blogs });
  res.json(blogs);
};

export default {
  getblogList,
  getblogCreate,
  postblogCreate,
  getBlogDetail,
};
