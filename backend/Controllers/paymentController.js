const Payment = require("../Models/Payment");
const FeeStructure = require("../Models/FeeStructure");
const User = require("../Models/User");

// ── Payment handlers ──────────────────────────────────────────────────────────

const recordPayment = async (req, res) => {
    try {
        const {
            studentId,
            feeStructureId,
            amount,
            paymentMode,
            paymentDate,
            transactionRef
        } = req.body;

        if (
            !studentId ||
            !feeStructureId ||
            amount === undefined ||
            !paymentMode ||
            !paymentDate
        ) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const parsedAmount = Number(amount);

        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({
                message: "Payment amount must be greater than zero"
            });
        }

        const student = await User.findById(studentId);

        if (!student || student.role !== "Student") {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        const feeStructure = await FeeStructure.findById(feeStructureId);

        if (!feeStructure) {
            return res.status(404).json({
                message: "Fee structure not found"
            });
        }

        const paymentsForThisFee = await Payment.find({
            student: studentId,
            feeStructure: feeStructureId
        });

        let alreadyPaid = 0;
        for (const payment of paymentsForThisFee) {
            alreadyPaid += payment.amount;
        }

        const pendingForThisFee = feeStructure.amount - alreadyPaid;

        if (parsedAmount > pendingForThisFee) {
            return res.status(400).json({
                message: `Amount exceeds the pending balance of ${pendingForThisFee} for this fee head`
            });
        }

        const year = new Date().getFullYear();
        const count = await Payment.countDocuments();
        const padded = String(count + 1).padStart(4, "0");
        const receiptNo = `RCP-${year}-${padded}`;

        const payment = await Payment.create({
            student: studentId,
            feeStructure: feeStructureId,
            amount: parsedAmount,
            paymentMode,
            paymentDate,
            transactionRef: transactionRef ? transactionRef.trim() : "",
            receiptNo,
            recordedBy: req.user.id
        });

        return res.status(201).json({
            message: "Payment recorded successfully",
            payment
        });

    } catch (error) {
        console.log("Record payment error:", error.message);

        return res.status(500).json({
            message: "Failed to record payment"
        });
    }
};

const getMyPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ student: req.user.id })
            .populate("feeStructure", "course feeHead amount dueDate")
            .populate("recordedBy", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Payment history fetched successfully",
            count: payments.length,
            payments
        });

    } catch (error) {
        console.log("Fetch my payments error:", error.message);

        return res.status(500).json({
            message: "Failed to fetch payment history"
        });
    }
};

const getStudentPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ student: req.params.id })
            .populate("feeStructure", "course feeHead amount dueDate")
            .populate("recordedBy", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Student payments fetched successfully",
            count: payments.length,
            payments
        });

    } catch (error) {
        console.log("Fetch student payments error:", error.message);

        return res.status(500).json({
            message: "Failed to fetch student payments"
        });
    }
};

const getPaymentByReceiptNo = async (req, res) => {
    try {
        const payment = await Payment.findOne({ receiptNo: req.params.receiptNo })
            .populate("student", "name email rollNumber course")
            .populate("feeStructure", "course feeHead amount dueDate")
            .populate("recordedBy", "name");

        if (!payment) {
            return res.status(404).json({
                message: "Receipt not found"
            });
        }

        if (
            req.user.role === "Student" &&
            payment.student._id.toString() !== req.user.id
        ) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        return res.status(200).json({
            message: "Receipt fetched successfully",
            payment
        });

    } catch (error) {
        console.log("Fetch receipt error:", error.message);

        return res.status(500).json({
            message: "Failed to fetch receipt"
        });
    }
};

// ── Student handlers ──────────────────────────────────────────────────────────

const getStudents = async (req, res) => {
    try {
        const { name, rollNumber, course } = req.query;

        const filter = { role: "Student" };

        if (name) {
            filter.name = { $regex: name.trim(), $options: "i" };
        }

        if (rollNumber) {
            filter.rollNumber = { $regex: rollNumber.trim(), $options: "i" };
        }

        if (course) {
            filter.course = { $regex: course.trim(), $options: "i" };
        }

        const students = await User.find(filter)
            .select("-password")
            .sort({ name: 1 });

        return res.status(200).json({
            message: "Students fetched successfully",
            count: students.length,
            students
        });

    } catch (error) {
        console.log("Fetch students error:", error.message);

        return res.status(500).json({
            message: "Failed to fetch students"
        });
    }
};

const getStudentFeeSummary = async (req, res) => {
    try {
        const student = await User.findById(req.params.id).select("-password");

        if (!student || student.role !== "Student") {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        if (!student.course) {
            return res.status(400).json({
                message: "Student has no course assigned"
            });
        }

        const feeStructures = await FeeStructure.find({
            course: student.course
        }).sort({ feeHead: 1 });

        let totalPayable = 0;
        for (const fs of feeStructures) {
            totalPayable += fs.amount;
        }

        const payments = await Payment.find({ student: student._id });

        let paidAmount = 0;
        for (const p of payments) {
            paidAmount += p.amount;
        }

        const pendingAmount = totalPayable - paidAmount;

        let status = "Unpaid";
        if (paidAmount >= totalPayable && totalPayable > 0) {
            status = "Paid";
        } else if (paidAmount > 0) {
            status = "Partially Paid";
        }

        const today = new Date();
        const overdue =
            pendingAmount > 0 &&
            feeStructures.some((fs) => new Date(fs.dueDate) < today);

        return res.status(200).json({
            message: "Fee summary fetched successfully",
            student,
            summary: {
                totalPayable,
                paidAmount,
                pendingAmount,
                status,
                overdue
            },
            feeStructures
        });

    } catch (error) {
        console.log("Fetch student fee summary error:", error.message);

        return res.status(500).json({
            message: "Failed to fetch fee summary"
        });
    }
};

module.exports = {
    recordPayment,
    getMyPayments,
    getStudentPayments,
    getPaymentByReceiptNo,
    getStudents,
    getStudentFeeSummary
};
