const express = require("express");
const route = express.Router();

const BannerController = require("../controller/banner.controller")

const checkAccessKey = require("../utils/checkAccess")

//multer
const multer = require("multer");
const storage = require("../utils/multer");
const upload = multer({
  storage,
});

route.get("/show", checkAccessKey(), BannerController.getBanner);
route.post("/create", checkAccessKey(), upload.single("image"), BannerController.createBanner);
route.patch("/update", checkAccessKey(), upload.single("image"), BannerController.updateBanner);
route.delete("/delete", checkAccessKey(),  BannerController.deleteBanner); 


module.exports = route