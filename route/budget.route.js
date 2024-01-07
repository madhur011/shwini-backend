const express = require("express");
const route = express.Router();

const BudgetController = require("../controller/budget.controller")

const checkAccessKey = require("../utils/checkAccess")

//multer
const multer = require("multer");
const storage = require("../utils/multer");
const upload = multer({
  storage,
});

route.get("/show", checkAccessKey(), BudgetController.getBudget);
route.post("/create", checkAccessKey(), upload.single("image"), BudgetController.createBudget);
route.patch("/update", checkAccessKey(), upload.single("image"), BudgetController.updateBudget);
route.delete("/delete", checkAccessKey(),  BudgetController.deleteBudget);


module.exports = route