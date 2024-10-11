const Seller = require("../models/SellersModel");
const { validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
var mongoose = require("mongoose");

let SellerController = {};

//------------------ Get Seller by Email ------------------
SellerController.getSellersByEmail = async (req, res, next) => {
  const { sellerEmail, sellerPassword } = req.body;

  try {
    const validSeller = await Seller.findOne({ sellerEmail });

    if (!validSeller) {
      return res
        .status(404)
        .json({
          message:
            "The email you entered is not registered. Please try again or sign up for an account.",
        });
    }

    const validPassword = bcryptjs.compareSync(
      sellerPassword,
      validSeller.sellerPassword
    );

    if (!validPassword) {
      return res
        .status(404)
        .json({
          message: "The password you entered is incorrect. Please try again.",
        });
    }

    const token = jwt.sign({ id: validSeller._id }, "v1i2s3h4n5u6c");
    res
      .cookie("access_token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      })
      .status(200)
      .json(validSeller);
  } catch (err) {
    console.error(err);
    return res.status(502).json(err);
  }
};

//------------------ Get Seller by Id ------------------
SellerController.getSellerById = async (req, res, next) => {
  const sellerId = req.params.id;

  try {
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found!" });
    }
    return res.status(200).json(seller);
  } catch (err) {
    console.error(err);
    return res.status(502).json({ message: "Error fetching seller" });
  }
};

// ------------------ Add a new Seller ------------------
SellerController.addSeller = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    sellerName,
    sellerEmail,
    sellerMobile,
    sellerPassword,
    sellerDoor,
    sellerStreet,
    sellerCity,
    sellerDistrict,
    sellerState,
    sellerCountry,
    sellerZipCode,
    sellerCords,
    sellerShop,
  } = req.body;

  if (!sellerPassword) {
    return res.status(400).json({ message: "Seller password is required." });
  }

  try {
    const existingSeller = await Seller.findOne({ sellerEmail });
    if (existingSeller) {
      return res.status(409).json({
        message: "This email is already registered. Try Login or use a different email",
      });
    }

    const hashedPassword = bcryptjs.hashSync(sellerPassword, 10);

    let seller = new Seller({
      sellerName,
      sellerEmail,
      sellerMobile,
      sellerPassword: hashedPassword,
      sellerDoor,
      sellerStreet,
      sellerCity,
      sellerDistrict,
      sellerState,
      sellerCountry,
      sellerZipCode,
      sellerCords: [parseFloat(sellerCords.lat), parseFloat(sellerCords.lng)],
      sellerShop,
    });
    await seller.save();
    return res.status(201).send({ message: "Seller added successfully!" });
  } catch (err) {
    if (
      err.code === 11000 &&
      err.keyPattern &&
      err.keyPattern.sellerEmail === 1
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

// ------------------ Signout Seller ------------------
SellerController.signOutSeller = async (req, res, next) => {
  try {
    res.clearCookie("access_token");
    return res
      .status(200)
      .json({ message: `Seller has been logged out successfully!` });
  } catch (err) {
    console.log(err);
    return res.status(502).json(err);
  }
};

//------------------ Get Sellers for Map ------------------
SellerController.getSellersForMap = async (req, res, next) => {
  try {
    const sellers = await Seller.find({}, "_id sellerName sellerCords");
    if (!sellers) {
      return res.status(404).json({ message: "Sellers not found!" });
    }

    const sellersWithDetails = sellers.map((seller) => {
      const coordinates =
        seller.sellerCords &&
        (Array.isArray(seller.sellerCords)
          ? seller.sellerCords
          : seller.sellerCords.lat && seller.sellerCords.lng
          ? [seller.sellerCords.lat, seller.sellerCords.lng]
          : null);

      if (!coordinates) {
        console.error(`Invalid coordinates for seller ${seller._id}`);
        return null;
      }

      return {
        id: seller._id,
        name: seller.sellerName,
        coordinates,
      };
    });

    const validSellers = sellersWithDetails.filter((seller) => seller !== null);

    const coordinatesArray = validSellers.map(({ coordinates }) => coordinates);
    console.log(coordinatesArray);

    return res.status(200).json(validSellers);
  } catch (err) {
    console.error(err);
    return res.status(502).json({ message: "Error fetching sellers" });
  }
};

// ------------------ Edit Seller by ID ------------------
SellerController.editSeller = async (req, res, next) => {
  let id = req.params.id;

  let updateFields = {};

  console.log(req.body);
  console.log(req.body.sellerShop);
  console.log(req.file);
  console.log(req.files);

  if (req.body.sellerName) {
    updateFields.sellerName = req.body.sellerName;
  }

  if (req.body.sellerMobile !== undefined && req.body.sellerMobile !== "null") {
    updateFields.sellerMobile = req.body.sellerMobile;
  }

  if (req.body.sellerCity) {
    updateFields.sellerCity = req.body.sellerCity;
  }

  if (req.body.sellerDoor !== undefined && req.body.sellerDoor !== "null") {
    updateFields.sellerDoor = req.body.sellerDoor;
  }

  if (req.body.sellerStreet) {
    updateFields.sellerStreet = req.body.sellerStreet;
  }

  if (req.body.sellerDistrict) {
    updateFields.sellerDistrict = req.body.sellerDistrict;
  }

  if (req.body.sellerState) {
    updateFields.sellerState = req.body.sellerState;
  }

  if (req.body.sellerCountry) {
    updateFields.sellerCountry = req.body.sellerCountry;
  }

  if (
    req.body.sellerZipCode !== undefined &&
    req.body.sellerZipCode !== "null"
  ) {
    updateFields.sellerZipCode = req.body.sellerZipCode;
  }

  if (
    req.body.sellerCPassword !== undefined &&
    req.body.sellerCPassword !== "null"
  ) {
    updateFields.sellerCPassword = req.body.sellerCPassword;
  }

  if (req.body.sellerPassword) {
    try {
      const hashedPassword = bcryptjs.hashSync(req.body.sellerPassword, 10);
      updateFields.sellerPassword = hashedPassword;
    } catch (hashError) {
      console.error(hashError);
      return res.status(500).json({ message: "Error hashing password" });
    }
  }

  if (req.body.sellerCords) {
    const cordsString = req.body.sellerCords;
    const coOrdArr = cordsString.split(",").map((coord) => parseFloat(coord));
    updateFields.sellerCords = { lat: coOrdArr[0], lng: coOrdArr[1] };
  }

  if (req.body.sellerShop) {
    updateFields.sellerShop = req.body.sellerShop;
  }

  if (req.file) {
    updateFields.sellerAvatar = req.file;
  }

  if (req.body.sellerEmail) {
    const existingSeller = await Seller.findOne({
      sellerEmail: req.body.sellerEmail,
    });

    if (existingSeller && existingSeller._id.toString() !== id) {
      return res.status(409).json({
        message:
          "The new email is already registered. Please choose a different email.",
      });
    }
    updateFields.sellerEmail = req.body.sellerEmail;
  }

  try {
    const updatedSeller = await Seller.findOneAndUpdate(
      { _id: id },
      updateFields,
      {
        new: true,
      }
    );

    if (!updatedSeller) {
      return res.status(404).json({ message: `No Seller Found with ID ${id}` });
    }

    return res.status(200).json(updatedSeller);
  } catch (err) {
    console.log(err);
    return res.status(502).json({ message: "Internal server error" });
  }
};

module.exports = SellerController;
