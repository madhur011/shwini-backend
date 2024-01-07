const express = require("express");
const route = express.Router();

const PolicyController = require("../controller/policy.controller")

const checkAccessKey = require("../utils/checkAccess")


route.get("/show", checkAccessKey(), PolicyController.getPolicy);
route.post("/create", checkAccessKey(), PolicyController.createPolicy);
route.patch("/update", checkAccessKey(), PolicyController.updatePolicy);
route.delete("/delete", checkAccessKey(), PolicyController.deletePolicy);


module.exports = route