const express = require("express");
const { registerVendor, loginVendor } = require("../controllers/vendorController");
const router = express.Router();

router.post("/register", registerVendor);
router.post("/login", loginVendor);

module.exports = router;
