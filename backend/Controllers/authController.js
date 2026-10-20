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
            bloodGroup,
            dateOfBirth,
            city
        } = req.body;

        if (
            !name ||
            !email ||
            !password ||
            !phone ||
            !bloodGroup ||
            !dateOfBirth ||
            !city
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

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            phone,
            bloodGroup,
            dateOfBirth,
            city: city.trim()
        });

        return res.status(201).json({
            message: "Registration successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                bloodGroup: user.bloodGroup,
                city: user.city,
                role: user.role
            }
        });

    } catch (error) {
        console.log("Registration error:", error.message);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Email already registered"
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

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

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
                bloodGroup: user.bloodGroup,
                city: user.city,
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
        const user = await User.findById(req.user.id)
            .select("-password");

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
        const { name, phone, bloodGroup, dateOfBirth, city } = req.body;

        const allowedBloodGroups = [
            "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
        ];

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

        if (bloodGroup !== undefined) {
            if (!allowedBloodGroups.includes(bloodGroup)) {
                return res.status(400).json({
                    message: "Invalid blood group"
                });
            }
            updates.bloodGroup = bloodGroup;
        }

        if (dateOfBirth !== undefined) {
            const date = new Date(dateOfBirth);

            if (!dateOfBirth || Number.isNaN(date.getTime())) {
                return res.status(400).json({
                    message: "Invalid date of birth"
                });
            }

            updates.dateOfBirth = date;
        }

        if (city !== undefined) {
            if (!city.trim()) {
                return res.status(400).json({
                    message: "City cannot be empty"
                });
            }
            updates.city = city.trim();
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
    getMe,updateProfile
};