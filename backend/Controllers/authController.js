const User = require("../Models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            rollNumber,
            course
        } = req.body;

        if (
            !name ||
            !email ||
            !password ||
            !phone ||
            !rollNumber ||
            !course
        ) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingEmail = await User.findOne({ email: normalizedEmail });
        if (existingEmail) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        const existingRoll = await User.findOne({
            rollNumber: rollNumber.trim()
        });
        if (existingRoll) {
            return res.status(409).json({
                message: "Roll number already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            phone: phone.trim(),
            rollNumber: rollNumber.trim(),
            course: course.trim()
        });

        return res.status(201).json({
            message: "Registration successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                rollNumber: user.rollNumber,
                course: user.course,
                role: user.role
            }
        });

    } catch (error) {
        console.log("Registration error:", error.message);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Email or roll number already registered"
            });
        }

        return res.status(500).json({
            message: "Registration failed"
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing in .env");
        }

        const token = jwt.sign(
            {
                id: user._id.toString(),
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1d"
            }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                rollNumber: user.rollNumber,
                course: user.course,
                role: user.role
            }
        });

    } catch (error) {
        console.log("Login error:", error.message);

        return res.status(500).json({
            message: "Login failed"
        });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "Profile fetched successfully",
            user
        });

    } catch (error) {
        console.log("Profile error:", error.message);

        return res.status(500).json({
            message: "Failed to fetch profile"
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, phone, course } = req.body;

        const updates = {};

        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({
                    message: "Name cannot be empty"
                });
            }
            updates.name = name.trim();
        }

        if (phone !== undefined) {
            if (!phone.trim()) {
                return res.status(400).json({
                    message: "Phone cannot be empty"
                });
            }
            updates.phone = phone.trim();
        }

        if (course !== undefined) {
            if (!course.trim()) {
                return res.status(400).json({
                    message: "Course cannot be empty"
                });
            }
            updates.course = course.trim();
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "Provide at least one field to update"
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            user
        });

    } catch (error) {
        console.log("Profile update error:", error.message);

        return res.status(500).json({
            message: "Failed to update profile"
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateProfile
};