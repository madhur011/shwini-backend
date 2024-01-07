const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    budget: { type: Number, default: 0 },
    image: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Budget", budgetSchema);