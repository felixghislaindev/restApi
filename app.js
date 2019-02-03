"use strict";

// load modules
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const userRoute = require("./routes/userRoutes");
const courseRoute = require("./routes/courseRoutes");

//  connecting to mongodb database sjstd-restapi
mongoose.connect("mongodb://localhost/sjstd-restapi");

// creating mongoose connection
const db = mongoose.connection;

// cheking if error happend during connection to the [sjstd-restapi] database
db.on("error", console.error.bind(console, "connection error:"));

// checking if connectiion to [sjstd-restapi] was sucessful
db.once("open", () => {
  console.log("connection to sjstd-restapi database was sucessful");
});
// variable to enable global error logging
const enableGlobalErrorLogging =
  process.env.ENABLE_GLOBAL_ERROR_LOGGING === "true";

// create the Express app
const app = express();

// Setup request body JSON parsing.
app.use(express.json());

// using user route
app.use("/api/users", userRoute);
// using the courses routes
app.use("/api/courses", courseRoute);

// setup morgan which gives us http request logging
app.use(morgan("dev"));

// TODO setup your api routes here

// setup a friendly greeting for the root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the REST API project!"
  });
});

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: "Route Not Found"
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {}
  });
});

// set our port
app.set("port", process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get("port"), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
