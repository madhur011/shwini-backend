const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    productCode: { type: String, default: "", ref: "Product" },
    ratingCount: { type: Number, default: 0 },
    ratingText: { type: String, default: "" },
    image: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Rating", ratingSchema);