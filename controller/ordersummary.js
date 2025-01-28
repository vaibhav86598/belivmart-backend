
const Product = require("../model/products");
const Order = require("../model/order");
const OrderSummary = require("../model/ordersummary");

const migrateOrdersToOrderSummary = async (req, res) => {
  try {

    // Fetch only orders with status "Delivered" from the database, populating product details
    const orders = await Order.find({ status: 'Delivered' }).populate({
      path: "products.productId",
      select: "FinalPrice sallerId category availableTimes minorderquantity packof",
    });

    if (!orders.length) {
      return res.status(404).json({ message: "No delivered orders found." });
    }

    let summaryCount = 0;
    let productCount = 0; // Variable to count products migrating

    // Iterate through each order
    for (const order of orders) {

      
      for (const product of order.products) {
        const { productId, quantity,shopname } = product;

        // Skip if product details are missing or incomplete
        if (!productId) {
          console.log(`Product details missing for order ID: ${order._id}, Product ID: ${productId ? productId._id : "N/A"}`);
          continue;
        }

        // Calculate the total amount for the product
        const singleProductPrice = productId.FinalPrice;
        const totalAmount = singleProductPrice * quantity;

        // Log the product migration
        console.log(`Migrating product: ${productId._id}`);
        console.log(`Product details: FinalPrice: ${singleProductPrice}, Quantity: ${quantity}, TotalAmount: ${totalAmount}`);

        // Create an OrderSummary for the product
        await OrderSummary.create({
          orderId: order._id,
          date: order.createdAt,
          productId: productId._id,
          quantity: quantity,
          shop: shopname ? shopname : "",
          totalAmount: totalAmount,
          singleproductprice: singleProductPrice,
        });

        summaryCount++;
        productCount++; // Increment product migration count
      }
    }

    // Log the total number of products being migrated
    console.log(`Total number of products to be migrated: ${productCount}`);

    // Send response with a summary of the operation
    res.status(200).json({
      message: "Migration completed successfully.",
      totalOrderSummariesCreated: summaryCount,
      totalProductsMigrated: productCount,
    });
  } catch (error) {
    console.error("Error during migration:", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { migrateOrdersToOrderSummary };
