import axios from "axios";

// def courses obj for testing
let courses = [
    {
      id: 1,
      title: "JavaScript Fundamentals",
      price: 49.99,
      description: "Learn the basics of JavaScript programming.",
      overview: "This course covers the fundamentals of JavaScript, including variables, data types, and control structures.",
      instructor: "John Doe",
      duration: "5 hours",
      image: "/images/javascript.png"
    },
    {
      id: 2,
      title: "Web Development with React",
      price: 79.99,
      description: "Master React and build modern web applications.",
      overview: "Become proficient in React and build interactive and responsive web applications.",
      instructor: "Jane Smith",
      duration: "8 hours",
      image: "/images/react.png"
    },
    {
      id: 3,
      title: "Python for Beginners",
      price: 59.99,
      description: "Get started with Python programming language.",
      overview: "Start your programming journey with Python and understand its key concepts.",
      instructor: "Alex Johnson",
      duration: "6 hours",
      image: "/images/python.jpg"
    },
  ];

export const coursesList = async (req, res) => {
  res.render("courses", { courses });
};

export const courseOverview = async(req,res) => {
    const courseId = req.params.id; // Retrieve the ID from the URL params //since the ID is part of the route URL. // not being passed as req.query.id. 
    // You could fetch data for the specific course using the ID (e.g., from a database)
    // For demonstration, find the course based on the ID in the courses array
    const course = courses.find(course => course.id === parseInt(courseId, 10));

    if (course) {
        res.render("courseOverview", { course }); // Renders the 'courseDetail.ejs' template with the specific course data
    } else {
        res.status(404).send('Course not found');
    }
}

export const courseEnroll = async(req,res) => {
  const courseId = req.params.id; // Retrieve the ID from the URL params //since the ID is part of the route URL. // not being passed as req.query.id. 
  // You could fetch data for the specific course using the ID (e.g., from a database)
  // For demonstration, find the course based on the ID in the courses array
  const course = courses.find(course => course.id === parseInt(courseId, 10));

  if (course) {
      res.render("courseEnroll", { course }); // Renders the 'courseDetail.ejs' template with the specific course data
  } else {
      res.status(404).send('Course not found');
  }
}

export default coursesList;
