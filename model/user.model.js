const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    mobileNo: Number,
    customerId: Number,
    password: { type: String, default: "" },
    gender: { type: String, default: "" },
    profileImage: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    // loginType: { type: Number, eum: [0, 1] },
    // 0:login, 1:signin
    isOnline: { type: Boolean, default: false },
    isBlock: { type: Boolean, default: false },
    address: [
      {
        fullName: { type: String, default: "" },
        phone: Number,
        type: { type: String, default: "home" },
        details: {
          socName: { type: String, default: "" },
          pincode: { type: Number, default: "" },
          city: { type: String, default: "" },
          state: { type: String, default: "" },
          country: { type: String, default: "" },
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("User", userSchema);
