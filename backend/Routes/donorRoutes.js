const express = require("express");
const router = express.Router();

const donorController = require("../Controllers/donorController");

router.get("/search", donorController.searchDonors);

module.exports = router;