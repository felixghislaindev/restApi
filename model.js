const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// creating the user schema for our application
const UserSchema = new Schema({
  firstName: String,
  lastName: String,
  emailAddress: String,
  password: String
});

// creating course schema for our apllication
const CourseSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  title: String,
  description: "String",
  estimatedTime: String,
  materialsNeeded: String
});

// defining the course model
const Course = mongoose.model("Course", CourseSchema);
// defineing the user model
const User = mongoose.model("User", UserSchema);

// exporting the course model
module.exports = {
  courseShema: Course,
  UserSchema: User
};
