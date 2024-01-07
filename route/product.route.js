const express = require("express");
const route = express.Router();

const ProductController = require("../controller/product.controller")

const checkAccessKey = require("../utils/checkAccess")

//multer
const multer = require("multer");
const storage = require("../utils/multer");
const upload = multer({
  storage,
});
// Show Products
route.get("/show", checkAccessKey(), ProductController.getProduct);
route.get("/showColorProduct", checkAccessKey(), ProductController.singleProductWithAllColor);
// Create Products
route.post("/create", checkAccessKey(), upload.any(), ProductController.createProduct);
// Update Products
route.patch("/updateDetails", checkAccessKey(), ProductController.editProductDetails);
route.patch("/updateColor", checkAccessKey(), upload.array("productImage"), ProductController.editProductColor);
// Delete Products
route.delete("/deleteDetails", checkAccessKey(), ProductController.deleteProducts);
route.delete("/deleteColor", checkAccessKey(), ProductController.deleteProductColor);

//Edit Single Value product
route.put("/updateProduct", checkAccessKey(), ProductController.updateSingleValue);

//Edit Multiple Value product
route.put("/updateMultipleValue", checkAccessKey(), ProductController.updateMultipleValue);




// =================================== Website API =======================================
route.get("/bestSeller", checkAccessKey(), ProductController.bestSellerProduct);
route.get("/showSingleProduct", checkAccessKey(), ProductController.showSingleProduct);
route.get("/allProduct", checkAccessKey(), ProductController.allProduct);
route.get("/categoryWiseProduct", checkAccessKey(), ProductController.categoryWiseProduct);
route.get("/colletionProduct", checkAccessKey(), ProductController.colletionProduct);
route.get("/budgetPoduct", checkAccessKey(), ProductController.budgetPoduct);


// ================ Get Mega Menu ============
route.get("/getAllAttribute", checkAccessKey(), ProductController.getAllAttribute);
route.get("/getAttibuteWiseproduct", checkAccessKey(), ProductController.getAttibuteWiseproduct);




module.exports = route