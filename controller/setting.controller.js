const {
  User,
  Product,
  Payment,
  Order,
  Setting,
} = require("../model/index.model");
const { deleteFiles } = require("../utils/deleteFile");
const { response } = require("../utils/response");

exports.updateSetting = async (req, res) => {
  try {
    const {
      headerOffer,
      webText,
      footerText,
      companyName,
      contact,
      email,
      address,
      shopTime,
      deliveryDay,
      returnDay,
      razorKey,
      razorApiSecret,
    } = req.body;
    const { logo, homeBanner, megaBanner, aboutBanner } = req.files;

    const setting = await Setting.findOne({});

    // Image
    if (logo) setting.logo = logo[0].path;
    if (homeBanner) setting.homeBanner = homeBanner[0].path;
    if (megaBanner) setting.megaBanner = megaBanner[0].path;
    if (aboutBanner) setting.aboutBanner = aboutBanner[0].path;

    // Text Details
    setting.headerOffer = headerOffer || setting.headerOffer;
    setting.webText = webText || setting.webText;
    setting.footerText = footerText || setting.footerText;
    setting.companyName = companyName || setting.companyName;
    setting.contact = contact || setting.contact;
    setting.email = email || setting.email;
    setting.address = address || setting.address;
    setting.shopTime = shopTime || setting.shopTime;
    setting.menufacture = menufacture || setting.menufacture;

    //handle Details Wise
    setting.deliveryDay = deliveryDay || setting.deliveryDay;
    setting.returnDay = returnDay || setting.returnDay;

    //Razor Pay Details
    setting.razorKey = razorKey || setting.razorKey;
    setting.razorApiSecret = razorApiSecret || setting.razorApiSecret;

    await setting.save();

    return response(res, 200, {
      message: "Setting Get Successfully !!",
      setting,
    });
  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }
};

exports.getSetting = async (req, res) => {
  try {
    const setting = await Setting.findOne({});

    if (req == "getMe") {
      return setting;
    } else {
      return response(res, 200, {
        message: "Setting Get Successfully !!",
        setting,
      });
    }
  } catch (error) {
    console.log(error);
    deleteFiles(req.files);
    return response(res, 500, error);
  }
};
