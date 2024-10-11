const User = require("../models/UsersModel");
const { validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
var mongoose = require("mongoose");

let UserController = {};

//------------------ Get list of all users ------------------
UserController.getUsers = async (req, res, next) => {
  let allUsers;

  try {
    allUsers = await User.find();

    if (!allUsers) {
      return res.status(404).json({ message: "No Users Found!" });
    }
  } catch (err) {
    console.log(err);
    return res.status(502).json(err);
  }
  return res.status(200).json(allUsers);
};

//------------------ Get User by Email ------------------
UserController.getUsersByEmail = async (req, res, next) => {
  const { userEmail, userPassword } = req.body;

  try {
    const validUser = await User.findOne({ userEmail });

    if (!validUser) {
      return res
        .status(404)
        .json({
          message: `The email you entered is not registered. Please try again or sign up for an account.`,
        });
    }

    const validPassword = bcryptjs.compareSync(
      userPassword,
      validUser.userPassword
    );

    if (!validPassword) {
      return res
        .status(404)
        .json({
          message: `The password you entered is incorrect. Please try again.`,
        });
    }

    const token = jwt.sign({ id: validUser._id }, "v1i2s3h4n5u6c");
    res
      .cookie("access_token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      })
      .status(200)
      .json(validUser);
  } catch (err) {
    console.error(err);
    return res.status(502).json(err);
  }
};

// ------------------ Add a new User ------------------
UserController.addUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    userName,
    userEmail,
    userMobile,
    userPassword,
    userDoor,
    userStreet,
    userCity,
    userDistrict,
    userState,
    userCountry,
    userZipCode,
    userCords,
  } = req.body;

  if (!userPassword) {
    return res.status(400).json({ message: "User password is required." });
  }

  try {
    const existingUser = await User.findOne({ userEmail });
    if (existingUser) {
      return res.status(409).json({
        message: "This email is already registered. Try Login or use a different email",
      });
    }

    const hashedPassword = bcryptjs.hashSync(userPassword, 10);

    let user = new User({
      userName,
      userEmail,
      userMobile,
      userPassword: hashedPassword,
      userDoor,
      userStreet,
      userCity,
      userDistrict,
      userState,
      userCountry,
      userZipCode,
      userCords: [parseFloat(userCords.lat), parseFloat(userCords.lng)],
    });
    await user.save();
    return res.status(201).send({ message: "User added successfully!" });
  } catch (err) {
    if (
      err.code === 11000 &&
      err.keyPattern &&
      err.keyPattern.userEmail === 1
    ) {
      return res.status(409).json({
        message:
          "This email is already registered. Try Login or use a different email",
      });
    } else {
      console.log(err);
      return res.status(502).json(err);
    }
  }
};

// ------------------ Signout User ------------------
UserController.signOutUser = async (req, res, next) => {
  try {
    res.clearCookie("access_token");
    return res
      .status(200)
      .json({ message: `User has been logged out successfully!` });
  } catch (err) {
    console.log(err);
    return res.status(502).json(err);
  }
};

// ------------------ Edit User by ID ------------------
UserController.editUser = async (req, res, next) => {
  let id = req.params.id;

  let updateFields = {};

  if (req.body.userName) {
    updateFields.userName = req.body.userName;
  }

  if (req.body.userMobile !== undefined && req.body.userMobile !== "null") {
    updateFields.userMobile = req.body.userMobile;
  }

  if (req.body.userCity) {
    updateFields.userCity = req.body.userCity;
  }

  if (req.body.userDoor !== undefined && req.body.userDoor !== "null") {
    updateFields.userDoor = req.body.userDoor;
  }

  if (req.body.userStreet) {
    updateFields.userStreet = req.body.userStreet;
  }

  if (req.body.userDistrict) {
    updateFields.userDistrict = req.body.userDistrict;
  }

  if (req.body.userState) {
    updateFields.userState = req.body.userState;
  }

  if (req.body.userCountry) {
    updateFields.userCountry = req.body.userCountry;
  }

  if (req.body.userZipCode !== undefined && req.body.userZipCode !== "null") {
    updateFields.userZipCode = req.body.userZipCode;
  }

  if (
    req.body.userCPassword !== undefined &&
    req.body.userCPassword !== "null"
  ) {
    updateFields.userCPassword = req.body.userCPassword;
  }

  if (req.body.userPassword) {
    try {
      const hashedPassword = bcryptjs.hashSync(req.body.userPassword, 10);
      updateFields.userPassword = hashedPassword;
    } catch (hashError) {
      console.error(hashError);
      return res.status(500).json({ message: "Error hashing password" });
    }
  }

  if (req.body.userCords) {
    const cordsString = req.body.userCords;
    const coOrdArr = cordsString.split(",").map((coord) => parseFloat(coord));
    updateFields.userCords = { lat: coOrdArr[0], lng: coOrdArr[1] };
  }

  if (req.file) {
    updateFields.userAvatar = req.file;
  }

  console.log(req.body);

  if (req.body.userEmail) {
    const existingUser = await User.findOne({
      userEmail: req.body.userEmail,
    });

    if (existingUser && existingUser._id.toString() !== id) {
      return res.status(409).json({
        message:
          "The new email is already registered. Please choose a different email.",
      });
    }
    updateFields.userEmail = req.body.userEmail;
  }

  try {
    const updatedUser = await User.findOneAndUpdate({ _id: id }, updateFields, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: `No User Found with ID ${id}` });
    }

    return res.status(200).json(updatedUser);
  } catch (err) {
    console.log(err);
    return res.status(502).json({ message: "Internal server error" });
  }
};

module.exports = UserController;
