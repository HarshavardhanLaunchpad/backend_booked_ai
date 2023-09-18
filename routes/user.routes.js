const express = require("express");
const { verifyToken, isAdmin } = require("../middlewares/authJwt");
const userController = require("../controllers/user.controller");

const router = express.Router();

router.post("/signup", userController.signup);
router.post("/login", userController.login);
// router.get("/", [verifyToken, isAdmin], userController.getAllUsers);
router.delete("/:userId", userController.deleteUserById);
router.get("/me", verifyToken, userController.getLoggedInUser);
router.post("/reset-password", userController.resetPassword);
router.post("/request-password-reset", userController.requestPasswordReset);
router.post("/logout", userController.logout);

module.exports = router;
