//src/controllers/courses.controller.js
import slugify from "slugify";
import { pool } from "../db.js";
import path from "path";
import {
  courseFieldsPlusAuthor_q,
  createCourseQuery,
  createCourseTableQuery,
  deleteCourseQuery,
  deleteUserCourseQuery,
  getCourseAuthorQuery,
  getCourseFromIdQuery,
  getCourseFromSlugQuery,
  getCourseListNoPagination_q,
  getCourseListQuery,
  getUserEnrolledCoursesQuery,
  tableCheckQuery,
  updateCourseQuery,
} from "../../db/queries/course.queries.js";
import { __dirname, setCustomMimeTypes } from "../../apps.js";
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
    // Ensure user ID exists in the session
    if (!req.session || !req.session.user || !req.session.user.id) {
      return res
        .status(401)
        .json({ message: "User ID not found in the session" });
    }

    const authorId = req.session.user.id;

    // Files upload check
    if (!req.files || !req.files.thumbnail || !req.files.video) {
      return res.status(400).send("No thumbnail or video file uploaded");
    }

    // Extract necessary data from request body
    let {
      title,
      description,
      text_content,
      ars_price,
      usd_price,
      discount,
    } = req.body;

    // Ensure title is a string
    if (typeof title !== "string") {
      title = String(title);
    }

    // Generate course slug
    const courseSlug = slugify(title, { lower: true, strict: true });

    // Manage discount value
    const discountValue = discount !== "" ? discount : null;

    // Generate unique filename for thumbnail
    const timestamp = Date.now();
    const filename = req.files.thumbnail.name;
    const uniqueFilename = encodeURIComponent(`${timestamp}_${filename}`);
    const relativePath = "/uploads/" + uniqueFilename;

    // Generate unique filename for video
    const videoFile = req.files.video;
    const videoFilename = videoFile.name.split(' ')[0];
    const uniqueVideoFilename = encodeURIComponent(
      `${timestamp}_${videoFilename}`
    );
    const videoPath = "/uploads/videos/" + uniqueVideoFilename;

    // Move uploaded thumbnail to the server
    req.files.thumbnail.mv(
      path.join(__dirname, "uploads", uniqueFilename),
      async (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error uploading the file");
        }

        // video file upload handling
        videoFile.mv(
          path.join(__dirname, "uploads/videos", uniqueVideoFilename),
          async (err) => {
            if (err) {
              console.error(err);
              return res.status(500).send("Error uploading the video file");
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

              // Prepare course data
              const courseData = [
                title,
                courseSlug,
                description,
                text_content,
                ars_price,
                usd_price,
                discountValue,
                relativePath,
                videoPath,
                authorId,
              ];

              console.log("\n\ncourseData: ", courseData);

              // Create the new course using the SQL query
              const [courseRow] = await pool.query(
                createCourseQuery,
                courseData
              );

              // Fetch the created course & JOIN with user as author
              const [fetchedCourse] = await pool.query(
                getCourseFromSlugQuery,
                courseSlug
              );
              const course = fetchedCourse[0];
              const courseId = course.id;

              console.log("\n\n◘ Creating course...");
              console.log("\n\ncourse :", course);

              // Set MIME type for the uploaded video
              setCustomMimeTypes(
                {
                  path: `/uploads/videos/${uniqueVideoFilename}`,
                },
                res,
                () => {} // Empty callback as it's not required in this context
              );
              
              // Redirect after creating the course
              res.redirect(`/api/course/${courseId}`);

            } catch (error) {
              console.error("Error creating the course:", error);
              return res.status(500).json({
                message: "Error creating the course",
                error: error.message,
              });
            }
          }
        ); // Closing bracket for video file upload
      }
    );
  } catch (error) {
    console.error("General error:", error);
    res
      .status(500)
      .json({ message: "Error creating the course", error: error.message });
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

  const timestamp = Date.now();

  // Check if thumbnail uploaded, encode, move
  if (req.files && req.files.thumbnail) {
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

  // Generate unique filename for video
  const videoFile = req.files.video;
  const videoFilename = videoFile.name.split(' ')[0];
  const uniqueVideoFilename = encodeURIComponent(
    `${timestamp}_${videoFilename}`
  );
  const videoPath = "/uploads/videos/" + uniqueVideoFilename;

  // video file upload handling
  videoFile.mv(
    path.join(__dirname, "uploads/videos", uniqueVideoFilename),
    async (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error uploading the video file");
      }
    }
  );


  try {
    // req fields
    const {
      title,
      description,
      text_content,
      video,
      ars_price,
      usd_price,
      discount,
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
      videoPath,
      ars_price,
      usd_price,
      discountValue,
      thumbnailPath,
      courseId, // where course.id
    ];

    // msg
    console.log("\n\n---Update Parameters:", updateParams); // Log the update parameters

    // Execute update query
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
        
        // Set MIME type for the uploaded video
        setCustomMimeTypes(
          {
            path: `/uploads/videos/${uniqueVideoFilename}`,
          },
          res,
          () => {} // Empty callback as it's not required in this context
        );

        res.redirect(
          `/api/course/${courseId}`
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
    const action = `/api/course/${courseId}/delete`;

    //msg
    console.log(`\n\ncourse: ${course.title}\n\n`);

    // render template
    res.render("courseDelete/courseDeleteConfirmation", {
      user,
      message,
      course,
      action,
    });
  } catch (error) {
    console.log("Error fetching course for deletion:", error);
    res.redirect(`/api/courses/?page=1&perPage=6`);
  }
};

const postCourseDelete = async (req, res) => {
  console.log("\n\n*** postCourseDelete\n\n");

  try {
    // get course
    let courseId = req.params.id;
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
    res.redirect(`/api/courses?page=1&perPage=6&message=${message}`);
  } catch (error) {
    const message = `Error deleting course: ${error}`;
    console.log(`\n\n${message}`);
    res.redirect(`/api/courses?page=1&perPage=6&message=${message}`);
  }
};

// --- COURSE LIST , ENROLL, & DETAILS
// ===========================================================

const coursesList = async (req, res) => {
  console.log("\n*** coursesList\n");
  const route = "courses";

  try {
    const message = req.query.message;
    const user = req.session.user || null;
    const isAdmin = user && user.role === "admin";

    const page = parseInt(req.query.page) || 1;
    let perPage = parseInt(req.query.perPage) || 1;

    // count courses
    const [totalCourses] = await pool.query(
      "SELECT COUNT(*) AS count FROM courses"
    );
    const totalItems = totalCourses[0].count;

    // fetch all courses
    const [coursesRows] = await pool.query(courseFieldsPlusAuthor_q, [
      0,
      totalItems,
    ]);

    // map courses
    let courses = coursesRows.map((course) => {
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
          name: course.author_name,
          username: course.author_username,
          avatar: course.author_avatar,
        },
        next: `/api/course/${course.id}/`, // Dynamic course link
      };
    });

    let enrolledCourseIds = [];

    if (user) {
      const [enrolledCoursesRows] = await pool.query(
        getUserEnrolledCoursesQuery,
        [user.id]
      );
      enrolledCourseIds = enrolledCoursesRows.map((enrolledCourse) =>
        enrolledCourse.id.toString()
      );
    }

    courses = courses.filter(
      (course) => !enrolledCourseIds.includes(course.id)
    );

    const totalFilteredItems = courses.length;
    const totalPages = Math.ceil(totalFilteredItems / perPage) || 1;

    // Adjust perPage if there are fewer items than perPage value
    if (totalFilteredItems < perPage) {
      perPage = totalFilteredItems;
    }

    const offset = (page - 1) * perPage;
    const coursesForPage = courses.slice(offset, offset + perPage);

    // redirect to the previous page if last it's empty
    if (page === totalPages && coursesForPage.length === 0) {
      res.redirect(`/api/${route}?page=${page - 1}&perPage=${perPage}`);
      return;
    }

    res.render("courses", {
      route,
      title: "Cursos",
      courses: coursesForPage,
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
    console.log("Error fetching courses:", error);
    res.redirect("/api/courses?message=Error fetching courses");
  }
};

const coursesListOwned = async (req, res) => {
  console.log("\n*** courseListOwned\n");
  const route = "courses-owned";

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
        enrolledCourse.id.toString()
      );

      // If the user has not enrolled in any courses, redirect to '/api/courses'
      if (enrolledCourseIds.length === 0) {
        res.redirect('/api/courses?page=1&perPage=6&message=No courses joined yet');
        return;
      }
    }

    // Get pagination parameters from query or set default values
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 1;
    // Calculate the offset based on the current page and number of items per page
    const offset = (page - 1) * perPage; // where to start the fetch depending on the page

    // Fetch total enrolled courses count for the user
    const [totalEnrolledCourses] = await pool.query(
      "SELECT COUNT(*) AS count FROM courses WHERE id IN (?)",
      [enrolledCourseIds]
    );
    const totalItems = totalEnrolledCourses[0].count;
    

    // Fetch enrolled courses for the user with pagination
    const [coursesRows] = await pool.query(
      "SELECT * FROM courses WHERE id IN (?) LIMIT ? OFFSET ?",
      [enrolledCourseIds, perPage, offset]
    );

    // Filter out courses that the user has not enrolled in
    let enrolledCourses = coursesRows
      .filter((course) => enrolledCourseIds.includes(course.id.toString()))
      .map((course) => {
        return {
          title: course.title,
          slug: course.slug,
          description: course.description,
          //ars_price: course.ars_price,
          //usd_price: course.usd_price,
          thumbnail: course.thumbnail,
          id: course.id.toString(),
          thumbnailPath: `/uploads/${course.thumbnail}`,
          created_at: new Date(course.created_at).toLocaleString(),
          updated_at: new Date(course.updated_at).toLocaleString(),
          author: {
            name: course.author_name,
            username: course.author_username,
            avatar: course.author_avatar,
          },
          next: `/api/course/${course.id}`, // Dynamic course link
        };
      });

    let totalPages = Math.ceil(totalItems / perPage) || 1;

    // Ensure that the currentPage doesn't exceed the total pages calculated
    if (page > totalPages) {
      page = totalPages;
      offset = (page - 1) * perPage;
    }

    // Handle redirect to the previous page if the last page is empty
    if (page > 1 && enrolledCourses.length === 0) {
      res.redirect(`/api/${route}?page=${page - 1}&perPage=${perPage}`);
      return;
    }

    console.log("enrolled courses: ", enrolledCourses);

    // Render enrolled courses for the user
    res.render("courses", {
      route,
      title: "Mis cursos",
      courses: enrolledCourses,
      totalItems,
      user,
      message: user
        ? message
        : "Not courses joined yet",
      isAdmin,
      perPage,
      page,
      offset,
      currentPage: page,
      totalPages,
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
      thumbnail: course.thumbnail,
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
  const courseId = req.params.id; // Fetch the course slug from the request

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
        thumbnail: course.thumbnail,
        author: {
          // Include author details in courseData
          name: course.author_name,
          username: course.author_username,
          avatar: course.author_avatar,
        },
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

  let courseId = req.params.id;
  const user = req.session.user || null;
  const message = req.query.message;

  try {
    console.log("\nCourseId:", courseId);
    const [courseRows] = await pool.query(getCourseFromIdQuery, courseId);

    if (!courseRows || courseRows.length === 0) {
      return res.status(404).send("Course not found");
    }

    const course = courseRows[0];
    console.log(course);
    console.log("\n\ncourse.video", course.video);
    courseId = course.id;

    // Format course timestamps and video_link
    const formattedCourse = {
      ...course,
      created_at: new Date(course.created_at).toLocaleString(),
      updated_at: new Date(course.updated_at).toLocaleString(),
    };

    if (!course) {
      return res.status(404).send("Course not found");
    }

    // Fetching author details
    const [authorRows] = await pool.query(getCourseAuthorQuery, [
      course.author_id,
    ]);
    const author = authorRows[0];
    console.log(author);

    if (!author) {
      return res.status(404).send("Author details not found");
    }

    // Extend formattedCourse with author details
    formattedCourse.author = {
      name: author.author_name,
      username: author.author_username,
      avatar: author.author_avatar,
    };
    console.log(formattedCourse.author);

    // Fill array with query result
    let enrolledCourses = [];
    if (user) {
      const [enrolledRows] = await pool.query(getUserEnrolledCoursesQuery, [
        user.id,
      ]);
      enrolledCourses = enrolledRows[0]?.enrolled_courses || [];
    }

    // Render the courseDetail view with the fetched data
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
