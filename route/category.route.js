const express = require("express");
const route = express.Router();

const CategoryController = require("../controller/category.controller")

const checkAccessKey = require("../utils/checkAccess")

//multer
const multer = require("multer");
const storage = require("../utils/multer");
const upload = multer({
  storage,
});

route.get("/show", checkAccessKey(), CategoryController.getCategory);
route.post("/create", checkAccessKey(), upload.single("image"), CategoryController.createCategory);
route.patch("/update", checkAccessKey(), upload.single("image"), CategoryController.updateCategory);
route.delete("/delete", checkAccessKey(),  CategoryController.deleteCategory);


module.exports = route