// ask for mongoose collection
import { users } from "../mongodb.js";

let User; // Declare a global variable to store logged-in us

export const login = async (req, res) => {
  try {
    // find user in db that matches username from login form
    const check = await users.findOne({ username: req.body.username });

    // password is right, go home
    if (check && check.password === req.body.password) {
      User = check;
      res.redirect("/");
      res.redirect("/?message=Login successful");
    } else {
      res.send("wrong password");
    }
  } catch (error) {
    res.send("wrong details");
    res.render("login");
  }
};

export const signup = async (req, res) => {
  const { username, name, password, email } = req.body;

  // add validation for required fields
  if (!username || !password) {
    return res.status(400).send("Username and password are required.");
  }

  const data = {
    username,
    name,
    password,
    email,
  };

  try {
    // save to MongoDB: MongoDB syntax
    await users.create(data);
    // Commenting out the rendering line res.render("signup");
    res.redirect("/"); // Redirect after successful signup
  } catch (error) {
    console.error("Error while saving to MongoDB:", error);
    // Commenting out the rendering line res.render("signup");
    res.redirect("/"); // Redirect even in case of an error
  }
};


export { User }; // Export the User variable
