// loading modules
const express = require("express");
const { check, validationResult } = require("express-validator/check");
const bycrypt = require("bcryptjs");
const auth = require("basic-auth");
const User = require("../model").UserSchema;

const router = express.Router();

// requiring courses
const Course = require("../model").courseShema;
// user authentication
const userAuthentication = async (req, res, next) => {
  // message for erro authetication handling
  let message = null;
  // user credential
  const userCredential = auth(req);

  //   checking if user exist
  // checking if user credential has been found
  if (userCredential) {
    // checking is user exist in our user data stored

    const user = await User.find(
      { emailAdress: userCredential.name },
      (err, user) => {
        if (err) return next(err);
        req.userFound = user[0];
      }
    );

    const foundUser = req.userFound;

    // check user password if user is foun in our database
    if (foundUser) {
      const authenticatedUser = bycrypt.compareSync(
        userCredential.pass,
        foundUser.password
      );
      // setting current login user if password match
      if (authenticatedUser) {
        // setting current logged in user
        req.currentUser = foundUser;
      } else {
        message = `Authentication failure for username: ${
          foundUser.username
        } wrong password entered`;
      }
    } else {
      message = `Authentication failure  ${foundUser.username} not found`;
    }
  } else {
    message = "Auth header not found";
  }
  if (message) {
    res.status(401).json({ message: "Access Denied" });
  } else {
    //   calling next if success
    next();
  }
};

// returning list of courses in our database
router.get("/", (req, res) => {
  // retreiving all courses from the database

  Course.find()
    .populate("user")
    .exec()
    .then(data => {
      res.json({
        result: data
      });
    });
});

// creating a course
router.post(
  "/",
  userAuthentication,
  [
    check("title")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "title"'),
    check("description")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "description"'),
    check("estimatedTime")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "estimatedTime"'),
    check("materialsNeeded")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "materiallNeeded"')
  ],
  (req, res) => {
    console.log(req.currentUser);
    // error if data falis validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Use the Array `map()` method to get a list of error messages.
      const errorMessages = errors.array().map(error => error.msg);

      // Return the validation errors to the client.
      return res.status(400).json({ errors: errorMessages });
    }
    const { title, description, estimatedTime, materialsNeeded } = req.body;
    // creating a Course and storing it in our database
    Course.create(
      {
        title,
        description,
        estimatedTime,
        materialsNeeded,
        user: req.currentUser.id
      },
      (err, user) => {
        if (err) return next(err);
        res.location("/api/courses/" + user.id);
        res.sendStatus(201);
      }
    );
  }
);
// returning a specific course
router.get("/:id", (req, res) => {
  Course.findById(req.params.id)
    .populate("user")
    .exec()
    .then(data => {
      res.json({
        result: data
      });
    });
});

// update a specific course
router.put(
  "/:id",
  userAuthentication,
  [
    check("title")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "title"'),
    check("description")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "description"'),
    check("estimatedTime")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "estimatedTime"'),
    check("materialsNeeded")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "materiallNeeded"')
  ],
  (req, res) => {
    // finding validating and updating a specific course
    Course.findById(req.params.id, (err, course) => {
      // will check if the course belong to the user by compairing the user id to the logged in id
      console.log(course.user.toString(), req.currentUser.id);
      if (course.user.toString() === req.currentUser.id) {
        Course.findOneAndUpdate(req.params.id, req.body, (err, course) => {
          if (err) next(err);
          res.sendStatus(204);
        });
      } else {
        res.sendStatus(403);
      }
    });
  }
);

// delete a specific course
router.delete("/:id", userAuthentication, (req, res) => {
  // finding and delete specific course
  // finding validating and updating a specific course
  Course.findById(req.params.id, (err, course) => {
    // will check if the course belong to the user by compairing the user id to the logged in id
    if (course.user.toString() === req.currentUser.id) {
      Course.findOneAndDelete(req.params.id, err => {
        if (err) next(err);
        res.sendStatus(204);
      });
    } else {
      res.sendStatus(403);
    }
  });
});

module.exports = router;
