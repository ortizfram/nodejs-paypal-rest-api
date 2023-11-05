import axios from "axios";
import slugify from "slugify";
import multer from "multer"; //for upoload imgs
import { User } from "./auth.controller.js";
import { Course } from "../models/course.model.js";



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

  // Fetch courses from the database using the Mongoose model
  const courses = await Course.find().lean();

  res.render("courses", { courses, user, message });
};

export const courseOverview = async (req, res) => {
  const user = User;
  const message = req.query.message; // Retrieve success message from query params authcontroller
  const courseSlug = req.params.slug;

  try {
    const course = await Course.findOne({ slug: courseSlug }).lean();

    if (course) {
      res.render('courseOverview', { course, user, message });
    } else {
      res.status(404).send('Course not found');
    }
  } catch (error) {
    res.status(500).send('Error fetching the course');
  }
};

export const courseEnroll = async (req, res) => {
  const user = User;
  const courseSlug = req.params.slug; // Retrieve the ID from the URL params //since the ID is part of the route URL. // not being passed as req.query.id.
  try {
    const course = await Course.findOne({ slug: courseSlug }).lean();

    if (course) {
      res.render("courseEnroll", { course, user });
    } else {
      res.status(404).send("Course not found");
    }
  } catch (error) {
    res.status(500).send('Error fetching the course');
  }
};

export default { coursesList, courseOverview, courseEnroll, courseCreate };
