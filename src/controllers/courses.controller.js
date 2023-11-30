//src/controllers/courses.controller.js
import slugify from "slugify";
import { pool } from "../db.js";
import path from "path";
import {
  createCourseQuery,
  createCourseTableQuery,
  getCourseFromIdQuery,
  getCourseFromSlugQuery,
  getCourseListQuery,
  getExistingModulesQuery,
  getUserEnrolledCoursesQuery,
  moduleCreateQuery,
  moduleUpdateQuery,
  modulesListQuery,
  tableCheckQuery,
  updateCourseQuery,
} from "../../db/queries/course.queries.js";
import { __dirname } from "../apps.js";

// --- COURSE CREATE/UPDATE --------------------------
const getCourseCreate = async (req, res) => {
  console.log("\n\n*** getCourseCreate\n\n");
  res.render("courseCreate/courseCreate");
};

const postCourseCreate = async (req, res) => {
  console.log("\n\n*** PostCourseCreate\n\n");

  try {
    // Declare
    let thumbnail;
    let relativePath;
    let courseSlug;
    let filename;

    // file upload check
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send("No files were uploaded");
    }

    // req thumbnail
    thumbnail = req.files ? req.files.thumbnail : "";
    filename = encodeURIComponent(thumbnail.name);
    relativePath = "./src/uploads/" + filename;
    // msgs
    console.log(" ");
    console.log("thumbnail :", thumbnail);
    console.log(" ");
    console.log("relativePath :", relativePath);

    // Use mv() to place file on the server
    thumbnail.mv(path.join(__dirname, "src", "uploads", filename))
      .then(() => {
        console.log("File uploaded!");

        // table check
        return pool.query(tableCheckQuery, "courses");
      })
      .then(([tableCheck]) => {
        if (tableCheck.length === 0) {
          // Table doesn't exist, create it
          return pool.query(createCourseTableQuery);
        } else {
          console.log("Course table already exists.");
          return Promise.resolve(); // Resolve promise to continue the chain
        }
      })
      .then(([createTableResult]) => {
        if (createTableResult) {
          console.log("course table created: ", createTableResult);
        }

        // req fields
        let {
          title,
          slug,
          description,
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
        courseSlug = slug || slugify(title, { lower: true, strict: true });

        // !if discount: null
        const discountValue = discount !== "" ? discount : null;

        // Create an object with column names and values
        const courseData = [
          title,
          courseSlug,
          description,
          ars_price,
          usd_price,
          discountValue,
          active === "true" ? true : false,
          relativePath, //this is thumbnail
          length,
        ];

        // Create the new course using the SQL query
        return pool.query(createCourseQuery, courseData);
      })
      .then(() => {
        // get the course
        return pool.query(getCourseFromSlugQuery, courseSlug);
      })
      .then(([courseRows]) => {
        const course = courseRows[0];
        const courseId = course.id;

        console.log("\n◘ Creating course...");
        console.log("course :", course);

        // Redirect after creating the course
        res.redirect(`/api/course/${courseId}/module/create?courseId=${courseId}`);
      })
      .catch((error) => {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
          // If the error is due to the unique constraint on the slug field
          const errorMessage = "Slug must be unique";
          return res.render("courseCreate/courseCreate", { errorMessage });
        }

        // If the error is due to other reasons
        return res.status(500).json({ message: "Error creating the course", error: error.message });
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
        console.log(`\n\n\→ Go to courseModuleUpdate: ${message}`);
        res.redirect(
          `/api/course/${courseId}/module/update?courseId=${courseId}`
        );
      } else {
        const message = "no changes made to course";
        console.log(`\n\n\→ Go to courseModuleUpdate: ${message}`);
        res
          .status(201)
          .redirect(
            `/api/course/${courseId}/module/update?courseId=${courseId}`
          );
      }
    }
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ message: "Error updating the course" });
  }
};
// --- MODULE CREATE/UPDATE --------------------------
const getModuleCreate = async (req, res) => {
  console.log("\n\n*** getModuleCreate\n\n");
  try {
    const courseId = parseInt(req.query.courseId);
    const [courseRows] = await pool.query(getCourseFromIdQuery, [courseId]);
    const course = courseRows[0];
    const user = req.session.user || null;

    // Fetch existing modules for the course
    const [moduleRows] = await pool.query(modulesListQuery, courseId);
    const modules = moduleRows || [];

    res.render("courseCreate/courseModules", {
      course,
      modules,
      courseId,
      user,
    });
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

    // Fetch course with req id
    const [courseRows] = await pool.query(getCourseFromIdQuery, [
      requestedCourseId,
    ]);
    const course = courseRows[0];
    console.log("\n--- Course:", course); // Log the course object to check if it's defined

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const courseId = course.id;
    console.log("Course ID:", courseId); // Log the course ID

    // Get data from form - handle multiple modules
    const { title, description, video_link } = req.body;
    const thumbnails = req.files
      ? Array.isArray(req.file.fieldname)
        ? req.files.fieldname
        : [req.files.fieldname]
      : [];

    // If there are multiple titles, descriptions, and video links sent as arrays
    if (
      Array.isArray(title) &&
      Array.isArray(description) &&
      Array.isArray(video_link) &&
      title.length === description.length &&
      description.length === video_link.length
    ) {
      for (let i = 0; i < title.length; i++) {
        const thumbnailPath = thumbnails[i] ? thumbnails[i].path : null; // Get the path of the i-th thumbnail or set to null if it doesn't exist
        const moduleData = [
          courseId,
          title[i],
          description[i],
          video_link[i],
          thumbnailPath,
        ];

        // Execute the query to create a module with title, description, video link, and thumbnail
        await pool.query(moduleCreateQuery, moduleData);
        console.log(
          "\n\n--- Module created in DB:",
          i + 1,
          title[i],
          thumbnailPath
        );
      }
    } else {
      // If only a single module is being added
      const thumbnailPath = thumbnails[0] ? thumbnails[0].path : null; // Get the path of the first thumbnail or set to null if it doesn't exist
      const moduleData = [
        courseId,
        title,
        description,
        video_link,
        thumbnailPath,
      ];

      // Execute the query to create a module with title, description, video link, and thumbnail
      await pool.query(moduleCreateQuery, moduleData);
      console.log("\n--- Module created", title, thumbnailPath);
    }

    // Redirect to video creation of modules
    res.status(201).redirect(`/api/course/${courseId}/modules`);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating module", error: error.message });
  }
};

const getModuleUpdate = async (req, res) => {
  console.log("\n\n*** getModuleUpdate\n\n");

  let courseId = parseInt(req.query.courseId);
  const [courseRows] = await pool.query(getCourseFromIdQuery, [courseId]);
  const course = courseRows[0];
  courseId = course.id;
  const user = req.session.user || null;
  const message = req.query.message;

  // Fetch existing modules associated with the course
  const [existingModulesRows] = await pool.query(getExistingModulesQuery, [
    courseId,
  ]);
  const existingModules = existingModulesRows || [];

  res.render("courseUpdate/courseModuleUpdate", {
    course,
    courseId,
    user,
    message,
    existingModules,
  });
};

const postModuleUpdate = async (req, res) => {
  console.log("\n\n*** PostModuleUpdate\n\n");
  try {
    const requestedCourseId = req.body.courseId;

    // Fetch course with req id
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
    const { title, description, video_link, moduleId } = req.body;

    // If arrays are provided for multiple modules
    if (
      Array.isArray(title) &&
      Array.isArray(description) &&
      Array.isArray(video_link) &&
      Array.isArray(moduleId) &&
      title.length === description.length &&
      description.length === video_link.length &&
      video_link.length === moduleId.length
    ) {
      for (let i = 0; i < title.length; i++) {
        const moduleData = [
          title[i],
          description[i],
          video_link[i],
          moduleId[i],
        ];

        // Check if module exists based on moduleId for updates
        const [moduleUpdateRows] = await pool.query(
          moduleUpdateQuery,
          moduleData
        );
        const affectedRows = moduleUpdateRows.affectedRows;

        if (affectedRows > 0) {
          console.log(`\n--- Module updated in DB: ${moduleId[i]}`);
        } else {
          // If no rows were affected, create module
          const [moduleCreateRows] = await pool.query(
            moduleCreateQuery,
            moduleData
          );
          console.log(`\n--- Module ${i + 1} created in DB`);
        }
      }
    } else {
      // Single module creation
      const moduleData = [title, description, video_link, courseId];
      await pool.query(moduleUpdateQuery, moduleData);
      console.log("\n--- Module Updated in DB");
    }

    // Fetch existing modules associated with the course
    const [existingModulesRows] = await pool.query(getExistingModulesQuery, [
      courseId,
    ]);
    const existingModules = existingModulesRows || [];

    // Redirect to video creation of modules
    res
      .status(201)
      .redirect(`/api/course/${courseId}/modules?courseId=${courseId}`);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating module", error: error.message });
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
        thumbnailPath: `/uploads/${course.thumbnail}`, // Construct the thumbnail path
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

      // If user enrolled in some course
      if (availableCourses.length > 0) {
        // Render available courses for the user
        res.render("courses", { courses: availableCourses, user, message });
      } else {
        // If enrolled = none, []
        res.render("courses", {
          courses: [],
          user,
          message: "You haven't enrolled in any courses yet.",
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
  postModuleUpdate,
  getModuleUpdate,
  getModuleCreate,
  postModuleCreate,
};
