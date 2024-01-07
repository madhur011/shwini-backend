const express = require("express");
const route = express.Router();

const SettingController = require("../controller/setting.controller")

const checkAccessKey = require("../utils/checkAccess")

//multer
const multer = require("multer");
const storage = require("../utils/multer");
const upload = multer({
  storage,
});

route.get("/show", checkAccessKey(), SettingController.getSetting);
route.patch("/update",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "homeBanner", maxCount: 1 },
    { name: "megaBanner", maxCount: 1 },
    { name: "aboutBanner", maxCount: 1 },
  ]),
  checkAccessKey(),
  SettingController.updateSetting);

module.exports = route