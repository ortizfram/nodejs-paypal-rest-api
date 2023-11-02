import mongoose from "mongoose";
import { config } from "dotenv";

config();// Loads the .env file into process.env

// database URL: mongodb ATLAS
const dbUrl = process.env.DB_URL

// connect mongodb to Nodejs
mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// create schema
const SignupSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Define collection
const users = new mongoose.model("Users", SignupSchema);

// export collection
export { users };
