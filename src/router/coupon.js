const express = require("express");
const { CouponController } = require("../controllers");
const verifyToken = require("../middleware/verify-token");
const { isAdminOrCreator } = require("../middleware/verify-role");

const router = express.Router();

router.get("/", CouponController.getAllCoupons);

//private
router.post(
  "/",
  [verifyToken, isAdminOrCreator],
  CouponController.createCoupon
);
router.patch(
  "/:couponId",
  [verifyToken, isAdminOrCreator],
  CouponController.repairCoupon
);
router.delete(
  "/:couponId",
  [verifyToken, isAdminOrCreator],
  CouponController.deleteCoupon
);

module.exports = router;
