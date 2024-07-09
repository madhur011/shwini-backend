const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    price: { type: Number, default: 0 },
    oldPrice: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    shippingCharge: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    craft: { type: String, default: "" },
    work: { type: String, default: "" },
    size: { type: String, default: "" },
    sku: { type: String, default: "" },
    patten: { type: String, default: "" },
    color: { type: String, default: "" },
    febric: { type: String, default: "" },
    sizeB: { type: String, default: "" },
    colorB: { type: String, default: "" },
    productCode: { type: String, default: "" },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    productImage: { type: Array, default: [] },
    outOfStock: { type: Boolean, default: false },
    newCollection: { type: Boolean, default: true },
    weddingCollection: { type: Boolean, default: false },
    purity: { type: String, default: "" },
    // For Delivery Partner
    length: { type: Number, default: 0 },
    breadth: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    weight: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Product", productSchema);
