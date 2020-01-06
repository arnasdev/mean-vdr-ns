const express = require("express");
const checkAuth = require("../middleware/check-auth");
const VehicleController = require("../controllers/vehicles")

const router = express.Router();

router.post("", checkAuth, VehicleController.createVehicle);

router.get("", checkAuth, VehicleController.getVehicles);

router.get("/search/:registration", VehicleController.searchRegistration);

router.put("/:id", checkAuth, VehicleController.editVehicle);

router.delete("/:id", checkAuth, VehicleController.deleteVehicle);

module.exports = router;
