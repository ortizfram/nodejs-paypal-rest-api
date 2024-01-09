// index.js
import app from "./src/apps.js";
import { config } from "dotenv";

// load .ENV
config();

const PORT = process.env.PORT || 3000; // Use PORT from .env or default to 3000
const HOST = process.env.HOST || 'localhost'; // Use HOST from .env or default to localhost

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});