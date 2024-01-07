const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    categoryName: { type: String, default: "" },
    image: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Category", categorySchema);