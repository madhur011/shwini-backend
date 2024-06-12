const { ProductCare } = require("../model/index.model");
const { response } = require("../utils/response");

exports.createProductCare = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return response(res, 201, { message: "Oops! Invalid details!" });
    }

    const productCare = new ProductCare({ title });
    await productCare.save();

    return response(res, 200, {
      message: "ProductCare created successfully!",
      productCare,
    });
  } catch (error) {
    console.error(error);
    return response(res, 500, error);
  }
};

exports.getProductCare = async (req, res) => {
  try {
    const productCare = await ProductCare.find();

    return response(res, 200, {
      message: "ProductCare data retrieved successfully!",
      productCare,
    });
  } catch (error) {
    console.error(error);
    return response(res, 500, error);
  }
};

exports.updateProductCare = async (req, res) => {
  try {
    const { productCareId } = req.query; // Assuming you have the productCare ID in the request parameters
    const { title } = req.body;

    if (!title) {
      return response(res, 400, { message: "Oops! Invalid details!" });
    }

    const productCare = await ProductCare.findByIdAndUpdate(
      productCareId,
      { title },
      { new: true }
    );

    if (!productCare) {
      return response(res, 404, { message: "ProductCare not found!" });
    }

    return response(res, 200, {
      message: "ProductCare updated successfully!",
      productCare,
    });
  } catch (error) {
    console.error(error);
    return response(res, 500, error);
  }
};

exports.deleteProductCare = async (req, res) => {
  try {
    const { productCareId } = req.query; // Assuming you have the productCare ID in the request parameters

    const productCare = await ProductCare.findByIdAndRemove(productCareId);

    if (!productCare) {
      return response(res, 404, { message: "ProductCare not found!" });
    }

    return response(res, 200, {
      message: "ProductCare deleted successfully!",
      productCare,
    });
  } catch (error) {
    console.error(error);
    return response(res, 500, error);
  }
};
