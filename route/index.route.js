const express = require("express");
const route = express.Router();
const app = express();

const admin = require("./admin.route");
route.use("/admin", admin);

const user = require("./user.route");
route.use("/user", user);

const banner = require("./banner.route");
route.use("/banner", banner);

const category = require("./category.route");
route.use("/category", category);

const attributes = require("./attributes.route");
route.use("/attributes", attributes);

const product = require("./product.route");
route.use("/product", product);

const budget = require("./budget.route");
route.use("/budget", budget);

const wishlist = require("./wishlist.route");
route.use("/wishlist", wishlist);

const cart = require("./cart.route");
route.use("/cart", cart);

const payment = require("./payment.route");
route.use("/payment", payment);

const order = require("./order.route");
route.use("/order", order);

const delivery = require("./delivery.route");
route.use("/delivery", delivery);

const policy = require("./policy.route");
route.use("/policy", policy);

const productCare = require("./productCare.route");
route.use("/productCare", productCare);

const rating = require("./rating.route");
route.use("/rating", rating);

const dashboard = require("./dashboard.route");
route.use("/dashboard", dashboard);

const setting = require("./setting.route");
route.use("/setting", setting);

module.exports = route;
