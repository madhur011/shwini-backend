const express = require("express");
const route = express.Router();

const OrderController = require("../controller/order.controller");

const checkAccessKey = require("../utils/checkAccess");

route.get("/orderAll", checkAccessKey(), OrderController.orderAll);
route.get("/userOrder", checkAccessKey(), OrderController.userOrder);
route.get("/singleOrder", checkAccessKey(), OrderController.singleOrder);
route.post("/submitOrder", checkAccessKey(), OrderController.submitOrder);
route.put("/updateStatus", checkAccessKey(), OrderController.updateStatus);
route.post("/getMyInvoice", checkAccessKey(), OrderController.getMyInvoice);

module.exports = route;
