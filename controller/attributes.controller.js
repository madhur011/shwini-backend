const { Attributes } = require("../model/index.model");
const { response } = require("../utils/response")



exports.getAttributes = async (req, res) => {
  try {
    const attributes = await Attributes.find()
    return response(res, 200, {
      message: "Attributes Get Successfully !!",
      attributes,
    });

  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }

}
exports.createAttributes = async (req, res) => {
  console.log("req.body", req.body);

  try {
    if (!req.body || !req.body.attrName || !req.body.details) {
      return response(res, 201, { message: "Oops ! Invalid details !" });
    }

    const attributes = await new Attributes()
    attributes.attrName = req.body.attrName
    attributes.details = req.body.details
    await attributes.save()

    return response(res, 200, {
      message: "User Get Successfully !!",
      attributes,
    });

  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }

}
exports.updateAttributes = async (req, res) => {
  console.log("req.query", req.query);
  console.log("req.query", req.body);
  try {
    if (!req.query.attributesId) {
      return response(res, 201, { message: "Oops ! Invalid details !" });
    }

    const attributes = await Attributes.findById(req.query.attributesId)
    if (!attributes) {
      return response(res, 201, { message: "Oops ! Invalid Attributes Id !" });
    }

    attributes.details = req.body.details ? req.body.details : attributes.details
    await attributes.save()

    return response(res, 200, {
      message: "User Get Successfully !!",
      attributes,
    });

  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }

}


