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
    const [coursesRows] = await pool.query(getCourseListQuery);

    // Map from query courses fields for each course
    const courses = coursesRows.map((course) => {
      return {
        title: course.title,
        slug: course.slug,
        description: course.description,
        price: course.price,
        thumbnail: course.thumbnail,
        id: course.id.toString(), // Ensure ID is converted to string for comparison
      };
    });

    const user = req.session.user || null;

    // Fetch enrolled courses for the user
    let enrolledCourseIds = [];
    // If user is logged in, render all courses
    if (user) {
      // Fetch enrolled courses for the user to later exclude them from default Courses view
      const [enrolledCoursesRows] = await pool.query(getUserEnrolledCoursesQuery,[user.id]); //get from query
      enrolledCourseIds = enrolledCoursesRows.map((enrolledCourse) => enrolledCourse.course_id.toString()); // extract enrolled [str(course_id)]

      
      // Filter out enrolled courses from the default courses view
      const availableCourses = courses.filter(
        (course) => !enrolledCourseIds.includes(course.id)
      );

      // if user enrolled sm course
      if (availableCourses.length > 0) {
        // Render available courses for the user
        res.render("courses", { courses: availableCourses, user, message });
      } else {
        // If enrolled = none, []
        res.render("courses", { courses: [], user, message:"You haven't enrolled to any courses yet." });
      }
    } else { // not logged in
      res.render("courses", { courses: courses , user, message });
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

    // Fetch the courses that the user has already enrolled in
    const user = req.session.user || null;
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

    // Fetch all courses
    const [rows] = await pool.query(getCourseListQuery);
    const courses = rows.map((course) => {
      return {
        title: course.title,
        slug: course.slug,
        description: course.description,
        price: course.price,
        thumbnail: course.thumbnail,
        id: course.id.toString(), // Ensure ID is converted to string for comparison
      };
    });

    // Filter out non-enrolled courses
    const enrolledCourses = courses.filter((course) =>
      enrolledCourseIds.includes(course.id)
    );

    // if enrolled courses
    if (enrolledCourses.length > 0) {
      // if logged in, render available courses
      res.render("coursesOwned", { courses: enrolledCourses, user, message });
    } else {
      // if enrolled = NONE, message
      res.render("coursesOwned", {
        user,
        courses: [],
        message: "You haven't enrolled in any courses yet.",
      });
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
