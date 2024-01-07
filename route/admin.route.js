const express = require("express");
const route = express.Router();

const AdminController = require("../controller/admin.controller")
const AdminMiddleware = require("../middleware/admin.middleware")

//multer
const multer = require("multer");
const storage = require("../utils/multer");
const upload = multer({
  storage,
});
// login admin
route.post("/login", AdminController.adminLogin);

// update admin email and name
route.patch("/update", AdminMiddleware, AdminController.update);

// update admin password
route.patch("/updatePassword", AdminMiddleware, AdminController.updatePassword);

// update admin image
route.put("/updateImage", AdminMiddleware, upload.single("image"), AdminController.updateImage);


module.exports = route