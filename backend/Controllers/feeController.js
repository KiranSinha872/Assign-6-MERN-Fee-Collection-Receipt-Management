const FeeStructure = require("../Models/FeeStructure");
const User = require("../Models/User");

const createFeeStructure = async (req, res) => {
    try {
        const { course, feeHead, amount, dueDate } = req.body;

        if (!course || !feeHead || amount === undefined || !dueDate) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (Number(amount) < 1) {
            return res.status(400).json({
                message: "Amount must be at least 1"
            });
        }

        const feeStructure = await FeeStructure.create({
            course: course.trim(),
            feeHead,
            amount: Number(amount),
            dueDate,
            createdBy: req.user.id
        });

        return res.status(201).json({
            message: "Fee structure created successfully",
            feeStructure
        });

    } catch (error) {
        console.log("Create fee structure error:", error.message);

        return res.status(500).json({
            message: "Failed to create fee structure"
        });
    }
};

const getFeeStructures = async (req, res) => {
    try {
        let filter = {};

        if (req.user.role === "Student") {
            const student = await User.findById(req.user.id).select("course");

            if (!student || !student.course) {
                return res.status(400).json({
                    message: "Student course not found"
                });
            }

            filter.course = student.course;
        }

        const feeStructures = await FeeStructure.find(filter)
            .populate("createdBy", "name")
            .sort({ course: 1, feeHead: 1 });

        return res.status(200).json({
            message: "Fee structures fetched successfully",
            count: feeStructures.length,
            feeStructures
        });

    } catch (error) {
        console.log("Fetch fee structures error:", error.message);

        return res.status(500).json({
            message: "Failed to fetch fee structures"
        });
    }
};

const getFeeStructureById = async (req, res) => {
    try {
        const feeStructure = await FeeStructure.findById(req.params.id)
            .populate("createdBy", "name");

        if (!feeStructure) {
            return res.status(404).json({
                message: "Fee structure not found"
            });
        }

        return res.status(200).json({
            message: "Fee structure fetched successfully",
            feeStructure
        });

    } catch (error) {
        console.log("Fetch fee structure error:", error.message);

        return res.status(500).json({
            message: "Failed to fetch fee structure"
        });
    }
};

const updateFeeStructure = async (req, res) => {
    try {
        const { course, feeHead, amount, dueDate } = req.body;

        const updates = {};

        if (course !== undefined) updates.course = course.trim();
        if (feeHead !== undefined) updates.feeHead = feeHead;
        if (amount !== undefined) {
            if (Number(amount) < 1) {
                return res.status(400).json({
                    message: "Amount must be at least 1"
                });
            }
            updates.amount = Number(amount);
        }
        if (dueDate !== undefined) updates.dueDate = dueDate;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "Provide at least one field to update"
            });
        }

        const feeStructure = await FeeStructure.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!feeStructure) {
            return res.status(404).json({
                message: "Fee structure not found"
            });
        }

        return res.status(200).json({
            message: "Fee structure updated successfully",
            feeStructure
        });

    } catch (error) {
        console.log("Update fee structure error:", error.message);

        return res.status(500).json({
            message: "Failed to update fee structure"
        });
    }
};

const deleteFeeStructure = async (req, res) => {
    try {
        const feeStructure = await FeeStructure.findByIdAndDelete(req.params.id);

        if (!feeStructure) {
            return res.status(404).json({
                message: "Fee structure not found"
            });
        }

        return res.status(200).json({
            message: "Fee structure deleted successfully"
        });

    } catch (error) {
        console.log("Delete fee structure error:", error.message);

        return res.status(500).json({
            message: "Failed to delete fee structure"
        });
    }
};

module.exports = {
    createFeeStructure,
    getFeeStructures,
    getFeeStructureById,
    updateFeeStructure,
    deleteFeeStructure
};
