// my code
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

// Import routes
const userRoutes = require("./routes/user.routes");

// Import routes
const app = express();

// Middlewares for parsing request bodies and enabling CORS
app.use(cors());
app.use(bodyParser.json());

// Use routes
app.use("/api/user", userRoutes);
// app.use("/api/chat", chatRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

// Connect to MongoDB
mongoose
  .connect(process.env.DB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Could not connect to MongoDB", error));

// Error handling middleware
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
