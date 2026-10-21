const express = require("express");
const router = express.Router();

const paymentController = require("../Controllers/paymentController");
const authMiddleware = require("../Middleware/authMiddleware");
const adminMiddleware = require("../Middleware/adminMiddleware");

router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    paymentController.recordPayment
);

router.get(
    "/my",
    authMiddleware,
    paymentController.getMyPayments
);

router.get(
    "/student/:id",
    authMiddleware,
    adminMiddleware,
    paymentController.getStudentPayments
);

router.get(
    "/receipt/:receiptNo",
    authMiddleware,
    paymentController.getPaymentByReceiptNo
);

router.get(
    "/students",
    authMiddleware,
    adminMiddleware,
    paymentController.getStudents
);

router.get(
    "/students/:id/fees",
    authMiddleware,
    adminMiddleware,
    paymentController.getStudentFeeSummary
);

module.exports = router;
