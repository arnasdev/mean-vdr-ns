const express = require("express");
const checkAuth = require("../middleware/check-auth");

const UserController = require("../controllers/user");

const router = express.Router();

router.post("/signup", UserController.createUser);

router.post("/login", UserController.userLogin);

router.post("/logout", UserController.userLogout);

router.delete("/:id", checkAuth, UserController.deleteUser);

router.put("/:id", checkAuth, UserController.editUser);


module.exports = router;
