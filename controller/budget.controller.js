const { Budget } = require("../model/index.model");
const { deleteFile, deleteFilePath } = require("../utils/deleteFile");
const { response } = require("../utils/response")



exports.getBudget = async (req, res) => {
  try {
    const budget = await Budget.find().sort({ budget: 1 })
    return response(res, 200, {
      message: "budget Get Successfully !!",
      budget,
    });

  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }

}
exports.createBudget = async (req, res) => {
  console.log("req.body", req.body);
  console.log("req.file", req.file);

  try {
    if (!req.body || !req.body.budget || !req.file) {
      deleteFile(req?.file)
      return response(res, 201, { message: "Oops ! Invalid details !" });
    }

    const budget = await new Budget()
    budget.budget = req.body.budget
    budget.image = req.file.path
    await budget.save()

    return response(res, 200, {
      message: "User Get Successfully !!",
      budget,
    });

  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }

}
exports.updateBudget = async (req, res) => {
  console.log("req.query", req.query);
  console.log("req.file", req.file);
  try {
    if (!req.query.budgetId) {
      deleteFile(req?.file)
      return response(res, 201, { message: "Oops ! Invalid details !" });
    }

    const budget = await Budget.findById(req.query.budgetId)
    if (!budget) {
      return response(res, 201, { message: "Oops ! Invalid budget Id !" });
    }

    if (req.file) {
      deleteFilePath(budget.image)
      budget.image = req.file.path
    }
    budget.budget = req.body.budget || budget.budget
    await budget.save()

    return response(res, 200, {
      message: "User Get Successfully !!",
      budget,
    });

  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }

}
exports.deleteBudget = async (req, res) => {
  console.log("req.query", req.query);
  try {
    if (!req.query.budgetId) {
      return response(res, 201, { message: "Oops ! Invalid details !" });
    }

    const budget = await Budget.findById(req.query.budgetId)
    if (!budget) {
      return response(res, 201, { message: "Oops ! Invalid budget Id !" });
    }
    deleteFilePath(budget.image)
    await budget.deleteOne()

    return response(res, 200, {
      message: "User Get Successfully !!",
    });

  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }

}

