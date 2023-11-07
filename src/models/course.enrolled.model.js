// course.enrolled.model.js
import mongoose from 'mongoose';

const EnrolledCoursesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  }
});

const EnrolledCourses = mongoose.model('EnrolledCourses', EnrolledCoursesSchema);

export default EnrolledCourses;
