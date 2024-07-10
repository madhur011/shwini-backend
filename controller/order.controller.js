const { request } = require("http");
const {
  Wishlist,
  User,
  Product,
  Payment,
  Order,
  Cart,
} = require("../model/index.model");
const { uniqueId, formatDate } = require("../utils/function");
const { response } = require("../utils/response");
const crypto = require("crypto");
const {
  authenticateShiprocket,
  createShiprocketOrder,
} = require("../utils/shiprocket");

//after payment this function call in payment controller other wise COD method
exports.submitOrder = async (req, res) => {
  console.log("req.body", req.body);
  console.log("req.body", req.body.product.allProduct);
  const {
    razorpay_payment_id,
    razorpay_order_id,
    user,
    product,
    address,
    isCod,
  } = req.body;
  console.log("address", address);

  try {
    const allOrders = product.allProduct.length;

    const orders = [];
    const cartId = [];

    const shiprocketToken = await authenticateShiprocket();
    if (!shiprocketToken) {
      return response(res, 201, {
        status: false,
        message: "Order is not submited",
      });
    }

    for (let i = 0; i < allOrders; i++) {
      const order = {
        orderId: uniqueId(20),
        userId: user._id,
        productId: product.allProduct[i].productId,
        productCode: product.allProduct[i].productCode,
        productCount: product.allProduct[i].productCount,
        paymentOrderId: isCod ? "-" : razorpay_order_id,
        paymentId: isCod ? "-" : razorpay_payment_id,
        isCod,
        address: {
          fullName: address.fullName,
          phone: address.phone,
          type: address.type,
          details: `${address.details.socName}, ${address.details.city} - ${address.details.pincode}, ${address.details.state}, ${address.details.country}`,
        },
      };
      console.log("product.allProduct[i]", product.allProduct[i]);
      const shiprocketOrder = {
        order_id: order.orderId.toString(),
        order_date: formatDate(new Date()),
        pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION,
        billing_customer_name: address.fullName,
        billing_last_name: "-",
        billing_address: address.details.socName,
        billing_city: address.details.city,
        billing_pincode: address.details.pincode,
        billing_state: address.details.state,
        billing_country: address.details.country,
        billing_email: user.email,
        billing_phone: address.phone,
        shipping_is_billing: true,
        order_items: [
          {
            name: product.allProduct[i].title,
            sku: product.allProduct[i].sku,
            units: product.allProduct[i].productCount,
            selling_price: product.allProduct[i].price,
            discount: "",
            tax: "",
            hsn: "",
          },
        ],
        payment_method: isCod ? "COD" : "Prepaid",
        sub_total:
          product.allProduct[i].price * product.allProduct[i].productCount,
        length: product.allProduct[i].length,
        breadth: product.allProduct[i].breadth,
        height:
          product.allProduct[i].height * product.allProduct[i].productCount,
        weight: product.allProduct[i].weight,
      };

      // Normal Order
      orders.push(order);
      cartId.push(product.allProduct[i]._id);

      const shiprocketResponse = await createShiprocketOrder(
        shiprocketToken,
        shiprocketOrder
      );
      console.log("Shiprocket order response:", shiprocketResponse);
      if (shiprocketResponse.status === "ERROR") {
        console.error(
          "Shiprocket order creation error:",
          shiprocketResponse.message
        );
        return response(res, 500, {
          status: false,
          message: shiprocketResponse.message,
        });
      }
    }

    await Order.insertMany(orders);

    const filter = { _id: { $in: cartId } };
    await Cart.deleteMany(filter);

    if (isCod) {
      return response(res, 200, {
        message: "Order Submit Successfully !!",
      });
    } else {
      return {
        message: "Order Successfully !!",
        orders,
      };
    }
  } catch (error) {
    console.log(error);
    return {
      error,
    };
  }
};

exports.singleOrder = async (req, res) => {
  try {
    const { orderId } = req.query;
    if (!orderId) {
      return response(res, 201, { message: "Oops! Invalid details !" });
    }

    const order = await Order.findById(orderId)
      .sort({ createdAt: -1 })
      .populate("productId");

    if (!order) {
      return response(res, 201, { message: "Oops! Invalid Order Id !" });
    }

    return response(res, 200, {
      message: "Get order Successfully !!",
      order,
    });
  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }
};

exports.orderAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const skip = page * limit;

    const search = req.query.search;
    const fieldsToSearch = [
      "orderId",
      "title",
      "price",
      "oldPrice",
      "productCode",
      "productCount",
      "confirmStatus",
      "paymentOrderId",
      "paymentId",
    ];

    const matchQuery = {
      $or: [
        {
          $or: fieldsToSearch.map((field) => ({
            [field]: { $regex: search, $options: "i" },
          })),
        },
        {
          $or: fieldsToSearch.map((field) => ({
            $expr: {
              $regexMatch: {
                input: { $toString: `$${field}` },
                regex: search,
                options: "i",
              },
            },
          })),
        },
      ],
    };

    const matchStatusQuery = req.query.status
      ? { confirmStatus: parseInt(req.query.status) }
      : { confirmStatus: { $ne: 0 } };

    console.log("req.query.status", req.query.status);

    const commonPipeline = [
      {
        $match: matchStatusQuery,
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "productId",
        },
      },
      {
        $unwind: {
          path: "$productId",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: 1,
          orderId: 1,
          userId: 1,
          productId: "$productId._id",
          title: "$productId.title",
          price: { $multiply: ["$productId.price", "$productCount"] },
          oldPrice: { $multiply: ["$productId.oldPrice", "$productCount"] },
          productImage: "$productId.productImage",
          color: "$productId.color",
          productCode: 1,
          productCount: 1,
          confirmStatus: 1,
          paymentOrderId: 1,
          paymentId: 1,
          isCod: 1,
          address: 1,
          createdAt: 1,
        },
      },
      {
        $match: matchQuery,
      },
    ];

    const countPipeline = [...commonPipeline, { $count: "totalCount" }];
    const aggregationPipeline = [
      ...commonPipeline,
      { $skip: skip },
      { $limit: limit },
      { $sort: { createdAt: -1 } },
    ];

    const [countResult] = await Order.aggregate(countPipeline);
    const totalCount = countResult?.totalCount || 0;

    const result = await Order.aggregate(aggregationPipeline);
    const paginatedResults = result || [];

    return response(res, 200, {
      message: "Get order Successfully !!",
      order: paginatedResults,
      orderTotal: totalCount,
    });
  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }
};

exports.userOrder = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return response(res, 201, { message: "Oops! Invalid details !" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return response(res, 201, { message: "Oops! Invalid User Id !" });
    }

    const order = await Order.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .populate("productId");

    return response(res, 200, {
      message: "Get order Successfully !!",
      order,
    });
  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.query;
    if (!orderId) {
      return response(res, 201, { message: "Oops! Invalid details !" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return response(res, 201, { message: "Oops! Invalid User Id !" });
    }

    if (status) order.confirmStatus = status;
    await order.save();

    return response(res, 200, {
      message: "Update order Status Successfully !!",
      order,
    });
  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }
};
