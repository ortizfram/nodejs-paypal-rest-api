//src/controllers/courses.controller.js
import slugify from "slugify";
import { pool } from "../db.js";
import {
  createCourseQuery,
  createCourseTableQuery,
  createTableModuleQuery,
  createVideoQuery,
  createVideosTableQuery,
  getCourseFromIdQuery,
  getCourseFromSlugQuery,
  getCourseListQuery,
  getUserEnrolledCoursesQuery,
  listCourseVideosQuery,
  moduleCreateQuery,
  modulesListQuery,
  tableCheckQuery,
  updateCourseQuery,
} from "../../db/queries/course.queries.js";
// --- COURSE CREATE --------------------------
const getCourseCreate = async (req, res) => {
  console.log("\n\n*** getCourseCreate\n\n");
  res.render("courseCreate/courseCreate");
};

const postCourseCreate = async (req, res) => {
  console.log("\n\n*** PostCourseCreate\n\n");
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
      ars_price,
      usd_price,
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

    // Convert empty string to NULL for discount
    const discountValue = discount !== "" ? discount : null;

    // Get the file path of the uploaded thumbnail
    const thumbnailPath = req.file ? req.file.path : "";

    // Create an object with column names and values
    const courseData = [
      title,
      courseSlug,
      description,
      ars_price,
      usd_price,
      discountValue,
      active === "true" ? true : false,
      thumbnailPath,
      length,
    ];

    // Create the new course using the SQL query
    await pool.query(createCourseQuery, courseData);
    // get the course
    const [courseRows] = await pool.query(getCourseFromSlugQuery, courseSlug);
    const course = courseRows[0];
    const courseId = course.id;

    console.log("\n◘ Creating course...");

    // Check if the table exists
    const [tableCheck2] = await pool.query(tableCheckQuery, "videos");

    if (tableCheck2.length === 0) {
      // Table doesn't exist, create it
      const [createTableResult] = await pool.query(createVideosTableQuery);
      console.log("\n◘ course video table created: ", createTableResult);
    } else {
      console.log("\n---Course video table already exists.");
    }

    // Redirect after creating the course
    res
      .status(201)
      .redirect(`/api/course/${courseId}/module/create?courseId=${courseId}`);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
      // If the error is due to the unique constraint on the slug field
      const errorMessage = "Slug must be unique";
      res.render("courseCreate/courseCreate", { errorMessage });
    } else {
      // If the error is due to other reasons
      res
        .status(500)
        .json({ message: "Error creating the course", error: error.message });
    }
  }
};
// --- MODULE CREATE --------------------------
const getModuleCreate = async (req, res) => {
  console.log("\n\n*** getVideoCreate\n\n");
  try {
    const courseId = parseInt(req.query.courseId);
    const [courseRows] = await pool.query(getCourseFromIdQuery, [courseId]);
    const course = courseRows[0];

    res.render("courseCreate/courseModules", { course, courseId });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching course data for module creation",
      error: error.message,
    });
  }
};

const postModuleCreate = async (req, res) => {
  console.log("\n\n*** PostModuleCreate\n\n");
  try {
    const requestedCourseId = req.body.courseId;

    // fetch course with req id
    const [courseRows] = await pool.query(getCourseFromIdQuery, [
      requestedCourseId,
    ]);

    const course = courseRows[0];
    console.log("\n---Course:", course); // Log the course object to check if it's defined

    let courseId; // Define courseId variable

    if (course) {
      courseId = course.id;
      console.log("Course ID:", courseId); // Log the course ID if it exists
    }

    // Get data from form - handle multiple modules
    const { title, description, video_link } = req.body;

    // If there are multiple titles, descriptions, and video links sent as arrays
    if (
      Array.isArray(title) &&
      Array.isArray(description) &&
      Array.isArray(video_link) &&
      title.length === description.length &&
      description.length === video_link.length
    ) {
      for (let i = 0; i < title.length; i++) {
        const moduleData = [courseId, title[i], description[i], video_link[i]];

        // Execute the query to create a module with title, description, and video link
        await pool.query(moduleCreateQuery, moduleData);
        console.log("\n--- Module created in DB:", i + 1);
      }
    } else {
      // If only a single module is being added
      const moduleData = [courseId, title, description, video_link];

      // Execute the query to create a module with title, description, and video link
      await pool.query(moduleCreateQuery, moduleData);
      console.log("\n--- Module created");
    }

    // Redirect to video creation of modules
    res
      .status(201)
      .redirect(`/api/course/${courseId}/modules`);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating module", error: error.message });
  }
};

// --- VIDEO CREATE--------------------------
const getVideoCreate = async (req, res) => {
  console.log("\n\n*** getVideoCreate\n\n");
  // Fetch necessary data for creating videos and render the video creation form
  try {
    let courseId = req.query.courseId; // Extract the course ID from the request parameters
    const [courseRows] = await pool.query(getCourseFromIdQuery, [courseId]);
    const course = courseRows[0];
    courseId = course.id;

    // Fetch modules for the selected course
    const [moduleRows] = await pool.query(modulesListQuery, [courseId]);
    const modules = moduleRows.map((module) => {
      return {
        id: module.id,
        title: module.title,
      };
    });

    res.render("courseCreate/courseVideos", { courseId, course, modules }); // Render the video creation form with necessary data
  } catch (error) {
    // Handle errors appropriately
    res.status(500).json({
      message: "Error fetching course data for video creation",
      error: error.message,
    });
  }
};

const postVideoCreate = async (req, res) => {
  console.log("\n\n*** PostVideoCreate\n\n");
  try {
    let courseId = req.body.courseId;
    const [courseRows] = await pool.query(getCourseFromIdQuery, [courseId]);
    const course = courseRows[0];
    courseId = course.id;

    const [tableCheck] = await pool.query(tableCheckQuery, "videos");

    if (tableCheck.length === 0) {
      const [createTableResult] = await pool.query(createCourseTableQuery);
      console.log("\n--- 'videos' table created: ", createTableResult);
    } else {
      console.log("\n---'videos' table already exists.");
    }

    // Request data and ensure they are arrays
    let { moduleId, videoId } = req.body;
    if (!Array.isArray(moduleId)) {
      moduleId = [moduleId];
    }
    if (!Array.isArray(videoId)) {
      videoId = [videoId];
    }

    // Prepare data for insertion into the table
    for (let i = 0; i < moduleId.length; i++) {
      const createVideoData = [courseId, moduleId[i], videoId[i]];
      console.log(`\n ---requested body data:\n ${createVideoData}\n`);

      // Execute the query to insert the video into the videos table
      await pool.query(createVideoQuery, createVideoData);
    }

    // Redirect after creating the course
    res.status(201).redirect("/api/courses");
  } catch (error) {
    // Handle errors appropriately
    res
      .status(500)
      .json({ message: "Error creating video", error: error.message });
  }
};

// --- COURSE UPDATE --------------------------
const getCourseUpdate = async (req, res) => {
  console.log(`\n\n*** courseUpdate\n\n`);

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

    res.render("courseUpdate", { course, message, user });
  } catch (error) {
    console.error("Error fetching the course:", error);
    res.status(500).send("Error fetching the course");
  }
};

const postCourseUpdate = async (req, res) => {
  console.log("\n\n*** PostCourseUpdate\n\n");
  const courseId = req.params.id; // Assuming the ID is coming from the request body
  console.log(`\n--- courseId: ${courseId}\n`);

  try {
    const {
      title,
      description,
      ars_price,
      usd_price,
      discount,
      active,
      thumbnail,
      length,
    } = req.body;

    let courseSlug;

    if (typeof title === "string" && title.trim() !== "") {
      courseSlug = slugify(title, { lower: true, strict: true });
    }

    const discountValue = discount !== "" ? discount : null;
    const thumbnailPath = req.file ? req.file.path : "";

    const updateParams = [
      title,
      courseSlug,
      description,
      ars_price,
      usd_price,
      discountValue,
      active === "true" ? true : false,
      thumbnailPath,
      length,
      courseId, // where course.id
    ];

    console.log("\n\n---Update Parameters:", updateParams); // Log the update parameters

    const result = await pool.query(updateCourseQuery, updateParams);
    console.log("\n\n---Update Query:", updateCourseQuery);
    console.log("\n\n---Query Result:", result); // Log the result of the query execution

    if (result && result[0].affectedRows !== undefined) {
      const affectedRows = parseInt(result[0].affectedRows);
      console.log("\n\n---Affected Rows:", affectedRows);

      const user = req.session.user || null;

      if (affectedRows > 0) {
        const message = "course updated correctly";
        console.log(`\n\n\→ Go to courseDetail: ${message}`);
        res.redirect(`/api/course/${courseId}/modules`);
      } else {
        const message = "no changes made to course";
        console.log(`\n\n\→ Go to courseDetail: ${message}`);
        res.redirect(`/api/course/${courseId}/modules`);
      }
    }
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ message: "Error updating the course" });
  }
};

// --- COURSE LIST , ENROLL, & DETAILS --------------------------

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
        ars_price: course.ars_price,
        usd_price: course.usd_price,
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
      const [enrolledCoursesRows] = await pool.query(
        getUserEnrolledCoursesQuery,
        [user.id]
      ); //get from query
      enrolledCourseIds = enrolledCoursesRows.map((enrolledCourse) =>
        enrolledCourse.course_id.toString()
      ); // extract enrolled [str(course_id)]

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
        res.render("courses", {
          courses: [],
          user,
          message: "You haven't enrolled to any courses yet.",
        });
      }
    } else {
      // not logged in
      res.render("courses", { courses: courses, user, message });
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

    // map each field
    const courses = rows.map((course) => {
      return {
        title: course.title,
        slug: course.slug,
        description: course.description,
        ars_price: course.ars_price,
        usd_price: course.usd_price,
        thumbnail: course.thumbnail,
        id: course.id.toString(), // Ensure ID is converted to string for comparison
      };
    });

    // Filter out non-enrolled courses
    const enrolledCourses = courses.filter((course) =>
      enrolledCourseIds.includes(course.id)
    );

    // Reverse the order of enrolled courses
    enrolledCourses.reverse();

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

      res.render("courseEnroll", { course: courseData, userId }); // Pass the courseData object
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
    const course = courseRows[0];
    courseId = course.id;
    console.log("\nFetched course:", course);

    if (!course) {
      return res.status(404).send("Course not found");
    }

    // Fetch modules associated with the current course
    const [moduleRows] = await pool.query(modulesListQuery, courseId);
    const modules = moduleRows || []; // Assuming moduleRows contain the modules for the course

    // Fetch the enrolled courses for the current user
    let enrolledCourses = [];
    if (user) {
      const [enrolledRows] = await pool.query(getUserEnrolledCoursesQuery, [
        user.id,
      ]);
      enrolledCourses = enrolledRows[0]?.enrolled_courses || [];
    }

    res.render("courseDetail", {
      course,
      message,
      user,
      modules,
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
  getModuleCreate,
  postModuleCreate,
  getVideoCreate,
  postVideoCreate,
};
