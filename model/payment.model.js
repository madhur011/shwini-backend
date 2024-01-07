const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    paymentOrderId: { type: String },
    paymentId: { type: String },
    amount: { type: Number, default: 0 },
    paymentStatus: { type: Number, default: 1, eum: [1, 2] }, // 1.pending  2.confirm
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);