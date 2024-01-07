const express = require("express");
const route = express.Router();

const AttributesController = require("../controller/attributes.controller")

const checkAccessKey = require("../utils/checkAccess")


route.get("/show", checkAccessKey(), AttributesController.getAttributes);
route.post("/create", checkAccessKey(), AttributesController.createAttributes);
route.patch("/update", checkAccessKey(), AttributesController.updateAttributes);
// route.delete("/delete", checkAccessKey(),  AttributesController.deleteAttributes); 


module.exports = route