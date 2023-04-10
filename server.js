const express = require("express");
const colors = require("colors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
require("dotenv").config();
// dotenv config
// dotenv.config();
dotenv.config({ path: "./routes/.env" });

// mongodb coonection
connectDB();

// rest object creating
const app = express();

// middlewares
app.use(express.json()); //to avid parsing related errors
app.use(morgan("dev"));

// routers
app.use("/api/v1/user", require("./routes/userRoutes"));
app.use("/api/v1/admin", require("./routes/adminRoutes"));
// for doctor
app.use("/api/v1/doctor", require("./routes/doctorRoutes"));

// listen port
const port = process.env.port || 8080;
const mode = process.env.NODE_ENV;
app.listen(port, () => {
  console.log(
    `Server Running in ${process.env.NODE_MODE} Mode on port ${process.env.PORT}`
      .bgCyan.white
  );
});
