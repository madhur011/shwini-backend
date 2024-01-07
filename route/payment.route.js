const express = require("express");
const route = express.Router();

const PaymentController = require("../controller/payment.controller")

const checkAccessKey = require("../utils/checkAccess")


route.get("/getPaymentData", checkAccessKey(), PaymentController.getPaymentData);
route.get("/paymentOrder", PaymentController.paymentOrder);
route.get("/getRazorKey", checkAccessKey(), PaymentController.getRazorKey);
route.post("/checkout", checkAccessKey(), PaymentController.checkout);
route.post("/paymentVerification", PaymentController.paymentVerification);


module.exports = route