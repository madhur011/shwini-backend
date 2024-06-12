const {
  Product,
  Category,
  Attributes,
  Wishlist,
} = require("../model/index.model");
const { deleteFiles, deleteFilesPath } = require("../utils/deleteFile");
const { uniqueId } = require("../utils/function");
const { response } = require("../utils/response");
const mongoose = require("mongoose");

// =================== Cretate product ==========================
exports.createProduct = async (req, res) => {
  console.log("req.body", req.body);
  // console.log("req.file", req.files);

  const productImages = req.files.reduce((acc, file) => {
    const matches = file.fieldname.match(/\[(\d+)\]\[(\d+)\]/);
    if (matches && matches.length === 3) {
      const [_, outerIndex, innerIndex] = matches.map(Number);
      acc[outerIndex] = acc[outerIndex] || [];
      acc[outerIndex][innerIndex] = file;
    }
    return acc;
  }, []);

  // Now, you have an object where each key is a unique filename, and the associated value is an array of file objects with that filename
  console.log("00000000000000000000", productImages);

  try {
    if (
      !req.body ||
      !req.body.title ||
      !req.body.price ||
      !req.body.oldPrice ||
      !req.body.shippingCharge ||
      !req.body.febric ||
      !req.body.craft ||
      !req.body.work ||
      !req.body.size ||
      !req.body.patten ||
      !req.body.color ||
      !req.body.sizeB ||
      !req.body.colorB ||
      !req.body.sku ||
      !req.body.purity ||
      !productImages ||
      !req.body.length ||
      !req.body.breath ||
      !req.body.height ||
      !req.body.weight
    ) {
      deleteFiles(req.files);
      return response(res, 201, { message: "Oops ! Invalid details !" });
    }

    const {
      title,
      price,
      oldPrice,
      shippingCharge,
      craft,
      work,
      size,
      patten,
      colorB,
      sizeB,
      febric,
      color,
      categoryId,
      productCode,
      sku,
      purity,
      length,
      breath,
      height,
      weight,
    } = req.body;
    const totalColor = color.length;
    // const productCode = uniqueId(8)
    const discountAmount = oldPrice - price;
    const discount = (discountAmount / oldPrice) * 100;

    const products = [];

    for (let i = 0; i < totalColor; i++) {
      const product = {
        title,
        price,
        oldPrice,
        shippingCharge,
        craft,
        work,
        stock: req.body.stock[i],
        color: color[i],
        size: size[i],
        colorB: colorB[i],
        sizeB: sizeB[i],
        febric,
        discount: discount.toFixed(),
        patten,
        productCode,
        categoryId,
        sku,
        purity,
        productImage: productImages[i].map((image) => image.path),
        length,
        breath,
        height,
        weight,
      };
      products.push(product);
    }
    await Product.insertMany(products);
    return response(res, 200, {
      message: "Product Get Successfully !!",
      products,
    });
  } catch (error) {
    console.error(error);
    return response(res, 500, error);
  }
};
exports.createFakeProduct = async (req, res) => {
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const data = [];
  for (let i = 0; i < 100000; i++) {
    const entry = {
      totalProduct: getRandomInt(1, 10),
      title: "Product " + getRandomInt(1, 1000),
      price: getRandomInt(100, 5000),
      oldPrice: getRandomInt(100, 5000),
      discount: getRandomInt(0, 50),
      shippingCharge: getRandomInt(0, 100),
      color: ["Red", "Blue", "Green", "Yellow"][getRandomInt(0, 3)],
      fabric: "Fabric " + getRandomInt(1, 20),
      productCode: getRandomInt(10000000, 99999999).toString(),
      productImage: Array.from({ length: 5 }, () => {
        const imageId = getRandomInt(1, 1000);
        return `https://picsum.photos/200/300?image=${imageId}`;
      }),
      categoryId: [
        "650156f04adace69dff9d8d9",
        "650156fe4adace69dff9d8db",
        "650157084adace69dff9d8dd",
        "6501571d4adace69dff9d8df",
      ][getRandomInt(0, 3)],
    };
    data.push(entry);
  }
  await Product.insertMany(data);
  return response(res, 200, {
    message: "Product Get Successfully !!",
    products: data,
  });
};

// =================== Show product ==========================

exports.getProduct = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const skip = page * limit;

    const search = req.query.search;
    const fieldsToSearch = [
      "title",
      "price",
      "craeft",
      "work",
      "patten",
      "purity",
      "sku",
      "oldPrice",
      "discount",
      "shippingCharge",
      "febric",
      "productCode",
      "categoryName",
    ];
    const numericSearch = !isNaN(search) ? parseFloat(search) : search;

    const matchQuery = search !== "ALL" && {
      $or: [
        {
          $or: fieldsToSearch.map((field) => ({
            [field]: { $regex: search, $options: "i" },
          })),
        },
        { $or: fieldsToSearch.map((field) => ({ [field]: numericSearch })) },
      ],
    };

    const countPipeline = [
      {
        $match: matchQuery,
      },
      {
        $group: {
          _id: "$productCode",
        },
      },
      {
        $count: "totalCount",
      },
    ];

    const aggregationPipeline = [
      {
        $match: matchQuery,
      },
      {
        $group: {
          _id: "$productCode",
          totalProduct: { $sum: 1 },
          title: { $first: "$title" },
          price: { $first: "$price" },
          oldPrice: { $first: "$oldPrice" },
          discount: { $first: "$discount" },
          shippingCharge: { $first: "$shippingCharge" },
          craft: { $first: "$craft" },
          patten: { $first: "$patten" },
          purity: { $first: "$purity" },
          sku: { $first: "$sku" },
          work: { $first: "$work" },
          colorB: { $first: "$colorB" },
          sizeB: { $first: "$sizeB" },
          size: { $first: "$size" },
          color: { $push: "$color" },
          febric: { $first: "$febric" },
          outOfStock: { $first: "$outOfStock" },
          productCode: { $first: "$productCode" },
          categoryId: { $first: "$categoryId" },
          productImage: { $first: "$productImage" },
          newCollection: { $first: "$newCollection" },
          weddingCollection: { $first: "$weddingCollection" },
          createdAt: { $first: "$createdAt" },
          length: { $first: "$length" },
          breadth: { $first: "$breadth" },
          height: { $first: "$height" },
          weight: { $first: "$weight" },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "categoryId",
        },
      },
      {
        $unwind: {
          path: "$categoryId",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          totalProduct: 1,
          price: 1,
          oldPrice: 1,
          discount: 1,
          outOfStock: 1,
          shippingCharge: 1,
          febric: 1,
          craft: 1,
          work: 1,
          patten: 1,
          purity: 1,
          sku: 1,
          colorB: 1,
          sizeB: 1,
          size: 1,
          productCode: 1,
          categoryId: "$categoryId._id",
          categoryName: "$categoryId.categoryName",
          color: 1,
          productImage: 1,
          newCollection: 1,
          weddingCollection: 1,
          createdAt: 1,
          length: 1,
          breadth: 1,
          height: 1,
          weight: 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ];

    const [countResult] = await Product.aggregate(countPipeline);
    const totalCount = countResult?.totalCount || 0;

    const result = await Product.aggregate(aggregationPipeline);
    const paginatedResults = result || [];

    return response(res, 200, {
      message: "Product Get Successfully !!",
      product: paginatedResults,
      productTotal: totalCount,
    });
  } catch (error) {
    console.error(error);
    return response(res, 500, error);
  }
};

exports.singleProductWithAllColor = async (req, res) => {
  try {
    if (!req.query.productCode) {
      return response(res, 201, { message: "Oops ! Invalid details !" });
    }

    const product = await Product.find({ productCode: req.query.productCode });

    if (!product) {
      return response(res, 201, { message: "Oops ! Invalid productCode !" });
    }

    return response(res, 200, {
      message: "Product Get Successfully !!",
      product,
    });
  } catch (error) {
    console.error(error);
    return response(res, 500, error);
  }
};

// =================== Update product ==========================

exports.editProductDetails = async (req, res) => {
  try {
    if (!req.body || !req.body.productCode) {
      return response(res, 201, { message: "Oops ! Invalid details !" });
    }

    const productCode = await Product.findOne({
      productCode: req.body.productCode,
    });

    if (!productCode) {
      return response(res, 201, { message: "Oops! Invalid Product Code!" });
    }

    const categoryName = await Product.populate(req.body, {
      path: "categoryId",
    });

    const discountAmount = req.body.oldPrice - req.body.price;
    const discount = (discountAmount / req.body.oldPrice) * 100;

    const updateData = {
      title: req.body.title || productCode.title,
      febric: req.body.febric || productCode.febric,
      price: req.body.price || productCode.price,
      oldPrice: req.body.oldPrice || productCode.oldPrice,
      craft: req.body.craft || productCode.craft,
      work: req.body.work || productCode.work,
      patten: req.body.patten || productCode.patten,
      purity: req.body.purity || productCode.purity,
      sku: req.body.sku || productCode.sku,
      discount: discount.toFixed(),
      shippingCharge: req.body.shippingCharge || productCode.shippingCharge,
      productCode: productCode.productCode,
      categoryId: categoryName.categoryId._id,
      categoryName: categoryName.categoryId.categoryName,
      length: req.body.length || productCode.length,
      breadth: req.body.breadth || productCode.breadth,
      height: req.body.height || productCode.height,
      weight: req.body.weight || productCode.weight,
    };

    await Product.updateMany(
      { productCode: req.body.productCode },
      { $set: updateData }
    );

    // console.log("updateData", updateData);

    return response(res, 200, {
      message: "Product Get Successfully !!",
      product: updateData,
    });
  } catch (error) {
    console.error(error);
    return response(res, 500, error);
  }
};

exports.editProductColor = async (req, res) => {
  console.log("req.body", req.body);
  console.log("req.files", req.files);
  console.log("req.query", req.query);

  try {
    if (!req.query.productId) {
      deleteFiles(req.files);
      return response(res, 201, { message: "Oops ! Invalid details !" });
    }

    const product = await Product.findById(req.query.productId);

    if (!product) {
      deleteFiles(req.files);
      return response(res, 201, { message: "Oops ! Invalid Product Id !" });
    }

    const productImageBody = req.body.productImage;

    console.log("product.outOfStock", product.outOfStock);
    console.log("req.body.stock", parseInt(req.body.stock));

    if (product.outOfStock && parseInt(req.body.stock) > 0) {
      product.outOfStock = false;
    }

    product.size = req.body.size || product.size;
    product.stock = req.body.stock || product.stock;
    product.sizeB = req.body.sizeB || product.sizeB;
    console.log("-----");
    const productImageArray = [];
    if (req.files.length > 0) {
      deleteFilesPath(req.files);
      for (let i = 0; i < req.files.length; i++) {
        productImageArray.push(req.files[i].path);
      }
      console.log("productImageArray1", productImageArray);
      if (productImageBody) {
        for (let i = 0; i < productImageBody.length; i++) {
          const regex = /storage\/.*/;
          productImageArray.push(productImageBody[i].match(regex)[0]);
        }
      }
      product.productImage = productImageArray;
    }
    console.log("productImageArray2", productImageArray);
    console.log("product", product);
    await product.save();

    return response(res, 200, {
      message: "Product Get Successfully !!",
      product,
    });
  } catch (error) {
    console.error(error);
    return response(res, 500, error);
  }
};

// =================== cretate product ==========================

exports.deleteProducts = async (req, res) => {
  console.log("req.query", req.query);
  try {
    if (!req.query.productCode) {
      return response(res, 201, { message: "Oops ! Invalid details !" });
    }

    const product = await Product.find({ productCode: req.query.productCode });
    if (!product) {
      return response(res, 201, { message: "Oops ! Invalid product Id !" });
    }
    for (let i = 0; i < product.length; i++) {
      deleteFilesPath(product[i].productImage);
    }
    await Product.deleteMany({ productCode: req.query.productCode });

    return response(res, 200, {
      message: "Product Delete Successfully !!",
    });
  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }
};
exports.deleteProductColor = async (req, res) => {
  console.log("req.query", req.query);
  try {
    if (!req.query.productId) {
      return response(res, 201, { message: "Oops ! Invalid details !" });
    }

    const product = await Product.findById(req.query.productId);
    if (!product) {
      return response(res, 201, { message: "Oops ! Invalid product Id !" });
    }
    deleteFilesPath(product.productImage);
    await product.deleteOne();

    return response(res, 200, {
      message: "Product Delete Successfully !!",
    });
  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }
};

// =================== Edit Single Value product ==========================
exports.updateSingleValue = async (req, res) => {
  try {
    const { productId, type } = req.query;

    const product = await Product.findById(productId);

    if (!productId || !product) {
      return response(res, 201, {
        message: "Oops! Invalid details or product Id!",
      });
    }

    if (type === "inStock") product.outOfStock = !product.outOfStock;
    if (product.outOfStock) {
      product.stock = 0;
    }
    if (type === "collection") product.newCollection = !product.newCollection;

    await product.save();

    return response(res, 200, {
      message: "Product updated successfully!",
      product,
    });
  } catch (error) {
    console.error(error);
    return response(res, 500, error);
  }
};
// =================== Edit Multiple Value product ==========================
exports.updateMultipleValue = async (req, res) => {
  try {
    const { productCode, type } = req.query;

    const product = await Product.findOne({ productCode: productCode });

    if (!productCode || !product) {
      return response(res, 201, {
        message: "Oops! Invalid details or product Id!",
      });
    }

    let updatedNewCollection;
    if (type == "newCollection") {
      updatedNewCollection = !product.newCollection;
      await Product.updateMany(
        { productCode },
        { $set: { newCollection: updatedNewCollection } }
      );
    }
    let updatedWeddingCollection;
    if (type == "weddingCollection") {
      updatedWeddingCollection = !product.weddingCollection;
      await Product.updateMany(
        { productCode },
        { $set: { weddingCollection: updatedWeddingCollection } }
      );
    }

    const newProduct = {
      productCode,
      newCollection: updatedNewCollection,
      weddingCollection: updatedWeddingCollection,
    };

    console.log("newProduct", newProduct);

    return response(res, 200, {
      message: "Product updated successfully!",
      newProduct,
    });
  } catch (error) {
    console.error(error);
    return response(res, 500, error);
  }
};

// =================================== Website API =======================================

exports.bestSellerProduct = async (req, res) => {
  try {
    const { userId } = req.query;

    let wishlistProducts = [];

    if (userId && userId !== "undefined") {
      console.log("userId", userId);
      wishlistProducts = await Wishlist.find({ userId }).distinct("productId");
    }

    const aggregationPipeline = [
      // {
      //   $match: matchQuery
      // },
      {
        $group: {
          _id: "$productCode",
          productId: { $push: "$_id" },
          totalProduct: { $sum: 1 },
          title: { $first: "$title" },
          price: { $first: "$price" },
          oldPrice: { $first: "$oldPrice" },
          discount: { $first: "$discount" },
          craft: { $first: "$craft" },
          work: { $first: "$work" },
          outOfStock: { $first: "$outOfStock" },
          shippingCharge: { $first: "$shippingCharge" },
          color: { $push: "$color" },
          febric: { $first: "$febric" },
          productCode: { $first: "$productCode" },
          categoryId: { $first: "$categoryId" },
          productImage: { $push: { $first: "$productImage" } },
          createdAt: { $first: "$createdAt" },
          wishlist: {
            $push: {
              $cond: {
                if: { $in: ["$_id", wishlistProducts] },
                then: true,
                else: false,
              },
            },
          },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: 0,
      },
      {
        $limit: 12,
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "categoryId",
        },
      },
      {
        $unwind: {
          path: "$categoryId",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: "ratings",
          as: "rating",
          let: { productCode: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$productCode", "$$productCode"] },
              },
            },
            {
              $group: {
                _id: "$productCode",
                total: { $sum: 1 },
                ratingCount: { $sum: "$ratingCount" },
              },
            },
            {
              $project: {
                _id: 1,
                total: 1,
                ratingCount: 1,
                totalRating: {
                  $divide: ["$ratingCount", "$total"],
                },
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$rating",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          productId: 1,
          title: 1,
          totalProduct: 1,
          price: 1,
          outOfStock: 1,
          oldPrice: 1,
          discount: 1,
          craft: 1,
          work: 1,
          shippingCharge: 1,
          febric: 1,
          productCode: 1,
          categoryId: "$categoryId._id",
          categoryName: "$categoryId.categoryName",
          color: 1,
          productImage: 1,
          createdAt: 1,
          wishlist: 1,
          rating: 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ];

    const result = await Product.aggregate(aggregationPipeline);
    const paginatedResults = result || [];
    console.log(paginatedResults);
    return response(res, 200, {
      message: "Product Get Successfully !!",
      product: paginatedResults,
    });
  } catch (error) {
    console.error(error);
    return response(res, 500, error);
  }
};

// show single product
exports.showSingleProduct = async (req, res) => {
  try {
    const { userId } = req.query;

    const productCode = await Product.findOne({
      productCode: req.query.productCode,
    });

    if (!req.query.productCode || !productCode) {
      return response(res, 201, {
        message: "Oops! Invalid details or product Code!",
      });
    }
    let productId = [];

    if (userId && userId != "undefined") {
      console.log("userId", userId);
      productId = await Wishlist.find({
        userId,
        productCode: productCode.productCode,
      }).distinct("productId");
    }
    // console.log("productId", productId);

    const aggregationPipeline = [
      {
        $match: { productCode: productCode.productCode },
      },
      {
        $group: {
          _id: "$productCode",
          totalProduct: { $sum: 1 },
          title: { $first: "$title" },
          price: { $first: "$price" },
          oldPrice: { $first: "$oldPrice" },
          discount: { $first: "$discount" },
          shippingCharge: { $first: "$shippingCharge" },
          color: { $push: "$color" },
          febric: { $first: "$febric" },
          craft: { $first: "$craft" },
          outOfStock: { $first: "$outOfStock" },
          size: { $first: "$size" },
          work: { $first: "$work" },
          productCode: { $first: "$productCode" },
          categoryId: { $first: "$categoryId" },
          productImage: { $first: "$productImage" },
          createdAt: { $first: "$createdAt" },
          allProduct: { $push: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "categoryId",
        },
      },
      {
        $unwind: {
          path: "$categoryId",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: "ratings", // Name of the ratings collection
          as: "rating",
          let: { productCode: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$productCode", "$$productCode"] },
              },
            },
            {
              $group: {
                _id: "$productCode",
                total: { $sum: 1 },
                ratingCount: { $sum: "$ratingCount" },
              },
            },
            {
              $project: {
                _id: 1,
                total: 1,
                ratingCount: 1,
                totalRating: {
                  $divide: ["$ratingCount", "$total"],
                },
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$rating",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          totalProduct: 1,
          price: 1,
          oldPrice: 1,
          discount: 1,
          shippingCharge: 1,
          febric: 1,
          size: 1,
          outOfStock: 1,
          productCode: 1,
          categoryId: "$categoryId._id",
          categoryName: "$categoryId.categoryName",
          color: 1,
          craft: 1,
          work: 1,
          productImage: 1,
          createdAt: 1,
          rating: 1,
          allProduct: {
            $map: {
              input: "$allProduct",
              as: "productItem",
              in: {
                $mergeObjects: [
                  "$$productItem",
                  {
                    wishlist: {
                      $cond: {
                        if: { $in: ["$$productItem._id", productId] },
                        then: true,
                        else: false,
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
    ];

    const result = await Product.aggregate(aggregationPipeline);
    const paginatedResults = result[0] || [];

    return response(res, 200, {
      message: "Product Get Successfully !!",
      product: paginatedResults,
    });
  } catch (error) {
    console.error(error);
    return response(res, 500, error);
  }
};

// All product
exports.allProduct = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 40;
    const skip = page * limit;

    console.log("req.query", req.query);

    const { userId, category, color, febric, price } = req.query;

    const filterUndefined = (value) => (value === "undefined" ? null : value);

    const categoryFilter = filterUndefined(category);
    const colorFilter = filterUndefined(color);
    const febricFilter = filterUndefined(febric);
    const priceFilter = filterUndefined(price);

    const matchCategory = categoryFilter
      ? { categoryId: new mongoose.Types.ObjectId(categoryFilter) }
      : { categoryId: { $ne: null } };
    const matchColor = colorFilter
      ? { color: colorFilter }
      : { color: { $ne: null } };
    const matchFebric = febricFilter
      ? { febric: febricFilter }
      : { febric: { $ne: null } };
    const matchPrice = priceFilter
      ? { price: { $lte: parseInt(priceFilter) } }
      : { price: { $ne: null } };

    const mergedMatch = {
      $and: [matchCategory, matchColor, matchFebric, matchPrice],
    };

    let wishlistProducts = [];

    if (userId && userId !== "undefined") {
      console.log("userId", userId);
      wishlistProducts = await Wishlist.find({ userId }).distinct("productId");
    }

    const countPipeline = [
      { $match: mergedMatch },
      { $group: { _id: "$productCode" } },
      { $count: "totalCount" },
    ];

    const aggregationPipeline = [
      { $match: mergedMatch },
      {
        $group: {
          _id: "$productCode",
          productId: { $push: "$_id" },
          totalProduct: { $sum: 1 },
          title: { $first: "$title" },
          price: { $first: "$price" },
          oldPrice: { $first: "$oldPrice" },
          discount: { $first: "$discount" },
          craft: { $first: "$craft" },
          work: { $first: "$work" },
          outOfStock: { $first: "$outOfStock" },
          shippingCharge: { $first: "$shippingCharge" },
          color: { $push: "$color" },
          febric: { $first: "$febric" },
          productCode: { $first: "$productCode" },
          categoryId: { $first: "$categoryId" },
          productImage: { $push: { $first: "$productImage" } },
          createdAt: { $first: "$createdAt" },
          wishlist: {
            $push: {
              $cond: {
                if: { $in: ["$_id", wishlistProducts] },
                then: true,
                else: false,
              },
            },
          },
        },
      },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "ratings", // Name of the ratings collection
          as: "rating",
          let: { productCode: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$productCode", "$$productCode"] },
              },
            },
            {
              $group: {
                _id: "$productCode",
                total: { $sum: 1 },
                ratingCount: { $sum: "$ratingCount" },
              },
            },
            {
              $project: {
                _id: 1,
                total: 1,
                ratingCount: 1,
                totalRating: {
                  $divide: ["$ratingCount", "$total"],
                },
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$rating",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $sort: { createdAt: -1 } },
    ];

    const productResults = await Product.aggregate(aggregationPipeline);
    const [countResult] = await Product.aggregate(countPipeline);

    return response(res, 200, {
      message: "Product Get Successfully !!",
      product: productResults || [],
      totalCount: countResult?.totalCount || 0,
    });
  } catch (error) {
    console.error(error);
    return response(res, 500, error);
  }
};

// category wise product
exports.categoryWiseProduct = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const skip = page * limit;
    console.log("req.query.categoryId", req.query);
    if (!req.query.categoryId || req.query.categoryId == "null") {
      return response(res, 201, { message: "Oops! Invalid details !" });
    }

    const categoryId = await Category.findById(req.query.categoryId);

    console.log("req.query.categoryId", req.query.categoryId);
    console.log("categoryId", categoryId);

    const { userId, color, febric, price } = req.query;
    let wishlistProducts = [];

    if (userId && userId !== "undefined") {
      console.log("userId", userId);
      wishlistProducts = await Wishlist.find({ userId }).distinct("productId");
    }

    if (!categoryId) {
      return response(res, 201, {
        message: "Oops! Invalid details or categoryId!",
      });
    }

    const filterUndefined = (value) => (value === "undefined" ? null : value);

    const colorFilter = filterUndefined(color);
    const febricFilter = filterUndefined(febric);
    const priceFilter = filterUndefined(price);

    const matchColor = colorFilter
      ? { color: colorFilter }
      : { color: { $ne: null } };
    const matchFebric = febricFilter
      ? { febric: febricFilter }
      : { febric: { $ne: null } };
    const matchPrice = priceFilter
      ? { price: { $lte: parseInt(priceFilter) } }
      : { price: { $ne: null } };

    const mergedMatch = { $and: [matchColor, matchFebric, matchPrice] };

    const countPipeline = [
      { $match: { categoryId: categoryId._id } },
      { $match: mergedMatch },
      { $group: { _id: "$productCode" } },
      { $count: "totalCount" },
    ];

    const aggregationPipeline = [
      { $match: { categoryId: categoryId._id } },
      { $match: mergedMatch },
      {
        $group: {
          _id: "$productCode",
          productId: { $push: "$_id" },
          totalProduct: { $sum: 1 },
          title: { $first: "$title" },
          price: { $first: "$price" },
          oldPrice: { $first: "$oldPrice" },
          discount: { $first: "$discount" },
          craft: { $first: "$craft" },
          work: { $first: "$work" },
          patten: { $first: "$patten" },
          purity: { $first: "$purity" },
          sku: { $first: "$sku" },
          shippingCharge: { $first: "$shippingCharge" },
          color: { $push: "$color" },
          febric: { $first: "$febric" },
          outOfStock: { $first: "$outOfStock" },
          productCode: { $first: "$productCode" },
          categoryId: { $first: "$categoryId" },
          productImage: { $push: { $first: "$productImage" } },
          createdAt: { $first: "$createdAt" },
          length: { $first: "$length" },
          breadth: { $first: "$breadth" },
          height: { $first: "$height" },
          weight: { $first: "$weight" },
          wishlist: {
            $push: {
              $cond: {
                if: { $in: ["$_id", wishlistProducts] },
                then: true,
                else: false,
              },
            },
          },
        },
      },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "ratings", // Name of the ratings collection
          as: "rating",
          let: { productCode: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$productCode", "$$productCode"] },
              },
            },
            {
              $group: {
                _id: "$productCode",
                total: { $sum: 1 },
                ratingCount: { $sum: "$ratingCount" },
              },
            },
            {
              $project: {
                _id: 1,
                total: 1,
                ratingCount: 1,
                totalRating: {
                  $divide: ["$ratingCount", "$total"],
                },
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$rating",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $sort: { createdAt: -1 } },
    ];
    const productResults = await Product.aggregate(aggregationPipeline);
    const [countResult] = await Product.aggregate(countPipeline);

    return response(res, 200, {
      message: "Product Get Successfully !!",
      product: productResults || [],
      totalCount: countResult?.totalCount || 0,
    });
  } catch (error) {
    console.error(error);
    return response(res, 500, error);
  }
};

// Colletion product
exports.colletionProduct = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 40;
    const skip = page * limit;

    const { userId, color, febric, price, category, type } = req.query;
    let wishlistProducts = [];

    if (userId && userId !== "undefined") {
      console.log("userId", userId);
      wishlistProducts = await Wishlist.find({ userId }).distinct("productId");
    }
    const filterUndefined = (value) => (value === "undefined" ? null : value);

    const categoryFilter = filterUndefined(category);
    const colorFilter = filterUndefined(color);
    const febricFilter = filterUndefined(febric);
    const priceFilter = filterUndefined(price);

    const matchQuery = {};
    if (type === "new" || type === "wedding") {
      matchQuery[type + "Collection"] = true;
    }

    const matchCategory = categoryFilter
      ? { categoryId: new mongoose.Types.ObjectId(categoryFilter) }
      : { categoryId: { $ne: null } };
    const matchColor = colorFilter
      ? { color: colorFilter }
      : { color: { $ne: null } };
    const matchFebric = febricFilter
      ? { febric: febricFilter }
      : { febric: { $ne: null } };
    const matchPrice = priceFilter
      ? { price: { $lte: parseInt(priceFilter) } }
      : { price: { $ne: null } };

    const mergedMatch = {
      $and: [matchQuery, matchCategory, matchColor, matchFebric, matchPrice],
    };

    const countPipeline = [
      { $match: mergedMatch },
      { $group: { _id: "$productCode" } },
      { $count: "totalCount" },
    ];

    const aggregationPipeline = [
      { $match: mergedMatch },
      {
        $group: {
          _id: "$productCode",
          productId: { $push: "$_id" },
          totalProduct: { $sum: 1 },
          title: { $first: "$title" },
          price: { $first: "$price" },
          oldPrice: { $first: "$oldPrice" },
          discount: { $first: "$discount" },
          craft: { $first: "$craft" },
          work: { $first: "$work" },
          patten: { $first: "$patten" },
          purity: { $first: "$purity" },
          sku: { $first: "$sku" },
          outOfStock: { $first: "$outOfStock" },
          shippingCharge: { $first: "$shippingCharge" },
          color: { $push: "$color" },
          febric: { $first: "$febric" },
          productCode: { $first: "$productCode" },
          categoryId: { $first: "$categoryId" },
          productImage: { $push: { $first: "$productImage" } },
          createdAt: { $first: "$createdAt" },
          length: { $first: "$length" },
          breadth: { $first: "$breadth" },
          height: { $first: "$height" },
          weight: { $first: "$weight" },
          wishlist: {
            $push: {
              $cond: {
                if: { $in: ["$_id", wishlistProducts] },
                then: true,
                else: false,
              },
            },
          },
        },
      },
      { $skip: skip },
      { $limit: limit },
      { $sort: { price: 1 } },
    ];

    const productResults = await Product.aggregate(aggregationPipeline);
    const [countResult] = await Product.aggregate(countPipeline);

    return response(res, 200, {
      message: "Product Get Successfully !!",
      product: productResults || [],
      totalCount: countResult?.totalCount || 0,
    });
  } catch (error) {
    console.error(error);
    return response(res, 500, error);
  }
};

// Budget in product
exports.budgetPoduct = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 40;
    const skip = page * limit;

    const { userId, color, febric, price, category, type } = req.query;
    let wishlistProducts = [];

    if (userId && userId !== "undefined") {
      console.log("userId", userId);
      wishlistProducts = await Wishlist.find({ userId }).distinct("productId");
    }
    const filterUndefined = (value) => (value === "undefined" ? null : value);

    const categoryFilter = filterUndefined(category);
    const colorFilter = filterUndefined(color);
    const febricFilter = filterUndefined(febric);

    const matchCategory = categoryFilter
      ? { categoryId: new mongoose.Types.ObjectId(categoryFilter) }
      : { categoryId: { $ne: null } };
    const matchColor = colorFilter
      ? { color: colorFilter }
      : { color: { $ne: null } };
    const matchFebric = febricFilter
      ? { febric: febricFilter }
      : { febric: { $ne: null } };

    const mergedMatch = {
      $and: [matchCategory, matchColor, matchFebric],
    };
    console.log("mergedMatch", mergedMatch);

    const countPipeline = [
      {
        $match: { price: { $lte: parseInt(price) } },
      },
      {
        $match: mergedMatch,
      },
      {
        $group: {
          _id: "$productCode",
        },
      },
      {
        $count: "totalCount",
      },
    ];

    const aggregationPipeline = [
      {
        $match: { price: { $lte: parseInt(price) } },
      },
      {
        $match: mergedMatch,
      },
      {
        $group: {
          _id: "$productCode",
          productId: { $push: "$_id" },
          totalProduct: { $sum: 1 },
          title: { $first: "$title" },
          price: { $first: "$price" },
          oldPrice: { $first: "$oldPrice" },
          discount: { $first: "$discount" },
          craft: { $first: "$craft" },
          work: { $first: "$work" },
          patten: { $first: "$patten" },
          purity: { $first: "$purity" },
          sku: { $first: "$sku" },
          outOfStock: { $first: "$outOfStock" },
          shippingCharge: { $first: "$shippingCharge" },
          color: { $push: "$color" },
          febric: { $first: "$febric" },
          productCode: { $first: "$productCode" },
          categoryId: { $first: "$categoryId" },
          productImage: { $push: { $first: "$productImage" } },
          createdAt: { $first: "$createdAt" },
          length: { $first: "$length" },
          breadth: { $first: "$breadth" },
          height: { $first: "$height" },
          weight: { $first: "$weight" },
          wishlist: {
            $push: {
              $cond: {
                if: { $in: ["$_id", wishlistProducts] },
                then: true,
                else: false,
              },
            },
          },
        },
      },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "ratings", // Name of the ratings collection
          as: "rating",
          let: { productCode: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$productCode", "$$productCode"] },
              },
            },
            {
              $group: {
                _id: "$productCode",
                total: { $sum: 1 },
                ratingCount: { $sum: "$ratingCount" },
              },
            },
            {
              $project: {
                _id: 1,
                total: 1,
                ratingCount: 1,
                totalRating: {
                  $divide: ["$ratingCount", "$total"],
                },
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$rating",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $sort: { price: -1 } },
    ];

    const productResults = await Product.aggregate(aggregationPipeline);
    console.log("productResults", productResults);

    const [countResult] = await Product.aggregate(countPipeline);
    return response(res, 200, {
      message: "Product Get Successfully !!",
      product: productResults || [],
      totalCount: countResult?.totalCount || 0,
    });
  } catch (error) {
    console.error(error);
    return response(res, 500, error);
  }
};

// ======== get Mega Menu ==================

// All Color in product
exports.getAllAttribute = async (req, res) => {
  try {
    const [color, febric] = await Promise.all([
      Attributes.findOne({ attrName: "Color" }),
      Attributes.findOne({ attrName: "Febric" }),
    ]);

    return response(res, 200, {
      message: "Color Get Successfully !!",
      color: color.details,
      febric: febric.details,
    });
  } catch (error) {
    console.error(error);
    return response(res, 500, error);
  }
};

// Attribute Wise in product
exports.getAttibuteWiseproduct = async (req, res) => {
  try {
    const { userId, color, febric, price, category, type, value, page, limit } =
      req.query;

    if (!type || !value) {
      return response(res, 201, { message: "Oops! Invalid details!" });
    }

    const attribute = { [type]: value };

    const wishlistProducts =
      userId && userId !== "undefined"
        ? await Wishlist.find({ userId }).distinct("productId")
        : [];

    const filterUndefined = (value) => (value === "undefined" ? null : value);

    const categoryFilter = filterUndefined(category);
    const colorFilter = filterUndefined(color);
    const febricFilter = filterUndefined(febric);
    const priceFilter = filterUndefined(price);

    const matchCategory = categoryFilter
      ? { categoryId: new mongoose.Types.ObjectId(categoryFilter) }
      : { categoryId: { $ne: null } };
    const matchColor = colorFilter
      ? { color: colorFilter }
      : { color: { $ne: null } };
    const matchFebric = febricFilter
      ? { febric: febricFilter }
      : { febric: { $ne: null } };
    const matchPrice = priceFilter
      ? { price: { $lte: parseInt(priceFilter) } }
      : { price: { $ne: null } };

    const mergedMatch = {
      $and: [matchCategory, matchColor, matchFebric, matchPrice],
    };

    const countPipeline = [
      { $match: attribute },
      { $match: mergedMatch },
      { $count: "totalCount" },
    ];

    const aggregationPipeline = [
      { $match: attribute },
      { $match: mergedMatch },
      {
        $group: {
          _id: "$productCode",
          productId: { $push: "$_id" },
          totalProduct: { $sum: 1 },
          title: { $first: "$title" },
          price: { $first: "$price" },
          oldPrice: { $first: "$oldPrice" },
          discount: { $first: "$discount" },
          craft: { $first: "$craft" },
          work: { $first: "$work" },
          patten: { $first: "$patten" },
          purity: { $first: "$purity" },
          sku: { $first: "$sku" },
          shippingCharge: { $first: "$shippingCharge" },
          color: { $push: "$color" },
          febric: { $first: "$febric" },
          productCode: { $first: "$productCode" },
          categoryId: { $first: "$categoryId" },
          productImage: { $push: { $first: "$productImage" } },
          createdAt: { $first: "$createdAt" },
          length: { $first: "$length" },
          breadth: { $first: "$breadth" },
          height: { $first: "$height" },
          weight: { $first: "$weight" },
          wishlist: {
            $push: {
              $cond: {
                if: { $in: ["$_id", wishlistProducts] },
                then: true,
                else: false,
              },
            },
          },
        },
      },
      { $skip: parseInt(page) * parseInt(limit) || 0 },
      { $limit: parseInt(limit) || 40 },
      {
        $lookup: {
          from: "ratings", // Name of the ratings collection
          as: "rating",
          let: { productCode: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$productCode", "$$productCode"] },
              },
            },
            {
              $group: {
                _id: "$productCode",
                total: { $sum: 1 },
                ratingCount: { $sum: "$ratingCount" },
              },
            },
            {
              $project: {
                _id: 1,
                total: 1,
                ratingCount: 1,
                totalRating: {
                  $divide: ["$ratingCount", "$total"],
                },
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$rating",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $sort: { price: -1 } },
    ];

    const productResults = await Product.aggregate(aggregationPipeline);
    const [countResult] = await Product.aggregate(countPipeline);

    return response(res, 200, {
      message: "Product Get Successfully !!",
      product: productResults || [],
      totalCount: countResult?.totalCount || 0,
    });
  } catch (error) {
    console.error(error);
    return response(res, 500, error);
  }
};
