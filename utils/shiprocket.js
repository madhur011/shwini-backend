const axios = require("axios");
const { response } = require("../utils/response");
const { User } = require("../model/index.model");
require("dotenv").config({ path: ".env" });

exports.authenticateShiprocket = async () => {
  try {
    console.log("Shiprocket response", process.env.SHIPROCKET_EMAIL);
    const response = await axios.post(
      `${process.env.SHIPROCKET_BASE_URL}external/auth/login`,
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }
    );

    return response.data.token;
  } catch (error) {
    // console.error("Error authenticating with Shiprocket:", error.message);
    throw error;
  }
};

exports.createShiprocketOrder = async (shiprocketToken, order) => {
  console.log("order", order);
  try {
    const response = await axios.post(
      `${process.env.SHIPROCKET_BASE_URL}external/orders/create/adhoc`,
      order,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${shiprocketToken}`,
        },
      }
    );
    console.log("Shiprocket response", response.data);
    return response.data;
  } catch (error) {
    // console.error("Error creating Shiprocket order:", error.message);
    throw error;
  }
};

exports.getShiprocketOrders = async (shiprocketToken) => {
  const response = await axios.get(
    `${process.env.SHIPROCKET_BASE_URL}external/orders/list`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${shiprocketToken}`,
      },
    }
  );
  return response.data;
};

exports.cancelShiprocketOrders = async (shiprocketToken, orderId) => {
  try {
    console.log("ids", orderId);
    const response = await axios.post(
      `${process.env.SHIPROCKET_BASE_URL}external/orders/cancel`,
      { ids: [orderId] },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${shiprocketToken}`,
        },
      }
    );
    console.log("Shiprocket response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error cancelling Shiprocket orders:",
      error.response ? error.response.data : error
    );
    throw error;
  }
};

exports.updateCustomerDeliveryAddress = async (
  shiprocketToken,
  orderId,
  order,
  userId
) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const payload = {
      order_id: order.shiprocket_order_id,
      shipping_customer_name: user.firstName,
      shipping_phone: order.address.phone,
      shipping_address: order.address.address,
      shipping_address_2: "",
      shipping_city: order.address.city,
      shipping_state: order.address.state,
      shipping_country: order.address.country,
      shipping_pincode: order.address.pinCode,
    };

    console.log("Payload to Shiprocket:", payload);

    const response = await axios.post(
      `${process.env.SHIPROCKET_BASE_URL}external/orders/address/update`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${shiprocketToken}`,
        },
      }
    );

    console.log("Shiprocket response:", response.data);

    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("API response error:", error.response.data);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error in making request:", error.message);
    }

    throw new Error("Error updating Shiprocket address");
  }
};

exports.getLocalityDetails = async (pinCode) => {
  try {
    const response = await axios.get(
      `https://api.postalpincode.in/pincode/${pinCode}`
    );
    return response.data[0].PostOffice;
  } catch (error) {
    console.error("Error fetching locality details:", error.message);
    throw error;
  }
};

exports.GenerateLabel = async (shiprocketToken, shipmentId) => {
  try {
    const response = await axios.post(
      `${process.env.SHIPROCKET_BASE_URL}external/courier/generate/label`,
      {
        shipment_id: [shipmentId],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${shiprocketToken}`,
        },
      }
    );

    console.log("Shiprocket response", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error generating label:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

exports.getInvoice = async (shiprocketToken, id) => {
  try {
    console.log("Sending request to Shiprocket with token : ", shiprocketToken);
    const response = await axios.post(
      `${process.env.SHIPROCKET_BASE_URL}external/orders/print/invoice`,
      { ids: [id] },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${shiprocketToken}`,
        },
      }
    );

    console.log("Shiprocket response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error getting invoice:",
      error.response ? error.response.data : error.message,
      error.stack
    );
    throw error;
  }
};

exports.generateMenifest = async (shiprocketToken, orderId) => {
  try {
    const response = await axios.post(
      `https://apiv2.shiprocket.in/v1external/manifests/print`,
      {
        shipment_id: [orderId],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${shiprocketToken}`,
        },
      }
    );

    console.log("Shiprocket response", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error getting invoice:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

exports.getPickUpAdress = async (shiprocketToken) => {
  try {
    const response = await axios.get(
      `${process.env.SHIPROCKET_BASE_URL}external/settings/company/pickup`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${shiprocketToken}`,
        },
      }
    );
    console.log("Shiprocket response", response.data);
    return response.data;
  } catch (error) {
    console.log(
      "Error fetching pickup address:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

exports.getShipmentsById = async (shiprocketToken, shipmentId) => {
  try {
    if (!shiprocketToken) {
      throw new Error("Missing Shiprocket token");
    }

    if (!shipmentId) {
      throw new Error("Missing shipment ID");
    }

    console.log("Sending request to Shiprocket with token:", shiprocketToken);
    console.log("Fetching shipment with ID:", shipmentId);

    const response = await axios.get(
      `https://apiv2.shiprocket.in/v1external/shipments/${shipmentId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${shiprocketToken}`,
        },
      }
    );

    if (!response.data || Object.keys(response.data).length === 0) {
      throw new Error("No data found in Shiprocket response");
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      console.error(
        "Error fetching shipment details:",
        error.response.status,
        error.response.statusText
      );
      console.error("Response headers:", error.response.headers);
      console.error("Response data:", error.response.data);
    } else {
      console.error("Error fetching shipment details:", error.message);
    }
    throw error;
  }
};
exports.getShipments = async (shiprocketToken) => {
  try {
    const response = await axios.get(
      `https://apiv2.shiprocket.in/v1external/shipments`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${shiprocketToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching shipment details:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

exports.getTrackingDetails = async (shiprocketToken, awbNumber) => {
  try {
    console.log("awbNumber", awbNumber);
    const response = await axios.get(
      `https://apiv2.shiprocket.in/v1external/courier/track/awb/${awbNumber}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${shiprocketToken}`,
        },
      }
    );
    console.log("Shiprocket response", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching tracking details:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

exports.cancelShipment = async (shiprocketToken, awbNumber) => {
  try {
    console.log("Sending request to Shiprocket with token:", awbNumber);
    const response = await axios.delete(
      `https://apiv2.shiprocket.in/v1external/orders/cancel/shipment/awbs`,
      {
        awbs: [awbNumber],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${shiprocketToken}`,
        },
      }
    );
    console.log("Shiprocket response", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching shipment details:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};
