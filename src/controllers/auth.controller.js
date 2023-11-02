// ask for mongoose collection
import collection from "../mongodb.js"

export const login = async (req, res) => {
  res.render("login");
};

export const signup = async (req, res) => {
  res.render("signup");

  // req form data
  const data = {
    username: req.body.username,
    name: req.body.name,
    password: req.body.password,
    email: req.body.email,
  };

  // save to mongodb: mongodb syntax
  await collection.insertMany([data])

  // go to home
  res.render("/")
};
