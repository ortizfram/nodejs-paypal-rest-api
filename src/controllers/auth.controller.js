import bcrypt from 'bcrypt';

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user in the database that matches the username from the login form
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    // If the user exists and the passwords match
    if (user && await bcrypt.compare(password, user.password)) {
      req.session.user = user; // Store the user in the session
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

  try {
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    const data = [
      username,
      name,
      hashedPassword, // Save the hashed password
      email,
    ];

    // Save to PostgreSQL
    await pool.query('INSERT INTO users (username, name, password, email) VALUES ($1, $2, $3, $4)', data);

    req.session.user = { username, name, email }; // Set the user in the session
    res.redirect("/?message=Signup successful. Logged in automatically.");
  } catch (error) {
    console.error("Error while saving to MongoDB:", error);
    res.redirect("/?message=Error during signup or login");
  }
};

export const logout = (req, res) => {
  // Clear the user session by destroying it
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    // Redirect the user to the home page after logout
    res.redirect("/?message=Logged out successfully");
  });
};

