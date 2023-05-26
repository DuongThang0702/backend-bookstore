import { Router } from "express";
import { UserController } from "../controllers";
import verifyToken from "../middleware/verify-token";
import { isAdmin } from "../middleware/verify-role";

const router = Router();
router.get("/forgotpassword", UserController.forgotPassword);
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/refresh_token", UserController.refreshTokenController);
router.post("/logout", UserController.logout);
router.post("/reset-password", UserController.resetPassword);
router.use(verifyToken);
router.get("/current", UserController.getUserCurrent);
router.patch("/current", UserController.updateUser);
router.patch("/:userId", isAdmin, UserController.updateUserByAdmin);
router.get("/", isAdmin, UserController.getUsers);
router.delete("/", isAdmin, UserController.deleteUser);
export default router;
