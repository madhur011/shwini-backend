const mongoose = require("mongoose");

const banerSchema = new mongoose.Schema(
  {
    url: { type: String, default: "" },
    image: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Banner", banerSchema);