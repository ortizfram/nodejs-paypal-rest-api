//src/controllers/courses.controller.js
import slugify from "slugify";
import { pool } from "../db.js";
import {
  createCourseQuery,
  createCourseTableQuery,
  getCourseFromSlugQuery,
  getCourseListQuery,
  getUserEnrolledCoursesQuery,
  tableCheckQuery,
} from "../../db/queries/course.queries.js";

const getCourseCreate = async (req, res) => {
  res.render("courseCreate");
};

const postCourseCreate = async (req, res) => {
  try {
    // Check if the table exists
    const [tableCheck] = await pool.query(tableCheckQuery, "courses");

    if (tableCheck.length === 0) {
      // Table doesn't exist, create it
      const [createTableResult] = await pool.query(createCourseTableQuery);
      console.log("course table created: ", createTableResult);
    } else {
      console.log("Course table already exists.");
    }

    const {
      title,
      slug,
      description,
      price,
      discount,
      active,
      thumbnail,
      length,
    } = req.body;

    // Set courseSlug as the provided slug, if any
    let courseSlug = slug;

    // If no slug is provided, generate it from the name
    if (!courseSlug) {
      courseSlug = slugify(title, { lower: true, strict: true }); // Generate the slug from the name
    }

    // Get the file path of the uploaded thumbnail
    const thumbnailPath = req.file ? req.file.path : "";

    // Create an object with column names and values
    const courseData = [
      title,
      courseSlug,
      description,
      price,
      discount,
      active === "true" ? true : false, // Convert 'true' string to boolean,
      thumbnailPath,
      length,
    ];

    // Insert the new course using the SQL query
    await pool.query(createCourseQuery, courseData);

    console.log("Creating course...");

    // Redirect after creating the course
    res.status(201).redirect("/api/courses");
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
      // If the error is due to the unique constraint on the slug field
      const errorMessage = "Slug must be unique";
      res.render("courseCreate", { errorMessage });
    } else {
      // If the error is due to other reasons
      res
        .status(500)
        .json({ message: "Error creating the course", error: error.message });
    }
  }
};

const coursesList = async (req, res) => {
  console.log("\n*** coursesList\n");
  try {
    const message = req.query.message;
    const [rows] = await pool.query(getCourseListQuery);

    // Map from query courses fields for each course
    const courses = rows.map((course) => {
      return {
        title: course.title,
        slug: course.slug,
        description: course.description,
        price: course.price,
        thumbnail: course.thumbnail,
      };
    });

    const user = req.session.user || null;

    // If user is logged in, render all courses
    if (user) {
      res.render("courses", { courses, user, message });
    } else {
      // If not logged in, render all courses
      res.render("courses", { courses, user: null, message });
    }
  } catch (error) {
    console.log("Error fetching courses:", error);
    res.redirect("/api/courses?message=Error fetching courses");
  }
};

const coursesListOwned = async (req, res) => {
  console.log("\n*** courseListOwned\n");
  // ♦ Same as coursesList view but with my owned courses,

  try {
    const message = req.query.message;
    const [rows] = await pool.query(getCourseListQuery);

    // map courses fileds and return
    const courses = rows.map((course) => {
      return {
        title: course.title,
        slug: course.slug,
        description: course.description,
        price: course.price,
        thumbnail: course.thumbnail,
      };
    });

    const user = req.session.user || null;

    //map user enrolled courses
    if (user) {
      const enrolledCourses = user.enrolledCourses || [];
      const enrolledCourseIds = enrolledCourses.map((courseId) =>
        courseId.toString()
      );

      // filter courses not enrolled
      const availableCourses = courses.filter((course) =>
        enrolledCourseIds.includes(course._id.toString())
      );

      // if logged in, render available courses
      res.render("courses", { courses: availableCourses, user, message });
    } else {
      // if not, render all courses
      res.render("courses", { courses, user: null, message });
    }
  } catch (error) {
    console.log("Error fetching courses:", error);
    res.redirect("/api/courses?message=Error fetching courses");
  }
};

const courseOverview = async (req, res) => {
  console.log("\n*** courseOverview\n");
  // ♦ View to have a quick look of the course before buying it,

  try {
    const user = req.session.user; // Retrieve the user from the session
    const message = req.query.message; // Retrieve success message from query params authcontroller
    const courseSlug = req.params.slug;

    // Fetch the course using the query
    const [rows] = await pool.query(getCourseFromSlugQuery, courseSlug);

    // Check if the course exists
    const course = rows[0];
    if (!course) {
      return res.status(404).send("Course not found");
    }

    // Check if the user is logged in and has enrolledCourses before proceeding
    if (user && user.enrolledCourses) {
      const isEnrolled = user.enrolledCourses.includes(course.id.toString());

      if (isEnrolled) {
        return res.redirect(`/course/${courseSlug}/modules`);
      }
    }

    // Structure the course data to pass to the view
    const courseData = {
      title: course.title,
      slug: course.slug,
      description: course.description,
      price: course.price,
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
  // Fetch the course slug from the request
  const courseSlug = req.params.slug;

  if (!req.session.user) {
    // Store the course slug in the query parameters to redirect after login
    return res.redirect(`/api/login?redirect=/course/${courseSlug}/enroll`);
  }

  try {
    const [rows] = await pool.query(getCourseFromSlugQuery, courseSlug);
    const course = rows[0];

    if (course) {
      const courseData = {
        title: course.title,
        slug: course.slug,
        description: course.description,
        price: course.price,
        discount: course.discount,
        active: course.active,
        thumbnail: course.thumbnail,
        length: course.length,
      };

      res.render("courseEnroll", { course: courseData }); // Pass the courseData object
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
  const courseSlug = req.params.slug;
  const user = req.session.user || null; // Get the user from the session or set to null if not logged in
  const message = req.query.message; // Retrieve success message from query params authcontroller

  try {
    console.log("\nCourse Slug:", courseSlug);
    const [courseRows] = await pool.query(getCourseFromSlugQuery, courseSlug);
    const course = courseRows[0];
    console.log("\nFetched course:", course);

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

    res.render("courseDetail", { course, message, user, enrolledCourses });
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
};
