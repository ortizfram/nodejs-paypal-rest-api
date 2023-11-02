// ask for mongoose collection
import {collection} from "../mongodb.js"

export const login = async (req, res) => {
  res.render("login");
};

export const signup = async (req, res) => {
  res.render("signup");

  const { username, name, password, email } = req.body;

  // add validation for required fields
  if (!username || !password) {
    // If username or password is missing, handle the error, redirect, or send an error response
    return res.status(400).send("Username and password are required.");
  }

  const data = {
    username,
    name,
    password,
    email,
  };


  try {
    // save to mongodb: mongodb syntax
    await collection.create(data);
    res.redirect("/"); //go home
  } catch (error) {
    console.error("Error while saving to MongoDB:", error);
    res.redirect("/");//go home
  }
};
