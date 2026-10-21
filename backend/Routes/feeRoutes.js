const express = require("express");
const router = express.Router();

const feeController = require("../Controllers/feeController");
const authMiddleware = require("../Middleware/authMiddleware");
const adminMiddleware = require("../Middleware/adminMiddleware");

router.get("/", authMiddleware, feeController.getFeeStructures);
router.get("/:id", authMiddleware, feeController.getFeeStructureById);

router.post("/", authMiddleware, adminMiddleware, feeController.createFeeStructure);
router.put("/:id", authMiddleware, adminMiddleware, feeController.updateFeeStructure);
router.delete("/:id", authMiddleware, adminMiddleware, feeController.deleteFeeStructure);

module.exports = router;
