const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const authenticate = require('../middleware/authMiddlerware');

// Middleware: Ensure user is authenticated
router.use(authenticate);

// GET /api/orders - List all orders for the vendor's products
router.get('/', async (req, res) => {
  try {
    // Find products belonging to the vendor
    const vendorProducts = await Product.find({ vendor: req.user.id }).select('_id');

    // Extract product IDs
    const productIds = vendorProducts.map(product => product._id);

    // Find orders for the vendor's products
    const orders = await Order.find({ product: { $in: productIds } }).populate('product', 'name price');

    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// PUT /api/orders/:id - Mark an order as shipped
router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('product');

    // Ensure the order belongs to one of the vendor's products
    if (!order || order.product.vendor.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    order.status = 'shipped';
    await order.save();

    res.status(200).json({ message: 'Order marked as shipped', order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

module.exports = router;
