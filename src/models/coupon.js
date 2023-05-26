const { Schema, model } = require("mongoose");

const CouponSchema = new Schema(
  {
    titleCoupon: { type: String, require: true, unique: true, uppercase: true },
    discount: { type: Number, require: true },
    expiry: { type: Date, require: true },
  },
  { timestamps: true }
);

const Coupon = model("Coupon", CouponSchema);
module.exports = Coupon;
