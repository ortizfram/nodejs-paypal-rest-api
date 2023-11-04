import mongoose from "mongoose";

// Course schema
const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    maxlength: 200,
    required: false
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  discount: {
    type: Number,
    required: true,
    default: 0
  },
  active: {
    type: Boolean,
    default: false
  },
  thumbnail: {
    type: String // Assuming the image path will be stored as a string
  },
  date: {
    type: Date,
    default: Date.now
  },
//   resource: {
//     type: String // Assuming the file path will be stored as a string
//   },
  length: {
    type: Number,
    required: true
  }
});

const Course = mongoose.model('Course', CourseSchema); // Creating the Course model

// Tag, Prerequisite, and Learning schemas as CourseProperty
const CoursePropertySchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    maxlength: 100
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  }
});

// Define Tag, Prerequisite, and Learning models inheriting CourseProperty
const Tag = mongoose.model('Tag', CoursePropertySchema);
const Prerequisite = mongoose.model('Prerequisite', CoursePropertySchema);
const Learning = mongoose.model('Learning', CoursePropertySchema);

export { Course, Tag, Prerequisite, Learning };
