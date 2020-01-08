const express = require("express");
const checkAuth = require("../middleware/check-auth");

const UserController = require("../controllers/user");

const router = express.Router();

router.post("/signup", UserController.createUser);

router.post("/login", UserController.userLogin);

router.post("/logout", UserController.userLogout);

router.post("/fb-login", UserController.facebookLogin);

router.post("/fb-userdata", UserController.facebookDetails);

router.post("/fb-link", UserController.facebookLink);

router.post("/fb-unlink", UserController.facebookUnlink);

router.delete("/:id", checkAuth, UserController.deleteUser);

router.put("/:id", checkAuth, UserController.editUser);


module.exports = router;
