import axios from "axios";
import slugify from "slugify";
import multer from "multer"; //for upoload imgs
import { Course } from "../models/course.model.js";
import { users } from "../mongodb.js";


export const courseCreate = async (req, res) => {
  try {
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

    let courseSlug = slug; // Set courseSlug as the provided slug, if any

    // If no slug is provided, generate it from the name
    if (!courseSlug) {
      courseSlug = slugify(title, { lower: true, strict: true }); // Generate the slug from the name
    }

    const thumbnailPath = req.file ? req.file.path : ""; // Get the file path of the uploaded thumbnail

    const newCourse = new Course({
      title,
      slug: courseSlug, // Assign the generated or provided slug
      description,
      price,
      discount,
      active,
      thumbnail: thumbnailPath,
      length,
    });

    // Save the new course to the database
    await newCourse.save();

    res.status(201).redirect("/courses");
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
      // If the error is due to the unique constraint on the slug field
      const errorMessage = "Slug must be unique";
      res.render("courseCreate", { errorMessage });
  }  else {
    // If the error is due to other reasons
    res.status(500).json({ message: "Error creating the course", error: error.message });
    }
  }
};

export const coursesList = async (req, res) => {
  // ♦ Render all courses

  try {
    const message = req.query.message; // Retrieve success message from query params authcontroller
    const courses = await Course.find().lean();
    const user = req.session.user || null; // Get the user from the session or set to null if not logged in

    if (user) {
      // Check if the user has enrolled courses before trying to access them
      const enrolledCourses = user.enrolledCourses || [];
      const enrolledCourseIds = enrolledCourses.map(courseId => courseId.toString());

      const availableCourses = courses.filter(course => !enrolledCourseIds.includes(course._id.toString()));

      res.render("courses", { courses: availableCourses, user, message });
    } else {
      // If user is not logged in, display all available courses
      res.render("courses", { courses, user:null, message });// Pass user as null
    }
  } catch (error) {
    res.redirect("/courses?message=Error fetching courses");
  }
};

export const coursesListOwned = async (req, res) => {
  // ♦ Same as coursesList view but with my owned courses, 

  if (!req.session.user) { // login needed
    // Store the course slug in the query parameters to redirect after login
    return res.redirect(`/login?redirect=/courses-owned`);
  }

  try {
    const user = req.session.user;
    if (user) {
      // find sessio user id in db. poplate with enrolledCourses
      const userDetails = await users.findOne({ _id: user._id }).populate('enrolledCourses').lean();
      const enrolledCourses = userDetails.enrolledCourses; // []

      res.render('coursesOwned', { courses: enrolledCourses, user });
    } else {
      res.render('coursesOwned', { courses: [], user });
    }
  } catch (error) {
    res.status(500).send('Error fetching enrolled courses');
  }
};

export const courseOverview = async (req, res) => {
  // ♦ View to have a quick look of the course before buying it, 

  try {
    const user = req.session.user; // Retrieve the user from the session
    const message = req.query.message; // Retrieve success message from query params authcontroller
    const courseSlug = req.params.slug;

    const course = await Course.findOne({ slug: courseSlug }).lean();

    if (!course) {
      return res.status(404).send('Course not found');
    }

    // Check if the user is logged in and has enrolledCourses before proceeding
    if (user && user.enrolledCourses) {
      const isEnrolled = user.enrolledCourses.includes(course._id.toString());
      
      if (isEnrolled) {
        return res.redirect(`/course/${courseSlug}/modules`);
      }
    }

    // Render the course overview page if not enrolled
    res.render('courseOverview', { course, user, message });
  } catch (error) {
    console.error("Error fetching the course:", error);
    res.status(500).send('Error fetching the course');
  }
};

export const courseEnroll = async (req, res) => {
  // ♦ This is just a view to send to createOrder, 
  // ♦ rendering course information 
  
  // Fetch the course slug from the request
  const courseSlug = req.params.slug;
  
  if (!req.session.user) {
    // Store the course slug in the query parameters to redirect after login
    return res.redirect(`/login?redirect=/course/${courseSlug}/enroll`);
  }

  try {
    const course = await Course.findOne({ slug: courseSlug }).lean();

    if (course) {
      res.render("courseEnroll", { course });
    } else {
      res.status(404).send("Course not found");
    }
  } catch (error) {
    res.status(500).send('Error fetching the course');
  }
};

export const courseDetail = async (req, res) => {
// ♦ View that renders x bought course ,
// ♦ it has course modules, videos and content

 // Fetch the course slug from the request
 const courseSlug = req.params.slug;
 const user = req.session.user || null; // Get the user from the session or set to null if not logged in
 const message = req.query.message; // Retrieve success message from query params authcontroller

 try {
   const course = await Course.findOne({ slug: courseSlug }).lean();

   if (course) {
    // Fetch the enrolled courses for the current user
    if (user) {
      const userDetails = await users.findOne({ _id: user._id}).populate('enrolledCourses').lean();
      const enrolledCourses = userDetails.enrolledCourses;

      res.render('courseDetail', { course, message, user, enrolledCourses });
   } else {
    res.render('courseDetail', { course, message, user, enrolledCourses: [] });
   }
  } else {
    res.status(404).send("Course not found");
  }
 } catch (error) {
   res.status(500).send('Error fetching the course');
 }
};


export default { coursesList, courseOverview, courseEnroll, courseDetail, courseCreate };
