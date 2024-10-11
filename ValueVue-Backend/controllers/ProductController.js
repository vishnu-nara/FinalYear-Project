const Products = require("../models/ProductsModel");
const mongoose = require("mongoose");
const sharp = require("sharp");

let ProductController = {};

//------------------ Get list of all products ------------------
ProductController.getProducts = async (req, res, next) => {
  let allProducts;

  try {
    allProducts = await Products.find().populate("sellerId", "sellerName");
    if (!allProducts) {
      return res.status(404).json({ message: "No Products Found!" });
    }
  } catch (err) {
    console.log(err);
    return res.status(502).json(err);
  }
  return res.status(200).json(allProducts);
};

//------------------ Add a new product --------------------------
/* ProductController.addProducts = async (req, res, next) => {
  const { productName, productCategory, productDesc, productPrice, sellerId } =
    req.body;
  const productImage = req.file;

  if (!productImage) {
    return res.status(400).json({ message: "Product image is required." });
  }

  let imageBuffer;

  try {
    const compressedImage = await sharp(productImage.buffer)
      .resize({ width: 500 })
      .webp({ quality: 100 })
      .toBuffer();

    imageBuffer = compressedImage;
  } catch (error) {
    console.error("Error compressing image:", error);
    return res.status(500).json({ message: "Error compressing image." });
  }

  let product = new Products({
    productName,
    productCategory,
    productDesc,
    productPrice,
    sellerId,
    productImage: {
      fieldname: productImage.fieldname,
      originalname: productImage.originalname,
      encoding: productImage.encoding,
      mimetype: "image/webp",
      buffer: imageBuffer,
      size: imageBuffer.length,
    },
  });

  try {
    await product.save();
  } catch (err) {
    console.log(err);
    return res.status(502).json(err);
  }
  console.log(productImage);
  return res.status(201).send({ message: "Product added successfully!" });
};
 */
ProductController.addProducts = async (req, res, next) => {
  const {
    productName,
    productCategory,
    productDesc,
    productPrice,
    sellerId,
    productFeatures,
    customFeatures,
    productStock,
  } = req.body;
  const productImage = req.file;

  console.log(req.body);

  if (!productImage) {
    return res.status(400).json({ message: "Product image is required." });
  }

  let imageBuffer;

  try {
    const compressedImage = await sharp(productImage.buffer)
      .resize({ width: 500 })
      .webp({ quality: 100 })
      .toBuffer();

    imageBuffer = compressedImage;
  } catch (error) {
    console.error("Error compressing image:", error);
    return res.status(500).json({ message: "Error compressing image." });
  }

  const parsedProductFeatures = JSON.parse(productFeatures);

  const parsedCustomFeatures = JSON.parse(customFeatures);
  const formattedCustomFeatures = {};

  for (const key in parsedCustomFeatures) {
    const customFeature = parsedCustomFeatures[key];
    const formattedName = customFeature.name
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
    formattedCustomFeatures[key] = {
      name: formattedName,
      value: customFeature.value,
    };
  }

  let product = new Products({
    productName,
    productCategory,
    productDesc,
    productPrice,
    sellerId,
    productStock,
    productFeatures: parsedProductFeatures,
    customFeatures: formattedCustomFeatures,
    productImage: {
      fieldname: productImage.fieldname,
      originalname: productImage.originalname,
      encoding: productImage.encoding,
      mimetype: "image/webp",
      buffer: imageBuffer,
      size: imageBuffer.length,
    },
  });

  try {
    await product.save();
    console.log(product);
    return res.status(201).send({ message: "Product added successfully!" });
  } catch (err) {
    console.log(err);
    return res.status(502).json(err);
  }
};

//------------------ Get a single product by ID ------------------
ProductController.getProductById = async (req, res, next) => {
  const productId = req.params.id;

  try {
    const product = await Products.findById(productId).populate("sellerId");
    if (!product) {
      return res.status(404).json({ message: "Product not found!" });
    }
    return res.status(200).json(product);
  } catch (err) {
    console.error(err);
    return res.status(502).json({ message: "Error fetching product" });
  }
};

// ------------------ Edit Product by ID ------------------
ProductController.editProductById = async (req, res, next) => {
  try {
    let id = req.params.id;

    let updateFields = {};

    console.log("Request Body:", req.body);

    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ message: "Invalid request body" });
    }

    if (req.body.productName) {
      updateFields.productName = req.body.productName;
    }

    if (req.body.productPrice) {
      updateFields.productPrice = req.body.productPrice;
    }

    if (req.body.productCategory) {
      updateFields.productCategory = req.body.productCategory;
    }

    if (req.body.productDesc) {
      updateFields.productDesc = req.body.productDesc;
    }

    if (req.body.productStock) {
      updateFields.productStock = req.body.productStock;
    }

    if (req.body.productFeatures) {
      // Parse productFeatures from JSON string
      try {
        updateFields.productFeatures = JSON.parse(req.body.productFeatures);
      } catch (error) {
        console.error("Error parsing productFeatures:", error);
        return res
          .status(400)
          .json({ message: "Invalid productFeatures JSON" });
      }
    }

    if (req.body.customFeatures) {
      // Parse customFeatures from JSON string
      try {
        updateFields.customFeatures = JSON.parse(req.body.customFeatures);
      } catch (error) {
        console.error("Error parsing customFeatures:", error);
        return res.status(400).json({ message: "Invalid customFeatures JSON" });
      }
    }

    if (req.file) {
      updateFields.productImage = req.file;
    }

    if (req.file) {
      try {
        const compressedImage = await sharp(req.file.buffer)
          .resize({ width: 500 })
          .webp({ quality: 100 })
          .toBuffer();

        updateFields.productImage = {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          encoding: req.file.encoding,
          mimetype: "image/webp",
          buffer: compressedImage,
          size: compressedImage.length,
        };
      } catch (error) {
        console.error("Error compressing image:", error);
        return res.status(500).json({ message: "Error compressing image." });
      }
    }

    console.log("Update Fields:", updateFields); // Log updateFields to check its structure

    const updatedProduct = await Products.findOneAndUpdate(
      { _id: id },
      updateFields,
      { new: true }
    );

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ message: `No Product Found with ID ${id}` });
    }

    return res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error in editProductById:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ------------------ Delete Product by ID ------------------
ProductController.deleteProductById = async (req, res, next) => {
  let id = req.params.id;

  try {
    const deletedProduct = await Products.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json("Product not found!");
    }

    return res.status(200).json("Product has been deleted!");
  } catch (err) {
    console.log(err);
    return res.status(502).json(err);
  }
};

// Helper function to calculate haversine distance
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  // Implementation of haversine formula to calculate distance
  const radLat1 = (Math.PI / 180) * lat1;
  const radLon1 = (Math.PI / 180) * lon1;
  const radLat2 = (Math.PI / 180) * lat2;
  const radLon2 = (Math.PI / 180) * lon2;

  const dLat = radLat2 - radLat1;
  const dLon = radLon2 - radLon1;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) *
      Math.cos(radLat2) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = 6371 * c; // Radius of Earth is approximately 6371 kilometers

  return distance;
}

//------------------------New NearbyProducts------------//
ProductController.getUserProducts = async (req, res, next) => {
  const { userLat, userLng, maxDistance = 50 } = req.query;

  try {
    const allProducts = await Products.find().populate({
      path: "sellerId",
      select: "sellerName sellerCords",
    });

    const nearbyProducts = allProducts
      .filter((product) => {
        const sellerCords = product.sellerId?.sellerCords;

        if (!sellerCords) {
          return false;
        }

        const coordinates = Array.isArray(sellerCords)
          ? sellerCords
          : [sellerCords.lat, sellerCords.lng];

        const distance = calculateHaversineDistance(
          userLat,
          userLng,
          coordinates[0],
          coordinates[1]
        );

        product.distance = distance;

        return distance <= maxDistance;
      })
      .map((product) => ({
        ...product.toObject(),
        distance: product.distance,
      }))
      .sort((a, b) => a.distance - b.distance);

    res.json(nearbyProducts);
  } catch (error) {
    console.error("Error fetching nearby products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//------------------------Get Products by Seller ID------------//
ProductController.getProductsBySeller = async (req, res, next) => {
  const { sellerId } = req.params;

  try {
    const products = await Products.find({
      sellerId: new mongoose.Types.ObjectId(sellerId),
    }).populate("sellerId", "sellerName");

    if (!products || products.length === 0) {
      return res.status(404).json([]);
    }

    return res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ------------------- Add this function to your ProductController --------------//
ProductController.getProductsByCategory = async (req, res, next) => {
  const { productCategory } = req.params;

  try {
    const products = await Products.find({ productCategory }).populate(
      "sellerId",
      "sellerName"
    );

    if (!products || products.length === 0) {
      return res.status(404).json({
        message: `No Products Found for the given category: ${productCategory}`,
      });
    }
    console.log(products);
    return res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


//--------------------- get near by products based on category ---------------------//
/* 
ProductController.getUserProductsByCategory = async (req, res, next) => {
  const { userLat, userLng, maxDistance = 50 } = req.query;
  const { productCategory } = req.params;

  try {
    // Fetch all products of the given category
    const allProducts = await Products.find({ productCategory }).populate({
      path: "sellerId",
      select: "sellerName sellerCords",
    });

    // Filter products by distance using haversine formula
    const nearbyProducts = allProducts
      .filter((product) => {
        const sellerCords = product.sellerId?.sellerCords;

        if (!sellerCords) {
          return false;
        }

        const coordinates = Array.isArray(sellerCords)
          ? sellerCords
          : [sellerCords.lat, sellerCords.lng];

        const distance = calculateHaversineDistance(
          userLat,
          userLng,
          coordinates[0],
          coordinates[1]
        );

        product.distance = distance;

        return distance <= maxDistance;
      })
      .map((product) => ({
        ...product.toObject(),
        distance: product.distance,
      }))
      .sort((a, b) => a.distance - b.distance);

    res.json(nearbyProducts);
  } catch (error) {
    console.error("Error fetching nearby products by category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
 */


module.exports = ProductController;