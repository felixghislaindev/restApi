// loading modules
const express = require("express");
const { check, validationResult } = require("express-validator/check");
const bycrypt = require("bcryptjs");
const auth = require("basic-auth");
const User = require("../model").UserSchema;

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

const router = express.Router();

// will return the authenticated user
router.get("/", userAuthentication, (req, res) => {
  const user = req.currentUser;

  res.json({
    id: user.id,
    name: user.firstName
  });
});

// will create a user
router.post(
  "/",
  [
    // email validation
    check("firstName")
      .exists()
      .withMessage('Please provide a value for "firstName"'),
    check("lastName")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "lastName"'),
    check("emailAdress")
      .exists({ checkNull: true, checkFalsy: true })
      .isEmail()
      .withMessage('Please provide a value for "email" example:"jhon@yahoo.com')
      .custom(async email => {
        const foundEmail = await User.find({ emailAdress: email });
        return foundEmail.length == 0;
      })
      .withMessage("this email already exist already exists"),
    check("password")
      .isLength({ min: 5 })
      .withMessage('Please provide a value for "password"')
  ],
  (req, res) => {
    // error if data falis validation
    console.log(req.currentUser);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Use the Array `map()` method to get a list of error messages.
      const errorMessages = errors.array().map(error => error.msg);

      // Return the validation errors to the client.
      return res.status(400).json({ errors: errorMessages });
    }

    const user = req.body;
    //using bycrpt to has the user passowrd befor bing save
    user.password = bycrypt.hashSync(user.password);

    // creating a user and storing it in our database
    User.create(req.body, (err, user) => {
      if (err) return next(err);
      res.location("/api/courses/" + user.id);
      res.send(201);
    });
  }
);

module.exports = router;
