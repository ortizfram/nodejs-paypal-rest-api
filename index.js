// index.js
import app from "./src/apps.js";
import { HOST, PORT } from "./src/config.js";


// RUN
app.listen(PORT);
console.log(" ");
console.log(" ");
console.log("Server on port ", PORT);
console.log("Open on browser: ", HOST);
