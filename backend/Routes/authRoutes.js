const express = require("express");
const router = express.Router();

const authController = require("../Controllers/authController");
const authMiddleware = require("../Middleware/authMiddleware");

router.post("/register", authController.registerUser);

router.post("/login", authController.loginUser);

router.get("/me", authMiddleware, authController.getMe);
router.put("/profile", authMiddleware, authController.updateProfile);


module.exports = router;