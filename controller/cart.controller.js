const { Wishlist, User, Product, Cart } = require("../model/index.model");
const { deleteFile, deleteFilePath } = require("../utils/deleteFile");
const { response } = require("../utils/response")



exports.getUserCart = async (req, res) => {
  try {

    const { userId } = req.query
    const user = await User.findById(userId);
    if (!user || !userId) {
      return response(res, 201, { message: "Oops! Invalid details or product Id!" });
    }


    const aggregationPipeline = [
      {
        $match: { $and: [{ userId: user?._id }, { saveLater: false }] }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $lookup: {
          from: "products",
          let: { productId: "$productId", productCount: "$productCount" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$productId"] }
              }
            },
            {
              $project: {
                _id: 1,
                title: 1,
                // single price
                price: 1,
                oldPrice: 1,
                savePrice: { $subtract: ["$oldPrice", "$price"] },
                // total price
                finalPrice: { $multiply: ["$price", "$$productCount"] },
                finalOldPrice: { $multiply: ["$oldPrice", "$$productCount"] },
                finalSavePrice: { $subtract: [{ $multiply: ["$oldPrice", "$$productCount"] }, { $multiply: ["$price", "$$productCount"] }] },
                discount: 1,
                shippingCharge: 1,
                stock: 1,
                color: 1,
                febric: 1,
                productImage: 1,
                outOfStock: 1,
                newCollection: 1,
                weddingCollection: 1
              }
            }
          ],
          as: "productDetails"
        }
      },
      {
        $unwind: {
          path: "$productDetails",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: 1,
          productCode: 1,
          productCount: 1,
          userId: 1,
          productId: 1,
          saveLater: 1,
          title: "$productDetails.title",
          price: "$productDetails.price",
          oldPrice: "$productDetails.oldPrice",
          discount: "$productDetails.discount",
          shippingCharge: "$productDetails.shippingCharge",
          productImage: "$productDetails.productImage",
          outOfStock: "$productDetails.outOfStock",
          savePrice: "$productDetails.savePrice",
          finalPrice: "$productDetails.finalPrice",
          finalOldPrice: "$productDetails.finalOldPrice",
          finalSavePrice: "$productDetails.finalSavePrice",
          createdAt: 1,
          updatedAt: 1,
        }
      },
      {
        $group: {
          _id: userId,
          productCount: { $sum: "$productCount" },
          price: { $sum: "$price" },
          oldPrice: { $sum: "$oldPrice" },
          finalPrice: { $sum: "$finalPrice" },
          finalOldPrice: { $sum: "$finalOldPrice" },
          finalSavePrice: { $sum: "$finalSavePrice" },
          totalProduct: { $sum: 1 },
          allProduct: { $push: "$$ROOT" }
        }
      },
    ]


    const cart = await Cart.aggregate(aggregationPipeline);

    const noCart = {
      productCount: 0,
      price: 0,
      oldPrice: 0,
      finalPrice: 0,
      finalOldPrice: 0,
      finalSavePrice: 0,
      totalProduct: 0,
      allProduct: []
    }


    return response(res, 200, {
      message: "cart Get Successfully !!",
      cart: cart[0] || noCart,
    });

  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }
}

exports.addToCart = async (req, res) => {
  console.log("req.body", req.body);

  const { userId, productId, productCount } = req.body;

  try {

    if (!userId || !productId || !productCount) {
      return response(res, 201, { message: "Oops ! Invalid details !" });
    }
    const user = await User.findById(userId)
    if (!user) {
      return response(res, 201, { message: "Oops ! User Done not Exist !" });
    }

    const product = await Product.findById(productId)
    if (!product) {
      return response(res, 201, { message: "Oops ! Product Done not Exist !" });
    }

    const oldCart = await Cart.findOne({ userId, productId })


    if (oldCart) {
      oldCart.productCount += parseInt(productCount)
      await oldCart.save()

      return response(res, 200, {
        message: "Add Cart Successfully !!",
        cart: oldCart
      });
    }

    const cart = await new Cart()
    cart.userId = user._id
    cart.productId = product._id
    cart.productCode = product.productCode
    cart.productCount = parseInt(productCount)
    await cart.save()

    const latestCart = {
      ...cart._doc,
      title: product.title,
      price: product.price,
      oldPrice: product.oldPrice,
      discount: product.discount,
      shippingCharge: product.shippingCharge,
      productImage: product.productImage,
      outOfStock: product.outOfStock,
      savePrice: (product.oldPrice - product.price),
      finalPrice: (product.price * cart.productCount),
      finalOldPrice: (product.oldPrice * cart.productCount),
      finalSavePrice: ((product.oldPrice * cart.productCount) - (product.price * cart.productCount))
    }

    return response(res, 200, {
      message: "Add Cart Successfully !!",
      cart: latestCart
    });



  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }

}

exports.addRemoveCartProduct = async (req, res) => {
  console.log("req.body", req.body);

  const { cartId, action, price, oldPrice } = req.body;

  if (!cartId || action === "") {
    return response(res, 201, { message: "Oops ! Invalid details !" });
  }

  try {
    const cart = await Cart.findById(cartId);

    if (!cart) {
      return response(res, 201, { message: "Oops ! Invalid CartId !" });
    }

    cart.productCount += action ? 1 : -1;
    await cart.save();

    const latestCart = {
      ...cart._doc,
      finalPrice: price * cart.productCount,
      finalOldPrice: oldPrice * cart.productCount,
      finalSavePrice: ((oldPrice * cart.productCount) - (price * cart.productCount)),
    };

    console.log("cart", latestCart);

    return response(res, 200, {
      message: "Add Cart Successfully !!",
      cart: latestCart,
    });



  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }

}


exports.deleteCart = async (req, res) => {
  console.log("req.query", req.query);
  try {
    if (!req.query.cartId) {
      return response(res, 201, { message: "Oops ! Invalid details !" });
    }
    const cart = await Cart.findById(req.query.cartId)
    if (!cart) {
      return response(res, 201, { message: "Oops ! Invalid Cart Id !" });
    }
    await cart.deleteOne()
    return response(res, 200, { message: "Cart Delete Successfully !!" });

  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }

}