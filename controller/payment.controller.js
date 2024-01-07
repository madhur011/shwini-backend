const { Wishlist, User, Product, Payment, Order } = require("../model/index.model");
const { response } = require("../utils/response")
const crypto = require('crypto');

const Razorpay = require("razorpay");
const { submitOrder } = require("./order.controller");

exports.checkout = async (req, res) => {
  console.log("req.body", req.body);

  const instance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET,
  });

  const { amount } = req.body;

  try {
    if (!amount) {
      return response(res, 201, { message: "Oops ! Invalid details !" });
    }
    var options = {
      amount: parseInt(amount) * 100,
      currency: "INR",
    };
    const order = await instance.orders.create(options);

    return response(res, 200, {
      message: "Checkout Successfully !!",
      order
    });


  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }

}

exports.paymentVerification = async (req, res) => {

  console.log("req.body", req.body);
  console.log("req.body", req.body.product.allProduct);
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, user, product, address } = req.body

  try {


    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_API_SECRET);
    const data = `${razorpay_order_id}|${razorpay_payment_id}`;
    hmac.update(data);
    const generated_signature = hmac.digest('hex')

    const payment = await new Payment()

    payment.userId = user._id
    payment.paymentOrderId = razorpay_order_id
    payment.paymentId = razorpay_payment_id
    payment.amount = product.finalPrice

    if (generated_signature == razorpay_signature) {

      payment.paymentStatus = 1
      await payment.save()

      const orderPlace = await submitOrder(req, res)

      console.log("orderPlace", orderPlace);

      return response(res, 200, {
        message: "Varification Successfully !!",
        order: orderPlace
      });
    } else {

      payment.paymentStatus = 0
      await payment.save()

      return response(res, 201, {
        message: "Varification Unsuccessfully !!",
      });
    }



  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }

}
exports.getRazorKey = async (req, res) => {

  try {
    return response(res, 200, {
      message: "Get Key Successfully !!",
      razorKey: process.env.RAZORPAY_API_KEY
    });
  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }

}
exports.getPaymentData = async (req, res) => {

  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const skip = page * limit;
    const search = req.query.search;
    const fieldsToSearch = ["amount", "paymentStatus", "paymentOrderId", "paymentId", "name", "email", "customerId", "mobileNo"];
    const numericSearch = !isNaN(search) ? parseFloat(search) : search;

    const matchQuery = {
      $or: [
        { $or: fieldsToSearch.map(field => ({ [field]: { $regex: search, $options: "i" } })) },
        {
          $or: fieldsToSearch.map(field => ({
            $expr: {
              $regexMatch: {
                input: { $toString: `$${field}` },
                regex: search,
                options: "i"
              }
            }
          }))
        }
      ]
    }

    const commonPipeline = [
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userId",
        },
      },
      {
        $unwind: {
          path: "$userId",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: 1,
          amount: 1,
          paymentStatus: 1,
          paymentOrderId: 1,
          paymentId: 1,
          createdAt: 1,
          userId: "$userId._id",
          name: "$userId.name",
          email: "$userId.email",
          profileImage: "$userId.profileImage",
          customerId: "$userId.customerId",
          mobileNo: "$userId.mobileNo",
        },
      },
      {
        $match: matchQuery
      }

    ];


    const countPipeline = [...commonPipeline, { $count: "totalCount" }];
    const aggregationPipeline = [
      ...commonPipeline,
      { $skip: skip },
      { $limit: limit },
      { $sort: { createdAt: -1 } }
    ];


    const [countResult] = await Payment.aggregate(countPipeline);
    const totalCount = countResult?.totalCount || 0;

    const result = await Payment.aggregate(aggregationPipeline);
    const paginatedResults = result || [];

    return response(res, 200, {
      message: "Payment Get Successfully !!",
      payment: paginatedResults,
      paymentTotal: totalCount,
    });

  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }

}



exports.paymentOrder = async (req, res) => {

  try {

    const { paymentOrderId, paymentId } = req.query

    if (!paymentOrderId || !paymentId) {
      return response(res, 201, { message: "Oops! Invalid details !" });
    }

    const order = await Order.find({ paymentOrderId, paymentId }).sort({ createdAt: -1 }).populate("productId")

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

}


