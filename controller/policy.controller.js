const { Wishlist, User, Product, Payment, Policy } = require("../model/index.model");
const { response } = require("../utils/response")
const crypto = require('crypto');

const Razorpay = require("razorpay");
const { submitOrder } = require("./order.controller");

exports.createPolicy = async (req, res) => {
  try {
    const { title, dec } = req.body;

    if (!title || !dec) {
      return response(res, 201, { message: "Oops! Invalid details!" });
    }

    const policy = new Policy({ title, dec });
    await policy.save();

    return response(res, 200, {
      message: "Policy created successfully!",
      policy,
    });
  } catch (error) {
    console.error(error);
    return response(res, 500, error);
  }
};

exports.getPolicy = async (req, res) => {
  try {
    const policy = await Policy.find();

    return response(res, 200, {
      message: "Policy data retrieved successfully!",
      policy,
    });
  } catch (error) {
    console.error(error);
    return response(res, 500, error);
  }
};

exports.updatePolicy = async (req, res) => {
  try {
    const { policyId } = req.query; // Assuming you have the policy ID in the request parameters
    const { title, dec } = req.body;

    if (!title || !dec) {
      return response(res, 400, { message: "Oops! Invalid details!" });
    }

    const policy = await Policy.findByIdAndUpdate(policyId, { title, dec }, { new: true });

    if (!policy) {
      return response(res, 404, { message: "Policy not found!" });
    }

    return response(res, 200, {
      message: "Policy updated successfully!",
      policy,
    });
  } catch (error) {
    console.error(error);
    return response(res, 500, error);
  }
};

exports.deletePolicy = async (req, res) => {
  try {
    const { policyId } = req.query; // Assuming you have the policy ID in the request parameters

    const policy = await Policy.findByIdAndRemove(policyId);

    if (!policy) {
      return response(res, 404, { message: "Policy not found!" });
    }

    return response(res, 200, {
      message: "Policy deleted successfully!",
      policy,
    });
  } catch (error) {
    console.error(error);
    return response(res, 500, error);
  }
};