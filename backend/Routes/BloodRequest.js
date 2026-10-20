
const express = require("express");
const router = express.Router();

const bloodRequestController = require("../Controllers/BloodRequestController");
const authMiddleware = require("../Middleware/authMiddleware");
const adminMiddleware = require("../Middleware/adminMiddleware");

router.post(
    "/",
    authMiddleware,
    bloodRequestController.createBloodRequest
);

router.get(
    "/my",
    authMiddleware,
    bloodRequestController.getMyBloodRequests
);

router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    bloodRequestController.getAllBloodRequests
);

router.patch(
    "/:id/status",
    authMiddleware,
    adminMiddleware,
    bloodRequestController.updateBloodRequestStatus
);

module.exports = router;
