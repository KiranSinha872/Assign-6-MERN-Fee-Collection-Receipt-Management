const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        rollNumber: {
            type: String,
            unique: true,
            sparse: true
        },
        course: {
            type: String
        },
        role: {
            type: String,
            enum: ["Student", "Admin"],
            default: "Student"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);
