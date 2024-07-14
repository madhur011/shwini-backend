const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    productCode: { type: String, default: "", ref: "Product" },
    productCount: { type: Number, default: 1 },
    confirmStatus: { type: Number, default: 1, eum: [1, 2, 3, 4, 5] }, // 1.pending  2.confirm 3.Delivered 4.Cancelled 5.Return
    paymentOrderId: { type: String },
    paymentId: { type: String },
    shiprocket_order_id: { type: String },
    shiprocket_shipment_id: { type: String },
    isCod: { type: Boolean, default: false },
    address: {
      fullName: { type: String, default: "" },
      phone: Number,
      type: { type: String, default: "home" },
      details: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Order", orderSchema);

orderSchema.index({ createdAt: -1 })
orderSchema.index({ userId: -1 })
orderSchema.index({ userId: -1 })
orderSchema.index({ orderId: -1 })
