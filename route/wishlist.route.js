const express = require("express");
const route = express.Router();

const WishlistController = require("../controller/wishlist.controller")

const checkAccessKey = require("../utils/checkAccess")


route.get("/show", checkAccessKey(), WishlistController.getWishlist);
route.post("/create", checkAccessKey(), WishlistController.createWishlist);
route.delete("/delete", checkAccessKey(), WishlistController.deleteWishlist);


module.exports = route