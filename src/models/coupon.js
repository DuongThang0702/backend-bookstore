import { Schema, model } from "mongoose";

const CouponSchema = new Schema(
  {
    titleCoupon: { type: String, require: true, unique: true },
    discount: { type: Number, require: true },
    expiry: { type: Date, require: true },
  },
  { timestamps: true }
);

const Coupon = model("Coupon", CouponSchema);
export default Coupon;
