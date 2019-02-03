// loading modules
const express = require("express");
const { check, validationResult } = require("express-validator/check");
const bycrypt = require("bcryptjs");
const auth = require("basic-auth");

// user authentication
const userAuthentication = (req, res, next) => {
  // message for erro authetication handling
  let message = null;
  // user credential
  const userCredential = auth(req);

  //   checking if user exist
  // checking if user credential has been found
  if (userCredential) {
    // checking is user exist in our user data stored
    const user = users.find(u => u.username === userCredential.name);

    // check user password if user is foun in our database
    if (user) {
      const authenticatedUser = bycrypt.compareSync(
        userCredential.pass,
        user.password
      );
      // setting current login user if password match
      if (authenticatedUser) {
        // setting current logged in user
        req.currentUser = user;
      } else {
        message = `Authentication failure for username: ${
          user.username
        } wrong password entered`;
      }
    } else {
      message = `Authentication failure  ${user.username} not found`;
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
// kepping user in a array
const users = [];

// will return the authenticated user
router.get("/", userAuthentication, (req, res) => {
  const user = req.currentUser;
  console.log(req);
  res.json({
    name: user.name,
    username: user.username
  });
});

// will create a user
router.post(
  "/",
  [
    check("name")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "name"'),
    check("username")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "username"'),
    check("password")
      .isLength({ min: 5 })
      .withMessage('Please provide a value for "password"')
  ],
  (req, res) => {
    // error if data falis validation
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

    users.push(user);
    //   setting header location
    res.location("/");
    res.sendStatus(201);
  }
);

module.exports = router;
