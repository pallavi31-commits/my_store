import express from 'express';
import Product from "../models/product.js";
import {
    createProduct,
    getProducts,
    updateProduct,
    deleteProduct
} from '../controllers/productsController.js';

const router = express.Router();

//Route to create a new product
// router.post('/add', createProduct);
router.post("/add", async (req, res) => {
  try {
    const product = new Product({
        ...req.body,
        title: req.body.name
    });

    await product.save();

    res.status(201).json(product);
  } catch (error) {
    console.error("ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
});

//Route to get all products
router.get('/', getProducts);

//Route to update a product by ID
router.put('/update/:id', updateProduct);

//Route to delete a product by ID
router.delete('/delete/:id', deleteProduct);

export default router;