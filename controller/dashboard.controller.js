const { User, Product, Payment, Order } = require("../model/index.model");
const { response } = require("../utils/response");

exports.getDashboard = async (req, res) => {
  try {
    const [
      totalUser,
      allProduct,
      totalProduct,
      totalPayment,
      allOrder,
      pandingOrder,
      confirmOrder,
      deliverdOrder,
      CencalOrder,
      returnOrder,
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Product.aggregate([
        { $group: { _id: "$productCode" } },
        { $count: "totalCount" },
      ]),
      Payment.aggregate([
        { $group: { _id: null, amount: { $sum: "$amount" } } },
      ]),
      Order.countDocuments(),
      Order.countDocuments({ confirmStatus: 1 }),
      Order.countDocuments({ confirmStatus: 2 }),
      Order.countDocuments({ confirmStatus: 3 }),
      Order.countDocuments({ confirmStatus: 4 }),
      Order.countDocuments({ confirmStatus: 5 }),
    ]);

    console.log("totalPayment", totalPayment);

    const dashboard = {
      totalUser,
      product: {
        allProduct,
        totalProduct: totalProduct[0].totalCount,
      },
      totalEarn: totalPayment.length < 0 ? totalPayment[0].amount : 0,
      order: {
        allOrder,
        pandingOrder,
        confirmOrder,
        deliverdOrder,
        CencalOrder,
        returnOrder,
      },
    };

    return response(res, 200, {
      message: "Dashboard Get Successfully !!",
      dashboard,
    });
  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }
};
