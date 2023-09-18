const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const config = require("config");

verifyToken = (req, res, next) => {
  // Get the token from the request header
  const token = req.header("Authorization");

  // Check if the token is not provided
  if (!token) {
    return res.status(401).json({ msg: "No token provided!" });
  }

  try {
    // Check if the token starts with "Bearer "
    if (!token.startsWith("Bearer ")) {
      return res.status(401).json({ msg: "Invalid token format!" });
    }

    // Remove the "Bearer " prefix from the token
    const jwtToken = token.substring(7);

    // Verify the token
    const decoded = jwt.verify(jwtToken, config.get("jwtSecret"));

    // Set the user ID from the token payload to the request object for further use
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid token!" });
  }
};

isAdmin = async (req, res, next) => {
  const user = await User.findById(req.userId);
  if (user.role === "admin") {
    next();
    return;
  }

  res.status(403).send({ message: "Require Admin Role!" });
  return;
};

const authJwt = {
  verifyToken: verifyToken,
  isAdmin: isAdmin,
};
module.exports = authJwt;
