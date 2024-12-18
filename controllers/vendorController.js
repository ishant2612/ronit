const Vendor = require("../models/Vendor");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Register Vendor
exports.registerVendor = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if vendor exists
    if (await Vendor.findOne({ email })) {
      return res.status(400).json({ error: "Vendor already exists" });
    }

    // Create new vendor
    const vendor = await Vendor.create({ name, email, password });
    res.status(201).json({ id: vendor._id, name: vendor.name, token: generateToken(vendor._id) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login Vendor
exports.loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check vendor credentials
    const vendor = await Vendor.findOne({ email });
    if (!vendor || !(await bcrypt.compare(password, vendor.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.status(200).json({ id: vendor._id, name: vendor.name, token: generateToken(vendor._id) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
