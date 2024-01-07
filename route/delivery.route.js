const express = require("express");
const route = express.Router();

const DeliveryController = require("../controller/delivery.controller")

const checkAccessKey = require("../utils/checkAccess")


// route.post("/checkPincode", checkAccessKey(), DeliveryController.checkPincode);


module.exports = route