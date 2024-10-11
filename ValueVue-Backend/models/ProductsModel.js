const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productsSchema = new Schema({
  productId: {
    type: String,
    required: false,
  },
  productName: {
    type: String,
    required: true,
  },
  productCategory: {
    type: String,
    required: true,
  },
  productDesc: {
    type: String,
    required: true,
  },
  productPrice: {
    type: Number,
    required: true,
  },
  productImage: {
    type: Object,
    required: false,
    default: null,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
    required: true,
  },
  productFeatures: {
    type: Object, 
    required: false,
    default: {},
  },
  customFeatures: {
    type: Object,
    required: false,
    default: {},
  },
  productStock: {
    type: String,
    required: true,
  },
});

const products = mongoose.model("products", productsSchema);

module.exports = products;
