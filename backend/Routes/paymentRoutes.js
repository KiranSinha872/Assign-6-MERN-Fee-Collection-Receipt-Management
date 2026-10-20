const express = require("express");
const router = express.Router();

const paymentController = require("../Controllers/paymentController");
const authMiddleware = require("../Middleware/authMiddleware");
const adminMiddleware = require("../Middleware/adminMiddleware");

// Admin: record a payment
router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    paymentController.recordPayment
);

// Student: get their own payment history
router.get(
    "/my",
    authMiddleware,
    paymentController.getMyPayments
);

// Admin: get all payments for a specific student
router.get(
    "/student/:id",
    authMiddleware,
    adminMiddleware,
    paymentController.getStudentPayments
);

// Student or Admin: get a receipt by receipt number
router.get(
    "/receipt/:receiptNo",
    authMiddleware,
    paymentController.getPaymentByReceiptNo
);

// Admin: list all students
router.get(
    "/students",
    authMiddleware,
    adminMiddleware,
    paymentController.getStudents
);

// Admin: get fee summary for a specific student
router.get(
    "/students/:id/fees",
    authMiddleware,
    adminMiddleware,
    paymentController.getStudentFeeSummary
);

module.exports = router;
