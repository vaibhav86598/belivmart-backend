const Service = require("../model/service");
const Product = require("../model/products");
const Order = require("../model/order");
const sendEmail = require("../utils/sendmail");
const fcm = require("../firebase/fcm");
const OrderSummary = require("../model/ordersummary");

const createOrder = async (req, res) => {
  try {
    // Create order in the database
    const order = await Order.create(req.body);

    // Populate product details
    await order.populate({
      path: "products.productId",
      select: "name FinalPrice description thumbnail",
    });

    // Send order confirmation email
    const emailSubject = "Order Confirmation - " + order._id;
    const emailMessage = generateOrderEmail(order); // Function to generate the email message

    // List of recipient emails
    const recipientEmails = [
      "vaibhavrathorema@gmail.com",
      "Manish78690468@gmail.com",
      "vipinparasiya@gmail.com",
    ];

    // Send email to all recipients
    for (let recipientEmail of recipientEmails) {
      await sendEmail(recipientEmail, emailSubject, emailMessage, true); // Send email as HTML
    }

    // Send FCM notification to admin
    const fcmTemplate = generateOrderFcmTemplate(order); // Function to generate the FCM template
    fcm.sendToAdminOrderTopic(fcmTemplate);

    res.status(201).json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}; 
 
// Helper function to format date to a readable format
const formatDate = (date) => {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };
  return new Date(date).toLocaleString(undefined, options); // Localized date format
};

const generateOrderFcmTemplate = (order) => {
  const productName = order.products.map((item) => item.productId.name).join(", ");
  const title = `₹${order.totalAmount} Order, ` + order._id;
  const body = `User- ${order.username} productName- ${productName} `;

  return {
    title,
    body,
  };
};

// Generate HTML content for the order email with images and styling
const generateOrderEmail = (order) => {
  let productsHTML = "";

  // Loop through each product and generate HTML for each item
  order.products.forEach((item) => {
    const product = item.productId;
    const imageUrl = product.thumbnail || ""; // Assume thumbnail is the image URL
    const shopNameHTML = item.shopname ? `<p style="background-color: #f1f1f1; padding: 5px; border-radius: 5px; margin-top: 10px;" ><strong>Shop:</strong> ${item.shopname}</p>` : "";
    productsHTML += `
      <div style="border: 1px solid #ddd; padding: 10px; margin-bottom: 15px;">
        <img src="${imageUrl}" alt="${product.name}" style="max-width: 150px; margin-right: 15px; float: left;">
        <div style="float: left; max-width: calc(100% - 170px);">
          <h3 style="margin: 0;">${product.name}</h3>
          <p><strong>Quantity:</strong> ${item.quantity}</p>
          <p><strong>Price:</strong> ₹${product.FinalPrice}</p>
          ${shopNameHTML} 
        </div>
        <div style="clear: both;"></div>
      </div>
    `;
  });

  return `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 20px; background-color: #f9f9f9; max-width: 600px; margin: auto;">
      <h2 style="text-align: center; color: #2c3e50;">Order Confirmation</h2>
      <p><strong>Username:</strong> ${order.username}</p>
      <p><strong>Address:</strong> ${order.address}</p>
      <p><strong>Mobile Number:</strong> ${order.mobileNumber}</p>
      <p><strong>Order Date and Time:</strong> ${formatDate(
        order.createdAt
      )}</p> <!-- Order Time and Date -->
      
      <h3>Products:</h3>
      ${productsHTML}
      
      <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
      <p><strong>Status:</strong> ${order.status}</p>
      <p><strong>Order Date and Time:</strong> ${formatDate(
        order.createdAt
      )}</p> <!-- Order Time and Date -->
      
      <hr style="border-top: 1px solid #ddd;">
      
      <p style="text-align: center; font-size: 14px; color: #888;">Thank you for shopping with us!</p>
    </div>
  `;
};

// get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get order by id
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// update order by id
// const updateOrderById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const order = await Order.findByIdAndUpdate(id, req.body, { new: true });
//     res.status(200).json(order);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
const updateOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;  // Assuming the status of the order is being updated.
    
    // Fetch the order by its ID
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    const previousStatus = order.status;
    
    // Update the order status in the database
    const updatedOrder = await Order.findByIdAndUpdate(id, req.body, { new: true });

    // If the status has changed to "Delivered", we need to add entries to the OrderSummary
    if (status === "Delivered" ) {
      console.log("Migrating order to OrderSummary: ", updatedOrder);
      // Iterate through products in the order to create entries in OrderSummary
      for (const product of updatedOrder.products) {
        const { productId, quantity, shopname } = product;

        // Skip if product details are missing or incomplete
        if (!productId) {
          console.log(`Product details missing for order ID: ${updatedOrder._id}, Product ID: ${productId ? productId._id : "N/A"}`);
          continue;
        }

        const singleProductPrice = productId.FinalPrice;
        const totalAmount = singleProductPrice * quantity;

        // Create an OrderSummary for the product
        await OrderSummary.create({
          orderId: updatedOrder._id,
          date: updatedOrder.createdAt,
          productId: productId._id,
          quantity: quantity,
          shop: shopname ? shopname : "",
          totalAmount: totalAmount,
          singleproductprice: singleProductPrice,
        });

        console.log(`Migrating product to OrderSummary: ${productId._id}`);
      }
    }

    // If the status has changed to "Pending" or "Cancelled", we need to remove entries from OrderSummary
    if ((status === "Pending" || status === "Cancelled") && previousStatus === "Delivered") {
      // Remove OrderSummary entries for this order
      await OrderSummary.deleteMany({ orderId: updatedOrder._id });
      console.log(`Removed OrderSummary entries for Order ID: ${updatedOrder._id}`);
    }

    // Send the updated order data as a response
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error.message);
    res.status(500).json({ error: error.message });
  }
};
const deleteOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getorderbystatus = async (req, res) => {
  try {
    const status = req.query.status || "Pending";
    const orders = await Order.find({ status: status }).sort({ createdAt: -1 }).limit(200).populate({
      path: "products.productId",
      select:
        "name shopname price FinalPrice discountPercentage thumbnail availableTimes minorderquantity packof active ourprice",
    });
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderById,
  deleteOrderById,
  getorderbystatus,
};
