const express = require("express");
const route = express.Router();

const CartController = require("../controller/cart.controller")

const checkAccessKey = require("../utils/checkAccess")


route.get("/show", checkAccessKey(), CartController.getUserCart);
route.post("/add", checkAccessKey(), CartController.addToCart);
route.patch("/addRemove", checkAccessKey(), CartController.addRemoveCartProduct);
route.delete("/delete", checkAccessKey(), CartController.deleteCart);


module.exports = route