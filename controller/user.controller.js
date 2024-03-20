const { User } = require("../model/index.model");
const { response } = require("../utils/response")

const jwt = require("jsonwebtoken"); // Conver to token admin details
const bcrypt = require("bcryptjs"); // Password bcrypt and compar
const { generateId, uniqueId } = require("../utils/function");



exports.userGet = async (req, res) => {
  try {
    const user = await User.find()
    return response(res, 200, {
      message: "User Get Successfully !!",
      user,
    });

  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }

}

exports.userLogin = async (req, res) => {
  console.log("req.body", req.body);

  try {
    if (!req.body || (!req.body.loginType && req.body.loginType > 0) || !req.body.email) {
      return response(res, 201, { message: "Oops ! Invalid details !" });
    }
    console.log("====");
    const userVarify = await User.findOne({ email: req.body.email })

    if (req.body.loginType == 0) {

      if (userVarify) {
        if (req.body.password) {
          if (userVarify.password != req.body.password) {
            return response(res, 201, { message: "Oops ! Invalid Password !" });
          }
        } else {
          return response(res, 201, { message: "Oops ! Enter Password !" });
        }
        let payload = {
          _id: userVarify._id,
          email: userVarify.email,
          name: userVarify.name,
          gender: userVarify.gender,
          profileImage: userVarify.profileImage,
          mobileNo: userVarify.mobileNo,
          customerId: userVarify.customerId,
          address: userVarify.address,
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET);

        return response(res, 200, {
          message: "User Login Successfully !!",
          token,
        });
      } else {
        return response(res, 201, { message: "Email Does Not Exist..!" });
      }

    } else if (req.body.loginType == 1) {
      if (userVarify) {
        return response(res, 201, { message: "Email Already Exist..!" });
      }
      if (!req.body.name || !req.body.mobileNo || !req.body.gender) {
        return response(res, 201, { message: "Invalid Details" });
      }
      console.log("req.file", req.files);

      let user = await new User();
      user.email = req.body.email;
      user.name = req.body.name;
      user.gender = req.body.gender;
      user.profileImage = req.files.profileImage[0].path;
      user.mobileNo = req.body.mobileNo;
      user.password = req.body.password;
      user.customerId = uniqueId(12);
      user.customerId = [];

      await user.save();

      let payload = {
        _id: user._id,
        email: user.email,
        name: user.name,
        gender: user.gender,
        profileImage: user.profileImage,
        mobileNo: user.mobileNo,
        customerId: user.customerId,
        customerId: [],
      }

      const token = jwt.sign(payload, process.env.JWT_SECRET);

      return response(res, 200, {
        message: "User Signing Successfully !!",
        token,
      });
    }


  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }
};


exports.updateUser = async (req, res) => {
  try {

    const { userId } = req.query
    const { email, name, gender, mobileNo, password } = req.body

    console.log("req.query", req.query);
    console.log("req.body", req.body);


    if (!userId) {
      return response(res, 201, { message: "Oops! Invalid details" });
    }
    const user = await User.findById(userId)
    if (!user) {
      return response(res, 201, { message: "Oops! Invalid User Id!" });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.gender = gender || user.gender;
    user.mobileNo = mobileNo || user.mobileNo;
    user.password = password || user.password;
    user.profileImage = req?.file?.path || user.profileImage;
    await user.save();


    return response(res, 200, {
      message: "User Updated successfully !!",
      user,
    });


  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }
}


exports.addAddress = async (req, res) => {
  try {
    console.log("req.body", req.body);


    const { userId } = req.query
    const { fullName, phone, type, socName, pincode, city, state, country } = req.body
    if (!userId || !fullName || !phone || !type || !socName || !pincode || !city || !state || !country) {
      return response(res, 201, { message: "Oops! Invalid details" });
    }
    const user = await User.findById(userId)
    if (!user) {
      return response(res, 201, { message: "Oops! Invalid User Id!" });
    }


    const newAddress = {
      fullName,
      phone,
      type,
      details: {
        socName,
        pincode,
        city,
        state,
        country,
      },
    };

    // Push the new address object to the user's address array
    user.address.push(newAddress);

    // Save the user document with the updated address array
    await user.save();
    return response(res, 200, {
      message: "Address added successfully !!",
      user,
    });


  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }
}

exports.updateAddress = async (req, res) => {
  try {
    console.log("req.body", req.body);
    console.log("req.query", req.query);


    const { userId, addressId } = req.query
    const { fullName, phone, type, socName, pincode, city, state, country } = req.body
    if (!userId || !addressId) {
      return response(res, 201, { message: "Oops! Invalid details" });
    }
    const user = await User.findById(userId)
    if (!user) {
      return response(res, 201, { message: "Oops! Invalid User Id!" });
    }

    // Now, find the address within the user's addresses array
    const userAddId = user.address.find(address => address._id.toString() === addressId);

    if (!userAddId) {
      return response(res, 201, { message: "Oops! Invalid Address Id!" });
    }
    console.log("userAddId", userAddId);


    userAddId.fullName = fullName || userAddId.fullName;
    userAddId.phone = phone || userAddId.phone;
    userAddId.type = type || userAddId.type;
    userAddId.details.socName = socName || userAddId.details.socName;
    userAddId.details.pincode = pincode || userAddId.details.pincode;
    userAddId.details.city = city || userAddId.details.city;
    userAddId.details.state = state || userAddId.details.state;
    userAddId.details.country = country || userAddId.details.country;

    // Save the user document with the updated address array
    await userAddId.save();
    return response(res, 200, {
      message: "Address added successfully !!",
      user,
    });


  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }
}


exports.deleteAddress = async (req, res) => {
  try {
    console.log("req.query", req.query);

    const { userId, addressId } = req.query;

    if (!userId || !addressId) {
      return response(res, 400, { message: "Oops! Invalid details" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return response(res, 404, { message: "Oops! Invalid User Id!" });
    }

    const addressIndex = user.address.findIndex(
      (address) => address._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return response(res, 404, { message: "Oops! Invalid Address Id!" });
    }
    user.address.splice(addressIndex, 1);

    await user.save();

    return response(res, 200, {
      message: "Address added successfully !!",
      user,
    });
  } catch (error) {
    console.error(error);
    return response(res, 500, { message: "Internal Server Error" });
  }
};


exports.userBlock = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return response(res, 201, { message: "Oops! Invalid details !" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return response(res, 201, { message: "Oops! Invalid user Id !" });
    }

    user.isBlock = !user.isBlock;
    await user.save();

    return response(res, 200, {
      message: "User updated successfully!",
      user
    });
  } catch (error) {
    console.error(error);
    return response(res, 500, error);
  }
}


exports.userProfile = async (req, res) => {
  try {
    const { userId } = req.query

    const user = await User.findById(userId)
    return response(res, 200, {
      message: "User Get Successfully !!",
      user,
    });

  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }

}