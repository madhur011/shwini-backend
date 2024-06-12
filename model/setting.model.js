const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    // Image
    logo: { type: String, default: "" },
    homeBanner: { type: String, default: "" },
    megaBanner: { type: String, default: "" },
    aboutBanner: { type: String, default: "" },
    // Text Details
    headerOffer: { type: String, default: "" },
    webText: { type: String, default: "" },
    footerText: { type: String, default: "" },
    companyName: { type: String, default: "" },
    contact: { type: String, default: "" },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    shopTime: { type: String, default: "" },
    menufacture: { type: String, default: "" },
    //handle Details Wise
    deliveryDay: { type: String, default: "" },
    returnDay: { type: String, default: "" },
    //Razor Pay Details
    razorKey: { type: String, default: "" },
    razorApiSecret: { type: String, default: "" },

  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Setting", settingSchema);