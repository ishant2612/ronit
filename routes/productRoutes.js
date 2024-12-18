const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const authenticate = require('../middleware/authMiddlerware'); // Middleware for JWT auth

// Middleware: Ensure user is authenticated
router.use(authenticate);

const handleErrors = (errors) => {
  return errors.map(err => ({ field: err.param, message: err.msg }));
};

// POST /api/products - Add a new product
router.post(
  '/',
  [
    body('name').isString().notEmpty().withMessage('Name is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: handleErrors(errors.array()) });
    }

    try {
      const { name, price, stock } = req.body;
      const product = new Product({
        name,
        price,
        stock,
        vendor: req.user.id // Vendor ID from JWT payload
      });
      await product.save();
      res.status(201).json(product);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// GET /api/products - List all products (pagination)
router.get('/', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const products = await Product.find({ vendor: req.user.id })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Product.countDocuments({ vendor: req.user.id });

    res.status(200).json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/products/:id - Update product details
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, vendor: req.user.id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    Object.assign(product, req.body); // Merge changes
    await product.save();

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/products/:id - Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, vendor: req.user.id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
