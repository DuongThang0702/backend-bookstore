import express from "express";
import { CouponController } from "../controllers";
import verifyToken from "../middleware/verify-token";
import { isAdminOrCreator } from "../middleware/verify-role";

const router = express.Router();

router.get("/", CouponController.getAllCoupons);
router.use(verifyToken, isAdminOrCreator);
router.post("/", CouponController.createCoupon);
router.patch("/:couponId", CouponController.repairCoupon);
router.delete("/:couponId", CouponController.deleteCoupon);

export default router;
