const express = require("express");
const route = express.Router();

const ProductCareController = require("../controller/productCare.controller");

const checkAccessKey = require("../utils/checkAccess");

route.get("/show", checkAccessKey(), ProductCareController.getProductCare);
route.post(
  "/create",
  checkAccessKey(),
  ProductCareController.createProductCare
);
route.patch(
  "/update",
  checkAccessKey(),
  ProductCareController.updateProductCare
);
route.delete(
  "/delete",
  checkAccessKey(),
  ProductCareController.deleteProductCare
);

module.exports = route;
