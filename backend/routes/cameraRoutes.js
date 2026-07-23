const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { detectCameraMood } = require("../controllers/cameraController");

router.post("/detect-camera", protect, detectCameraMood);

module.exports = router;