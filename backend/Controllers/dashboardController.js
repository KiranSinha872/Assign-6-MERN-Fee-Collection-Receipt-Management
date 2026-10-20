const Payment = require("../Models/Payment");
const FeeStructure = require("../Models/FeeStructure");
const User = require("../Models/User");

const getDashboard = async (req, res) => {
    try {
        const payments = await Payment.find();

        let totalCollected = 0;
        const modeWiseCollection = {};

        for (const payment of payments) {
            totalCollected += payment.amount;
            modeWiseCollection[payment.paymentMode] =
                (modeWiseCollection[payment.paymentMode] || 0) + payment.amount;
        }

        const students = await User.find({ role: "Student" }).select("-password");
        const feeStructures = await FeeStructure.find();

        let totalPending = 0;
        const overdueDefaulters = [];
        const today = new Date();

        for (const student of students) {
            if (!student.course) {
                continue;
            }

            const courseFees = feeStructures.filter(
                (fs) => fs.course === student.course
            );

            let totalPayable = 0;
            for (const fs of courseFees) {
                totalPayable += fs.amount;
            }

            const studentPayments = payments.filter(
                (p) => p.student.toString() === student._id.toString()
            );

            let paidAmount = 0;
            for (const p of studentPayments) {
                paidAmount += p.amount;
            }

            const pendingAmount = totalPayable - paidAmount;
            totalPending += pendingAmount;

            let status = "Unpaid";
            if (paidAmount >= totalPayable && totalPayable > 0) {
                status = "Paid";
            } else if (paidAmount > 0) {
                status = "Partially Paid";
            }

            if (pendingAmount > 0) {
                const isOverdue = courseFees.some(
                    (fs) => new Date(fs.dueDate) < today
                );

                if (isOverdue) {
                    overdueDefaulters.push({
                        student: {
                            id: student._id,
                            name: student.name,
                            email: student.email,
                            rollNumber: student.rollNumber,
                            course: student.course
                        },
                        pendingAmount,
                        status
                    });
                }
            }
        }

        return res.status(200).json({
            message: "Dashboard data fetched successfully",
            totalCollected,
            totalPending,
            overdueDefaulters,
            modeWiseCollection
        });

    } catch (error) {
        console.log("Dashboard error:", error.message);

        return res.status(500).json({
            message: "Failed to fetch dashboard data"
        });
    }
};

module.exports = { getDashboard };
