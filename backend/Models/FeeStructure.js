const mongoose = require("mongoose");

const feeStructureSchema = new mongoose.Schema(
    {
        course: {
            type: String,
            required: true,
            trim: true
        },
        feeHead: {
            type: String,
            enum: ["Tuition", "Exam", "Transport", "Other"],
            required: true
        },
        amount: {
            type: Number,
            required: true,
            min: 1
        },
        dueDate: {
            type: Date,
            required: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("FeeStructure", feeStructureSchema);
