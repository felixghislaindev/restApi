"use strict";
// db config
"use strict";

const mongoose = require("mongoose");

mongoose.connect(
  "mongodb://localhost:27017/qa",
  { useNewUrlParser: true }
);

const db = mongoose.connection;

db.on("error", err => {
  console.log("connection error", err);
});

db.once("open", () => {
  console.log("connection to dataabse sucessfull");
}); //ending db open

// importing express
const express = require("express");
// import tng body parser
const jsonParser = require("body-parser").json();
// requiring morgan
const logger = require("morgan");
// requiring router module
const routes = require("./routes");

//creating the app
const app = express();

app.use(jsonParser);
// connecting routes
// use morgan
app.use(logger("dev"));
app.use("/questions", routes);

app.get("/", (req, res) => {
  res.send("welcome to the api");
});

// handling error msg
// cathing 404
app.use((req, res, next) => {
  const err = new Error("not found");
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message
    }
  });
});

// port the app is listenening on
const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`App running on port ${port}`));
