const User = require("../Models/User");

const searchDonors = async (req, res) => {
    try {
        const { bloodGroup, city } = req.query;

        const filter = {
            role: "Donor"
        };

        const allowedBloodGroups = [
            "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
        ];

        if (bloodGroup) {
            if (!allowedBloodGroups.includes(bloodGroup)) {
                return res.status(400).json({
                    message: "Invalid blood group"
                });
            }

            filter.bloodGroup = bloodGroup;
        }

        if (city) {
            filter.city = {
                $regex: city.trim(),
                $options: "i"
            };
        }

        const donors = await User.find(filter)
            .select("name bloodGroup city")
            .sort({ name: 1 });

        return res.status(200).json({
            message: "Donors fetched successfully",
            count: donors.length,
            donors
        });
    } catch (error) {
        console.log("Donor search error:", error.message);

        return res.status(500).json({
            message: "Failed to search donors"
        });
    }
};

module.exports = { searchDonors };