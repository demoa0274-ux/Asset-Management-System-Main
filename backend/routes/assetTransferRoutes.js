// backend/routes/assetTransferRoutes.js
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { adminOrSubadmin } = require("../middleware/adminMiddleware");
const { transferAsset, getAssetTransferHistory } = require("../controllers/assetTransferController");

router.post("/transfer", protect, adminOrSubadmin, transferAsset);

router.get("/asset-transfers/history", protect, getAssetTransferHistory);

module.exports = router;

