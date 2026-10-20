const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        feeStructure: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FeeStructure",
            required: true
        },
        amount: {
            type: Number,
            required: true,
            min: 1
        },
        paymentMode: {
            type: String,
            enum: ["Cash", "UPI", "Card"],
            required: true
        },
        paymentDate: {
            type: Date,
            required: true
        },
        transactionRef: {
            type: String,
            trim: true,
            default: ""
        },
        receiptNo: {
            type: String,
            required: true,
            unique: true
        },
        recordedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Payment", paymentSchema);
