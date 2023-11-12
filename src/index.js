// index.js
import app from "./apps.js";
import { HOST, PORT } from "./config.js";


// RUN
app.listen(PORT);
console.log("Server on port ", PORT);
console.log("Open on browser: ", HOST);
