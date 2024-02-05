//src/controllers/courses.controller.js
import slugify from "slugify";
import path from "path";
import moveFile from "../utils/moveFile.js";
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
import { __dirname, db, setCustomMimeTypes } from "../../server.js";
import { fetchUserByField } from "../../db/queries/auth.queries.js";

//COURSE CREATE/UPDATE/DELETE
// ===========================================================
const getCourseDelete = async (req, res) => {
  console.log("\n\n*** getCourseDelete\n\n");
  const user = req.session.user || null;
  const message = req.query.message;
  try {
    // course from id
    const courseId = req.query.courseId;
    const [courseRows] = await db.promise().execute(getCourseFromIdQuery, [courseId]);
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
    const [courseRows] = await db.promise().execute(getCourseFromIdQuery, [courseId]);
    const course = courseRows[0];
    courseId = course.id;

    //msg
    console.log(`\n\n${course.title}\n\n`);

    // Perform deletion query
    await db.promise().execute(deleteUserCourseQuery, [courseId]);
    await db.promise().execute(deleteCourseQuery, [courseId]);

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
      const [enrolledCoursesRows] = await db.promise().execute(
        getUserEnrolledCoursesQuery,
        [user.id]
      );
      enrolledCourseIds = enrolledCoursesRows.map((enrolledCourse) =>
        enrolledCourse.id.toString()
      );

      // If the user has not enrolled in any courses, redirect to '/api/courses'
      if (enrolledCourseIds.length === 0) {
        res.redirect(
          "/api/courses?page=1&perPage=6&message=No courses joined yet"
        );
        return;
      }
    }

    // Get pagination parameters from query or set default values
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 1;
    // Calculate the offset based on the current page and number of items per page
    const offset = (page - 1) * perPage; // where to start the fetch depending on the page

    // Fetch total enrolled courses count for the user
    const [totalEnrolledCourses] = await db.promise().execute(
      "SELECT COUNT(*) AS count FROM courses WHERE id IN (?)",
      [enrolledCourseIds]
    );
    const totalItems = totalEnrolledCourses[0].count;

    // Fetch enrolled courses for the user with pagination
    const [coursesRows] = await db.promise().execute(
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
      message: user ? message : "Not courses joined yet",
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
    const [rows] = await db.promise().execute(getCourseFromIdQuery, courseId);

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
    const [rows] = await db.promise().execute(getCourseFromIdQuery, courseId);
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




export default {
  coursesListOwned,
  courseOverview,
  courseEnroll,
  getCourseDelete,
  postCourseDelete,
};
