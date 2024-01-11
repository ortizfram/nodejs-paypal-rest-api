import {
  blogFieldsPlusAuthor_q,
  createBlogQuery,
  createBlogTable,
  deleteBlogQuery,
  getBlogAuthorQuery,
  getBlogFromIdQuery,
  getBlogFromSlugQuery,
  updateBlogQuery,
} from "../../db/queries/blog.queries.js";
import slugify from "slugify";
import { pool } from "../db.js";
import path from "path";
import { __dirname } from "../../apps.js";
import { tableCheckQuery } from "../../db/queries/course.queries.js";
import createTableIfNotExists from "../public/js/createTable.js";
import { Marked, marked } from "marked";

const getblogCreate = async (req, res, next) => {
  console.log("\n\n*** getblogCreate\n\n");
  const message = req.query.message;
  const user = req.session.user || null;
  //   const userId = user.id || null;
  const userId = null;
  const errorMessage = "";
  const title = "Blog Create";
  const submit = "Create";
  const action = `/api/blog/create`;

  res.render(`blog/blogCreate`, {
    user,
    userId,
    message,
    errorMessage,
    title,
    submit,
    action,
  });
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
            return res.status(500).json({
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
    const blogId = req.params.id;
    const message = req.query.message;
    const user = req.session.user || null;

    const [blogRows] = await pool.query(getBlogFromIdQuery, blogId);
    const blog = blogRows[0];

    // Format course timestamps and video_link
    const formattedBlog = {
      ...blog,
      created_at: new Date(blog.created_at).toLocaleString(),
      updated_at: new Date(blog.updated_at).toLocaleString(),
    };

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Fetching author details
    const [authorRows] = await pool.query(getBlogAuthorQuery, [blog.author_id]);
    const author = authorRows[0];
    console.log(author);

    if (!author) {
      return res.status(404).send("Author details not found");
    }

    // Extend formattedBlog with author details
    formattedBlog.author = {
      name: author.author_name,
      username: author.author_username,
      avatar: author.author_avatar,
    };
    console.log(formattedBlog.author);

    // Convert Markdown to HTML using marked
    const markdownContent = blog.text_content; 
    const htmlContent = marked(markdownContent);

    // Render the blog details as JSON
    // res.json(blog);
    res.render("blog/blogDetail", {
      message,
      user,
      blogId,
      blog: formattedBlog,
      htmlContent,
    });
  } catch (error) {
    console.error("Error fetching blog details:", error);
    res
      .status(500)
      .json({ message: "Error fetching blog details", error: error.message });
  }
};

const getblogList = async (req, res, next) => {
  console.log("\n\n*** getblogList\n\n");
  try {
    const route = "blog";

    const message = req.query.message;
    const user = req.session.user || null;
    const isAdmin = user && user.role === "admin";

    const page = parseInt(req.query.page) || 1;
    let perPage = parseInt(req.query.perPage) || 1;

    // count blogs
    const [totalBlogs] = await pool.query(
      "SELECT COUNT(*) AS count FROM blogs"
    );
    const totalItems = totalBlogs[0].count;

    // fetch all blogs
    const [blogRows] = await pool.query(blogFieldsPlusAuthor_q, [
      0,
      totalItems,
    ]);

    // map blogs
    let blogs = blogRows.map((blog) => {
      return {
        title: blog.title,
        slug: blog.slug,
        description: blog.description,
        thumbnail: blog.thumbnail,
        id: blog.id.toString(),
        thumbnailPath: `/uploads/${blog.thumbnail}`,
        created_at: new Date(blog.created_at).toLocaleString(),
        updated_at: new Date(blog.updated_at).toLocaleString(),
        author: {
          name: blog.author_name,
          username: blog.author_username,
          avatar: blog.author_avatar,
        },
        next: `/api/blog/${blog.id}`, // Dynamic blog link
      };
    });

    // calculate totalItems for pagination
    const totalFilteredItems = blogs.length;
    const totalPages = Math.ceil(totalFilteredItems / perPage) || 1;

    // Adjust perPage if there are fewer items than perPage value
    if (totalFilteredItems < perPage) {
      perPage = totalFilteredItems;
    }

    const offset = (page - 1) * perPage;
    const blogsForPage = blogs.slice(offset, offset + perPage);

    // redirect to the previous page if last it's empty
    if (page === totalPages && blogsForPage.length === 0) {
      res.redirect(`/api/blog?page=${page - 1}&perPage=${perPage}`);
      return;
    }

    res.render(`blog/blogList`, {
      route,
      title: "Blogs y Noticias",
      blogs: blogsForPage,
      totalItems: totalFilteredItems,
      user,
      message,
      isAdmin,
      perPage,
      page,
      offset,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.log("Error fetching blogs:", error);
    res.redirect("/api/blog?message=Error fetching blogs");
  }
};
// --------------------

const getBlogUpdate = async (req, res) => {
  console.log(`\n\n*** getBlogUpdate\n\n`);

  const message = req.query.message;
  const user = req.session.user || null;
  const blogId = req.params.id;
  const userId = null;
  const errorMessage = "";
  const title = "Blog Update";
  const submit = "Update";
  const action = `/api/blog/${blogId}/update`;

  res.render(`blog/blogCreate`, {
    user,
    userId,
    message,
    errorMessage,
    title,
    submit,
    action,
  });
};

const postBlogUpdate = async (req, res) => {
  console.log("\n\n*** postBlogUpdate\n\n");

  // get blogId
  let blogId = req.params.id; // Assuming the ID is coming from the request body
  const [blogRows] = await pool.query(getBlogFromIdQuery, [blogId]);
  const blog = blogRows[0];
  blogId = blog.id;
  let thumbnailPath = "";
  let thumbnail = "";
  let blogSlug = "";
  console.log(`\n--- blogId: ${blogId}\n`);

  // file upload check
  if (!req.files || Object.keys(req.files).length === 0) {
    const message = `(ERROR): no Thumbnail was uploaded, try again uploading a file.`;
    return res.redirect(
      `/api/blog/${blogId}/update?blogId=${blogId}&message=${message}`
    );
  }

  // Check if thumbnail uploaded, encode, move
  if (req.files && req.files.thumbnail) {
    const timestamp = Date.now();
    const filename = req.files.thumbnail.name;
    const uniqueFilename = encodeURIComponent(`${timestamp}_${filename}`);
    thumbnailPath = "/uploads/" + uniqueFilename;

    // Assign the uploaded thumbnail file to the 'thumbnail' variable
    thumbnail = req.files.thumbnail;

    // Use mv() to place file on the server
    await thumbnail.mv(path.join(__dirname, "uploads", uniqueFilename));
  } else {
    // If no new thumbnail uploaded, retain the existing thumbnail path
    thumbnailPath = course.thumbnail; // Assuming course.thumbnail holds the existing thumbnail path
  }

  try {
    // req fields
    const { title, description, text_content } = req.body;

    // Autogenerate slug from title
    if (typeof title === "string" && title.trim() !== "") {
      blogSlug = slugify(title, { lower: true, strict: true });
    }

    // Get current timestamp in the format 'YYYY-MM-DD HH:MM:SS'
    const currentTimestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");


    const updateParams = [
      title,
      blogSlug,
      description,
      text_content,
      thumbnailPath,
      blogId, // where
    ];

    // msg
    console.log("\n\n---Update Parameters:", updateParams); // Log the update parameters

    // query
    const result = await pool.query(updateBlogQuery, updateParams);

    //msg of query & result of query
    console.log("\n\n---Update Query:", updateBlogQuery);
    console.log("\n\n---Query Result:", result); // Log the result of the query execution

    // update check msg
    if (result && result[0].affectedRows !== undefined) {
      //show if affected rows
      const affectedRows = parseInt(result[0].affectedRows);
      console.log("\n\n---Affected Rows:", affectedRows);

      const user = req.session.user || null;

      if (affectedRows > 0) {
        const message = "blog updated correctly";
        res.redirect(`/api/blog/${blogId}`);
      } else {
        const message = "no changes made to blog";
        res.status(201).redirect(`/api/blog/${blogId}`);
      }
    }
  } catch (error) {
    console.error("Error updating blog:", error);
    console.error("Database Error:", error.sqlMessage); // Log the database error message
    res.status(500).json({ message: "Error updating the blog" });
  }
};

const getBlogDelete = async (req, res) => {
  console.log("\n\n*** getBlogDelete\n\n");
  const user = req.session.user || null;
  const message = req.query.message;
  try {
    // course from id
    const blogId = req.params.id;
    const [blogRows] = await pool.query(getBlogFromIdQuery, [blogId]);
    const blog = blogRows[0];
    const action = `/api/blog/${blogId}/delete`;

    //msg
    console.log(`\n\nblog: ${blog.title}\n\n`);

    // render template
    res.render("blog/blogDeleteConfirmation", {
      user,
      message,
      blog,
      action,
    });
  } catch (error) {
    console.log("Error fetching blog for deletion:", error);
    res.redirect(`/api/blog?page=1&perPage=6`);
  }
};

const postBlogDelete = async (req, res) => {
  console.log("\n\n*** postBlogDelete\n\n");

  try {
    // get blog
    let blogId = req.params.id;
    const [blogRows] = await pool.query(getBlogFromIdQuery, [blogId]);
    const blog = blogRows[0];
    blogId = blog.id;

    //msg
    console.log(`\n\n${blog.title}\n\n`);

    // Perform deletion query
    await pool.query(deleteBlogQuery, [blogId]);

    //msgs
    const message = `blog deleted successfully`;
    console.log(`\n\n${message}`);

    // Redirect after successful deletion
    res.redirect(`/api/blog?page=1&perPage=6&message=${message}`);
  } catch (error) {
    const message = `Error deleting blog: ${error}`;
    console.log(`\n\n${message}`);
    res.redirect(`/api/blog?page=1&perPage=6&message=${message}`);
  }
};

export default {
  getblogList,
  getblogCreate,
  postblogCreate,
  getBlogDetail,
  getBlogUpdate,
  postBlogUpdate,
  getBlogDelete,
  postBlogDelete,
};
