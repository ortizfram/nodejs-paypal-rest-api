import axios from "axios";
import slugify from "slugify";
import multer from "multer"; //for upoload imgs
import { User } from "./auth.controller.js";
import { Course } from "../models/course.model.js";

// def courses obj for testing
let courses = [
  {
    id: 1,
    title: "JavaScript Fundamentals",
    price: 49.99,
    description: "Learn the basics of JavaScript programming.",
    overview:
      "This course covers the fundamentals of JavaScript, including variables, data types, and control structures.",
    instructor: "John Doe",
    duration: "5 hours",
    image: "/images/javascript.png",
  },
  {
    id: 2,
    title: "Web Development with React",
    price: 79.99,
    description: "Master React and build modern web applications.",
    overview:
      "Become proficient in React and build interactive and responsive web applications.",
    instructor: "Jane Smith",
    duration: "8 hours",
    image: "/images/react.png",
  },
  {
    id: 3,
    title: "Python for Beginners",
    price: 59.99,
    description: "Get started with Python programming language.",
    overview:
      "Start your programming journey with Python and understand its key concepts.",
    instructor: "Alex Johnson",
    duration: "6 hours",
    image: "/images/python.jpg",
  },
];

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
  const user = User;
  const message = req.query.message; // Retrieve success message from query params authcontroller
  res.render("courses", { courses, user, message });
};

export const courseOverview = async (req, res) => {
  const user = User;
  const message = req.query.message; // Retrieve success message from query params authcontroller
  const courseId = req.params.id; // Retrieve the ID from the URL params //since the ID is part of the route URL. // not being passed as req.query.id.
  // You could fetch data for the specific course using the ID (e.g., from a database)
  // For demonstration, find the course based on the ID in the courses array
  const course = courses.find((course) => course.id === parseInt(courseId, 10));

  if (course) {
    res.render("courseOverview", { course, user, message }); // Renders the 'courseDetail.ejs' template with the specific course data
  } else {
    res.status(404).send("Course not found");
  }
};

export const courseEnroll = async (req, res) => {
  const user = User;
  const courseId = req.params.id; // Retrieve the ID from the URL params //since the ID is part of the route URL. // not being passed as req.query.id.
  // You could fetch data for the specific course using the ID (e.g., from a database)
  // For demonstration, find the course based on the ID in the courses array
  const course = courses.find((course) => course.id === parseInt(courseId, 10));

  if (course) {
    res.render("courseEnroll", { course, user }); // Renders the 'courseDetail.ejs' template with the specific course data
  } else {
    res.status(404).send("Course not found");
  }
};

export default { coursesList, courseOverview, courseEnroll, courseCreate };
