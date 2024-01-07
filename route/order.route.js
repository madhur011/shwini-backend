const express = require("express");
const route = express.Router();

const OrderController = require("../controller/order.controller")

const checkAccessKey = require("../utils/checkAccess")


route.get("/orderAll", checkAccessKey(), OrderController.orderAll);
route.get("/userOrder", checkAccessKey(), OrderController.userOrder);
route.get("/singleOrder", checkAccessKey(), OrderController.singleOrder);
route.put("/updateStatus", checkAccessKey(), OrderController.updateStatus);


module.exports = route