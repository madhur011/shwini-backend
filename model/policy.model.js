const mongoose = require("mongoose");

const policySchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    dec: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Policy", policySchema);