// index.js
import app from "./src/apps.js";
import { config } from "dotenv";

// load .ENV
config();

// 
const PORT = process.env.PORT || 3000; 
const HOST = process.env.HOST || 'localhost'; 

// Connection
app.listen(PORT, HOST, () => {
  console.log(`Server is rrrunning on http://${HOST}:${PORT}`);
});