
const mongoose = require("mongoose");

const bloodRequestSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    patientName: {
        type: String,
        required: true,
        trim: true
    },
    bloodGroup: {
        type: String,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        required: true
    },
    units: {
        type: Number,
        required: true,
        min: 1
    },
    hospitalName: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Accepted", "Completed", "Cancelled"],
        default: "Pending"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("BloodRequest", bloodRequestSchema);
