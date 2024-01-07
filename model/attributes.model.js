const mongoose = require("mongoose");

const attributesSchema = new mongoose.Schema(
  {
    attrName: { type: String, default: "" },
    details: { type: Array, default: [] },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Attributes", attributesSchema);