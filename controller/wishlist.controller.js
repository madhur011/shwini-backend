const { Wishlist, User, Product } = require("../model/index.model");
const { response } = require("../utils/response")



exports.getWishlist = async (req, res) => {
  try {

    const { userId } = req.query
    if (!userId) {
      return response(res, 201, { message: "Oops! Invalid details " });
    }

    if (userId != "undefined") {
      const user = await User.findById(userId);
      if (!user) {
        return response(res, 201, { message: "Oops! Invalid  Wishlist Id!" });
      }

      const aggregationPipeline = [
        {
          $match: { userId: user._id }
        },
        {
          $sort: { createdAt: -1 }
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
        }, {
          $project: {
            _id: 1,
            productCode: 1,
            userId: 1,
            productImage: "$productId.productImage",
            productId: "$productId._id",
            title: "$productId.title",
            price: "$productId.price",
            oldPrice: "$productId.oldPrice",
            discount: "$productId.discount",
            stock: "$productId.stock",
            color: "$productId.color",
            productCode: "$productId.productCode",
            outOfStock: "$productId.outOfStock",
            createdAt: 1,
          }
        }
      ]

      const wishlist = await Wishlist.aggregate(aggregationPipeline);
      return response(res, 200, {
        message: "wishlist Get Successfully !!",
        wishlist,
      });
    }

  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }
}


exports.createWishlist = async (req, res) => {
  console.log("req.query", req.query);

    const { userId, productId } = req.query;

    try {
      if (!userId || !productId) {
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
      const inWishlist = await Wishlist.findOne({ userId, productId })
      if (!inWishlist) {
        const wishlist = await new Wishlist()
        wishlist.userId = user._id
        wishlist.productId = product._id
        wishlist.productCode = product.productCode
        await wishlist.save()

        return response(res, 200, {
          message: "Add Wishlist Successfully !!",
          data: wishlist,
          wishlist: true,
        });
      } else {
        await Wishlist.deleteOne(inWishlist)
        return response(res, 200, {
          message: "Remove Wishlist Successfully !!",
          data: inWishlist,
          wishlist: false,
        });
      }


  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }

}


exports.deleteWishlist = async (req, res) => {
  console.log("req.query", req.query);
  try {
    if (!req.query.wishlistId) {
      return response(res, 201, { message: "Oops ! Invalid details !" });
    }
    const wishlist = await Wishlist.findById(req.query.wishlistId)
    if (!wishlist) {
      return response(res, 201, { message: "Oops ! Invalid Wishlist Id !" });
    }
    await wishlist.deleteOne()
    return response(res, 200, { message: "Wishlist Delete Successfully !!" });

  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }

}