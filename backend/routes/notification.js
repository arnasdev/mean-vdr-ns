const express = require("express");
const checkAuth = require("../middleware/check-auth");

const NotificationController = require("../controllers/notification");

const router = express.Router();

router.put("", checkAuth, NotificationController.setNotification);
router.get("", checkAuth, NotificationController.getNotification);

module.exports = router;
