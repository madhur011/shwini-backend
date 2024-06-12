const mongoose = require("mongoose");

const productCareSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("ProductCare", productCareSchema);
