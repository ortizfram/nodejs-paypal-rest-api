import axios from "axios";

export const coursesList = async (req, res) => {
  let courses = [
    { id: 1, title: "JavaScript Fundamentals", price: 49.99 },
    { id: 2, title: "Web Development with React", price: 79.99 },
    { id: 3, title: "Python for Beginners", price: 59.99 },
  ];

  return res.json(courses);
};
