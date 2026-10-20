const express = require("express");
const router = express.Router();

const dashboardController = require("../Controllers/dashboardController");
const authMiddleware = require("../Middleware/authMiddleware");
const adminMiddleware = require("../Middleware/adminMiddleware");

// Admin only
router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    dashboardController.getDashboard
);

module.exports = router;
