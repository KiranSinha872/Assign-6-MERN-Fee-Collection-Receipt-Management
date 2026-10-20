
const BloodRequest = require("../Models/BloodRequest");

const createBloodRequest = async (req, res) => {
    try {
        const {
            patientName,
            bloodGroup,
            units,
            hospitalName,
            city,
            contactNumber
        } = req.body;

        if (
            !patientName ||
            !bloodGroup ||
            units === undefined ||
            !hospitalName ||
            !city ||
            !contactNumber
        ) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (!Number.isInteger(Number(units)) || Number(units) < 1) {
            return res.status(400).json({
                message: "Units must be a positive whole number"
            });
        }

        const bloodRequest = await BloodRequest.create({
            requester: req.user.id,
            patientName,
            bloodGroup,
            units: Number(units),
            hospitalName,
            city,
            contactNumber
        });

        return res.status(201).json({
            message: "Blood request created successfully",
            bloodRequest
        });
    } catch (error) {
        console.log("Blood request error:", error.message);

        return res.status(500).json({
            message: "Failed to create blood request"
        });
    }
};


const getMyBloodRequests = async (req, res) => {
    try {
        const requests = await BloodRequest.find({
            requester: req.user.id
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Your blood requests fetched successfully",
            count: requests.length,
            requests
        });
    } catch (error) {
        console.log("Fetch requests error:", error.message);

        return res.status(500).json({
            message: "Failed to fetch blood requests"
        });
    }
};
const updateBloodRequestStatus = async (req, res) => {
    try {
        const status = req.body?.status?.trim();
console.log("Received status:", JSON.stringify(status));

        const allowedStatuses = [
            "Pending",
            "Accepted",
            "Completed",
            "Cancelled"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        const request = await BloodRequest.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!request) {
            return res.status(404).json({
                message: "Blood request not found"
            });
        }

        return res.status(200).json({
            message: "Blood request status updated successfully",
            request
        });
    } catch (error) {
        console.log("Status update error:", error.message);

        return res.status(500).json({
            message: "Failed to update blood request status"
        });
    }
};

const getAllBloodRequests = async (req, res) => {
    try {
        const { bloodGroup, city, status } = req.query;

        const filter = {};

        if (bloodGroup) {
            filter.bloodGroup = bloodGroup;
        }

        if (city) {
            filter.city = { $regex: city, $options: "i" };
        }

        if (status) {
            filter.status = status;
        }

        const requests = await BloodRequest.find(filter)
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Blood requests fetched successfully",
            count: requests.length,
            requests
        });
    } catch (error) {
        console.log("Fetch all requests error:", error.message);

        return res.status(500).json({
            message: "Failed to fetch blood requests"
        });
    }
};



module.exports = {
    createBloodRequest,
    getMyBloodRequests,getAllBloodRequests,updateBloodRequestStatus
};
