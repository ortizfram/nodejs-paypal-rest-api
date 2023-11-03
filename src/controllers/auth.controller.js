import { users } from "../mongodb.js";

let User; // Declare a global variable to store logged-in user

export const login = async (req, res) => {
  try {
    // Find user in the database that matches the username from the login form
    const check = await users.findOne({ username: req.body.username });

    // If the username and password are correct, log the user in
    if (check && check.password === req.body.password) {
      User = check;
      res.redirect("/?message=Login successful");
    } else {
      res.send("Wrong password or username");
    }
  } catch (error) {
    res.send("An error occurred while logging in");
  }
};

export const signup = async (req, res) => {
  const { username, name, password, email } = req.body;

  // Add validation for required fields
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
    // Save to MongoDB
    await users.create(data);

    // Directly log in after successful signup
    const check = await users.findOne({ username, password });
    if (check) {
      User = check;
      res.redirect("/?message=Signup successful. Logged in automatically.");
    } else {
      res.send("Error creating user or logging in");
    }
  } catch (error) {
    console.error("Error while saving to MongoDB:", error);
    res.redirect("/?message=Error during signup or login");
  }
};

export const logout = (req, res) => {
  // Log out the user by clearing the global User variable
  User = undefined;
  res.redirect("/?message=Logged out successfully");
  res.render("home")
};

export { User }; // Export the User variable
