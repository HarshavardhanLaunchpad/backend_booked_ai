const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

// Controller for user registration
const signup = async (req, res) => {
  const { username, email, password, phoneNumber } = req.body;

  try {
    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered" });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      phoneNumber,
    });
    // Save the user to the database
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error", message: error.message });
  }
};

// Controller for user login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user in the database by email
    const user = await User.findOne({ email });

    // Check if the user exists
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    console.log("req.body", req.body);
    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    // // Check if the password matches
    // if (!passwordMatch) {
    //   return res.status(400).json({ error: "Invalid email or password" });
    // }

    // Generate a JWT token for the logged-in user
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        username: user.username,
        nationality: user.nationality,
        role: user.role,
      },
      "mysecretkey",
      {
        expiresIn: "1h",
      }
    );

    // Send the token as a response
    res.status(200).json({
      token,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error", message: error.message });
  }
};

// Controller to get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude the password field from the response
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Server error", message: error.message });
  }
};

// Controller to delete a user by their ID
const deleteUserById = async (req, res) => {
  const { userId } = req.params; // Assuming that the user's ID is passed as a URL parameter

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error", message: error.message });
  }
};

// Controller to get logged-in user details
const getLoggedInUser = async (req, res) => {
  try {
    // The user's ID is available in the request object after authentication middleware
    const userId = req.userId;

    // Find the user by ID and exclude the password field from the response
    const user = await User.findById(userId, { password: 0 });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Server error", message: error.message });
  }
};

// Controller for user logout
const logout = (req, res) => {
  // Log the logout action or do some other task, if necessary
  console.log(`User with ID ${req.userId} has logged out.`);

  // Respond with a success message
  res.status(200).json({ message: "User logged out successfully" });
};

const crypto = require("crypto"); // for generating reset tokens

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate reset token & expiration time
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // token valid for 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Send email logic here

    res.status(200).json({ message: "Reset email sent" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetToken,
      resetTokenExpiry: { $gt: Date.now() }, // ensures token is not expired
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Hash the new password and update user record
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = undefined; // Clear the reset token
    user.resetTokenExpiry = undefined; // Clear the expiration time
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error", message: error.message });
  }
};

module.exports = {
  signup,
  deleteUserById,
  login,
  requestPasswordReset,
  getAllUsers,
  getLoggedInUser,
  resetPassword,
  logout,
};
