const Service = require("../model/service");
const Product = require("../model/products");
const createService = async (req, res) => {
    try {
        const { name, image } = req.body;
        const service = new Service({ name, image });
        await service.save();
        res.status(201).json(service);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        await Service.findByIdAndDelete(id);
        res.status(200).json({ message: "Service deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, image, active, poistionId } = req.body; // Extract updated fields from the request body.
        // Update the service in the database and return the updated document.
        const service = await Service.findByIdAndUpdate(
            id,
            { name, image, active, poistionId },
            { new: true } // Ensures the returned document is the updated version.
        );

        res.status(200).json(service); // Respond with the updated service.
    } catch (error) {
        res.status(500).json({ error: error.message }); // Handle errors and respond with an error message.
    }
};

const getAllServices = async (req, res) => {
    try {
        const services = await Service.find();
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const getservicebyid = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await Service.findById(id);
        res.status(200).json(service);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const searchServices = async (req, res) => {
    try {
        const { name } = req.params;
        const services = await Service.find({ name: { $regex: new RegExp(name, 'i') } });
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// product

// const createProduct = async (req, res) => {
//     try {
//         const product = new Product(req.body);
//         await product.save();
//         res.status(201).json(product);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };
const createProduct = async (req, res) => {
    try {
      const { shopPrices, price, shopname } = req.body;
  
      if (shopPrices && shopPrices.length > 0) {
        req.body.price = shopPrices[0]?.price || price; // Default to the first shop price if provided
      } else if (!price) {
        return res.status(400).json({ error: "Price is required if no shop price is specified." });
      }
  
      const product = new Product(req.body);
      await product.save();
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await Product.findByIdAndDelete(id);
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate("category")
        res.status(200).json({products , totalProducts:products.length});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id).populate("category");
        res.status(200).json({product});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const getproductsbyserviceid = async (req, res) => {
    try {
      const { name } = req.params;
       
      // Case insensitive search for service by name
      const service = await Service.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } });
  
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
  
      // Finding products by category ID
      const products = await Product.find({ category: service._id, active:"true"  });
  
      res.status(200).json({ products });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  };
  

  const getRelatedProducts = async (req, res) => {
    try {
        const { word } = req.query;

        if (!word) {
            return res.status(400).json({ error: "Please provide a search word." });
        }

        const products = await Product.find({
            name: { $regex: word, $options: "i" }, active:"true"  // Case-insensitive search
        }).populate("category");
        res.status(200).json({ products, totalProducts: products.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const gettopsaller = async (req, res) => {
    try {
        const products = await Product.find({ topsaller: "true" });
        res.status(200).json({ products });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = {
    createService,
    getAllServices,
    getproductsbyserviceid,
    deleteService,
    updateService,
    createProduct,
    getAllProducts,
    deleteProduct,
    updateProduct,
    getProductById,
    getservicebyid,
    getRelatedProducts,
    searchServices,
    gettopsaller
};