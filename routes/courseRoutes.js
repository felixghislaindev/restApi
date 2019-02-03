// loading modules
const express = require("express");

const router = express.Router();

// returning list of courses in our database
router.get("/", (req, res) => {
  res.json({
    message: "return a list of courses"
  });
});

// creating a course
router.post("/", (req, res) => {
  res.json({
    message: "return a list of courses"
  });
});
// returning a specific course
router.get("/:id", (req, res) => {
  res.json({
    message: `will return the course with the id of ${req.params.id}`
  });
});

// update a specific course
router.put("/:id", (req, res) => {
  res.json({
    message: `will update the course with the id ${req.params.id}`
  });
});

// delete a specific course
router.delete("/:id", (req, res) => {
  res.json({
    message: `will delete the course with the id ${req.params.id}`
  });
});

module.exports = router;
