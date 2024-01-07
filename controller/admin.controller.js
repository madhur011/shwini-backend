const { Admin } = require("../model/index.model");
const { response } = require("../utils/response")
const fs = require("fs")
const jwt = require("jsonwebtoken"); // Conver to token admin details
const bcrypt = require("bcryptjs"); // Password bcrypt and compar
const { deleteFile } = require("../utils/deleteFile");


//admin login
exports.adminLogin = async (req, res, next) => {
  try {
    if (req.body && req.body.email && req.body.password) {
      const admin = await Admin.findOne({ email: req.body.email });

      console.log("admin", admin);


      if (!admin) {
        return response(res, 401, { message: "Oops ! Email doesn't exist" })
      }

      const isPassword = await bcrypt.compareSync(
        req.body.password,
        admin.password
      );

      if (!isPassword) {
        return response(res, 401, { message: "Oops ! Password doesn't exist" })
      }

      const payload = {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        image: admin.image,
        role: admin.role,
        isActive: admin.isActive,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET);

      if (admin.isActive) {
        return response(res, 200, {
          message: "Admin Login Successfully !!",
          token,
        })
      } else {
        return response(res, 401, { message: "Admin does not exists !" })
      }
    } else {
      return response(res, 401, { message: "Oops ! Invalid details !" })
    }
  } catch (error) {
    console.log(error);
    return response(res, 500, error)
  }
};

//update admin profile email and name [Backend]
exports.update = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);

    if (!admin)

      return response(res, 401, { message: "Admin doesn't Exist!!" })

    admin.name = req.body.name;
    admin.email = req.body.email;

    await admin.save();


    const payload = {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      image: admin.image,
      role: admin.role,
      isActive: admin.isActive,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);

    return response(res, 200, {
      message: "Admin Updated Successfully!!",
      token,
    })
  } catch (error) {
    console.log(error);
    return response(res, 500, error)
  }
};

//update admin password [Backend]
exports.updatePassword = async (req, res) => {
  try {
    if (req.body.oldPassword || req.body.password) {
      console.log("admin", req.admin);
      const admin = await Admin.findOne({ _id: req.admin._id }).exec();

      if (!admin) {
        return response(res, 401, { message: "Admin not found" });
      }
      console.log("req.body", req.body);

      const validPassword = bcrypt.compareSync(req.body.oldPassword, admin.password);

      if (!validPassword) {
        return response(res, 401, { message: "Oops! Old Password doesn't match" });
      }

      // if (req.body.password !== req.body.confirmPass) {
      //   return response(res, 401, { message: "Oops! New Password and Confirm Password don't match" });
      // }

      const hash = bcrypt.hashSync(req.body.password, 10);

      await Admin.updateOne({ _id: req.admin._id }, { $set: { password: hash } }).exec();
      const payload = {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        image: admin.image,
        role: admin.role,
        isActive: admin.isActive,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET);

      return response(res, 200, {
        message: "Admin Updated Successfully!!",
        token,
      })
    } else {
      return response(res, 401, { message: "Invalid details" });
    }


  } catch (error) {
    console.log(error);
    return response(res, 500, error)
  }
};

//update admin profile image
exports.updateImage = async (req, res) => {
  try {

    console.log("req.file", req.file);

    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
      deleteFile(req.file);
      return res
        .status(200)
        .json({ status: false, message: "Admin does not Exist!" });
    }

    if (req.file) {
      if (fs.existsSync(admin.image)) {
        fs.unlinkSync(admin.image);
      }

      admin.image = req.file.path;
    }

    await admin.save();

    const payload = {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      image: admin.image,
      role: admin.role,
      isActive: admin.isActive,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);

    return response(res, 200, {
      message: "Admin Image Update Successfully !!",
      token,
    })
  } catch (error) {
    console.log(error);
    deleteFile(req.file);
    return response(res, 500, error)
  }
};