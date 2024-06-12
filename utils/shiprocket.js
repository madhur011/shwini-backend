const axios = require("axios");
require("dotenv").config({ path: ".env" });
const { Order, userInfo } = require("../models/index.model");

// Token Generate
exports.authenticateShiprocket = async () => {
  try {
    const response = await axios.post(
      `${process.env.SHIPROCKET_BASE_URL}/external/auth/login`,
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }
    );

    return response.data.token;
  } catch (error) {
    console.error("Error authenticating with Shiprocket:", error.message);
    throw error;
  }
};

// Create Order In Partner
exports.createShiprocketOrder = async (shiprocketToken, order) => {
  try {
    const response = await axios.post(
      `${process.env.SHIPROCKET_BASE_URL}/external/orders/create/adhoc`,
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
    console.error("Error creating Shiprocket order:", error.message);
    throw error;
  }
};

// Order Get By ID (Single Order)
exports.getShiprocketOrderById = async (shiprocketToken, orderId) => {
  const response = await axios.get(
    `${process.env.SHIPROCKET_BASE_URL}/external/orders/get?order_id=${orderId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${shiprocketToken}`,
      },
    }
  );
  console.log("Shiprocket response", response.data);
  return response.data;
};

// Order Get ALL
exports.getShiprocketOrders = async (shiprocketToken) => {
  const response = await axios.get(
    `${process.env.SHIPROCKET_BASE_URL}/external/orders/list`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${shiprocketToken}`,
      },
    }
  );
  console.log("Shiprocket response", response.data);
  return response.data;
};

// Order Change
exports.updateShiprocketOrder = async (shiprocketToken, orderId) => {
  const response = await axios.get(
    `${process.env.SHIPROCKET_BASE_URL}/external/orders/update?order_id=${orderId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${shiprocketToken}`,
      },
    }
  );
  console.log("Shiprocket response", response.data);
  return response.data;
};

// Order Cancel
exports.cancelShiprocketOrders = async (shiprocketToken, orderId) => {
  try {
    console.log("ids", orderId);
    const response = await axios.post(
      `${process.env.SHIPROCKET_BASE_URL}/external/orders/cancel`,
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

// After Order Change Address
exports.updateCustomerDeliveryAddress = async (
  shiprocketToken,
  orderId,
  order,
  userId
) => {
  try {
    const user = await userInfo.findById(userId);
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
      `${process.env.SHIPROCKET_BASE_URL}/external/orders/address/update`,
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

// Find Delivery Location
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

// Label Generate For Print
exports.GenerateLabel = async (shiprocketToken, shipmentId) => {
  try {
    const response = await axios.post(
      `${process.env.SHIPROCKET_BASE_URL}/external/courier/generate/label`,
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

// Show Invoice For Print
exports.getInvoice = async (shiprocketToken, ids) => {
  try {
    console.log("Sending request to Shiprocket with token:", shiprocketToken);
    const response = await axios.post(
      `${process.env.SHIPROCKET_BASE_URL}/external/orders/print/invoice`,
      { ids: [ids] },
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

// Show Menifest For Print
exports.generateMenifest = async (shiprocketToken, orderId) => {
  try {
    const response = await axios.post(
      `${process.env.SHIPROCKET_BASE_URL}/external/orders/print/manifes`,
      {
        ids: shipmentIds,
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

// Show Pikup Address
exports.getPickUpAdress = async (shiprocketToken) => {
  try {
    const response = await axios.get(
      `${process.env.SHIPROCKET_BASE_URL}/external/settings/company/pickup`,
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

// Show Tracking
exports.getTrackingDetails = async (req, res) => {
  try {
    const { shipmentId } = req.query;

    console.log(`Fetching token for Shiprocket...`);
    const shiprocketToken = await authenticateShiprocket();
    console.log(`Token fetched: ${shiprocketToken}`);

    console.log(`Fetching shipment details for Shipment ID: ${shipmentId}`);

    const shipmentDetailsResponse = await getShipmentsById(
      shiprocketToken,
      shipmentId
    );
    console.log(
      `Shipment details response:`,
      shipmentDetailsResponse.shipment_track
    );

    const awbNumber = shipmentDetailsResponse.data.awb;
    console.log(`AWB Number extracted: ${awbNumber}`);

    console.log(`Fetching tracking details for AWB Number: ${awbNumber}`);
    const trackingDetailsResponse = await getTrackingDetail(
      shiprocketToken,
      awbNumber
    );
    console.log(`Tracking details response:`, trackingDetailsResponse);

    res.status(200).json({
      message: "Tracking details fetched successfully",
      response: trackingDetailsResponse,
    });
  } catch (error) {
    console.error("Error fetching tracking details:", error);
    res.status(500).json({
      error: "Error fetching tracking details",
      message: error.message,
    });
  }
};

// Find AWS Token Number
exports.getShipmentsById = async (shiprocketToken, shipmentId) => {
  try {
    console.log("Sending request to Shiprocket with token:", shipmentId);
    const response = await axios.get(
      `https://apiv2.shiprocket.in/v1/external/shipments/${shipmentId}`,
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

// Show Tracking Data
exports.getTrackingDetail = async (shiprocketToken, awbNumber) => {
  try {
    console.log("awbNumber", awbNumber);
    const response = await axios.get(
      `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awbNumber}`,
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
