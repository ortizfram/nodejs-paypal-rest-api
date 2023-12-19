//src/controllers/courses.controller.js
import slugify from "slugify";
import { pool } from "../db.js";
import path from "path";
import {
  createCourseQuery,
  createCourseTableQuery,
  deleteCourseQuery,
  deleteUserCourseQuery,
  getCourseFromIdQuery,
  getCourseFromSlugQuery,
  getCourseListNoPagination_q,
  getCourseListQuery,
  getUserEnrolledCoursesQuery,
  tableCheckQuery,
  updateCourseQuery,
} from "../../db/queries/course.queries.js";
import { __dirname } from "../apps.js";
import { fetchUserByField } from "../../db/queries/auth.queries.js";

//COURSE CREATE/UPDATE/DELETE
// ===========================================================
const getCourseCreate = async (req, res) => {
  console.log("\n\n*** getCourseCreate\n\n");

  const message = req.query.message;
  const user = req.session.user || null;
  const userId = user.id || null;
  res.render(`courseCreate/courseCreate`, { message, user });
};

const postCourseCreate = async (req, res) => {
  console.log("\n\n*** PostCourseCreate\n\n");

  try {
    // Declare
    let thumbnail;
    let relativePath;
    let courseSlug;
    let filename;
    let uniqueFilename;
    let timestamp;
    let slug;
    let authorId = req.session.user.id;

    // file upload check
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send("No files were uploaded");
    }

    // req thumbnail
    thumbnail = req.files ? req.files.thumbnail : "";
    timestamp = Date.now();
    filename = thumbnail.name;
    uniqueFilename = encodeURIComponent(`${timestamp}_${filename}`);
    relativePath = "/uploads/" + uniqueFilename;

    // msgs
    console.log(" ");
    console.log("thumbnail :", thumbnail);
    console.log(" ");
    console.log("relativePath :", relativePath);

    // Use mv() to place file on the server
    thumbnail
      .mv(path.join(__dirname, "uploads", uniqueFilename))
      .then(() => {
        console.log(" ");
        console.log(" ");
        console.log("File uploaded!");

        // table check
        return pool.query(tableCheckQuery, "courses");
      })
      .then(([tableCheck]) => {
        if (tableCheck.length === 0) {
          // Table doesn't exist, create it
          console.log(" ");
          console.log(" ");
          console.log("course table created");
          return pool.query(createCourseTableQuery);
        } else {
          console.log(" ");
          console.log(" ");
          console.log("Course table already exists.");
          return Promise.resolve(); // Resolve promise to continue the chain
        }
      })
      .then(async () => {
        // req fields
        let {
          title,
          description,
          text_content,
          video_link,
          ars_price,
          usd_price,
          discount,
          active,
          length,
        } = req.body;

        // Parse String 'title'
        if (typeof title !== "string") {
          title = String(title);
        }

        // assign
        courseSlug = slugify(title, { lower: true, strict: true });

        // !if discount: null
        const discountValue = discount !== "" ? discount : null;

        // Get current timestamp like (DD-MM-YYY HH:MM:SS)
        const currentDate = new Date();
        const currentTimestamp =
          currentDate.getDate().toString().padStart(2, "0") +
          "-" +
          (currentDate.getMonth() + 1).toString().padStart(2, "0") +
          "-" +
          currentDate.getFullYear().toString() +
          " " +
          currentDate.getHours().toString().padStart(2, "0") +
          ":" +
          currentDate.getMinutes().toString().padStart(2, "0") +
          ":" +
          currentDate.getSeconds().toString().padStart(2, "0");


        // make authorId the fetched userId from DB
        const [authorRow] = await pool.query(fetchUserByField("id"), authorId);//comes from session.user.id
        const existingUserId = authorRow[0]["id"];

        // Create an object with column names and values
        const courseData = [
          title,
          courseSlug,
          description,
          text_content,
          video_link,
          ars_price,
          usd_price,
          discountValue,
          active === "true" ? true : false,
          relativePath, //this is thumbnail
          length,
          currentTimestamp, // 'created_at'
          currentTimestamp, // 'updated_at'
          existingUserId, // 'author_id'
        ];
        console.log("\n\ncourseData: ", courseData);

        // Create the new course using the SQL query
        const [courseRow] = await pool.query(createCourseQuery, courseData);
      })
      .then(async () => {
        // Fetch the created course
        const [fetchedCourse] = await pool.query(
          getCourseFromSlugQuery,
          courseSlug
        );
        const course = fetchedCourse[0];
        const courseId = course.id;

        console.log("\n\n◘ Creating course...");
        console.log("\n\ncourse :", course);

        // Redirect after creating the course
        res.redirect(`/api/course/${courseId}`);
      })
      .catch((error) => {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
          // If the error is due to the unique constraint on the slug field
          const errorMessage = "Slug must be unique";
          return res.render("courseCreate/courseCreate", { errorMessage });
        }

        // If the error is due to other reasons
        return res
          .status(500)
          .json({ message: "Error creating the course", error: error.message });
      });
  } catch (error) {
    return res.status(500).send(error);
  }
};

const getCourseUpdate = async (req, res) => {
  console.log(`\n\n*** getCourseUpdate\n\n`);

  const message = req.query.message;
  const user = req.session.user || null;
  const courseId = req.params.id;

  try {
    console.log("\nCourse Id:", courseId);
    const [courseRows] = await pool.query(getCourseFromIdQuery, courseId);
    const course = courseRows[0];
    console.log("\n---Fetched course:", course);

    if (!course) {
      return res.status(404).send("Course not found");
    }

    res.render("courseUpdate/courseUpdate", { course, message, user });
  } catch (error) {
    console.error("Error fetching the course:", error);
    res.status(500).send("Error fetching the course");
  }
};

const postCourseUpdate = async (req, res) => {
  console.log("\n\n*** PostCourseUpdate\n\n");

  // get courseId
  let courseId = req.params.id; // Assuming the ID is coming from the request body
  const [courseRows] = await pool.query(getCourseFromIdQuery, [courseId]);
  const course = courseRows[0];
  courseId = course.id;
  console.log(`\n--- courseId: ${courseId}\n`);

  // Declare
  let courseSlug;
  let thumbnailPath;
  let thumbnail;
  let discountValue;

  // file upload check
  if (!req.files || Object.keys(req.files).length === 0) {
    const message = `(ERROR): no Thumbnail was uploaded, try again uploading a file.`;
    return res.redirect(
      `/api/course/${courseId}/update?courseId=${courseId}&message=${message}`
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
    const {
      title,
      description,
      text_content,
      video_link,
      ars_price,
      usd_price,
      discount,
      active,
      length,
    } = req.body;

    // Autogenerate slug from title
    if (typeof title === "string" && title.trim() !== "") {
      courseSlug = slugify(title, { lower: true, strict: true });
    }

    // !if discount : null
    discountValue = discount !== "" ? discount : null;

    // Get current timestamp in the format 'YYYY-MM-DD HH:MM:SS'
    const currentTimestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    const updateParams = [
      title,
      courseSlug,
      description,
      text_content,
      video_link,
      ars_price,
      usd_price,
      discountValue,
      active === "true" ? true : false,
      thumbnailPath,
      length,
      courseId, // where course.id
    ];

    // msg
    console.log("\n\n---Update Parameters:", updateParams); // Log the update parameters

    // query
    const result = await pool.query(updateCourseQuery, updateParams);

    //msg of query & result of query
    console.log("\n\n---Update Query:", updateCourseQuery);
    console.log("\n\n---Query Result:", result); // Log the result of the query execution

    // update check msg
    if (result && result[0].affectedRows !== undefined) {
      //show if affected rows
      const affectedRows = parseInt(result[0].affectedRows);
      console.log("\n\n---Affected Rows:", affectedRows);

      const user = req.session.user || null;

      if (affectedRows > 0) {
        const message = "course updated correctly";
        console.log(`\n\n\→ Go to courseModules: ${message}`);
        res.redirect(
          `/api/course/${courseId}`
          // `/api/course/${courseId}/module/update?courseId=${courseId}`
        );
      } else {
        const message = "no changes made to course";
        console.log(`\n\n\→ Go to courseModules: ${message}`);
        res.status(201).redirect(
          `/api/course/${courseId}`
          // `/api/course/${courseId}/module/update?courseId=${courseId}`
        );
      }
    }
  } catch (error) {
    console.error("Error updating course:", error);
    console.error("Database Error:", error.sqlMessage); // Log the database error message
    res.status(500).json({ message: "Error updating the course" });
  }
};

const getCourseDelete = async (req, res) => {
  console.log("\n\n*** getCourseDelete\n\n");
  const user = req.session.user || null;
  const message = req.query.message;
  try {
    // course from id
    const courseId = req.query.courseId;
    const [courseRows] = await pool.query(getCourseFromIdQuery, [courseId]);
    const course = courseRows[0];

    //msg
    console.log(`\n\ncourse: ${course.title}\n\n`);

    // render template
    res.render("courseDelete/courseDeleteConfirmation", {
      user,
      message,
      course,
    });
  } catch (error) {
    console.log("Error fetching course for deletion:", error);
    res.redirect(`/api/courses/`);
  }
};

const postCourseDelete = async (req, res) => {
  // Deletes course from Id of tables: courses user_courses
  console.log("\n\n*** postCourseDelete\n\n");

  try {
    // get course
    let courseId = req.body.courseId;
    const [courseRows] = await pool.query(getCourseFromIdQuery, [courseId]);
    const course = courseRows[0];
    courseId = course.id;

    //msg
    console.log(`\n\n${course.title}\n\n`);

    // Perform deletion query
    await pool.query(deleteUserCourseQuery, [courseId]);
    await pool.query(deleteCourseQuery, [courseId]);

    //msgs
    const message = `course deleted successfully`;
    console.log(`\n\n${message}`);

    // Redirect after successful deletion
    res.redirect(`/api/courses?message=${message}`);
  } catch (error) {
    const message = `Error deleting course: ${error}`;
    console.log(`\n\n${message}`);
    res.redirect(`/api/courses?message=${message}`);
  }
};

// --- COURSE LIST , ENROLL, & DETAILS
// ===========================================================

const coursesList = async (req, res) => {
  console.log("\n*** coursesList\n");

  try {
    const message = req.query.message;
    const user = req.session.user || null;
    const isAdmin = user && user.role === "admin";

    let enrolledCourseIds = [];
    if (user) {
      const [enrolledCoursesRows] = await pool.query(
        getUserEnrolledCoursesQuery,
        [user.id]
      );
      enrolledCourseIds = enrolledCoursesRows.map((enrolledCourse) =>
        enrolledCourse.course_id.toString()
      );
    }

    // Fetch all courses from the database without pagination
    let [coursesRows] = await pool.query(getCourseListNoPagination_q);

    // Fetch author details, and other fields for each course
    const coursePromises = coursesRows.map(async (course) => {
      const [authorRow] = await pool.query(fetchUserByField('id'), course.author_id);
      const author = authorRow[0]; // Assuming the author details are returned in the first row
      
      return {
        title: course.title,
        slug: course.slug,
        description: course.description,
        ars_price: course.ars_price,
        usd_price: course.usd_price,
        thumbnail: course.thumbnail,
        id: course.id.toString(),
        thumbnailPath: `/uploads/${course.thumbnail}`,
        created_at: new Date(course.created_at).toLocaleString(),
        updated_at: new Date(course.updated_at).toLocaleString(),
        author: {
          name: author.name,
          username: author.username,
          avatar: author.avatar,
        },
      };
    });

    // Resolve all promises to get the complete course details
    let courses = await Promise.all(coursePromises);

    // If the user is logged in and has enrolled courses, filter them out
    if (user && enrolledCourseIds.length > 0) {
      courses = courses.filter(
        (course) => !enrolledCourseIds.includes(course.id)
      );
    }

    const totalItems = courses.length;

    // Render all courses for the user
    res.render("courses", {
      courses,
      totalItems,
      user,
      message: user
        ? "These courses are available for today, enjoy!"
        : "All courses",
      isAdmin, // Sending isAdmin flag to the view
    });
  } catch (error) {
    console.log("Error fetching courses:", error);
    res.redirect("/api/courses?message=Error fetching courses");
  }
};

const coursesListOwned = async (req, res) => {
  console.log("\n*** courseListOwned\n");

  try {
    const user = req.session.user || null;
    const isAdmin = user && user.role === "admin";
    const message = req.query.message;

    let enrolledCourseIds = [];

    // Fetch enrolled courses for the user if logged in
    if (user) {
      const [enrolledCoursesRows] = await pool.query(
        getUserEnrolledCoursesQuery,
        [user.id]
      );
      enrolledCourseIds = enrolledCoursesRows.map((enrolledCourse) =>
        enrolledCourse.course_id.toString()
      );
    }

    // Fetch all courses from the database
    const [coursesRows] = await pool.query(getCourseListNoPagination_q);

    // Filter out courses that the user has not enrolled in
    let enrolledCourses = coursesRows.filter((course) =>
      enrolledCourseIds.includes(course.id.toString())
    );

    // Render enrolled courses for the user
    const totalItems = enrolledCourses.length;

    res.render("coursesOwned", {
      courses: enrolledCourses,
      author: enrolledCourses.author,
      totalItems,
      user,
      message: user
        ? "Your enrolled courses"
        : "You haven't enrolled in any courses yet.",
      isAdmin, // Sending isAdmin flag to the view
    });
  } catch (error) {
    console.log("Error fetching courses:", error);
    res.redirect("/api/courses-owned?message=Error fetching courses");
  }
};

const courseOverview = async (req, res) => {
  console.log("\n*** courseOverview\n");
  // ♦ View to have a quick look of the course before buying it,

  try {
    const user = req.session.user; // Retrieve the user from the session
    const message = req.query.message; // Retrieve success message from query params authcontroller
    const courseId = req.params.id;

    // Fetch the course using the query
    const [rows] = await pool.query(getCourseFromIdQuery, courseId);

    // Check if the course exists
    const course = rows[0];
    if (!course) {
      return res.status(404).send("Course not found");
    }

    // Check if the user is logged in and has enrolledCourses before proceeding
    if (user && user.enrolledCourses) {
      const isEnrolled = user.enrolledCourses.includes(course.id.toString());

      if (isEnrolled) {
        return res.redirect(`/course/${courseId}/modules`);
      }
    }

    // Structure the course data to pass to the view
    const courseData = {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      ars_price: course.ars_price,
      usd_price: course.usd_price,
      discount: course.discount,
      active: course.active,
      thumbnail: course.thumbnail,
      length: course.length,
    };

    // Render the course overview page if not enrolled
    res.render("courseOverview", { course: courseData, user, message });
  } catch (error) {
    console.error("Error fetching the course:", error);
    res.status(500).send("Error fetching the course");
  }
};

const courseEnroll = async (req, res) => {
  console.log("\n***courseEnroll\n");

  const user = req.session.user; // Retrieve the user from the session
  const message = req.query.message; // Retrieve success message from query params authcontroller
  // Fetch the course slug from the request
  const courseId = req.params.id;

  if (!req.session.user) {
    // Store the course slug in the query parameters to redirect after login
    return res.redirect(
      `/api/login?redirect=/course/${courseId}/enroll?courseId=${courseId}`
    );
  }
  const userId = req.session.user.id;

  try {
    const [rows] = await pool.query(getCourseFromIdQuery, courseId);
    const course = rows[0];

    if (course) {
      console.log("\n -- courseId", typeof course.id, course.id);
      const courseData = {
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        ars_price: course.ars_price,
        usd_price: course.usd_price,
        discount: course.discount,
        active: course.active,
        thumbnail: course.thumbnail,
        length: course.length,
      };

      res.render("courseEnroll", { course: courseData, userId, user, message }); // Pass the courseData object
    } else {
      res.status(404).send("Course not found");
    }
  } catch (error) {
    res.status(500).send("Error fetching the course");
  }
};

const courseDetail = async (req, res) => {
  console.log("\n*** courseDetail\n");
  // ♦ View that renders x bought course ,
  // ♦ it has course modules, videos and content

  // Fetch the course slug from the request
  let courseId = req.params.id;
  const user = req.session.user || null; // Get the user from the session or set to null if not logged in
  const message = req.query.message; // Retrieve success message from query params authcontroller

  try {
    console.log("\nCourseId:", courseId);
    const [courseRows] = await pool.query(getCourseFromIdQuery, courseId);
    if (!courseRows || courseRows.length === 0) {
      return res.status(404).send("Course not found");
    }

    const course = courseRows[0];
    console.log("courseId : ", course.id);
    console.log(`\n\ncourse: ${course}\n\n`);
    courseId = course.id;

    // Format the date strings for created_at and updated_at fields
    const formattedCourse = {
      ...course,
      created_at: new Date(course.created_at).toLocaleString(),
      updated_at: new Date(course.updated_at).toLocaleString(),
    };
    

    if (!course) {
      return res.status(404).send("Course not found");
    }

    // Fetch the enrolled courses for the current user
    let enrolledCourses = [];
    if (user) {
      const [enrolledRows] = await pool.query(getUserEnrolledCoursesQuery, [
        user.id,
      ]);
      enrolledCourses = enrolledRows[0]?.enrolled_courses || [];
    }

    res.render("courseDetail", {
      course: formattedCourse,
      message,
      user,
      enrolledCourses,
    });
  } catch (error) {
    console.error("Error fetching the course:", error);
    res.status(500).send("Error fetching the course");
  }
};

export default {
  coursesList,
  coursesListOwned,
  courseOverview,
  courseEnroll,
  courseDetail,
  getCourseCreate,
  postCourseCreate,
  getCourseUpdate,
  postCourseUpdate,
  getCourseDelete,
  postCourseDelete,
};
