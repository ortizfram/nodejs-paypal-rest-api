import mongoose from "mongoose";

// connect mongodb to Nodejs
mongoose
  .connect("mongodb://localhost:27017/nodejs-paypal-rest-api")
  .then(() => {
    console.log("mongodb connected");
  })
  .catch(() => {
    console.log("failed to connect db");
  });

// create schema
const LoginSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Define collection
const collection = new mongoose.model("Collection1", LoginSchema);

// export collection
export {collection};
