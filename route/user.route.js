const express = require("express");
const route = express.Router();

const UserController = require("../controller/user.controller")

const checkAccessKey = require("../utils/checkAccess")

//multer
const multer = require("multer");
const storage = require("../utils/multer");
const upload = multer({
  storage,
});

route.get("/userAll", checkAccessKey(), UserController.userGet);
route.get("/userProfile", checkAccessKey(), UserController.userProfile);

// login user
route.post("/login", upload.fields([{ name: "coverImage" }, { name: "profileImage", maxCount: 1 }]), checkAccessKey(), UserController.userLogin);

route.patch("/updateUser", upload.single("profileImage"), checkAccessKey(), UserController.updateUser);

// User Add Address
route.patch("/addAddress", checkAccessKey(), UserController.addAddress);
// User Update Address
route.put("/updateAddress", checkAccessKey(), UserController.updateAddress);
// User Delete Address
route.delete("/deleteAddress", checkAccessKey(), UserController.deleteAddress);

// User Block
route.put("/userBlock", checkAccessKey(), UserController.userBlock);

module.exports = route