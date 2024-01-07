const express = require("express");
const route = express.Router();

const DashboardController = require("../controller/dashboard.controller")

const checkAccessKey = require("../utils/checkAccess")


route.get("/show", checkAccessKey(), DashboardController.getDashboard);


module.exports = route