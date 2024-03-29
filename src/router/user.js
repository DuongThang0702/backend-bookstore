const { Router } = require("express");
const { UserController } = require("../controllers");
const verifyToken = require("../middleware/verify-token");
const { isAdmin } = require("../middleware/verify-role");
const uploader = require("../config/cloudinary-config");

const router = Router();
router.get("/refresh-token/:token", UserController.refreshTokenController);
router.post("/forgot-password", UserController.forgotPassword);
router.patch("/final-register/:token", UserController.finalRegister);
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.patch("/reset-password", UserController.resetPassword);
router.delete("/logout", UserController.logout);

//private
router.get("/current", verifyToken, UserController.getUserCurrent);
router.patch("/update-cart", verifyToken, UserController.updateCart);
router.patch("/update-address", verifyToken, UserController.updateAddress);
router.patch(
  "/current",
  verifyToken,
  uploader.single("avatar"),
  UserController.updateUser
);
router.patch("/:uid", [verifyToken, isAdmin], UserController.updateUserByAdmin);
router.get("/all-user", [verifyToken, isAdmin], UserController.getUsers);
router.post(
  "/create-user-by-admin",
  [verifyToken, isAdmin],
  UserController.createUserByAdmin
);
router.delete("/:uid", [verifyToken, isAdmin], UserController.deleteUser);

module.exports = router;
