const jwt = require("jsonwebtoken");
const Vendor = require("../models/Vendor");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach vendor to request
      req.vendor = await Vendor.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res.status(401).json({ error: "Not authorized" });
    }
  } else {
    res.status(401).json({ error: "Not authorized, no token" });
  }
};

module.exports = protect;
