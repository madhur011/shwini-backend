const { Category } = require("../model/index.model");
const { deleteFile, deleteFilePath } = require("../utils/deleteFile");
const { response } = require("../utils/response")



exports.getCategory = async (req, res) => {
  try {
    const category = await Category.find().sort({ createdAt: -1 })
    return response(res, 200, {
      message: "category Get Successfully !!",
      category,
    });

  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }

}
exports.createCategory = async (req, res) => {
  console.log("req.body", req.body);
  console.log("req.file", req.file);

  try {
    if (!req.body || !req.body.categoryName || !req.file) {
      deleteFile(req?.file)
      return response(res, 201, { message: "Oops ! Invalid details !" });
    }

    const category = await new Category()
    category.categoryName = req.body.categoryName
    category.image = req.file.path
    await category.save()

    return response(res, 200, {
      message: "User Get Successfully !!",
      category,
    });

  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }

}
exports.updateCategory = async (req, res) => {
  console.log("req.query", req.query);
  try {
    if (!req.query.categoryId) {
      deleteFile(req?.file)
      return response(res, 201, { message: "Oops ! Invalid details !" });
    }

    const category = await Category.findById(req.query.categoryId)
    if (!category) {
      return response(res, 201, { message: "Oops ! Invalid category Id !" });
    }

    if (req.file) {
      deleteFilePath(category.image)
      category.image = req.file.path
    }
    category.categoryName = req.body.categoryName ? req.body.categoryName : category.categoryName
    await category.save()

    return response(res, 200, {
      message: "User Get Successfully !!",
      category,
    });

  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }

}
exports.deleteCategory = async (req, res) => {
  console.log("req.query", req.query);
  try {
    if (!req.query.categoryId) {
      return response(res, 201, { message: "Oops ! Invalid details !" });
    }

    const category = await Category.findById(req.query.categoryId)
    if (!category) {
      return response(res, 201, { message: "Oops ! Invalid category Id !" });
    }
    deleteFilePath(category.image)
    await category.deleteOne()

    return response(res, 200, {
      message: "User Get Successfully !!",
    });

  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }

}

