const express = require("express");
const route = express.Router();

const RatingController = require("../controller/rating.controller")

const checkAccessKey = require("../utils/checkAccess")

//multer
const multer = require("multer");
const storage = require("../utils/multer");
const upload = multer({
  storage,
});

route.get("/show", checkAccessKey(), RatingController.getRating);
route.post("/create", checkAccessKey(), upload.single("image"), RatingController.createRating);


module.exports = route