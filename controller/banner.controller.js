const { Banner } = require("../model/index.model");
const { deleteFile, deleteFilePath } = require("../utils/deleteFile");
const { response } = require("../utils/response")



exports.getBanner = async (req, res) => {
  try {
    const banner = await Banner.find().sort({ createdAt: -1 })
    return response(res, 200, {
      message: "Banner Get Successfully !!",
      banner,
    });

  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }

}
exports.createBanner = async (req, res) => {
  console.log("req.body", req.body);
  console.log("req.file", req.file);

  try {
    if (!req.body || !req.body.url || !req.file) {
      deleteFile(req?.file)
      return response(res, 201, { message: "Oops ! Invalid details !" });
    }

    const banner = await new Banner()
    banner.url = req.body.url
    banner.image = req.file.path
    await banner.save()

    return response(res, 200, {
      message: "User Get Successfully !!",
      banner,
    });

  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }

}
exports.updateBanner = async (req, res) => {
  console.log("req.query", req.query);
  try {
    if (!req.query.bannerId) {
      deleteFile(req?.file)
      return response(res, 201, { message: "Oops ! Invalid details !" });
    }

    const banner = await Banner.findById(req.query.bannerId)
    if (!banner) {
      return response(res, 201, { message: "Oops ! Invalid Banner Id !" });
    }

    if (req.file) {
      deleteFilePath(banner.image)
      banner.image = req.file.path
    }
    banner.url = req.body.url ? req.body.url : banner.url
    await banner.save()

    return response(res, 200, {
      message: "User Get Successfully !!",
      banner,
    });

  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }

}
exports.deleteBanner = async (req, res) => {
  console.log("req.query", req.query);
  try {
    if (!req.query.bannerId) {
      return response(res, 201, { message: "Oops ! Invalid details !" });
    }

    const banner = await Banner.findById(req.query.bannerId)
    if (!banner) {
      return response(res, 201, { message: "Oops ! Invalid Banner Id !" });
    }
    deleteFilePath(banner.image)

    await banner.deleteOne()

    return response(res, 200, {
      message: "User Get Successfully !!",
    });

  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }

}

