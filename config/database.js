const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const connectDb = async () => {
  try {
    // await mongoose.connect("mongodb+srv://vaibhavrathorema:Y9HsBzd2qM7KSGxr@delivery.pe6rr.mongodb.net/delivery", {
    await mongoose.connect("mongodb+srv://vaibhavrathorema:Y9HsBzd2qM7KSGxr@delivery.pe6rr.mongodb.net");
    console.log(" connected to Mongoose database.");
  } catch (error) {
    console.error("Unable to connect to MongoDB Database", error);
  }
};

// export database
module.exports = connectDb


// const mongoose = require("mongoose");
// mongoose.set("strictQuery", false); // Disables Mongoose strict query mode if needed

// // Function to connect to MongoDB
// const connectDb = async () => {
//   try {
//     const dbUri = process.env.MONGODB_URI || "mongodb+srv://vaibhavrathorema:Y9HsBzd2qM7KSGxr@delivery.pe6rr.mongodb.net/delivery";
    
//     // Add connection options to improve connection stability
//     const options = {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       serverSelectionTimeoutMS: 5000, // Adjust timeout duration
//       retryWrites: true, // Enable retryable writes
//     };

//     // Attempt to connect to MongoDB using Mongoose
//     await mongoose.connect(dbUri, options);
//     console.log("Connected to MongoDB database.");
//   } catch (error) {
//     console.error("Unable to connect to MongoDB Database:", error.message);
//     // Optionally add retry logic or exit process
//     process.exit(1); // Exit the process if unable to connect
//   }
// };

// // Export the connection function to use in other parts of the application
// module.exports = connectDb;
